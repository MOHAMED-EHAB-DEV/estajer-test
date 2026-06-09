import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      return NextResponse.json({ success: false, hasActiveOrder: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const order = await Order.findOne({
      $or: [
        { ownerData: user._id, "userData.id": otherUserId },
        { ownerData: otherUserId, "userData.id": user._id },
      ],
      status: {
        $in: ["pending", "confirmed", "received", "completed", "not-returned"],
      },
      endDate: { $gte: today },
    }).select("_id");

    console.log("order: ", order);
    let contactInfo = null;
    if (order) {
      const otherUser = await User.findById(otherUserId).select(
        "phone email fullName",
      );
      if (otherUser) {
        contactInfo = {
          phone: otherUser.phone,
          email: otherUser.email,
          fullName: otherUser.fullName,
        };
      }
    }

    return NextResponse.json({
      success: true,
      hasActiveOrder: !!order,
      contactInfo,
    });
  } catch (error) {
    return NextResponse.json({ success: false, hasActiveOrder: false });
  }
}
