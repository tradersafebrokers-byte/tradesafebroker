import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ContactMessage } from '../models/contactMessage.model.js';
import { FooterSetting } from '../models/footerSetting.model.js';
import { sendEmail } from '../services/mail.service.js';

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

  const ticketId = `TSB-${Math.floor(100000 + Math.random() * 900000)}`;

  const newMessage = await ContactMessage.create({
    ticketId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    status: 'unread',
  });

  // Automated Ticket Confirmation & Auto-Reply Dispatch
  try {
    const autoReplyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 28px; text-align: center; }
          .logo { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .logo span { color: #fc5d21; }
          .badge { display: inline-block; background: rgba(252, 93, 33, 0.15); color: #fc5d21; border: 1px solid rgba(252, 93, 33, 0.3); font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 12px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .ticket-card { background: #f1f5f9; border-left: 4px solid #fc5d21; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; }
          .ticket-title { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .ticket-num { font-size: 18px; font-weight: 800; color: #0f172a; }
          .msg-preview { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13.5px; color: #334155; }
          .footer { padding: 20px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">TradeSafe<span>Brokers</span></div>
            <div class="badge">Support Ticket Created</div>
          </div>
          <div class="content">
            <h2 style="margin-top: 0; font-size: 18px; color: #0f172a;">Hello ${name.trim()},</h2>
            <p>Thank you for contacting the <strong>TradeSafeBrokers Support Desk</strong>. Your request has been logged and assigned an official tracking ticket:</p>
            
            <div class="ticket-card">
              <div class="ticket-title">Official Support Ticket ID</div>
              <div class="ticket-num">#${ticketId}</div>
            </div>

            <p>Our compliance and trader support team is reviewing your inquiry. We typically reply within 2–6 business hours.</p>

            <div class="ticket-title" style="margin-top: 20px;">Summary of your inquiry:</div>
            <div class="msg-preview">
              ${message.trim().replace(/\n/g, '<br>')}
            </div>

            <p style="font-size: 13px; color: #64748b;">If you have additional details to provide, simply reply directly to this email with reference to ticket <strong>#${ticketId}</strong>.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} TradeSafeBrokers Support Team. All rights reserved.<br>
            Empowering traders with verified, regulated broker intelligence.
          </div>
        </div>
      </body>
      </html>
    `;

    sendEmail({
      to: email.trim().toLowerCase(),
      subject: `[Ticket #${ticketId}] Support Inquiry Received - TradeSafeBrokers`,
      html: autoReplyHtml,
      text: `Hello ${name.trim()},\n\nThank you for reaching out to TradeSafeBrokers Support. Your support ticket has been created: #${ticketId}.\n\nOur team is reviewing your message:\n"${message.trim()}"\n\nWe will get back to you shortly.\n\nTradeSafeBrokers Support Desk`,
    }).catch((err) => {
      console.warn('⚠️ [Contact Auto-Reply Mail Skipped/Failed]:', err.message);
    });
  } catch (err) {
    console.warn('⚠️ [Auto-reply setup error]:', err.message);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      newMessage,
      `Your support ticket #${ticketId} has been created. An auto-confirmation email was sent to ${email.trim()}.`
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
 * @desc    Reply to a contact message and dispatch email to user (Admin Only)
 * @route   POST /api/v1/contact/:id/reply
 * @access  Private (Admin only)
 */
export const replyContactMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replySubject, replyMessage } = req.body;

  if (!replyMessage?.trim()) {
    throw new ApiError(400, 'Reply message cannot be empty.');
  }

  const message = await ContactMessage.findById(id);
  if (!message) {
    throw new ApiError(404, 'Contact message not found.');
  }

  const ticketId = message.ticketId || `TSB-${message._id.toString().slice(-6).toUpperCase()}`;
  const subject = replySubject?.trim() || `Re: [Ticket #${ticketId}] Support Inquiry - TradeSafeBrokers`;

  const replyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 28px; text-align: center; }
        .logo { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo span { color: #fc5d21; }
        .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 10px; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .reply-body { font-size: 14.5px; color: #0f172a; line-height: 1.7; background: #fdfdfd; padding: 18px 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0; }
        .quote-box { background: #f8fafc; border-left: 3px solid #94a3b8; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 22px 0 10px; font-size: 13px; color: #64748b; }
        .quote-meta { font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        .footer { padding: 20px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TradeSafe<span>Brokers</span></div>
          <div class="badge">Official Support Response • Ticket #${ticketId}</div>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; font-size: 18px; color: #0f172a;">Dear ${message.name},</h2>
          <p>This is an official response from the TradeSafeBrokers Executive Support Desk regarding your inquiry under ticket <strong>#${ticketId}</strong>.</p>
          
          <div class="reply-body">
            ${replyMessage.trim().replace(/\n/g, '<br>')}
          </div>

          <div class="quote-box">
            <div class="quote-meta">Your original message on ${new Date(message.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}:</div>
            ${message.message.replace(/\n/g, '<br>')}
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            Need further clarification? You can reply directly to this email anytime.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} TradeSafeBrokers Support Desk. All rights reserved.<br>
          Official communication from TradeSafeBrokers Regulatory &amp; Trader Services.
        </div>
      </div>
    </body>
    </html>
  `;

  // Update DB record first to guarantee real-time website notification delivery
  message.status = 'replied';
  message.ticketId = ticketId;
  message.replySubject = subject;
  message.replyMessage = replyMessage.trim();
  message.repliedAt = new Date();
  if (req.user?._id) {
    message.repliedBy = req.user._id;
  }
  await message.save();

  // Dispatch email to user asynchronously / safely
  let emailDispatched = false;
  try {
    await sendEmail({
      to: message.email,
      subject,
      html: replyHtml,
      text: `Dear ${message.name},\n\n${replyMessage.trim()}\n\n---\nOriginal message on ${new Date(message.createdAt).toLocaleString()}:\n"${message.message}"\n\nTradeSafeBrokers Support Desk (Ticket #${ticketId})`,
    });
    emailDispatched = true;
  } catch (mailErr) {
    console.warn('⚠️ [Admin Reply Mail Notice]:', mailErr.message);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      message,
      `Reply recorded and delivered to user popup${emailDispatched ? ` and emailed to ${message.email}` : ''} (Ticket #${ticketId}).`
    )
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

/**
 * @desc    Get replied contact messages for client popup (by ticketIds, email, or logged-in user)
 * @route   GET /api/v1/contact/replies
 * @access  Public / Optional Auth
 */
export const getUserReplies = asyncHandler(async (req, res) => {
  const { ticketIds, email } = req.query;
  const orConditions = [];

  if (ticketIds) {
    const ids = String(ticketIds)
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.length > 0) {
      orConditions.push({ ticketId: { $in: ids } });
    }
  }

  if (email && typeof email === 'string' && email.trim()) {
    orConditions.push({ email: email.trim().toLowerCase() });
  }

  if (req.user?.email) {
    orConditions.push({ email: req.user.email.trim().toLowerCase() });
  }

  if (orConditions.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { replies: [] }, 'No inquiry identifier provided.')
    );
  }

  const replies = await ContactMessage.find({
    status: 'replied',
    $or: orConditions,
  })
    .sort({ repliedAt: -1, updatedAt: -1 })
    .limit(20)
    .select('_id ticketId name email message subject replySubject replyMessage repliedAt createdAt');

  return res.status(200).json(
    new ApiResponse(200, { replies }, 'Support replies retrieved successfully.')
  );
});
