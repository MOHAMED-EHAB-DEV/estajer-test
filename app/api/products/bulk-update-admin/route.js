import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { productIds, updates } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product IDs are required" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No updates provided" },
        { status: 400 }
      );
    }

    // Build the $set object from allowed fields
    const setFields = {};

    if (updates.category !== undefined) {
      setFields.category = updates.category;
    }
    if (updates.subCategory !== undefined) {
      setFields.subCategory = updates.subCategory;
    }
    if (updates.quantity !== undefined) {
      setFields.quantity = Number(updates.quantity);
    }
    if (updates.minQuantity !== undefined) {
      setFields.minQuantity = Number(updates.minQuantity);
    }
    if (updates.status !== undefined) {
      setFields.status = updates.status;
    }
    if (updates.location !== undefined) {
      setFields.location = {
        type: "Point",
        coordinates: [updates.location.lng, updates.location.lat],
      };
    }
    if (updates.addressAr !== undefined) {
      setFields.addressAr = updates.addressAr;
    }
    if (updates.addressEn !== undefined) {
      setFields.addressEn = updates.addressEn;
    }

    // Delivery fields
    if (updates.delivery !== undefined) {
      if (updates.delivery.type !== undefined) {
        setFields["rental.delivery.type"] = updates.delivery.type;
      }
      if (updates.delivery.pricingModel !== undefined) {
        setFields["rental.delivery.pricingModel"] = updates.delivery.pricingModel;
      }
      if (updates.delivery.cost !== undefined) {
        setFields["rental.delivery.cost"] = updates.delivery.cost;
      }
      if (updates.delivery.fixedCityPricing !== undefined) {
        setFields["rental.delivery.fixedCityPricing"] = updates.delivery.fixedCityPricing;
      }
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: setFields }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products/bulk-update-admin",
      method: "PATCH",
      req,
    });
  }
}
