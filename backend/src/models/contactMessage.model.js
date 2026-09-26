import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    ticketId: {
      type: String,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      default: 'General Support Inquiry',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
    replySubject: {
      type: String,
      trim: true,
    },
    replyMessage: {
      type: String,
      trim: true,
    },
    repliedAt: {
      type: Date,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

contactMessageSchema.pre('save', function (next) {
  if (!this.ticketId) {
    this.ticketId = `TSB-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
