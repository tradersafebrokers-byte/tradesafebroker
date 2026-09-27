import { Router } from 'express';
import {
  submitContactMessage,
  getContactMessages,
  deleteContactMessage,
  replyContactMessage,
  getFooterSettings,
  updateFooterSettings,
  getMyReplies,
  markReplyAsRead,
} from '../controllers/contact.controller.js';
import { verifyJWT, requireAdmin, optionalVerifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// Public: Submit contact form message (optionalVerifyJWT to link userId if logged in)
router.route('/').post(authLimiter, optionalVerifyJWT, submitContactMessage);

// Public: Get current footer link visibility settings
router.route('/footer-settings').get(getFooterSettings);

// Authenticated: Get unread admin replies for the logged-in user
router.route('/my-replies').get(verifyJWT, getMyReplies);

// Admin Only: Get all contact messages
router.route('/').get(verifyJWT, requireAdmin, getContactMessages);

// Admin Only: Reply to contact message & send email
router.route('/:id/reply').post(verifyJWT, requireAdmin, replyContactMessage);

// Authenticated: Mark an admin reply as read
router.route('/:id/mark-read').patch(verifyJWT, markReplyAsRead);

// Admin Only: Delete a contact message
router.route('/:id').delete(verifyJWT, requireAdmin, deleteContactMessage);

// Admin Only: Update footer link visibility settings
router.route('/footer-settings').post(verifyJWT, requireAdmin, updateFooterSettings);

export default router;
