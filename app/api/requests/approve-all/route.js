import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Request from "@/models/Request";
import Notification from "@/models/Notification";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }
    // Find all pending requests (not approved and not rejected)
    const pendingRequests = await Request.find({
      approved: false,
      rejected: false,
    }).populate("owner", "lang");

    if (pendingRequests.length === 0) {
      return NextResponse.json(
        { message: "No pending requests found" },
        { status: 200 }
      );
    }

    // Approve all pending requests
    const approvalPromises = pendingRequests.map(async (request) => {
      // Update request status
      request.approved = true;
      await request.save();
      const userLang = request.owner.lang || "ar";
      // Create language-specific notification title
      const notificationTitle =
        userLang === "en"
          ? `Your request "${
              request.nameEn || request.nameAr
            }" has been approved`
          : `تم قبول طلبك "${request.nameAr || request.nameEn}"`;

      // Create a notification for the request owner
      const notification = new Notification({
        user: request.owner._id,
        type: "accepted",
        title: notificationTitle,
        relatedId: request._id,
      });
      await notification.save();
      return request._id;
    });

    // Wait for all approval operations to complete
    const approvedRequestIds = await Promise.all(approvalPromises);

    return NextResponse.json(
      {
        message: `${approvedRequestIds.length} requests approved successfully`,
        approvedRequestIds,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/requests/approve-all",
      method: "POST",
      req,
    });
  }
}
