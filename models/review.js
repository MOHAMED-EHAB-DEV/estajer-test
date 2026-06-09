import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      quality: {
        type: Number,
        required: [true, "Quality rating is required"],
        min: 1,
        max: 5,
      },
      price: {
        type: Number,
        required: [true, "Price rating is required"],
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        required: [true, "Communication rating is required"],
        min: 1,
        max: 5,
      },
      experience: {
        type: Number,
        required: [true, "Experience rating is required"],
        min: 1,
        max: 5,
      },
      overall: {
        type: Number,
        required: [true, "Overall rating is required"],
        min: 1,
        max: 5,
      },
    },
    userName: String,
    userImage: String,
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
    images: [String],
  },
  { timestamps: true },
);
reviewSchema.index({ product: 1, createdAt: -1 });
export default mongoose.models?.Review ||
  mongoose.model("Review", reviewSchema);
