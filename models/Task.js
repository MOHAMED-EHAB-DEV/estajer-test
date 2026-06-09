import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: String,
    type: {
      type: String,
      enum: [
        "programming",
        "bug",
        "feature",
        "seo",
        "marketing",
        "ui",
        "ux",
        "design",
        "content",
        "testing",
        "documentation",
        "other",
      ],
      required: [true, "Task type is required"],
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: { type: Number, default: 0, min: 0 },
    images: [{ url: String, alt: String }],
    links: [{ url: String, title: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true },
);

// // Index for efficient sorting and filtering
// taskSchema.index({ priority: -1, createdAt: -1 });
// taskSchema.index({ status: 1 });
// taskSchema.index({ type: 1 });
// taskSchema.index({ createdBy: 1 });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
