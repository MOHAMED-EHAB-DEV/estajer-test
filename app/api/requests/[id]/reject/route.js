import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Request from "@/models/Request";
import Notification from "@/models/Notification";
import { sendRequestNotificationEmail } from "@/lib/email";
import { authenticateUser } from "@/middleware/auth";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { reason } = await req.json();
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

    // Update the request's rejected status and store rejection reason
    request.rejected = true;
    request.rejectionReason = reason || "";
    await request.save();

    // Get user language preference
    const userLang = request.owner.lang || "ar";

    // Create language-specific notification title
    const notificationTitle =
      userLang === "en"
        ? `Your request "${request.nameEn || request.nameAr}" has been rejected`
        : `تم رفض طلبك "${request.nameAr || request.nameEn}"`;

    // Create a notification for the request owner
    const notification = new Notification({
      user: request.owner._id,
      type: "canceled",
      title: notificationTitle,
      relatedId: request._id,
    });

    await notification.save();

    // Send email notification
    await sendRequestNotificationEmail({
      email: request.owner.email,
      requestName: userLang === "en" ? request.nameEn : request.nameAr,
      status: "rejected",
      reason,
      userLang,
    }).catch((err) => console.error("Failed to send email notification:", err));

    return NextResponse.json(
      { message: "Request rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting request:", error);
    return NextResponse.json(
      { error: "Failed to reject request" },
      { status: 500 }
    );
  }
}
