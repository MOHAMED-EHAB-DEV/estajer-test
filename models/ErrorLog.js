import mongoose from "mongoose";

const ErrorLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    stack: { type: String },
    endpoint: { type: String, required: true },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      required: true,
    },
    statusCode: { type: Number, default: 500 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requestBody: { type: mongoose.Schema.Types.Mixed },
    requestParams: { type: mongoose.Schema.Types.Mixed },
    userAgent: { type: String },
    ip: { type: String },
    resolved: { type: Boolean, default: false },
    resourceId: { type: String },
    userToken: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Index for efficient querying
ErrorLogSchema.index({ createdAt: -1 });
ErrorLogSchema.index({ endpoint: 1 });
ErrorLogSchema.index({ resolved: 1 });

const ErrorLog =
  mongoose.models.ErrorLog || mongoose.model("ErrorLog", ErrorLogSchema);

export default ErrorLog;
