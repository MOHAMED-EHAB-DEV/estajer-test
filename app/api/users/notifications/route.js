import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import PushSubscription from "@/models/PushSubscription";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    await connectDB();
    const { subscription } = await req.json();
    const user = await authenticateUser();
    let userSubscription = await PushSubscription.findOne({ user: user._id });
    if (userSubscription) {
      const subscriptionExists = userSubscription.subscription.some(
        (sub) => sub.endpoint === subscription.endpoint
      );
      if (subscriptionExists)
        return NextResponse.json({ success: true, subscribed: true });
    }
    return NextResponse.json({ success: true, subscribed: false });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/notifications",
      method: "POST",
      req,
    });
  }
}
