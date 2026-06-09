import mongoose from "mongoose";
mongoose.models = {};
const heroSlideSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    imageEn: { type: String, required: true },
    altAr: { type: String, required: true },
    altEn: { type: String, required: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    link: { type: String },
    titleAr: { type: String },
    titleEn: { type: String },
    subtitleAr: { type: String },
    subtitleEn: { type: String },
    buttonTextAr: { type: String },
    buttonTextEn: { type: String },
    textPosition: {
      type: String,
      enum: ["start", "center", "end"],
      default: "start",
    },
    textColor: { type: String, default: "#ffffff" },
    imagePositionX: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center",
    },
    imagePositionY: {
      type: String,
      enum: ["top", "center", "bottom"],
      default: "center",
    },
  },
  { timestamps: true },
);

export default mongoose.models.HeroSlide ||
  mongoose.model("HeroSlide", heroSlideSchema);
