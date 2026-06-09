import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { authenticateUser } from "@/middleware/auth";

// PATCH - Update task priority (move up/down)
export async function PATCH(request) {
  try {
    await connectDB();

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { taskId, direction } = body;

    if (!taskId || !direction) {
      return NextResponse.json(
        { success: false, error: "Task ID and direction are required" },
        { status: 400 }
      );
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Update priority based on direction
    let newPriority = task.priority;
    if (direction === "up") {
      newPriority = task.priority + 1;
    } else if (direction === "down") {
      newPriority = Math.max(0, task.priority - 1);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { priority: newPriority },
      { new: true }
    )
      .populate("createdBy", "fullName email avatar")
      .populate("assignedTo", "fullName email avatar")
      .populate("completedBy", "fullName email avatar")
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: "Priority updated successfully",
    });
  } catch (error) {
    console.error("Error updating task priority:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
