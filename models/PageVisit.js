import mongoose from "mongoose";

const pageVisitSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, index: true },
    date: {
      type: Date,
      required: true,
      index: true,
      default: function () {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return today;
      },
    },
    count: { type: Number, required: true, default: 0 },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      index: true,
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound unique index: one doc per page per lang per day
pageVisitSchema.index({ page: 1, date: 1 }, { unique: true });

export default mongoose.models?.PageVisit ||
  mongoose.model("PageVisit", pageVisitSchema);
