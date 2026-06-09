import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { authenticateUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";

// GET - Fetch single task
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const task = await Task.findById(id)
      .populate("createdBy", "fullName email avatar")
      .populate("assignedTo", "fullName email avatar")
      .populate("completedBy", "fullName email avatar")
      .lean();

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update task
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      priority,
      images,
      links,
      assignedTo,
      notes,
    } = body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) {
      updateData.status = status;
      // If completed, set completedBy and completedAt
      if (status === "completed") {
        updateData.completedBy = user._id;
        updateData.completedAt = new Date();
      } else {
        // If status changed from completed to something else, clear completion data
        updateData.completedBy = null;
        updateData.completedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (images !== undefined) {
      // Upload new base64 images to Cloudinary
      updateData.images = await Promise.all(
        images.map(async (image) => {
          if (image.url && image.url.startsWith("data:image")) {
            const uploaded = await cloudinary.uploader.upload(image.url, {
              folder: "tasks",
              format: "webp",
            });
            return {
              url: uploaded.secure_url,
              alt: image.alt || "task image",
            };
          }
          return image;
        })
      );
    }
    if (links !== undefined) updateData.links = links;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (notes !== undefined) updateData.notes = notes;

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "fullName email avatar")
      .populate("assignedTo", "fullName email avatar")
      .populate("completedBy", "fullName email avatar")
      .lean();

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
