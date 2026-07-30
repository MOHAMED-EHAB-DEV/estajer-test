import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    usageLimit: {
      type: Number, // null or number. If null, unlimited.
      default: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date, // null means no expiration.
      default: null,
    },
    trialMonths: {
      type: Number, // null or number.
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
