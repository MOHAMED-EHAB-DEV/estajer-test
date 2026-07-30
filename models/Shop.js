import mongoose from "mongoose";
const shopSchema = new mongoose.Schema(
  {
    // --- Owner ---
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // A user can only have one shop
    },
    // --- Basic Info ---
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    domain: { type: String, default: null, sparse: true, index: true }, // Custom domain e.g. "alaaelbana.com"
    gtmId: { type: String, default: null }, // Custom GTM Container ID e.g. "GTM-XXXXXX"
    logo: { type: String, required: true }, // Cloudinary URL
    descriptionAr: { type: String },
    descriptionEn: { type: String },
    // --- Brand ---
    brandColor: { type: String, default: "#E04B2A" },
    // --- SEO ---
    seoTitleAr: { type: String },
    seoTitleEn: { type: String },
    seoDescriptionAr: { type: String },
    seoDescriptionEn: { type: String },
    seoKeywordsAr: { type: String },
    seoKeywordsEn: { type: String },
    ogImage: { type: String },
    sections: [
      {
        _id: false,
        instanceId: { type: String, required: true }, // nanoid — unique per added section
        themeId: { type: String, required: true, default: "classic" },
        sectionType: { type: String, required: true }, // "hero" | "about" | "slider" | "offerBanners" | "categories" | "howItWorks" | "reviews"
        order: { type: Number, default: 0 },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    shopCommission: { type: Number, default: 10, min: 0, max: 100 },
    plan: {
      type: String,
      enum: ["starter", "growth"],
      default: "starter",
    },
    // --- Status ---
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Shop || mongoose.model("Shop", shopSchema);
