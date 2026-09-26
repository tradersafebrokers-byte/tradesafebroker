import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ContactMessage } from '../models/contactMessage.model.js';
import { FooterSetting } from '../models/footerSetting.model.js';

/**
 * @desc    Submit a new contact message (Public)
 * @route   POST /api/v1/contact
 * @access  Public
 */
export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ApiError(400, 'Full name, email address, and message are all required.');
  }

  const newMessage = await ContactMessage.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      newMessage,
      'Your message has been sent successfully. We will be in touch shortly!'
    )
  );
});

/**
 * @desc    Get all contact messages (Admin Only)
 * @route   GET /api/v1/contact
 * @access  Private (Admin only)
 */
export const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { messages, count: messages.length }, 'Contact messages retrieved successfully.')
  );
});

/**
 * @desc    Delete a contact message (Admin Only)
 * @route   DELETE /api/v1/contact/:id
 * @access  Private (Admin only)
 */
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await ContactMessage.findByIdAndDelete(id);

  if (!deleted) {
    throw new ApiError(404, 'Contact message not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { id }, 'Contact message deleted successfully.')
  );
});

/**
 * @desc    Get footer link visibility settings (Public)
 * @route   GET /api/v1/contact/footer-settings
 * @access  Public
 */
export const getFooterSettings = asyncHandler(async (req, res) => {
  let setting = await FooterSetting.findOne({ key: 'footer_config' });
  if (!setting) {
    setting = await FooterSetting.create({ key: 'footer_config', hiddenLinks: [] });
  }

  return res.status(200).json(
    new ApiResponse(200, { hiddenLinks: setting.hiddenLinks }, 'Footer settings retrieved.')
  );
});

/**
 * @desc    Update footer link visibility (Admin Only)
 * @route   POST /api/v1/contact/footer-settings
 * @access  Private (Admin only)
 */
export const updateFooterSettings = asyncHandler(async (req, res) => {
  const { hiddenLinks } = req.body;

  if (!Array.isArray(hiddenLinks)) {
    throw new ApiError(400, 'hiddenLinks must be an array of link labels or IDs.');
  }

  const setting = await FooterSetting.findOneAndUpdate(
    { key: 'footer_config' },
    { hiddenLinks },
    { new: true, upsert: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { hiddenLinks: setting.hiddenLinks }, 'Footer settings updated successfully.')
  );
});
