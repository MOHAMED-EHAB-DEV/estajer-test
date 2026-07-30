import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    await connectDB();
    await authenticateUser(); // Ensure user is logged in

    const body = await req.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "invalid_code" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "invalid_coupon" },
        { status: 404 }
      );
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "expired_coupon" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "usage_limit_exceeded" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      trialMonths: coupon.trialMonths,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/premium/coupons/validate",
      method: "POST",
      req,
    });
  }
}
