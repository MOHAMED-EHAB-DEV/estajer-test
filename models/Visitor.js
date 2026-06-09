import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: [true, "ip is required"],
      unique: [true, "ip must be unique"],
    },
    userAgent: String,
    referrer: String,
    path: String,
    acceptLanguage: String,
  },
  { timestamps: true },
);

export default mongoose.models.Visitor ||
  mongoose.model("Visitor", visitorSchema);
