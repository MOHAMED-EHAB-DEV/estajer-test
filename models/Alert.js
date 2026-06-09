import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    order: { type: String, ref: "Order" },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    proposal: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
    damageReport: { type: mongoose.Schema.Types.ObjectId, ref: "DamageReport" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  },
  { timestamps: true },
);

export default mongoose.models.Alert || mongoose.model("Alert", alertSchema);
