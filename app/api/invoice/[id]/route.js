import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getInvoice } from "@/lib/vom";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req, { params }) {
  try {
    const invoiceId = (await params).id;

    await connectDB();
    // Authenticate the user
    const user = await authenticateUser();

    const order = await Order.findOne({
      ownerData: user._id,
      invoiceId,
    }).select("invoiceId");

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Invoice not found or access denied" },
        { status: 404 }
      );
    }
    const res = await getInvoice({ invoiceId });

    // Return the PDF with proper headers
    return new NextResponse(res, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="invoice.pdf"',
        "Cache-Control": "no-cache, private",
      },
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/invoice/[id]",
      method: "GET",
      id,
      req,
    });
  }
}
