import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import Review from "@/models/review";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit")) || 4;
  const skip = parseInt(searchParams.get("skip")) || 0;
  const lang = searchParams.get("lang") || "ar";

  try {
    await connectDB();
    const user = await User.findById(id);
    const [reviews, totalReviews, averageRatings] = await Promise.all([
      Review.find({ owner: user._id })
        .populate({ path: "user", select: "fullName avatar" })
        .populate({ path: "product", select: "nameEn nameAr" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ owner: user._id }),
      Review.aggregate([
        { $match: { owner: user._id } },
        {
          $group: {
            _id: null,
            avgQuality: { $avg: "$rating.quality" },
            avgPrice: { $avg: "$rating.price" },
            avgCommunication: { $avg: "$rating.communication" },
            avgExperience: { $avg: "$rating.experience" },
          },
        },
      ]),
    ]);

    if (!reviews)
      return NextResponse.json({ success: false, error: "No reviews found" });
    // add name and delete the nameAr and nameEn fields based on the lang
    reviews.forEach((review) => {
      if (review.product) {
        if (lang === "ar") review.product.name = review.product.nameAr;
        else review.product.name = review.product.nameEn;
        delete review.product.nameAr;
        delete review.product.nameEn;
      }
    });

    const ratings = averageRatings[0]
      ? {
          quality: Number(averageRatings[0].avgQuality.toFixed(1)),
          price: Number(averageRatings[0].avgPrice.toFixed(1)),
          communication: Number(averageRatings[0].avgCommunication.toFixed(1)),
          experience: Number(averageRatings[0].avgExperience.toFixed(1)),
        }
      : null;

    return NextResponse.json({
      success: true,
      data: reviews,
      total: totalReviews,
      hasMore: totalReviews > skip + limit,
      averageRatings: ratings,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/reviews/[id]",
      method: "GET",
      id,
      req,
    });
  }
}
