import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user owns the product
    if (
      user.accountType !== "admin" &&
      product.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to restore this product" },
        { status: 403 }
      );
    }

    // Check if product is actually deleted
    if (!product.deleted) {
      return NextResponse.json(
        { success: false, error: "Product is not deleted" },
        { status: 400 }
      );
    }

    // Restore the product
    const restoredProduct = await Product.findByIdAndUpdate(
      id,
      { deleted: false, deletedAt: null },
      { new: true }
    );

    return NextResponse.json({ success: true, data: restoredProduct });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]/restore",
      method: "PATCH",
      id,
      req,
    });
  }
}
