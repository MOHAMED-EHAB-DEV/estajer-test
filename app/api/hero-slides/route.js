import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import HeroSlide from "@/models/HeroSlide";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch slides
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const query = {};
    if (!all) query.active = true;

    const slides = await HeroSlide.find(query).sort({ order: 1 });
    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/hero-slides",
      method: "GET",
      req,
    });
  }
}

// POST - Create a new slide
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

    if (!data.image || !data.imageEn || !data.altAr || !data.altEn) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 },
      );
    }

    let imageUrl = data.image;
    if (data.image.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.image, {
        folder: "hero-slides",
        format: "webp",
      });
      imageUrl = uploaded.secure_url;
    }

    let imageEnUrl = data.imageEn;
    if (data.imageEn && data.imageEn.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.imageEn, {
        folder: "hero-slides",
        format: "webp",
      });
      imageEnUrl = uploaded.secure_url;
    }

    const slide = await HeroSlide.create({
      ...data,
      image: imageUrl,
      imageEn: imageEnUrl,
    });

    return NextResponse.json({ success: true, data: slide });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/hero-slides",
      method: "POST",
      req,
    });
  }
}

// DELETE - Bulk delete slides
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

    await HeroSlide.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      message: "Slides deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/hero-slides",
      method: "DELETE",
      req,
    });
  }
}
