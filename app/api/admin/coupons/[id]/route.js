import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";
import { handleApiError } from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "coupon_not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/coupons/[id]",
      method: "DELETE",
      req,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updateData = {};
    if (body.isActive !== undefined) updateData.isActive = !!body.isActive;
    if (body.usageLimit !== undefined) {
      updateData.usageLimit =
        body.usageLimit === null || body.usageLimit === ""
          ? null
          : Number(body.usageLimit);
    }
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }
    if (body.trialMonths !== undefined) {
      updateData.trialMonths =
        body.trialMonths === null || body.trialMonths === ""
          ? null
          : Number(body.trialMonths);
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "coupon_not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/coupons/[id]",
      method: "PATCH",
      req,
    });
  }
}
