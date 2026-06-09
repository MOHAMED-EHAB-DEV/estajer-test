import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    sponsorshipStartDate: { type: Date, default: Date.now },
    sponsorshipEndDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Sponsor =
  mongoose.models.Sponsor || mongoose.model("Sponsor", sponsorSchema);

export default Sponsor;
