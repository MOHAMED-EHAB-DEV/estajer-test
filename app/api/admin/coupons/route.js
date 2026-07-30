import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authHeaders(req);

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/coupons",
      method: "GET",
      req,
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      code,
      discountPercent,
      usageLimit,
      expiresAt,
      trialMonths,
      isActive,
    } = body;

    if (!code || typeof code !== "string" || !discountPercent) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 },
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const exists = await Coupon.exists({ code: cleanCode });
    if (exists) {
      return NextResponse.json(
        { success: false, error: "coupon_exists" },
        { status: 400 },
      );
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountPercent: Number(discountPercent),
      usageLimit:
        usageLimit === "" || usageLimit === null || usageLimit === undefined
          ? null
          : Number(usageLimit),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      trialMonths:
        Number(discountPercent) === 100 &&
        trialMonths !== "" &&
        trialMonths !== null &&
        trialMonths !== undefined
          ? Number(trialMonths)
          : null,
      isActive: isActive !== false,
    });

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/coupons",
      method: "POST",
      req,
    });
  }
}
