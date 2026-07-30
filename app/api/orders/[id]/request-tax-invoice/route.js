import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";
import { sendTaxInvoiceRequestEmail } from "@/lib/emails/tax-invoice";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const orderId = await params.id;
    const order = await Order.findById(orderId).populate("ownerData", "email lang");

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Verify user is renter (customer)
    if (order.userData.id.toString() !== user._id.toString() && user.accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    order.taxInvoiceRequested = true;
    await order.save();

    // Send email to landlord
    if (order.ownerData && order.ownerData.email) {
      await sendTaxInvoiceRequestEmail({
        email: order.ownerData.email,
        orderId: order._id,
        userLang: order.ownerData.lang || "ar",
        checkoutOrigin: order.checkoutOrigin,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/orders/${params.id}/request-tax-invoice`,
      method: "POST",
      req,
    });
  }
}
