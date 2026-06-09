import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DamageReport from "@/models/DamageReport";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { authenticateUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";
import { handleApiError } from "@/lib/errorHandler";
import { authHeaders } from "@/middleware/authHeaders";

// GET - Fetch all damage reports (admin only)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const user = client ? await authenticateUser() : await authHeaders(req);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");

    const query = {};
    if (status) query.status = status;

    // If user is not admin, they can only see their own reports (as a reporter/landlord)
    if (user.accountType !== "admin") query.reporter = user._id;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      DamageReport.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      DamageReport.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/damage-reports",
      method: "GET",
      req,
    });
  }
}

import { updateAlert } from "@/lib/alert";

// POST - Create a new damage report
export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    const {
      orderId,
      productId,
      beforeImages,
      afterImages,
      notes,
      damageDescription,
    } = await req.json();

    // Validate required fields
    if (!orderId || !productId || !damageDescription) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify the order exists and belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      ownerData: user._id,
      status: { $in: ["completed", "received", "confirmed"] },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found or not in valid status for damage report",
        },
        { status: 404 },
      );
    }
    // Check if a damage report already exists for this order and product
    const existingReport = await DamageReport.findOne({
      order: orderId,
      product: productId,
    });

    if (existingReport) {
      return NextResponse.json(
        {
          success: false,
          error: "Damage report already exists for this order",
        },
        { status: 400 },
      );
    }

    // Upload before images to cloudinary
    const beforeImageUrls =
      beforeImages && beforeImages.length > 0
        ? await Promise.all(
            beforeImages.map((image) =>
              cloudinary.uploader
                .upload(image.preview, { folder: "damage-reports/before" })
                .then((result) => ({
                  preview: result.secure_url,
                  gradientColors: image.gradientColors,
                  gradientStyle: image.gradientStyle,
                })),
            ),
          )
        : [];

    // Upload after images to cloudinary
    const afterImageUrls =
      afterImages && afterImages.length > 0
        ? await Promise.all(
            afterImages.map((image) =>
              cloudinary.uploader
                .upload(image.preview, { folder: "damage-reports/after" })
                .then((result) => ({
                  preview: result.secure_url,
                  gradientColors: image.gradientColors,
                  gradientStyle: image.gradientStyle,
                })),
            ),
          )
        : [];

    // Create the damage report
    const damageReport = new DamageReport({
      order: orderId,
      product: productId,
      reporter: user._id,
      customer: order.userData.id,
      beforeImages: beforeImageUrls,
      afterImages: afterImageUrls,
      notes,
      damageDescription,
    });

    await damageReport.save();
    await updateAlert("damageReport", damageReport._id);

    await Order.findByIdAndUpdate(orderId, { hasDamageReport: true });
    return NextResponse.json({ success: true, data: damageReport });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/damage-reports",
      method: "POST",
      req,
    });
  }
}
