import mongoose from "mongoose";
import Booking from "./Booking";
import Partner from "./Partner";
// Helper function to generate safe, readable 8-char IDs
const generateOrderId = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const orderSchema = new mongoose.Schema({
  _id: { type: String, default: generateOrderId },
  userData: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    notes: String,
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
  price: { type: Number, required: true },
  tax: { type: Number, required: true },
  insurance: { type: Number, required: true },
  deliveryCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  ownerAmount: Number,
  status: {
    type: String,
    enum: [
      "not-paid",
      "pending",
      "confirmed",
      "received",
      "completed",
      "cancelled",
      "rejecting",
      "not-returned",
    ],
    default: "not-paid",
  },
  invoiceId: Number,
  paymentUrl: String,
  contractId: String,
  milestoneId: String,
  waffyStatus: String,
  paymentId: String,
  paymentGateway: String,
  nanaStatus: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  documentationImages: [String],
  ownerDocumentationImages: [String],
  deliveryCode: String,
  renterConfirmedAt: Date,
  ownerConfirmedAt: Date,
  deliveryNotificationSent: { type: Boolean, default: false },
  returnNotificationSent: { type: Boolean, default: false },
  rejectionApproved: { type: Boolean, default: false },
  hasDamageReport: { type: Boolean, default: false },
  lastCashoutEmailSent: Date,
  createdAt: { type: Date, default: Date.now },
  adminNotes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      note: String,
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

orderSchema.pre("find", function (next) {
  this.populate({
    path: "items",
    populate: {
      path: "product",
      select:
        "nameAr nameEn category images location deliveryType selectedBranch deliveryCost",
    },
  });
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
