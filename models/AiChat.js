import mongoose from "mongoose";
const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true, maxlength: 1000 },
    aiData: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    state: { type: String, enum: ["sent", "read"], default: "sent" },
    isAdmin: Boolean,
  },
  { _id: true }
);

const aiChatSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
    visitorName: { type: String },
    messages: [aiMessageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    metadata: {
      ip: String,
      userAgent: String,
      acceptLanguage: String,
      referrer: String,
      path: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AiChat || mongoose.model("AiChat", aiChatSchema);
