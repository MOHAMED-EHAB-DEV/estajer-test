import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    quantity: { type: Number, required: true },
    minQuantity: { type: Number, default: 1 },
    category: { type: String, required: true },
    subCategory: { type: String },
    images: [
      {
        preview: { type: String, required: true },
        gradientColors: { type: [String], default: ["#fff7f0", "#fff3ea"] },
        gradientStyle: {
          type: String,
          default: "linear-gradient(135deg, #fff7f0, #fff3ea)",
        },
      },
    ],
    approved: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    rejectMessage: String,
    isMain: { type: Boolean, default: false },
    location: {
      type: { type: String, default: "Point" },
      coordinates: [{ type: Number, required: true }],
    },
    addressAr: {
      country: String,
      governorate: String,
      city: String,
      neighborhood: String,
    },
    addressEn: {
      country: String,
      governorate: String,
      city: String,
      neighborhood: String,
    },
    nana: Boolean,
    rental: {
      value: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      delivery: {
        type: {
          type: String,
          enum: ["receive", "delivery", "free", "deliveryCompany"],
        },
        cost: Number,
        pricingModel: {
          type: String,
          enum: ["perKm", "fixedCity"],
          default: "perKm",
        },
        fixedCityPricing: [
          {
            id: Number,
            cityAr: String,
            cityEn: String,
            governorateAr: String,
            governorateEn: String,
            displayName: String,
            isGovernorate: { type: Boolean, default: false },
            price: Number,
          },
        ],
      },
      minDays: { type: Number, required: true, default: 1 },
      discountTiers: [
        {
          id: Number,
          minDays: Number,
          discount: Number,
          discountPrice: Number,
          discountType: String,
          dateRanges: [{ from: Date, to: Date, id: Number }],
        },
      ],
      quantityDiscountTiers: [
        {
          id: Number,
          minQuantity: Number,
          discount: Number,
        },
      ],
      packages: [
        {
          id: Number,
          unit: {
            type: String,
            enum: ["hours", "days", "weeks", "months"],
          },
          duration: Number,
          price: Number,
          daysNumber: Number,
        },
      ],
    },
    services: [
      {
        id: Number,
        nameAr: String,
        nameEn: String,
        quantity: Number,
        price: Number,
        pricingType: {
          type: String,
          enum: ["perDay", "fixed"],
          default: "perDay",
        },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lovedCount: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      sum: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["excellent", "veryGood", "good"],
      default: "excellent",
    },
    sales: {
      totalCount: { type: Number, default: 0 },
      monthlyCount: { type: Number, default: 0 },
      lastMonthlyReset: { type: Date, default: Date.now },
    },
    pricingModel: { type: String, enum: ["perDay", "packages"] },
    vomId: String,
    providers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Partner" }],
    shopCategories: [{ type: mongoose.Schema.Types.ObjectId }],
    useCases: [{ nameAr: String, nameEn: String }],
    specs: [{ keyAr: String, keyEn: String, valueAr: String, valueEn: String }],
    features: [
      { titleAr: String, titleEn: String, descAr: String, descEn: String },
    ],
    seoTitleAr: { type: String, default: "" },
    seoTitleEn: { type: String, default: "" },
    seoDescriptionAr: { type: String, default: "" },
    seoDescriptionEn: { type: String, default: "" },
  },
  { timestamps: true },
);

// Create geospatial index
productSchema.index({ location: "2dsphere" });

productSchema.index({
  nameEn: "text",
  nameAr: "text",
  descriptionEn: "text",
  descriptionAr: "text",
});

export default mongoose.models?.Product ||
  mongoose.model("Product", productSchema);
