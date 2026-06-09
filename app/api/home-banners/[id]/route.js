import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import HomeBanner from "@/models/HomeBanner";
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

    const updatedBanner = await HomeBanner.findByIdAndUpdate(
      id,
      {
        ...data,
        image: imageUrl,
        imageEn: imageEnUrl,
        categoryId: data.categoryId || null,
        userId: data.userId || null,
      },
      { new: true },
    );

    if (!updatedBanner) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedBanner });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/home-banners/${params.id}`,
      method: "PUT",
      req,
    });
  }
}
