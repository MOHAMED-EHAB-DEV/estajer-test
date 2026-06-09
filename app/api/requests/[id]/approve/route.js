import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Request from "@/models/Request";
import Notification from "@/models/Notification";
import { sendRequestNotificationEmail } from "@/lib/email";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Find the request by ID
    const request = await Request.findById(id).populate("owner", "email lang");
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Update the request's approved status
    request.approved = true;
    await request.save();

    const userLang = request.owner.lang || "ar";
    // Create language-specific notification title
    const notificationTitle =
      userLang === "en"
        ? `Your request "${request.nameEn || request.nameAr}" has been approved`
        : `تم قبول طلبك "${request.nameAr || request.nameEn}"`;

    // Create a notification for the request owner
    const notification = new Notification({
      user: request.owner._id,
      type: "accepted",
      title: notificationTitle,
      relatedId: request._id,
    });

    await notification.save();

    await sendRequestNotificationEmail({
      email: request.owner.email,
      requestName: userLang === "en" ? request.nameEn : request.nameAr,
      status: "approved",
      userLang,
    }).catch((err) => console.error("Failed to send email notification:", err));

    return NextResponse.json(
      { message: "Request approved successfully" },
      { status: 200 }
    );
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/requests/[id]/approve",
      method: "POST",
      id,
      req,
    });
  }
}
