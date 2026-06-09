import mongoose from "mongoose";
const damageReportSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    beforeImages: [
      {
        preview: { type: String, required: true },
        gradientColors: [String],
        gradientStyle: String,
      },
    ],
    afterImages: [
      {
        preview: { type: String, required: true },
        gradientColors: [String],
        gradientStyle: String,
      },
    ],
    damageDescription: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
    adminNotes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    notes: String,
  },
  { timestamps: true },
);

// Populate references on find
damageReportSchema.pre("find", function (next) {
  this.populate([
    {
      path: "order",
      select: "_id startDate endDate totalAmount status documentationImages",
    },
    {
      path: "product",
      select: "nameAr nameEn images",
    },
    {
      path: "reporter",
      select: "fullName email avatar",
    },
    {
      path: "customer",
      select: "fullName email avatar",
    },
    {
      path: "reviewedBy",
      select: "fullName email",
    },
  ]);
  next();
});

damageReportSchema.pre("findOne", function (next) {
  this.populate([
    {
      path: "order",
      select: "_id startDate endDate totalAmount status documentationImages",
    },
    {
      path: "product",
      select: "nameAr nameEn images",
    },
    {
      path: "reporter",
      select: "fullName email avatar",
    },
    {
      path: "customer",
      select: "fullName email avatar",
    },
    {
      path: "reviewedBy",
      select: "fullName email avatar",
    },
  ]);
  next();
});

export default mongoose.models?.DamageReport ||
  mongoose.model("DamageReport", damageReportSchema);
