import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import Review from "@/models/review";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { authenticateUser } from "@/middleware/auth";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit")) || 4;
  const skip = parseInt(searchParams.get("skip")) || 0;

  try {
    await connectDB();

    // Get product rating info
    const [product, reviews, totalReviews] = await Promise.all([
      Product.findById(id).select("rating"),
      Review.find({ product: id })
        .populate({ path: "user", select: "fullName avatar" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: id }),
    ]);

    if (!reviews)
      return NextResponse.json({ success: false, error: "No reviews found" });

    return NextResponse.json({
      success: true,
      data: reviews,
      total: totalReviews,
      hasMore: totalReviews > skip + limit,
      rating: {
        average: product?.rating?.average,
        count: product?.rating?.count,
      },
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/review/[id]",
      method: "GET",
      id,
      req,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    if (
      review.user.toString() !== user._id.toString() &&
      user.accountType !== "admin"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Delete review images from cloudinary
    if (review.images?.length > 0) {
      await Promise.all(
        review.images.map(async (imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`reviews/${publicId}`);
        }),
      );
    }

    const product = await Product.findById(review.product);
    const owner = await User.findById(product.owner);

    const newProductCount = Math.max(0, product.rating.count - 1);
    const newProductSum = Math.max(
      0,
      product.rating.sum - review.rating.overall,
    );
    const newOwnerCount = Math.max(0, owner.rating.count - 1);
    const newOwnerSum = Math.max(0, owner.rating.sum - review.rating.overall);

    product.set({
      rating: {
        count: newProductCount,
        sum: newProductSum,
        average: newProductCount > 0 ? newProductSum / newProductCount : 0,
      },
    });

    owner.set({
      rating: {
        count: newOwnerCount,
        sum: newOwnerSum,
        average: newOwnerCount > 0 ? newOwnerSum / newOwnerCount : 0,
      },
    });

    await Promise.all([review.deleteOne(), product.save(), owner.save()]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/review/[id]",
      method: "DELETE",
      id,
      req,
    });
  }
}
