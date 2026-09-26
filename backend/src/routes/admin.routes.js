import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllAdminBrokers,
  deleteAdminBroker,
  toggleBrokerVerification,
  updateBrokerStatus,
  updateAdminBroker,
  getAllAdminReviews,
  deleteAdminReview,
  updateReviewStatus,
  promoteMeToAdmin,
  getAllKycSubmissions,
  verifyUserKyc,
} from '../controllers/admin.controller.js';
import {
  getAllAdminTestimonials,
  deleteTestimonial,
  resetDemoTestimonials,
  createTestimonial,
} from '../controllers/testimonial.controller.js';
import { verifyJWT, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all admin routes with JWT verification
router.use(verifyJWT);

// Convenience endpoint to grant admin role to current logged-in user (useful for testing/demo)
router.post('/promote-me', promoteMeToAdmin);

// Enforce admin privileges for all endpoints below
router.use(requireAdmin);

// Stats & Overview
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// User KYC Management
router.get('/kyc', getAllKycSubmissions);
router.patch('/kyc/:id/status', verifyUserKyc);

// Broker Management
router.get('/brokers', getAllAdminBrokers);
router.delete('/brokers/:id', deleteAdminBroker);
router.patch('/brokers/:id/verify', toggleBrokerVerification);
router.patch('/brokers/:id/status', updateBrokerStatus);
router.put('/brokers/:id', updateAdminBroker);
router.patch('/brokers/:id', updateAdminBroker);

// Review Management
router.get('/reviews', getAllAdminReviews);
router.delete('/reviews/:id', deleteAdminReview);
router.patch('/reviews/:id/status', updateReviewStatus);

// Testimonial Management (Marquee & Demo Testimonials)
router.get('/testimonials', getAllAdminTestimonials);
router.post('/testimonials', createTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);
router.post('/testimonials/reset', resetDemoTestimonials);

export default router;
