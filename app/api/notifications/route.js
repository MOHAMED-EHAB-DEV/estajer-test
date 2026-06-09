import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const notSeen = searchParams.get("notSeen");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const user = client ? await authenticateUser() : await authHeaders(req);

    if (notSeen) {
      const count = await Notification.countDocuments({
        user: user._id,
        seen: false,
      });
      return NextResponse.json({ success: true, count });
    }

    const skip = (page - 1) * limit;
    const totalNotifications = await Notification.countDocuments({
      user: user._id,
    });
    const totalPages = Math.ceil(totalNotifications / limit);

    const notifications = await Notification.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: notifications,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/notifications",
      method: "GET",
      req,
    });
  }
}

export async function PATCH() {
  try {
    await connectDB();
    const user = await authenticateUser();

    await Notification.updateMany(
      { user: user._id, seen: false },
      { seen: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/notifications",
      method: "PATCH",
    });
  }
}
