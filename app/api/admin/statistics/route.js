import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Chat from "@/models/Chat";
import VisitorCount from "@/models/VisitorCount";
import User from "@/models/User";
import Product from "@/models/Product";
import Request from "@/models/Request";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

const getDateRange = (startDateParam, endDateParam) => {
  let startDate, endDate;

  if (startDateParam && endDateParam) {
    // Use provided date range
    startDate = new Date(startDateParam);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Default to today if no dates provided
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }

  return { startDate, endDate };
};

export async function GET(req) {
  try {
    await connectDB();

    const user = await authHeaders(req);

    // Check if user is admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const { startDate, endDate } = getDateRange(startDateParam, endDateParam);

    // Fetch all statistics in parallel
    const [
      newPendingProducts,
      activeProducts,
      websiteViews,
      unreadMessages,
      totalUsers,
      activeUsers,
      pendingRequests,
      confirmedRequests,
      cancelledRequests,
    ] = await Promise.all([
      // New pending products (products created in the period)
      Product.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate },
        approved: false,
      }),

      // Active products (approved products)
      Product.countDocuments({ approved: true }),

      // Website views for the period
      startDate.getTime() === endDate.getTime() - 86400000 // Single day (24 hours difference)
        ? VisitorCount.findOne({
            date: { $gte: startDate, $lt: endDate },
          }).then((doc) => doc?.count || 0)
        : VisitorCount.aggregate([
            { $match: { date: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: null, totalViews: { $sum: "$count" } } },
          ]).then((result) => result[0]?.totalViews || 0),

      // Unread messages in the period
      Chat.aggregate([
        { $unwind: "$messages" },
        {
          $match: {
            "messages.state": "sent",
            "messages.timestamp": { $gte: startDate, $lt: endDate },
          },
        },
        { $count: "unreadCount" },
      ]).then((result) => result[0]?.unreadCount || 0),

      // Total users
      User.countDocuments({}),

      // Active users in the period
      User.countDocuments({ lastSeen: { $gte: startDate, $lt: endDate } }),

      // Pending paid requests (orders created in the period)
      Order.countDocuments({
        status: "pending",
        createdAt: { $gte: startDate, $lt: endDate },
      }),

      // Confirmed requests
      Order.countDocuments({
        status: "confirmed",
        createdAt: { $gte: startDate, $lt: endDate },
      }),

      // Cancelled requests (assuming there's a status field)
      Order.countDocuments({
        status: "cancelled",
        createdAt: { $gte: startDate, $lt: endDate },
      }),
    ]);

    const statistics = {
      newPendingProducts,
      activeProducts,
      websiteViews,
      unreadMessages,
      totalUsers,
      activeUsers,
      pendingRequests,
      confirmedRequests,
      cancelledRequests,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };

    return NextResponse.json({ success: true, data: statistics });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/statistics",
      method: "GET",
      req,
    });
  }
}
