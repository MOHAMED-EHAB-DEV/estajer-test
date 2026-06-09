import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    image: { type: String }, // Required for main categories, optional for subcategories
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null means it's a main category
    },
    order: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    productsCount: { type: Number, default: 0 },
    nana: Boolean,
    visits: { type: Number, default: 0 },
    hideFromHome: { type: Boolean, default: false },
    seoTitleAr: { type: String },
    seoTitleEn: { type: String },
    seoDescriptionAr: { type: String },
    seoDescriptionEn: { type: String },
    seoKeywordsAr: { type: String },
    seoKeywordsEn: { type: String },
    richContentAr: { type: String }, // Rich SEO content in Arabic
    richContentEn: { type: String }, // Rich SEO content in English
  },
  { timestamps: true },
);

// Index for faster queries
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ status: 1 });

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Make sure virtuals are included in toJSON and toObject
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

export default mongoose.models?.Category ||
  mongoose.model("Category", categorySchema);
