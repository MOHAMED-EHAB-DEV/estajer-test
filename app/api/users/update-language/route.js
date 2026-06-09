import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { lang } = await request.json();

    // Validate language
    if (!lang || !["ar", "en"].includes(lang)) {
      return NextResponse.json(
        { success: false, error: "Invalid language. Must be 'ar' or 'en'" },
        { status: 400 }
      );
    }

    // Update user language preference
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { lang } },
      { runValidators: true, new: true }
    ).select("-password -verificationCode");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Language preference updated successfully",
      data: { lang: updatedUser.lang },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/update-language",
      method: "PATCH",
      req: request,
    });
  }
}
