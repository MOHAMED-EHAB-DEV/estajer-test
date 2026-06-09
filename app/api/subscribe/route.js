import { NextResponse } from "next/server";
import PushSubscription from "@/models/PushSubscription";
import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  await connectDB();
  const user = await authenticateUser();
  const { subscription } = await req.json();

  if (!subscription) {
    return NextResponse.json(
      { message: "Missing subscription" },
      { status: 400 },
    );
  }

  try {
    let userSubscription = await PushSubscription.findOne({ user: user._id });

    if (userSubscription) {
      const subscriptionExists = userSubscription.subscription.some(
        (sub) => sub.endpoint === subscription.endpoint,
      );

      if (!subscriptionExists) {
        userSubscription.subscription.push(subscription);
        await userSubscription.save();
        return NextResponse.json(
          { message: "Subscription added" },
          { status: 200 },
        );
      } else {
        return NextResponse.json(
          { message: "Subscription already exists" },
          { status: 200 },
        );
      }
    } else {
      const newSubscription = new PushSubscription({
        user: user._id,
        subscription: [subscription],
      });

      await newSubscription.save();
      return NextResponse.json(
        { message: "Subscription saved" },
        { status: 201 },
      );
    }
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/subscribe",
      method: "POST",
      req,
    });
  }
}

export async function DELETE(req) {
  await connectDB();
  const user = await authenticateUser();
  const { endpoint } = await req.json();
  console.log("endpoint: ", endpoint);

  if (!endpoint) {
    return NextResponse.json({ message: "Missing endpoint" }, { status: 400 });
  }

  try {
    const updatedSub = await PushSubscription.findOneAndUpdate(
      { user: user._id },
      { $pull: { subscription: { endpoint: endpoint } } },
      { new: true },
    );

    if (updatedSub) {
      if (updatedSub.subscription.length === 0) {
        await PushSubscription.deleteOne({ _id: updatedSub._id });
      }
      return NextResponse.json(
        { message: "Subscription removed" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/subscribe",
      method: "DELETE",
      req,
    });
  }
}
