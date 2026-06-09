import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    images: {
      type: [String],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "At least one image is required",
      },
      required: true,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: [{ type: Number, required: true }],
    },
    addressAr: String,
    addressEn: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approved: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models?.Request ||
  mongoose.model("Request", requestSchema);
