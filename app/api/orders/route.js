import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isRequests = searchParams.get("requests") === "true";
    const showAll = searchParams.get("showAll") === "true";
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const id = searchParams.get("id");
    const ownerSearch = searchParams.get("ownerSearch");
    const customerSearch = searchParams.get("customerSearch");
    const provider = searchParams.get("provider");
    const unPaid = searchParams.get("unPaid") === "true";

    const user = await authHeaders(req);

    let query =
      showAll && user.accountType === "admin"
        ? unPaid
          ? {}
          : { status: { $ne: "not-paid" } }
        : isRequests
          ? { ownerData: user._id, status: { $ne: "not-paid" } }
          : { "userData.id": user._id };

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

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

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
    } else if (date) {
      const now = new Date();
      let startDate;
      switch (date) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "week":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7,
          );
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    if (id) {
      query.$or = [
        { _id: id },
        { contractId: id },
        { milestoneId: id },
        { paymentId: id },
      ];
    }

    if (ownerSearch) {
      const ownerSearchQuery = {
        $or: [
          { fullName: { $regex: ownerSearch, $options: "i" } },
          { email: { $regex: ownerSearch, $options: "i" } },
          { phone: { $regex: ownerSearch, $options: "i" } },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(ownerSearch)) {
        ownerSearchQuery.$or.push({ _id: ownerSearch });
      }

      const matchingOwners = await User.find(ownerSearchQuery).select("_id");
      const ownerIds = matchingOwners.map((o) => o._id);
      query.ownerData = { $in: ownerIds };
    }

    if (customerSearch) {
      query.$or = query.$or || [];
      query.$or.push(
        { "userData.fullName": { $regex: customerSearch, $options: "i" } },
        { "userData.email": { $regex: customerSearch, $options: "i" } },
        { "userData.phone": { $regex: customerSearch, $options: "i" } },
      );
      if (mongoose.Types.ObjectId.isValid(customerSearch)) {
        query.$or.push({ "userData.id": customerSearch });
      }
    }

    if (provider) {
      if (provider === "nana") {
        query.paymentGateway = "nana";
      } else if (provider === "estajer") {
        query.paymentGateway = { $ne: "nana" };
        query.providerId = {
          $ne: new mongoose.Types.ObjectId("699ccc057fa956a3b96d93d8"),
        };
      } else if (mongoose.Types.ObjectId.isValid(provider)) {
        query.providerId = provider;
      }
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find(query)

      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate("userData.id", "createdAt avatar fullName isOnline lastSeen")
      .populate(
        "ownerData",
        "createdAt avatar fullName phone email address location isOnline lastSeen branches",
      )
      .populate("providerId", "nameAr nameEn slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        orders,
        totalOrders,
        totalPages,
        currentPage: page,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/orders",
      method: "GET",
      req,
    });
  }
}
