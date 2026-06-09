import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
  maxDuration: 60,
};

async function reuploadImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;

    // Upload to cloudinary as a new image
    const uploaded = await cloudinary.uploader.upload(base64Image, {
      folder: "products",
      format: "webp",
    });

    return uploaded.secure_url;
  } catch (error) {
    console.error("Error re-uploading image:", error);
    throw error;
  }
}

import { updateAlert } from "@/lib/alert";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;

    // Find the original product
    const originalProduct = await Product.findById(id).lean();

    if (!originalProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Check if user owns the product or if he is admin
    if (
      originalProduct.owner.toString() !== user._id.toString() &&
      user.accountType !== "admin"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 },
      );
    }

    // Re-upload all images to create new unique URLs
    const newImages = await Promise.all(
      originalProduct.images.map(async (image) => {
        const newPreviewUrl = await reuploadImage(image.preview);
        return {
          preview: newPreviewUrl,
          gradientColors: image.gradientColors,
          gradientStyle: image.gradientStyle,
        };
      }),
    );

    // Create new product data (exclude _id, createdAt, updatedAt, and rating data)
    const {
      _id: originalId,
      createdAt,
      updatedAt,
      rating,
      lovedCount,
      approved,
      rejected,
      rejectMessage,
      ...productData
    } = originalProduct;

    // Create the duplicated product
    const duplicatedProduct = await Product.create({
      ...productData,
      images: newImages,
      nameAr: `${originalProduct.nameAr} (نسخة)`,
      nameEn: `${originalProduct.nameEn} (Copy)`,
      approved: false,
      rejected: false,
      hidden: false,
      deleted: false,
      rating: { count: 0, sum: 0, average: 0 },
      lovedCount: 0,
    });

    user.productsCount = (user.productsCount || 0) + 1;
    await user.save();

    await updateAlert("product", duplicatedProduct._id);

    return NextResponse.json({
      success: true,
      data: duplicatedProduct,
      message: "Product duplicated successfully",
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]/duplicate",
      method: "POST",
      id,
      req,
    });
  }
}
