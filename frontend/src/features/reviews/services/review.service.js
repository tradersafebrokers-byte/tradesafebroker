import apiClient from '../../auth/services/api.client.js';

export const reviewService = {
  /**
   * Get reviews for a broker (or all reviews) with statistical aggregates
   * @param {Object} params - { brokerId, brokerSlug, brokerName, rating, sentiment, search, page, limit }
   */
  async getBrokerReviews(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return await apiClient.get(`/reviews${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Submit a new trader or broker review
   * @param {Object} reviewData
   */
  async createReview(reviewData) {
    return await apiClient.post('/reviews', reviewData);
  },

  /**
   * Official Broker Reply to a review
   * @param {string} reviewId
   * @param {Object} replyData - { responseComment, responderName }
   */
  async replyToReview(reviewId, replyData) {
    return await apiClient.post(`/reviews/${reviewId}/reply`, replyData);
  },

  /**
   * Upvote review as helpful
   * @param {string} reviewId
   */
  async voteHelpful(reviewId) {
    return await apiClient.post(`/reviews/${reviewId}/helpful`);
  },

  /**
   * Flag/report a review for spam or violation
   * @param {string} reviewId
   * @param {string} reason
   */
  async flagReview(reviewId, reason = 'Community report') {
    try {
      return await apiClient.post(`/reviews/${reviewId}/flag`, { reason });
    } catch {
      return { success: true };
    }
  },

  /**
   * Delete review (Admin or Author)
   * @param {string} reviewId
   */
  async deleteReview(reviewId) {
    return await apiClient.delete(`/reviews/${reviewId}`);
  },
};

export default reviewService;
