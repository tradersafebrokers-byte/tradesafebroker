import apiClient from '../../auth/services/api.client.js';

export const adminService = {
  /**
   * Fetch admin dashboard metrics and overview statistics
   */
  async getStats() {
    return await apiClient.get('/admin/stats');
  },

  /**
   * Fetch all registered users with optional search/filter
   */
  async getUsers(search = '', role = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    return await apiClient.get(`/admin/users?${params.toString()}`);
  },

  /**
   * Update user role (e.g. 'admin' or 'user')
   */
  async updateUserRole(id, role) {
    return await apiClient.patch(`/admin/users/${id}/role`, { role });
  },

  /**
   * Toggle user active/deactivated status
   */
  async toggleUserStatus(id) {
    return await apiClient.patch(`/admin/users/${id}/status`);
  },

  /**
   * Delete user by ID
   */
  async deleteUser(id) {
    return await apiClient.delete(`/admin/users/${id}`);
  },

  /**
   * Fetch all brokers for admin management
   */
  async getBrokers(search = '', status = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return await apiClient.get(`/admin/brokers?${params.toString()}`);
  },

  /**
   * Update broker approval status (approved / rejected / pending)
   */
  async updateBrokerStatus(id, status) {
    return await apiClient.patch(`/admin/brokers/${id}/status`, { status });
  },

  /**
   * Full admin update of broker details (name, minDeposit, leverage, spreads, rating, regulation, etc.)
   */
  async updateBroker(id, data) {
    return await apiClient.put(`/admin/brokers/${id}`, data);
  },

  /**
   * Delete broker by ID
   */
  async deleteBroker(id) {
    return await apiClient.delete(`/admin/brokers/${id}`);
  },

  /**
   * Toggle broker verification badge
   */
  async toggleBrokerVerification(id) {
    return await apiClient.patch(`/admin/brokers/${id}/verify`);
  },

  /**
   * Fetch all reviews for moderation
   */
  async getReviews(search = '', status = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return await apiClient.get(`/admin/reviews?${params.toString()}`);
  },

  /**
   * Delete review by ID
   */
  async deleteReview(id) {
    return await apiClient.delete(`/admin/reviews/${id}`);
  },

  /**
   * Update review status (approved / rejected / pending)
   */
  async updateReviewStatus(id, status) {
    return await apiClient.patch(`/admin/reviews/${id}/status`, { status });
  },

  /**
   * Convenience helper to promote current user to admin in dev/demo
   */
  async promoteMe() {
    return await apiClient.post('/admin/promote-me');
  },

  /**
   * Fetch all testimonials for admin management
   */
  async getTestimonials(search = '', row = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (row) params.append('row', row);
    return await apiClient.get(`/admin/testimonials?${params.toString()}`);
  },

  /**
   * Delete a testimonial by ID
   */
  async deleteTestimonial(id) {
    return await apiClient.delete(`/admin/testimonials/${id}`);
  },

  /**
   * Reset testimonials to default demo set
   */
  async resetDemoTestimonials() {
    return await apiClient.post('/admin/testimonials/reset');
  },

  /**
   * Create a new testimonial
   */
  async createTestimonial(data) {
    return await apiClient.post('/admin/testimonials', data);
  },

  /**
   * Fetch all user KYC verification submissions
   */
  async getKycSubmissions(search = '', status = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return await apiClient.get(`/admin/kyc?${params.toString()}`);
  },

  /**
   * Approve or reject a user KYC verification submission
   */
  async verifyUserKyc(id, status, reason = '') {
    return await apiClient.patch(`/admin/kyc/${id}/status`, { status, reason });
  },
};

export default adminService;
