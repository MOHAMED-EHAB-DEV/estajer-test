import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.profileImageStatus !== "rejected") {
      return NextResponse.json(
        { error: "Image is not rejected" },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { reviewRequested: true } },
      { new: true },
    ).select("-password -verificationCode");

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/profile-image/review",
      method: "POST",
      req: request,
    });
  }
}
