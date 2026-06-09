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

    let visitor = await Visitor.findOne(query);
    if (!visitor) {
      // If we provided a visitorId but it wasn't found, we can't do much unless we create a new one by IP
      const headers = req.headers;
      const forwarded =
        headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
      const ip = forwarded
        ? forwarded.split(",")[0].trim().replace("::ffff:", "")
        : undefined;

      const userAgent = headers.get("user-agent") || "";
      const acceptLanguage = headers.get("accept-language") || "";

      visitor = await Visitor.create({
        ip,
        userAgent,
        acceptLanguage,
      });
    }

    let visitorSub = await PushSubscription.findOne({ visitor: visitor._id });
    if (!visitorSub) {
      await PushSubscription.create({
        visitor: visitor._id,
        subscription: [subscription],
      });
    } else {
      const subscriptionExists = visitorSub.subscription.some(
        (sub) => sub.endpoint === subscription.endpoint,
      );
      if (!subscriptionExists) {
        visitorSub.subscription.push(subscription);
        await visitorSub.save();
      }
    }

    return NextResponse.json({ success: true, message: "Subscription saved" });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/visitors/subscribe",
      method: "POST",
      req,
    });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { endpoint, visitorId } = await req.json();

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
      const updatedSub = await PushSubscription.findOneAndUpdate(
        { visitor: visitor._id },
        { $pull: { subscription: { endpoint: endpoint } } },
        { new: true },
      );

      if (updatedSub && updatedSub.subscription.length === 0) {
        await PushSubscription.deleteOne({ _id: updatedSub._id });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subscription removed",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/visitors/subscribe",
      method: "DELETE",
      req,
    });
  }
}
