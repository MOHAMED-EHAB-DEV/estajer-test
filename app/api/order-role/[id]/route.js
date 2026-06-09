import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { handleApiError } from "@/lib/errorHandler";
import { authHeaders } from "@/middleware/authHeaders";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await authHeaders(req, true);

    const { id } = await params;

    // Try to find the order where the user is the owner or renter
    const order = await Order.findOne({
      $and: [
        { $or: [{ milestoneId: id }, { _id: id }] },
        ...(user.accountType !== "admin"
          ? [{ $or: [{ ownerData: user._id }, { "userData.id": user._id }] }]
          : []),
      ],
    })
      .populate("ownerData", "email fullName phone lang")
      .populate("userData.id", "email fullName phone lang")
      .populate({
        path: "items",
        populate: {
          path: "product",
          select: "nameAr nameEn images",
        },
      })
      .select(
        "status userData ownerData items totalAmount startDate endDate deliveryCode renterConfirmedAt ownerConfirmedAt documentationImages ownerDocumentationImages",
      );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    // Determine role
    const isOwner = order.ownerData._id.toString() === user._id.toString();
    const role = isOwner ? "owner" : "renter";

    if (!role && user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const orderData = {
      _id: order._id,
      orderId: order._id,
      status: order.status,
      startDate: order.startDate,
      endDate: order.endDate,
      items: order.items,
      totalAmount: order.totalAmount,
      userData: order.userData,
      ownerData: order.ownerData,
      renterConfirmedAt: order.renterConfirmedAt,
      ownerConfirmedAt: order.ownerConfirmedAt,
      // Only show delivery code to the renter
      ...(role === "renter" && { deliveryCode: order.deliveryCode }),
    };

    return NextResponse.json({
      success: true,
      data: { order: orderData, role: role || "renter" },
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/order-role/[id]",
      method: "GET",
      id,
      req,
    });
  }
}
