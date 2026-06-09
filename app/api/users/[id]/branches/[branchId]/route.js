import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

// PATCH - Update a branch
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, branchId } = await params;

    // Check if the authenticated user is the owner or admin
    if (user._id.toString() !== id && user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { name, address, location } = await request.json();

    // Update the branch
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, "branches._id": branchId },
      {
        $set: {
          "branches.$.name.ar": name?.ar,
          "branches.$.name.en": name?.en,
          "branches.$.address.ar": address?.ar || "",
          "branches.$.address.en": address?.en || "",
          "branches.$.location": location || {},
        },
      },
      { new: true }
    ).select("-password -verificationCode");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User or branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Branch updated successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/[id]/branches/[branchId]",
      method: "PATCH",
      req: request,
    });
  }
}

// DELETE - Remove a branch
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, branchId } = await params;

    // Check if the authenticated user is the owner or admin
    if (user._id.toString() !== id && user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Remove the branch
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $pull: { branches: { _id: branchId } } },
      { new: true }
    ).select("-password -verificationCode");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/[id]/branches/[branchId]",
      method: "DELETE",
      req: request,
    });
  }
}
