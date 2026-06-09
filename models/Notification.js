import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["default", "accepted", "canceled", "message", "order"],
      required: true,
    },
    seen: { type: Boolean, default: false },
    relatedId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
