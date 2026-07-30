import mongoose from "mongoose";

const premiumOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    milestoneId: { type: String, required: true, unique: true },
    contractId: { type: String, required: true },
    paymentUrl: { type: String },
    amount: { type: Number, required: true },
    plan: {
      type: String,
      enum: ["starter", "growth"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["new", "upgrade"],
      default: "new",
    },
    status: {
      type: String,
      enum: ["not-paid", "paid"],
      default: "not-paid",
    },
    waffyStatus: {
      type: String,
      default: "PAYMENT_PROCESSING",
    },
    couponCode: { type: String },
    discountPercent: { type: Number },
    trialMonths: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.PremiumOrder ||
  mongoose.model("PremiumOrder", premiumOrderSchema);
