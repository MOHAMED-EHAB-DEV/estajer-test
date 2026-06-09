import mongoose from "mongoose";

const PushSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    sparse: true,
  },
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor",
    unique: true,
    sparse: true,
  },
  subscription: [{ type: Object, required: true }],
});

export default mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);
