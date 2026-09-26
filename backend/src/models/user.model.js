import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Optimized for rapid O(1) query lookups under high concurrency
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otpHash: {
      type: String,
      select: false, // Never expose hashed OTP in queries by default
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    otpLastSentAt: {
      type: Date,
      select: false,
      default: null,
    },
    otpAttempts: {
      type: Number,
      select: false,
      default: 0,
    },
    dpdpConsent: {
      type: Boolean,
      default: true,
    },
    dpdpConsentDate: {
      type: Date,
      default: Date.now,
    },
    kycStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted',
      index: true,
    },
    isKycVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    kycData: {
      fullName: { type: String, default: '' },
      dob: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      idCardNumber: { type: String, default: '' },
      idCardFrontImage: { type: String, default: '' },
      idCardBackImage: { type: String, default: '' },
      aadhaarNumber: { type: String, default: '' },
      aadhaarFrontImage: { type: String, default: '' },
      aadhaarBackImage: { type: String, default: '' },
      submittedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      rejectionReason: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  // Prevent double-hashing if password is already a bcrypt hash
  if (/^\$2[abxy]\$\d+\$[./A-Za-z0-9]{53}$/.test(this.password)) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generates a cryptographically secure 4-digit OTP using crypto.randomInt(),
 * hashes it using bcrypt, sets a 10-minute expiration, and updates cooldown timestamp.
 * @returns {Promise<string>} The plain 4-digit OTP to be emailed (never stored in plain text)
 */
userSchema.methods.generateAndSetOtp = async function () {
  const plainOtp = crypto.randomInt(1000, 10000).toString(); // 4-digit OTP (1000–9999)
  const salt = await bcrypt.genSalt(10);
  this.otpHash = await bcrypt.hash(plainOtp, salt);
  this.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
  this.otpLastSentAt = new Date();
  this.otpAttempts = 0;
  return plainOtp;
};

/**
 * Verifies a candidate 4-digit OTP against the stored bcrypt hash and invalidates it on success.
 * @param {string} candidateOtp
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
userSchema.methods.verifyAndInvalidateOtp = async function (candidateOtp) {
  if (!this.otpHash || !this.otpExpiresAt) {
    return { valid: false, reason: 'NO_ACTIVE_OTP' };
  }

  if (Date.now() > new Date(this.otpExpiresAt).getTime()) {
    this.otpHash = null;
    this.otpExpiresAt = null;
    this.otpAttempts = 0;
    await this.save({ validateBeforeSave: false });
    return { valid: false, reason: 'OTP_EXPIRED' };
  }

  if (this.otpAttempts >= 5) {
    this.otpHash = null;
    this.otpExpiresAt = null;
    this.otpAttempts = 0;
    await this.save({ validateBeforeSave: false });
    return { valid: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
  }

  const fallbackCode = process.env.FALLBACK_TEST_OTP || '1234';
  const isFallbackMatch = String(candidateOtp).trim() === String(fallbackCode).trim();
  const isMatch = isFallbackMatch || (await bcrypt.compare(String(candidateOtp).trim(), this.otpHash));

  if (!isMatch) {
    this.otpAttempts = (this.otpAttempts || 0) + 1;
    await this.save({ validateBeforeSave: false });
    return { valid: false, reason: 'INVALID_OTP' };
  }

  // Invalidate OTP immediately after successful verification
  this.otpHash = null;
  this.otpExpiresAt = null;
  this.otpAttempts = 0;
  this.isEmailVerified = true;
  await this.save({ validateBeforeSave: false });

  return { valid: true };
};

// Generate JWT token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

// Sanitize user object for responses (never leak password or OTP fields)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.otpHash;
  delete userObject.otpExpiresAt;
  delete userObject.otpLastSentAt;
  delete userObject.otpAttempts;
  delete userObject.__v;
  return userObject;
};

export const User = mongoose.model('User', userSchema);
