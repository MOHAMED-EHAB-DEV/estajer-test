import mongoose from "mongoose";
import Booking from "./Booking";
// Helper function to generate safe, readable 8-char IDs
const generateOrderId = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const preOrderSchema = new mongoose.Schema({
  _id: { type: String, default: generateOrderId },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner",
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
  ],
  cartItems: { type: Array, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, required: true },
  insurance: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "used", "expired"],
    default: "pending",
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Expires after 1 hour
  },
  createdAt: { type: Date, default: Date.now },
});

preOrderSchema.pre("find", function (next) {
  this.populate({
    path: "items",
    populate: {
      path: "product",
      select: "nameAr nameEn descriptionAr images location rental",
    },
  });
  next();
});

preOrderSchema.pre("findOne", function (next) {
  this.populate({
    path: "items",
    populate: {
      path: "product",
      select: "nameAr nameEn descriptionAr images location rental",
    },
  });
  next();
});

const PreOrder =
  mongoose.models.PreOrder || mongoose.model("PreOrder", preOrderSchema);

export default PreOrder;
