import mongoose from "mongoose";

const missingTranslationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    pageUrl: {
      type: String,
      default: "/",
      trim: true,
    },
    lang: {
      type: String,
      default: "ar",
      trim: true,
    },
    source: {
      type: String,
      enum: ["client", "server"],
      default: "client",
    },
    count: {
      type: Number,
      default: 1,
    },
    userAgent: {
      type: String,
      default: "",
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

missingTranslationSchema.index(
  { key: 1, pageUrl: 1, lang: 1 },
  { unique: true }
);
missingTranslationSchema.index({ count: -1 });
missingTranslationSchema.index({ resolved: 1 });
missingTranslationSchema.index({ lastSeen: -1 });

export default mongoose.models.MissingTranslation ||
  mongoose.model("MissingTranslation", missingTranslationSchema);
