import mongoose from "mongoose";
const homeBannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    imageEn: { type: String, required: true },
    link: { type: String, required: true },
    altAr: { type: String, required: true },
    altEn: { type: String, required: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    nana: Boolean,
    place: {
      type: String,
      enum: ["home", "category", "profile"],
      default: "home",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models.HomeBanner ||
  mongoose.model("HomeBanner", homeBannerSchema);
