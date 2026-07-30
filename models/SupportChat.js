import mongoose from "mongoose";
import { nanoid } from "nanoid";

const feedbackItemSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => nanoid(8) },
    type: {
      type: String,
      enum: ["bug", "suggestion", "review", "other"],
      required: true,
    },
    summary: { type: String, required: true, maxlength: 500 },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "dismissed"],
      default: "pending",
    },
    isHidden: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } },
);

const supportMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "ai", "admin"],
      required: true,
    },
    content: { type: String, default: "", maxlength: 1000 },
    imageUrl: { type: String },
    state: {
      type: String,
      enum: ["sent", "read"],
      default: "sent",
    },
    feedbackRef: { type: String }, // id of the feedbackItem this message created/updated
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true },
);

const supportChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    messages: [supportMessageSchema],
    feedbackItems: [feedbackItemSchema],
    aiMode: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.SupportChat ||
  mongoose.model("SupportChat", supportChatSchema);
