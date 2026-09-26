import { Router } from 'express';
import {
  submitContactMessage,
  getContactMessages,
  deleteContactMessage,
  replyContactMessage,
  getFooterSettings,
  updateFooterSettings,
  getUserReplies,
} from '../controllers/contact.controller.js';
import { verifyJWT, requireAdmin, optionalVerifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public: Submit contact form message
router.route('/').post(submitContactMessage);

// Public / User: Check replied inquiries for client toast & fixed popup
router.route('/replies').get(optionalVerifyJWT, getUserReplies);

// Public: Get current footer link visibility settings
router.route('/footer-settings').get(getFooterSettings);

// Admin Only: Get all contact messages
router.route('/').get(verifyJWT, requireAdmin, getContactMessages);

// Admin Only: Reply to contact message & send email
router.route('/:id/reply').post(verifyJWT, requireAdmin, replyContactMessage);

// Admin Only: Delete a contact message
router.route('/:id').delete(verifyJWT, requireAdmin, deleteContactMessage);

// Admin Only: Update footer link visibility settings
router.route('/footer-settings').post(verifyJWT, requireAdmin, updateFooterSettings);

export default router;
