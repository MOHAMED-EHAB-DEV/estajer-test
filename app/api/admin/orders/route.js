import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Category from "@/models/Category";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const search = searchParams.get("search");

    const user = await authHeaders(req);

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    let query = { status: { $ne: "not-paid" } };

    if (status && status !== "all") {
      if (status === "rejecting") {
        query.status = "rejecting";
        query.$or = [{ rejectionApproved: false }, { rejectionApproved: null }];
      } else if (status === "rejectionConfirmed") {
        query.status = "rejecting";
        query.rejectionApproved = true;
      } else {
        query.status = status;
      }
    }

    if (startDateParam || endDateParam) {
      query.createdAt = {};
      if (startDateParam) {
        const start = new Date(startDateParam);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      query.$or = [{ contractId: { $regex: search, $options: "i" } }];
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({ _id: search });
      }

      const userQuery = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };

      const matchingUsers = await User.find(userQuery).select("_id");
      const userIds = matchingUsers.map((u) => u._id);

      if (userIds.length > 0) {
        query.$or.push({ "userData.id": { $in: userIds } });
        query.$or.push({ ownerData: { $in: userIds } });
      }
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate(
        "userData.id",
        "createdAt avatar fullName isOnline lastSeen companyDetails",
      )
      .populate(
        "ownerData",
        "createdAt avatar fullName phone email address location isOnline lastSeen branches companyDetails accountType",
      )
      .populate("source.refId", "nameAr nameEn slug")
      .lean();

    // Base query for stats
    const statsQuery = {};
    if (query.createdAt) {
      statsQuery.createdAt = query.createdAt;
    }

    const statsAggr = await Order.aggregate([
      { $match: statsQuery },
      {
        $group: {
          _id: null,
          allOrders: { $sum: 1 },
          newNotPaidOrders: {
            $sum: { $cond: [{ $eq: ["$status", "not-paid"] }, 1, 0] },
          },
          pendingPaidOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          receivedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "received"] }, 1, 0] },
          },
          completedOrders: {
            $sum: {
              $cond: [
                {
                  $and: {
                    $eq: ["$status", "completed"],
                    $eq: ["$waffyStatus", "CASH_OUT_APPROVED"],
                  },
                },
                1,
                0,
              ],
            },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          rejectingOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "rejecting"] },
                    { $ne: ["$waffyStatus", "CASH_OUT_APPROVED"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          rejectionConfirmedOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "rejecting"] },
                    { $eq: ["$waffyStatus", "CASH_OUT_APPROVED"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          notReturnedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "not-returned"] }, 1, 0] },
          },
        },
      },
    ]);

    const statsResult = statsAggr[0] || {
      allOrders: 0,
      newNotPaidOrders: 0,
      pendingPaidOrders: 0,
      confirmedOrders: 0,
      receivedOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      rejectingOrders: 0,
      rejectionConfirmedOrders: 0,
      notReturnedOrders: 0,
    };

    const {
      allOrders,
      newNotPaidOrders,
      pendingPaidOrders,
      confirmedOrders,
      receivedOrders,
      completedOrders,
      cancelledOrders,
      rejectingOrders,
      rejectionConfirmedOrders,
      notReturnedOrders,
    } = statsResult;

    const categoryAggregation = await Order.aggregate([
      { $match: statsQuery },
      { $unwind: "$items" },
      // Step 1: Lookup the bookings from the items array
      {
        $lookup: {
          from: "bookings",
          localField: "items",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      // Step 2: Group by product ID first to reduce the number of product lookups
      { $group: { _id: "$booking.product", orderCount: { $sum: 1 } } },
      // Step 3: Lookup the product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $group: { _id: "$product.category", count: { $sum: "$orderCount" } } },
      { $sort: { count: -1 } },
      { $limit: 7 },
    ]);

    const allCategories = await Category.find({}).lean();
    const catMap = {};
    allCategories.forEach((c) => {
      catMap[c.key] = c.nameAr || c.nameEn;
    });

    const barData = categoryAggregation.map((c) => ({
      category: catMap[c._id] || c._id || "غير محدد",
      value: c.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders,
        totalOrders,
        totalPages,
        currentPage: page,
        stats: {
          allOrders,
          newNotPaidOrders,
          pendingPaidOrders,
          confirmedOrders,
          receivedOrders,
          completedOrders,
          cancelledOrders,
          rejectingOrders,
          rejectionConfirmedOrders,
          notReturnedOrders,
          barData,
        },
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/orders",
      method: "GET",
      req,
    });
  }
}
