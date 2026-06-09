import mongoose from "mongoose";
import User from "./User";
import Product from "./Product";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "not-paid",
        "pending",
        "confirmed",
        "received",
        "completed",
        "cancelled",
      ],
      default: "not-paid",
    },
    services: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    deliveryType: {
      type: String,
      enum: ["receive", "delivery", "free", "deliveryCompany"],
    },
    selectedBranch: { name: String, _id: String },
    deliveryCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
