import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import HomeBanner from "@/models/HomeBanner";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch all active banners
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const place = searchParams.get("place");
    const categoryId = searchParams.get("categoryId");
    const userId = searchParams.get("userId");
    const all = searchParams.get("all") === "true";
    const isNana = searchParams.get("nana") === "true";

    const query = {};

    if (!all) query.active = true;
    if (isNana) query.nana = true;
    if (place) query.place = place;
    if (categoryId) query.categoryId = categoryId;

    if (userId && mongoose.isValidObjectId(userId)) query.userId = userId;

    let queryBuilder = HomeBanner.find(query).sort({ order: 1 });

    if (all) {
      queryBuilder = queryBuilder
        .populate("categoryId", "nameAr nameEn")
        .populate("userId", "fullName email");
    }

    const banners = await queryBuilder;
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/home-banners",
      method: "GET",
      req,
    });
  }
}

// POST - Create a new banner
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

    const data = await req.json();

    if (
      !data.image ||
      !data.imageEn ||
      !data.link ||
      !data.altAr ||
      !data.altEn
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 },
      );
    }

    let imageUrl = data.image;
    // If the image is a base64 string, upload it to cloudinary
    if (data.image.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.image, {
        folder: "home-banners",
        format: "webp",
      });
      imageUrl = uploaded.secure_url;
    }

    let imageEnUrl = data.imageEn;
    if (data.imageEn && data.imageEn.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.imageEn, {
        folder: "home-banners",
        format: "webp",
      });
      imageEnUrl = uploaded.secure_url;
    }

    const banner = await HomeBanner.create({
      ...data,
      image: imageUrl,
      imageEn: imageEnUrl,
      categoryId: data.categoryId || null,
      userId: data.userId || null,
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/home-banners",
      method: "POST",
      req,
    });
  }
}

// DELETE - Delete a banner
export async function DELETE(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: "IDs are required" },
        { status: 400 },
      );
    }

    await HomeBanner.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      message: "Banners deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/home-banners",
      method: "DELETE",
      req,
    });
  }
}
