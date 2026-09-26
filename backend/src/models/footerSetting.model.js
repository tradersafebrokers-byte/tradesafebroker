import mongoose from 'mongoose';

const footerSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'footer_config',
      unique: true,
    },
    hiddenLinks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const FooterSetting = mongoose.model('FooterSetting', footerSettingSchema);
