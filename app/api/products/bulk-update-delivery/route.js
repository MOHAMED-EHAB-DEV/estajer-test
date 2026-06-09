import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    const { productIds, deliveryData } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product IDs are required" },
        { status: 400 }
      );
    }

    if (!deliveryData) {
      return NextResponse.json(
        { success: false, error: "Delivery data is required" },
        { status: 400 }
      );
    }

    // Get products and verify ownership
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: "No products found" },
        { status: 404 }
      );
    }

    // Check ownership for non-admin users
    if (user.accountType !== "admin") {
      const unauthorizedProducts = products.filter(
        (p) => p.owner.toString() !== user._id.toString()
      );
      if (unauthorizedProducts.length > 0) {
        return NextResponse.json(
          { success: false, error: "Not authorized to update some products" },
          { status: 403 }
        );
      }
    }

    // Build update object based on provided delivery data
    const updateFields = {};

    if (deliveryData.type !== undefined) {
      updateFields["rental.delivery.type"] = deliveryData.type;
    }

    if (deliveryData.pricingModel !== undefined) {
      updateFields["rental.delivery.pricingModel"] = deliveryData.pricingModel;
    }

    if (deliveryData.cost !== undefined) {
      updateFields["rental.delivery.cost"] = deliveryData.cost;
    }

    if (deliveryData.fixedCityPricing !== undefined) {
      updateFields["rental.delivery.fixedCityPricing"] =
        deliveryData.fixedCityPricing;
    }

    // Update all selected products
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateFields }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products/bulk-update-delivery",
      method: "PATCH",
      req,
    });
  }
}
