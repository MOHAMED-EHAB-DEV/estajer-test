import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: ["fake", "inappropriate", "scam", "other"],
  },
  description: String,
  status: {
    type: String,
    enum: ["pending", "reviewed", "resolved"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.models?.Report || mongoose.model("Report", reportSchema);
