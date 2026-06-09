import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: null,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    enum: ["loading", "sent", "read"],
    required: true,
    default: "sent",
  },
  attachments: [String],
  isAdmin: Boolean,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "inprogress", "cancelled", "solved"],
      default: "new",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    messages: [messageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lang: {
      type: String,
      default: "ar",
      enum: ["ar", "en"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    visitorId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models?.Ticket ||
  mongoose.model("Ticket", ticketSchema);
