import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, default: "", maxLength: 500 },
  state: {
    type: String,
    enum: ["loading", "sent", "read"],
    required: true,
    default: "sent",
  },
  isAdmin: Boolean,
  timestamp: { type: Date, default: Date.now },
  aiData: { type: mongoose.Schema.Types.Mixed },
});

const chatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  participants: [
    { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } },
  ],
  messages: [messageSchema],
  lastMessageAt: { type: Date, default: Date.now },
});

// Generate chatId from participant IDs
chatSchema.pre("save", function (next) {
  if (!this.chatId) {
    const sortedIds = this.participants
      .map((p) => p.userId.toString())
      .sort()
      .join("_");
    this.chatId = sortedIds;
  }
  next();
});
export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
