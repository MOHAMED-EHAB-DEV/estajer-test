import { authHeaders } from "@/middleware/authHeaders";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 5;

    const user = await authHeaders(req);

    // Check if user is admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the latest notifications with user details
    const notifications = await Notification.find({})
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/notifications",
      method: "GET",
      req,
    });
  }
}
