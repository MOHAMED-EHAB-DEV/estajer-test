import mongoose from "mongoose";

const mcpAuthCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export default mongoose.models?.McpAuthCode ||
  mongoose.model("McpAuthCode", mcpAuthCodeSchema);
