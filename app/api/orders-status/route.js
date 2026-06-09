import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Request from "@/models/Request";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const user = await authHeaders(req);

    // Get orders statistics for the user
    const [sent, completed, pending, canceled, requests] = await Promise.all([
      // Total orders
      Order.countDocuments(
        role === "renter"
          ? { ownerData: user._id, status: { $ne: "not-paid" } }
          : { "userData.id": user._id }
      ),
      // Completed orders
      Order.countDocuments(
        role === "renter"
          ? { ownerData: user._id, status: "completed" }
          : { "userData.id": user._id, status: "completed" }
      ),
      // Pending orders
      Order.countDocuments(
        role === "renter"
          ? { ownerData: user._id, status: "pending" }
          : { "userData.id": user._id, status: "pending" }
      ),
      // Canceled orders
      Order.countDocuments(
        role === "renter"
          ? { ownerData: user._id, status: "cancelled" }
          : { "userData.id": user._id, status: "cancelled" }
      ),
      Request.countDocuments({ owner: user._id, approved: true }),
    ]);

    return NextResponse.json({
      success: true,
      sent,
      completed,
      pending,
      canceled,
      requests,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/orders-status",
      method: "GET",
      req,
    });
  }
}
