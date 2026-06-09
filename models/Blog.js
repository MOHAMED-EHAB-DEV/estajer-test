import mongoose from "mongoose";
const blogSchema = new mongoose.Schema(
  {
    titleAr: { type: String, required: true },
    titleEn: { type: String, required: true },
    contentEn: { type: String, required: true },
    contentAr: { type: String, required: true },
    thumbnail: {
      preview: { type: String, required: true },
      gradientColors: [String],
      gradientStyle: String,
    },
    category: {
      type: String,
      enum: ["latestNews", "partnerships", "eventParticipation", "topics"],
      required: true,
    },
    seoTitleAr: String,
    seoTitleEn: String,
    seoDescriptionAr: String,
    seoDescriptionEn: String,
    urlName: { type: String, required: true, unique: true },
    altText: String,
    hidden: { type: Boolean, default: false },
    comments: [
      {
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: { type: String, required: true, trim: true },
        subComments: [
          {
            owner: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            text: { type: String, required: true, trim: true },
          },
        ],
      },
    ],
    faqs: [
      {
        questionAr: { type: String },
        questionEn: { type: String },
        answerAr: { type: String },
        answerEn: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models?.Blog || mongoose.model("Blog", blogSchema);
