import mongoose from "mongoose";

const visitorCountSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      default: function () {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return today;
      },
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.models.VisitorCount ||
  mongoose.model("VisitorCount", visitorCountSchema);
