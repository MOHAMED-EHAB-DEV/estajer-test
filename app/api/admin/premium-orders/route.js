import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PremiumOrder from "@/models/PremiumOrder";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authHeaders(req);

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Find all premium orders and populate user details
    const orders = await PremiumOrder.find()
      .populate("userId", "fullName email phone avatar shopPlan")
      .sort({ createdAt: -1 });

    // Group by user so all orders for the same user are together
    const grouped = {};
    orders.forEach((order) => {
      const u = order.userId;
      if (!u) return;
      const uId = u._id.toString();
      if (!grouped[uId]) {
        grouped[uId] = {
          user: u,
          orders: [],
        };
      }
      grouped[uId].orders.push(order);
    });

    const groupedList = Object.values(grouped);

    return NextResponse.json({
      success: true,
      orders,
      groupedOrders: groupedList,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/premium-orders",
      method: "GET",
      req,
    });
  }
}
