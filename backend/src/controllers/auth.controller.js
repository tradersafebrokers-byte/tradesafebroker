import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { OtpVerification } from '../models/otpVerification.model.js';
import { COOKIE_OPTIONS, AUTH_MESSAGES } from '../constants/index.js';
import { sendOtpEmail, verifySmtpConnection } from '../services/mail.service.js';

const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown between OTP sends

/**
 * @desc    Initiate registration & send 4-digit verification OTP
 *          (User is NOT created in the users collection until OTP is verified)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  // 1. Check if a verified user already exists in the `users` collection
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  }).select('+otpLastSentAt +otpHash');

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      if (existingUser.isEmailVerified) {
        throw new ApiError(409, 'User with this email already exists. Please log in.');
      }

      // Existing unverified user: update credentials and send fresh OTP
      if (
        existingUser.otpLastSentAt &&
        Date.now() - new Date(existingUser.otpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS
      ) {
        const waitSec = Math.ceil(
          (OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(existingUser.otpLastSentAt).getTime())) / 1000
        );
        throw new ApiError(429, `Please wait ${waitSec} seconds before requesting another code.`);
      }

      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
      const plainOtp = await existingUser.generateAndSetOtp();
      await existingUser.save({ validateBeforeSave: false });

      // Deliver 4-digit OTP email via Hostinger SMTP
      await sendOtpEmail({
        to: existingUser.email,
        username: existingUser.username,
        otp: plainOtp,
        expiresInMinutes: 10,
        purpose: 'Account Registration',
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            requiresOtp: true,
            email: existingUser.email,
            cooldownSeconds: 60,
          },
          'A 4-digit verification code has been sent to your email.'
        )
      );
    }
    throw new ApiError(409, 'Username is already taken');
  }

  // 2. Check if another pending signup is actively holding this username
  const usernameHeldByPending = await OtpVerification.findOne({
    username: normalizedUsername,
    email: { $ne: normalizedEmail },
    otpExpiresAt: { $gt: new Date() },
  });

  if (usernameHeldByPending) {
    throw new ApiError(409, 'Username is already taken');
  }

  // 3. Check if there is an existing pending OTP record for this email
  let pendingRecord = await OtpVerification.findOne({ email: normalizedEmail });

  if (pendingRecord) {
    if (
      pendingRecord.otpLastSentAt &&
      Date.now() - new Date(pendingRecord.otpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      const waitSec = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(pendingRecord.otpLastSentAt).getTime())) / 1000
      );
      throw new ApiError(429, `Please wait ${waitSec} seconds before requesting another code.`);
    }

    const salt = await bcrypt.genSalt(10);
    pendingRecord.username = normalizedUsername;
    pendingRecord.passwordHash = await bcrypt.hash(password, salt);
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    pendingRecord = new OtpVerification({
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash,
      otpHash: 'pending',
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
  }

  const plainOtp = await pendingRecord.generateAndSetOtp();
  await pendingRecord.save();

  // Deliver 4-digit OTP email via Hostinger SMTP
  await sendOtpEmail({
    to: pendingRecord.email,
    username: pendingRecord.username,
    otp: plainOtp,
    expiresInMinutes: 10,
    purpose: 'Account Registration',
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        requiresOtp: true,
        email: pendingRecord.email,
        cooldownSeconds: 60,
      },
      'A 4-digit verification code has been sent to your email.'
    )
  );
});

/**
 * @desc    Verify 4-digit OTP (for both Sign Up and Login), create User if pending signup, and issue JWT session
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. First check if there is an existing User in `users` collection (Login OTP verification)
  const existingUser = await User.findOne({ email: normalizedEmail }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt'
  );

  if (existingUser && existingUser.otpHash) {
    const verification = await existingUser.verifyAndInvalidateOtp(otp);

    if (!verification.valid) {
      if (verification.reason === 'OTP_EXPIRED') {
        throw new ApiError(400, 'Your 4-digit verification code has expired. Please request a new code.');
      }
      if (verification.reason === 'MAX_ATTEMPTS_EXCEEDED') {
        throw new ApiError(
          429,
          'Too many incorrect attempts. For your security, this OTP was invalidated. Please request a new code.'
        );
      }
      throw new ApiError(400, 'Invalid 4-digit verification code. Please check and try again.');
    }

    const token = existingUser.generateAccessToken();
    const sanitizedUser = existingUser.toJSON();

    return res
      .status(200)
      .cookie('accessToken', token, COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          200,
          {
            user: sanitizedUser,
            token,
          },
          'Login verified successfully! Welcome back to TradeSafe Brokers.'
        )
      );
  }

  // 2. Otherwise check pending signup in `OtpVerification` (Sign Up OTP verification)
  const pendingRecord = await OtpVerification.findOne({ email: normalizedEmail });

  if (!pendingRecord) {
    throw new ApiError(400, 'Invalid or expired 4-digit verification code.');
  }

  const verification = await pendingRecord.verifyOtp(otp);

  if (!verification.valid) {
    if (verification.reason === 'OTP_EXPIRED') {
      throw new ApiError(400, 'Your 4-digit verification code has expired. Please request a new code.');
    }
    if (verification.reason === 'MAX_ATTEMPTS_EXCEEDED') {
      throw new ApiError(
        429,
        'Too many incorrect attempts. For your security, this OTP was invalidated. Please request a new code.'
      );
    }
    throw new ApiError(400, 'Invalid 4-digit verification code. Please check and try again.');
  }

  // Ensure no duplicate user was created in the meantime
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
      email: pendingRecord.email,
      username: pendingRecord.username,
      password: pendingRecord.passwordHash,
      isEmailVerified: true,
    });
  } else {
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  // Delete temporary OTP signup record
  await OtpVerification.deleteOne({ _id: pendingRecord._id });

  const token = user.generateAccessToken();
  const sanitizedUser = user.toJSON();

  return res
    .status(200)
    .cookie('accessToken', token, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          user: sanitizedUser,
          token,
        },
        'Email verified and account created successfully! Welcome to TradeSafe Brokers.'
      )
    );
});

/**
 * @desc    Resend / Send a 4-digit OTP with 60s cooldown (supports both Pending Sign Up and Login OTP)
 * @route   POST /api/v1/auth/resend-otp
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check existing User first (Login OTP resend)
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+otpLastSentAt +otpHash +otpExpiresAt +otpAttempts'
  );

  if (user && user.isActive) {
    if (
      user.otpLastSentAt &&
      Date.now() - new Date(user.otpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      const secondsLeft = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(user.otpLastSentAt).getTime())) / 1000
      );
      throw new ApiError(429, `Please wait ${secondsLeft} seconds before requesting a new OTP.`);
    }

    const plainOtp = await user.generateAndSetOtp();
    await user.save({ validateBeforeSave: false });

    // Deliver email via Hostinger SMTP
    await sendOtpEmail({
      to: user.email,
      username: user.username,
      otp: plainOtp,
      expiresInMinutes: 10,
      purpose: 'Login Verification',
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          requiresOtp: true,
          email: user.email,
          cooldownSeconds: 60,
        },
        'A new 4-digit verification code has been sent to your email.'
      )
    );
  }

  // 2. Check pending signup in `OtpVerification`
  const pendingRecord = await OtpVerification.findOne({ email: normalizedEmail });

  if (pendingRecord) {
    if (
      pendingRecord.otpLastSentAt &&
      Date.now() - new Date(pendingRecord.otpLastSentAt).getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      const secondsLeft = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(pendingRecord.otpLastSentAt).getTime())) / 1000
      );
      throw new ApiError(429, `Please wait ${secondsLeft} seconds before requesting a new OTP.`);
    }

    const plainOtp = await pendingRecord.generateAndSetOtp();
    await pendingRecord.save();

    // Deliver email via Hostinger SMTP
    await sendOtpEmail({
      to: pendingRecord.email,
      username: pendingRecord.username,
      otp: plainOtp,
      expiresInMinutes: 10,
      purpose: 'Account Registration',
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          requiresOtp: true,
          email: pendingRecord.email,
          cooldownSeconds: 60,
        },
        'A new 4-digit verification code has been sent to your email.'
      )
    );
  }

  // Security: Do not reveal whether an account exists
  return res.status(200).json(
    new ApiResponse(
      200,
      { cooldownSeconds: 60 },
      'If an account with this email exists, a 4-digit verification code has been sent.'
    )
  );
});

/**
 * @desc    Login existing user -> Verify credentials & ALWAYS send a 4-digit OTP to email
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user in `users` collection
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+password +otpHash +otpLastSentAt +otpExpiresAt'
  );

  // 2. If not in `users` yet, check if they have a pending signup in `OtpVerification`
  if (!user) {
    const pendingRecord = await OtpVerification.findOne({ email: normalizedEmail });
    if (pendingRecord) {
      const isPendingPasswordValid = await bcrypt.compare(password, pendingRecord.passwordHash);
      if (!isPendingPasswordValid) {
        throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
      }

      const plainOtp = await pendingRecord.generateAndSetOtp();
      await pendingRecord.save();

      // Deliver email via Hostinger SMTP
      await sendOtpEmail({
        to: pendingRecord.email,
        username: pendingRecord.username,
        otp: plainOtp,
        expiresInMinutes: 10,
        purpose: 'Account Verification',
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            requiresOtp: true,
            email: pendingRecord.email,
            cooldownSeconds: 60,
          },
          'A 4-digit verification code has been sent to your email.'
        )
      );
    }

    throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  // 3. Verify password using bcrypt
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  // If user registered earlier but never completed email verification, require registration OTP
  if (!user.isEmailVerified) {
    const plainOtp = await user.generateAndSetOtp();
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail({
      to: user.email,
      username: user.username,
      otp: plainOtp,
      expiresInMinutes: 10,
      purpose: 'Account Registration',
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          requiresOtp: true,
          email: user.email,
          cooldownSeconds: 60,
        },
        'Please verify your email. A 4-digit verification code has been sent to your email.'
      )
    );
  }

  // 4. Direct Login - Issue JWT session without OTP
  const token = user.generateAccessToken();
  const sanitizedUser = user.toJSON();

  return res
    .status(200)
    .cookie('accessToken', token, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          requiresOtp: false,
          user: sanitizedUser,
          token,
        },
        'Login successful! Welcome back to TradeSafe Brokers.'
      )
    );
});

/**
 * @desc    Safe SMTP connection test method (Never exposes SMTP credentials)
 * @route   GET /api/v1/auth/smtp-test
 * @access  Public / Diagnostic
 */
export const testSmtpConnection = asyncHandler(async (req, res) => {
  const status = await verifySmtpConnection();
  return res
    .status(200)
    .json(new ApiResponse(200, status, 'SMTP server connection verified successfully.'));
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, AUTH_MESSAGES.PROFILE_FETCHED));
});

/**
 * @desc    Logout user & clear accessToken cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie('accessToken', COOKIE_OPTIONS)
    .json(new ApiResponse(200, null, AUTH_MESSAGES.LOGOUT_SUCCESS));
});

/**
 * @desc    Submit ID Card KYC verification details
 * @route   POST /api/v1/auth/kyc/submit
 * @access  Private (Authenticated User)
 */
export const submitKyc = asyncHandler(async (req, res) => {
  const {
    fullName,
    dob,
    phone,
    address,
    idCardNumber,
    aadhaarNumber,
    idCardFrontImage,
    aadhaarFrontImage,
    idCardBackImage,
    aadhaarBackImage,
  } = req.body;

  const idNumber = (idCardNumber || aadhaarNumber || '').trim();
  const frontImage = idCardFrontImage || aadhaarFrontImage || '';
  const backImage = idCardBackImage || aadhaarBackImage || '';

  if (!fullName || !idNumber) {
    throw new ApiError(400, 'Full Legal Name and ID Card Number are required for KYC.');
  }

  const cleanId = idNumber.replace(/\s+/g, '');
  if (cleanId.length < 3) {
    throw new ApiError(400, 'Please enter a valid ID Card number.');
  }

  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.kycStatus = 'pending';
  user.kycData = {
    fullName: fullName.trim(),
    dob: dob || '',
    phone: phone || '',
    address: address || '',
    idCardNumber: cleanId,
    aadhaarNumber: cleanId,
    idCardFrontImage: frontImage,
    aadhaarFrontImage: frontImage,
    idCardBackImage: backImage,
    aadhaarBackImage: backImage,
    submittedAt: new Date(),
    verifiedAt: null,
    rejectionReason: '',
  };

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      'ID Card KYC submitted successfully! PipWise compliance team will review your application.'
    )
  );
});

/**
 * @desc    Get user current KYC status
 * @route   GET /api/v1/auth/kyc/status
 * @access  Private
 */
export const getKycStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    'kycStatus isKycVerified kycData username email role'
  );
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kycStatus: user.kycStatus,
        isKycVerified: user.isKycVerified,
        kycData: user.kycData,
      },
      'KYC status retrieved'
    )
  );
});

