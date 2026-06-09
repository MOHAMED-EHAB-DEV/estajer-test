import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import Visitor from "@/models/Visitor";
import PushSubscription from "@/models/PushSubscription";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    await connectDB();
    const { subscription, visitorId } = await req.json();

    let query = {};
    if (visitorId) {
      query = { _id: visitorId };
    } else {
      const headers = req.headers;
      const forwarded =
        headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
      const ip = forwarded
        ? forwarded.split(",")[0].trim().replace("::ffff:", "")
        : undefined;

      if (!ip) {
        return NextResponse.json({ success: false, error: "IP not found" });
      }
      query = { ip };
    }

    const visitor = await Visitor.findOne(query);
    if (visitor) {
      const visitorSub = await PushSubscription.findOne({
        visitor: visitor._id,
      });
      if (visitorSub) {
        const subscriptionExists = visitorSub.subscription.some(
          (sub) => sub.endpoint === subscription.endpoint,
        );
        if (subscriptionExists)
          return NextResponse.json({ success: true, subscribed: true });
      }
    }
    return NextResponse.json({ success: true, subscribed: false });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/visitors/notifications",
      method: "POST",
      req,
    });
  }
}
