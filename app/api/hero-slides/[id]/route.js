import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import HeroSlide from "@/models/HeroSlide";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const data = await req.json();

    let imageUrl = data.image;
    if (data.image && data.image.startsWith("data:")) {
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

    const updatedSlide = await HeroSlide.findByIdAndUpdate(
      id,
      { ...data, image: imageUrl, imageEn: imageEnUrl },
      { new: true },
    );

    if (!updatedSlide) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedSlide });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/hero-slides/${params.id}`,
      method: "PUT",
      req,
    });
  }
}
