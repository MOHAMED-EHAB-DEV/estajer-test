import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        rejected: false,
        approved: false,
        $unset: { rejectMessage: "" },
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]/reset-status",
      method: "POST",
      id,
      req,
    });
  }
}
