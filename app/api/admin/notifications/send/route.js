import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import { sendToAllUsers } from "@/lib/sendNotification";
import { authenticateUser } from "@/middleware/auth";
import PushSubscription from "@/models/PushSubscription";
import User from "@/models/User";
import Visitor from "@/models/Visitor";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const subscriptions = await PushSubscription.find({})
      .populate("user", "fullName email")
      .populate("visitor", "ip");

    const formattedSubs = subscriptions.map((sub) => ({
      id: sub._id,
      label: sub.user
        ? sub.user.fullName
        : `زائر (${sub.visitor?.ip || "مجهول"})`,
      type: sub.user ? "user" : "visitor",
      details: sub.user ? sub.user.email : sub.visitor?.ip,
    }));

    return NextResponse.json({
      success: true,
      count: formattedSubs.length,
      subscriptions: formattedSubs,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/notifications/send",
      method: "GET",
      req,
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { title, body, url, image, subscriptionIds } = await req.json();

    const payload = {
      title,
      body,
      icon: image || "/icon.png",
      data: { url: url || "/" },
    };

    await sendToAllUsers(payload, subscriptionIds);

    return NextResponse.json({
      success: true,
      message: "Notifications sent successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/notifications/send",
      method: "POST",
      req,
    });
  }
}
