import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    nanaId: String,
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
    },
    unsubscribed: Boolean,
    avatar: {
      type: String,
      required: [true, "Avatar is required"],
      default:
        "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
    },
    bioAr: { type: String },
    bioEn: { type: String },
    address: { type: String },
    location: { lat: Number, lng: Number },
    pathName: {
      type: String,
      unique: [true, "Path name must be unique"],
      lowercase: true,
      maxlength: [23, "Path name must be less than 23 characters"],
    },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isBanned: { type: Boolean, default: false },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      unique: [true, "Phone number must be unique"],
      required: [true, "Phone number is required"],
    },
    lang: {
      type: String,
      default: "ar",
      enum: ["ar", "en"],
    },
    accountType: {
      type: String,
      enum: ["personal", "company", "admin"],
      default: "personal",
    },
    companyDetails: {
      companyName: String,
      registerNumber: String,
      taxCode: String,
    },
    documentCode: String,
    freelanceCertificate: {
      status: {
        type: String,
        enum: [
          "ACTIVE",
          "EXPIRED",
          "REVOKED",
          "REJECTED",
          "CANCELED",
          "PENDING",
        ],
      },
      expiryDate: String,
      verifiedAt: Date,
    },
    iban: String,
    vomId: String,
    waffyId: String,
    waffyAddress: Boolean,
    clientUserToken: String,
    nationalId: String,
    unifiedNumber: String,
    nafathTempId: String,
    nafathData: {
      firstNameAr: String,
      fatherNameAr: String,
      grandFatherNameAr: String,
      lastNameAr: String,
      firstNameEn: String,
      fatherNameEn: String,
      grandFatherNameEn: String,
      lastNameEn: String,
      dateOfBirthG: String,
      dateOfBirthH: String,
      gender: String,
      nationality: String,
      nationalityCode: String,
      expiryDateG: String,
      issuePlace: String,
      transId: String,
      status: String,
    },
    premium: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    nafathVerified: { type: Boolean, default: false },
    hasBranches: { type: Boolean, default: false },
    branches: [
      {
        name: { ar: String, en: String },
        address: {
          ar: {
            country: String,
            governorate: String,
            city: String,
            neighborhood: String,
          },
          en: {
            country: String,
            governorate: String,
            city: String,
            neighborhood: String,
          },
        },
        location: { lat: Number, lng: Number },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    verificationCode: { code: String, expiresAt: Date },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      sum: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
    isRenter: { type: Boolean, default: false },
    commission: { type: Number, default: 15, min: 0, max: 100 },
    skipIbanVerification: { type: Boolean, default: false },
    profileImageStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    rejectionReason: { type: String },
    rejectedImage: { type: String },
    reviewRequested: { type: Boolean, default: false },
    productsCount: { type: Number, default: 0 },
    hasShop: { type: Boolean, default: false },
    holidayPeriods: [
      {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true, strict: true },
);

// Add method to check if verification code is valid
userSchema.methods.isVerificationCodeValid = function (code) {
  return (
    this.verificationCode.code === code &&
    this.verificationCode.expiresAt > new Date()
  );
};

export default mongoose.models.User || mongoose.model("User", userSchema);
