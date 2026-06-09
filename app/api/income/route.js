import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();

    const user = await authHeaders(req, true);

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get 30 days ago date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Calculate daily income (completed orders from today)
    const dailyOrders = await Order.find({
      ownerData: user._id,
      status: "completed",
      createdAt: { $gte: today },
    });

    // Calculate total income (completed orders from last 30 days)
    const totalOrders = await Order.find({
      ownerData: user._id,
      status: "completed",
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Sum up the total amounts
    const dailyIncome = dailyOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalIncome = totalOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return NextResponse.json({
      success: true,
      dailyIncome,
      totalIncome,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/income",
      method: "GET",
      req,
    });
  }
}
