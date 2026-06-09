import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

// POST - Add a new branch
export async function POST(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    const { id } = await params;

    // Check if the authenticated user is the owner or admin
    if (user._id.toString() !== id && user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the target user
    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has branches enabled
    if (!targetUser.hasBranches) {
      return NextResponse.json(
        { success: false, error: "Branches not enabled for this user" },
        { status: 400 }
      );
    }

    const { name, address, location } = await request.json();

    if (!name?.ar?.trim() || !name?.en?.trim()) {
      return NextResponse.json(
        { success: false, error: "Branch name is required in both languages" },
        { status: 400 }
      );
    }

    // Add the new branch
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          branches: {
            name: {
              ar: name.ar.trim(),
              en: name.en.trim(),
            },
            address: {
              ar: address?.ar || "",
              en: address?.en || "",
            },
            location: location || {},
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    ).select("-password -verificationCode");

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Branch added successfully",
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/users/[id]/branches",
      method: "POST",
      id,
      req: request,
    });
  }
}
