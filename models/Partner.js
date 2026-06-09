import mongoose from "mongoose";
import "./Product";
const partnerSchema = new mongoose.Schema(
  {
    // --- Basic Info ---
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: { type: String, required: true }, // Cloudinary URL
    descriptionAr: { type: String },
    descriptionEn: { type: String },

    // --- SEO ---
    seoTitleAr: { type: String },
    seoTitleEn: { type: String },

    // --- About Us Section ---
    aboutUsLink: { type: String },
    aboutUsButtonTextAr: { type: String },
    aboutUsButtonTextEn: { type: String },
    seoDescriptionAr: { type: String },
    seoDescriptionEn: { type: String },
    seoKeywordsAr: { type: String },
    seoKeywordsEn: { type: String },
    ogImage: { type: String },

    // --- Hero Section ---
    heroTitleAr: { type: String },
    heroTitleEn: { type: String },
    heroDescriptionAr: { type: String },
    heroDescriptionEn: { type: String },
    heroBanners: [
      {
        imageAr: { type: String, required: true },
        imageEn: { type: String, required: true },
        link: { type: String },
        altAr: { type: String },
        altEn: { type: String },
        order: { type: Number, default: 0 },
      },
    ],

    // --- Product Sections/Sliders ---
    sliders: [
      {
        titleAr: { type: String, required: true },
        titleEn: { type: String, required: true },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        displayMode: {
          type: String,
          enum: ["slider", "grid"],
          default: "slider",
        },
        order: { type: Number, default: 0 },
      },
    ],

    // --- How It Works Section ---
    howItWorks: {
      sectionTitleAr: { type: String, default: "" },
      sectionTitleEn: { type: String, default: "" },
      estajerSide: {
        titleAr: { type: String, default: "" },
        titleEn: { type: String, default: "" },
        itemsAr: [{ type: String }],
        itemsEn: [{ type: String }],
      },
      partnerSide: {
        titleAr: { type: String, default: "" },
        titleEn: { type: String, default: "" },
        itemsAr: [{ type: String }],
        itemsEn: [{ type: String }],
      },
      sharedBenefits: {
        titleAr: { type: String, default: "" },
        titleEn: { type: String, default: "" },
        itemsAr: [{ type: String }],
        itemsEn: [{ type: String }],
      },
    },

    // --- Offer Banners ---
    offerBanners: [
      {
        titleAr: { type: String, default: "" },
        titleEn: { type: String, default: "" },
        banners: [
          {
            imageAr: { type: String },
            imageEn: { type: String },
            link: { type: String },
            altAr: { type: String },
            altEn: { type: String },
            ctaTextAr: { type: String },
            ctaTextEn: { type: String },
            order: { type: Number, default: 0 },
          },
        ],
        order: { type: Number, default: 2 },
      },
    ],
    // --- Global Search Products ---
    allowedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // --- Status ---
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    aboutUsOrder: { type: Number, default: 1 },
    howItWorksOrder: { type: Number, default: 4 },
  },
  { timestamps: true },
);

// Indexing for faster lookups
partnerSchema.index({ isActive: 1 });

export default mongoose.models.Partner ||
  mongoose.model("Partner", partnerSchema);
