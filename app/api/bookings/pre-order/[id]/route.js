import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import PreOrder from "@/models/PreOrder";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import { authHeaders } from "@/middleware/authHeaders";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const user = client ? await authenticateUser() : await authHeaders(req);
    const { id } = await params;

    const preOrder = await PreOrder.findOne({
      _id: id,
      userId: user._id,
      status: "pending",
    });

    if (!preOrder) {
      return NextResponse.json(
        { success: false, error: "Pre-order not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: preOrder,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/bookings/pre-order/[id]",
      method: "GET",
      req,
      id,
    });
  }
}
