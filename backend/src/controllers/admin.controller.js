import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Broker } from '../models/broker.model.js';
import { Review } from '../models/review.model.js';
import { Testimonial } from '../models/testimonial.model.js';

/**
 * @desc    Get Admin Overview Analytics & Counts
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBrokers,
    totalReviews,
    totalTestimonials,
    activeUsers,
    adminCount,
    verifiedBrokers,
    pendingBrokers,
    approvedBrokers,
    rejectedBrokers,
    pendingReviews,
    recentUsers,
    recentBrokers,
    recentReviews,
    pendingBrokersList,
  ] = await Promise.all([
    User.countDocuments(),
    Broker.countDocuments(),
    Review.countDocuments(),
    Testimonial.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'admin' }),
    Broker.countDocuments({ isVerified: true }),
    Broker.countDocuments({ status: 'pending' }),
    Broker.countDocuments({ status: { $in: ['active', 'approved'] } }),
    Broker.countDocuments({ status: 'rejected' }),
    Review.countDocuments({ status: 'pending' }),
    User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
    Broker.find().sort({ createdAt: -1 }).limit(6),
    Review.find().sort({ createdAt: -1 }).limit(6),
    Broker.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalBrokers,
        totalReviews,
        totalTestimonials,
        activeUsers,
        adminCount,
        verifiedBrokers,
        pendingBrokers,
        approvedBrokers,
        rejectedBrokers,
        pendingReviews,
        recentUsers,
        recentBrokers,
        recentReviews,
        pendingBrokersList,
      },
      'Admin statistics loaded successfully'
    )
  );
});

/**
 * @desc    Get all users with optional search & pagination
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role && (role === 'admin' || role === 'user')) {
    query.role = role;
  }

  const users = await User.find(query).sort({ createdAt: -1 }).select('-password');

  return res.status(200).json(
    new ApiResponse(200, { users, count: users.length }, 'Users fetched successfully')
  );
});

/**
 * @desc    Update user role (promote to admin or demote to user)
 * @route   PATCH /api/v1/admin/users/:id/role
 * @access  Private (Admin only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Must be "admin" or "user".');
  }

  // Prevent admin from demoting themselves
  if (req.user._id.toString() === id && role !== 'admin') {
    throw new ApiError(400, 'You cannot remove your own administrator status.');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { user }, `User role updated to ${role}`)
  );
});

/**
 * @desc    Toggle user active/deactivated status
 * @route   PATCH /api/v1/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'You cannot deactivate your own administrator account.');
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`
    )
  );
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'You cannot delete your own administrator account.');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, `User "${user.username}" deleted successfully`)
  );
});

/**
 * @desc    Get all brokers for admin management
 * @route   GET /api/v1/admin/brokers
 * @access  Private (Admin only)
 */
export const getAllAdminBrokers = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { platforms: { $regex: search, $options: 'i' } },
      { regulation: { $regex: search, $options: 'i' } },
    ];
  }
  if (status && status !== 'all') {
    if (status === 'approved') {
      query.status = { $in: ['approved', 'active'] };
    } else {
      query.status = status;
    }
  }

  const brokers = await Broker.find(query).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { brokers, count: brokers.length }, 'Brokers fetched successfully')
  );
});

/**
 * @desc    Update broker status (Approve / Reject / Pending)
 * @route   PATCH /api/v1/admin/brokers/:id/status
 * @access  Private (Admin only)
 */
export const updateBrokerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending', 'active'].includes(status)) {
    throw new ApiError(400, 'Invalid broker status. Must be approved, rejected, or pending.');
  }

  const updateFields = { status };
  if (status === 'approved' || status === 'active') {
    updateFields.isVerified = true;
    updateFields.isVerifiedPartner = true;
    updateFields.verificationBadge = 'Verified Broker';
    updateFields.approvedAt = new Date();
  } else if (status === 'rejected') {
    updateFields.isVerified = false;
    updateFields.isVerifiedPartner = false;
  }

  const broker = await Broker.findByIdAndUpdate(id, updateFields, { new: true });
  if (!broker) {
    throw new ApiError(404, 'Broker not found');
  }

  const statusLabel =
    status === 'approved' || status === 'active'
      ? 'Approved & Verified as Official Partner'
      : status === 'rejected'
      ? 'Rejected'
      : 'Marked as Pending Review';

  return res.status(200).json(
    new ApiResponse(200, { broker }, `Broker "${broker.name}" ${statusLabel}`)
  );
});

/**
 * @desc    Update broker details (Full admin edit)
 * @route   PUT /api/v1/admin/brokers/:id
 * @access  Private (Admin only)
 */
export const updateAdminBroker = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Safeguard against modifying internal MongoDB _id
  delete updateData._id;

  const broker = await Broker.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!broker) {
    throw new ApiError(404, 'Broker not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { broker }, `Broker "${broker.name}" updated successfully`)
  );
});

/**
 * @desc    Delete broker by ID
 * @route   DELETE /api/v1/admin/brokers/:id
 * @access  Private (Admin only)
 */
export const deleteAdminBroker = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const broker = await Broker.findByIdAndDelete(id);
  if (!broker) {
    throw new ApiError(404, 'Broker not found');
  }

  // Also clean up any associated reviews
  await Review.deleteMany({ broker: id });

  return res.status(200).json(
    new ApiResponse(200, null, `Broker "${broker.name}" and associated records removed successfully`)
  );
});

/**
 * @desc    Toggle broker verification status
 * @route   PATCH /api/v1/admin/brokers/:id/verify
 * @access  Private (Admin only)
 */
export const toggleBrokerVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const broker = await Broker.findById(id);
  if (!broker) {
    throw new ApiError(404, 'Broker not found');
  }

  broker.isVerified = !broker.isVerified;
  await broker.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { broker },
      `Broker verification status updated to ${broker.isVerified ? 'Verified' : 'Unverified'}`
    )
  );
});

/**
 * @desc    Get all reviews for admin moderation
 * @route   GET /api/v1/admin/reviews
 * @access  Private (Admin only)
 */
export const getAllAdminReviews = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { brokerName: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { comment: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
    ];
  }
  if (status && ['approved', 'pending', 'rejected'].includes(status)) {
    query.status = status;
  }

  const reviews = await Review.find(query).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { reviews, count: reviews.length }, 'Reviews fetched successfully')
  );
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/admin/reviews/:id
 * @access  Private (Admin only)
 */
export const deleteAdminReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Review deleted successfully')
  );
});

/**
 * @desc    Update review status (Approve / Reject)
 * @route   PATCH /api/v1/admin/reviews/:id/status
 * @access  Private (Admin only)
 */
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'pending', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid review status. Must be approved, pending, or rejected.');
  }

  const review = await Review.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { review }, `Review marked as ${status}`)
  );
});

/**
 * @desc    Development helper: promote current authenticated user to admin
 * @route   POST /api/v1/admin/promote-me
 * @access  Private (authenticated user)
 */
export const promoteMeToAdmin = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: 'admin' },
    { new: true }
  ).select('-password');

  return res.status(200).json(
    new ApiResponse(200, { user }, 'Congratulations! You have been granted Administrator privileges.')
  );
});

/**
 * @desc    Get all user KYC verification submissions
 * @route   GET /api/v1/admin/kyc
 * @access  Private (Admin only)
 */
export const getAllKycSubmissions = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const query = {
    kycStatus: { $ne: 'not_submitted' },
  };

  if (status && status !== 'all' && ['pending', 'verified', 'rejected'].includes(status)) {
    query.kycStatus = status;
  }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'kycData.fullName': { $regex: search, $options: 'i' } },
      { 'kycData.idCardNumber': { $regex: search, $options: 'i' } },
      { 'kycData.aadhaarNumber': { $regex: search, $options: 'i' } },
    ];
  }

  const submissions = await User.find(query)
    .sort({ 'kycData.submittedAt': -1, updatedAt: -1 })
    .select('-password');

  const [totalSubmissions, pendingCount, verifiedCount, rejectedCount] = await Promise.all([
    User.countDocuments({ kycStatus: { $ne: 'not_submitted' } }),
    User.countDocuments({ kycStatus: 'pending' }),
    User.countDocuments({ kycStatus: 'verified' }),
    User.countDocuments({ kycStatus: 'rejected' }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        submissions,
        counts: {
          total: totalSubmissions,
          pending: pendingCount,
          verified: verifiedCount,
          rejected: rejectedCount,
        },
      },
      'User KYC submissions fetched successfully'
    )
  );
});

/**
 * @desc    Approve or Reject User KYC with verification status & badge
 * @route   PATCH /api/v1/admin/kyc/:id/status
 * @access  Private (Admin only)
 */
export const verifyUserKyc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be "verified" or "rejected".');
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (status === 'verified') {
    user.kycStatus = 'verified';
    user.isKycVerified = true;
    if (!user.kycData) user.kycData = {};
    user.kycData.verifiedAt = new Date();
    user.kycData.rejectionReason = '';
  } else {
    user.kycStatus = 'rejected';
    user.isKycVerified = false;
    if (!user.kycData) user.kycData = {};
    user.kycData.rejectedAt = new Date();
    user.kycData.rejectionReason =
      reason || 'ID Card document verification failed. Please re-upload clear front & back photos.';
  }

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      status === 'verified'
        ? `KYC for ${user.username} approved! User awarded Verified Trader badge.`
        : `KYC for ${user.username} marked as rejected.`
    )
  );
});
