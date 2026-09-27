import mongoose from 'mongoose';
import { Review } from '../models/review.model.js';
import { Broker } from '../models/broker.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Calculate statistical aggregates (ratings, star breakdown, category metrics)
 * for a set of reviews
 */
const calculateReviewStats = (reviews) => {
  const total = reviews.length;
  if (total === 0) {
    return {
      total: 0,
      averageRating: 4.8,
      recommendPercentage: 96,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      categories: {
        executionSpeed: 4.8,
        customerSupport: 4.7,
        withdrawalSpeed: 4.9,
        spreadsFees: 4.8,
      },
    };
  }

  let totalRating = 0;
  let recommendCount = 0;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let catExec = 0;
  let catSupport = 0;
  let catWithdrawal = 0;
  let catSpreads = 0;

  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    distribution[star] = (distribution[star] || 0) + 1;
    totalRating += r.rating || 5;

    if (r.recommend !== false) {
      recommendCount += 1;
    }

    catExec += r.categories?.executionSpeed || r.rating || 5;
    catSupport += r.categories?.customerSupport || r.rating || 5;
    catWithdrawal += r.categories?.withdrawalSpeed || r.rating || 5;
    catSpreads += r.categories?.spreadsFees || r.rating || 5;
  });

  return {
    total,
    averageRating: parseFloat((totalRating / total).toFixed(1)),
    recommendPercentage: Math.round((recommendCount / total) * 100),
    distribution,
    categories: {
      executionSpeed: parseFloat((catExec / total).toFixed(1)),
      customerSupport: parseFloat((catSupport / total).toFixed(1)),
      withdrawalSpeed: parseFloat((catWithdrawal / total).toFixed(1)),
      spreadsFees: parseFloat((catSpreads / total).toFixed(1)),
    },
  };
};

/**
 * @desc    Get reviews for a specific broker or all brokers
 * @route   GET /api/v1/reviews
 * @access  Public
 */
export const getBrokerReviews = asyncHandler(async (req, res) => {
  const {
    brokerId,
    brokerSlug,
    brokerName,
    rating,
    sentiment,
    status = 'approved',
    search,
    limit = 50,
  } = req.query;

  const query = {};

  if (status && ['approved', 'pending', 'rejected', 'all'].includes(status)) {
    if (status !== 'all') {
      query.status = status;
    }
  } else {
    query.status = 'approved';
  }

  if (brokerId && mongoose.Types.ObjectId.isValid(brokerId)) {
    query.broker = new mongoose.Types.ObjectId(brokerId);
  } else if (brokerSlug) {
    query.brokerSlug = brokerSlug.toLowerCase().trim();
  } else if (brokerName) {
    query.brokerName = { $regex: brokerName.trim(), $options: 'i' };
  }

  if (rating) {
    query.rating = Number(rating);
  }

  if (sentiment && ['positive', 'neutral', 'negative'].includes(sentiment)) {
    query.sentiment = sentiment;
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { title: { $regex: s, $options: 'i' } },
      { comment: { $regex: s, $options: 'i' } },
      { username: { $regex: s, $options: 'i' } },
      { brokerName: { $regex: s, $options: 'i' } },
    ];
  }

  const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(100, Math.max(1, Number(limit))))
    .populate('user', 'username email avatar isKycVerified kycStatus role');

  // Also fetch all approved reviews for this broker to compute aggregate statistics
  let statsQuery = { status: 'approved' };
  if (query.broker) statsQuery.broker = query.broker;
  if (query.brokerSlug) statsQuery.brokerSlug = query.brokerSlug;
  if (query.brokerName) statsQuery.brokerName = query.brokerName;

  const allApproved = await Review.find(statsQuery);
  const stats = calculateReviewStats(allApproved);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        stats,
        totalReturned: reviews.length,
      },
      'Broker reviews fetched successfully'
    )
  );
});

/**
 * @desc    Submit a new review for a broker (User or Broker Partner)
 * @route   POST /api/v1/reviews
 * @access  Public (Optional JWT attaches verified user details)
 */
export const createReview = asyncHandler(async (req, res) => {
  const {
    brokerId,
    brokerSlug,
    brokerName,
    rating,
    title,
    comment,
    categories,
    depositMethodUsed = 'UPI / IMPS',
    recommend = true,
    reviewerRole,
    username: guestUsername,
    userEmail: guestEmail,
  } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    throw new ApiError(400, 'A valid rating between 1 and 5 is required.');
  }

  if (!comment || comment.trim().length < 8) {
    throw new ApiError(400, 'Please write a meaningful review comment (at least 8 characters).');
  }

  let matchedBroker = null;
  if (brokerId && mongoose.Types.ObjectId.isValid(brokerId)) {
    matchedBroker = await Broker.findById(brokerId);
  } else if (brokerSlug) {
    matchedBroker = await Broker.findOne({ slug: brokerSlug.toLowerCase().trim() });
  } else if (brokerName) {
    matchedBroker = await Broker.findOne({
      name: { $regex: `^${brokerName.trim()}$`, $options: 'i' },
    });
  }

  const finalBrokerName = matchedBroker?.name || brokerName?.trim() || 'Forex Broker';
  const finalBrokerSlug = matchedBroker?.slug || brokerSlug?.toLowerCase().trim() || 'forex-broker';

  // Determine reviewer identity
  let userId = null;
  let username = guestUsername?.trim() || 'Verified Trader';
  let userEmail = guestEmail?.trim().toLowerCase() || '';
  let verifiedTrader = true;
  let role = 'trader';

  if (req.user) {
    userId = req.user._id;
    username = req.user.username || username;
    userEmail = req.user.email || userEmail;
    verifiedTrader = Boolean(req.user.isKycVerified || req.user.kycStatus === 'verified');
    if (req.user.role === 'partner' || reviewerRole === 'broker') {
      role = 'broker';
    } else if (req.user.role === 'admin') {
      role = 'admin';
    }
  } else if (reviewerRole === 'broker') {
    role = 'broker';
  }

  // Derive sentiment
  const numRating = Number(rating);
  const sentiment = numRating >= 4 ? 'positive' : numRating === 3 ? 'neutral' : 'negative';

  const newReview = await Review.create({
    broker: matchedBroker?._id || null,
    brokerName: finalBrokerName,
    brokerSlug: finalBrokerSlug,
    user: userId,
    username,
    userEmail,
    rating: numRating,
    title: title?.trim() || `${numRating}★ Trading Review for ${finalBrokerName}`,
    comment: comment.trim(),
    sentiment,
    status: 'approved',
    verifiedTrader,
    depositMethodUsed: depositMethodUsed || 'UPI / IMPS',
    recommend: Boolean(recommend),
    reviewerRole: role,
    categories: {
      executionSpeed: Number(categories?.executionSpeed || numRating),
      customerSupport: Number(categories?.customerSupport || numRating),
      withdrawalSpeed: Number(categories?.withdrawalSpeed || numRating),
      spreadsFees: Number(categories?.spreadsFees || numRating),
    },
  });

  // Dynamically update the Broker record with new rating & reviews count
  if (matchedBroker) {
    const allBrokerReviews = await Review.find({
      broker: matchedBroker._id,
      status: 'approved',
    });
    if (allBrokerReviews.length > 0) {
      const avg =
        allBrokerReviews.reduce((sum, r) => sum + r.rating, 0) / allBrokerReviews.length;
      matchedBroker.rating = parseFloat(avg.toFixed(1));
      matchedBroker.reviewsCount = `${allBrokerReviews.length}+ verified reviews`;
      await matchedBroker.save();
    }
  }

  return res.status(201).json(
    new ApiResponse(201, { review: newReview }, 'Review submitted successfully!')
  );
});

/**
 * @desc    Official Broker Response to a review
 * @route   POST /api/v1/reviews/:id/reply
 * @access  Public / Broker Representative (Optional or Authenticated)
 */
export const replyToReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responseComment, responderName } = req.body;

  if (!responseComment || responseComment.trim().length < 5) {
    throw new ApiError(400, 'Please provide an official response comment.');
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  const officialName =
    responderName?.trim() ||
    (req.user?.username
      ? `${req.user.username} (${review.brokerName} Official)`
      : `${review.brokerName} Official Team`);

  review.brokerResponse = {
    responseComment: responseComment.trim(),
    responderName: officialName,
    respondedAt: new Date(),
    isOfficial: true,
    brokerUser: req.user?._id || null,
  };

  await review.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { review },
      `Official response from ${officialName} posted successfully!`
    )
  );
});

/**
 * @desc    Vote review as helpful
 * @route   POST /api/v1/reviews/:id/helpful
 * @access  Public
 */
export const voteHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const voterKey = req.user?._id?.toString() || req.ip || 'anonymous-voter';

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  // Toggle or increment
  const alreadyVoted = review.helpfulVoters?.includes(voterKey);
  if (alreadyVoted) {
    review.helpfulVoters = review.helpfulVoters.filter((k) => k !== voterKey);
    review.helpfulVotes = Math.max(0, (review.helpfulVotes || 1) - 1);
  } else {
    if (!review.helpfulVoters) review.helpfulVoters = [];
    review.helpfulVoters.push(voterKey);
    review.helpfulVotes = (review.helpfulVotes || 0) + 1;
  }

  await review.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        helpfulVotes: review.helpfulVotes,
        hasVoted: !alreadyVoted,
      },
      alreadyVoted ? 'Helpful vote removed' : 'Marked review as helpful!'
    )
  );
});

/**
 * @desc    Flag a review for moderation / report fake review
 * @route   POST /api/v1/reviews/:id/flag
 * @access  Public
 */
export const flagReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = 'Reported by community member' } = req.body || {};

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  review.flagged = true;
  review.flagReason = reason;
  review.flagCount = (review.flagCount || 0) + 1;
  await review.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { flagged: true, flagCount: review.flagCount },
      'Review has been flagged for compliance review.'
    )
  );
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Admin or review author)
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  // Check authorization: must be admin or author
  if (
    req.user?.role !== 'admin' &&
    (!review.user || review.user.toString() !== req.user?._id?.toString())
  ) {
    throw new ApiError(403, 'You are not authorized to delete this review.');
  }

  await Review.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, null, 'Review deleted successfully.')
  );
});
