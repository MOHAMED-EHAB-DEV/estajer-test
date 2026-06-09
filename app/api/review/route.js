import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import Review from "@/models/review";
import Product from "@/models/Product";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();
    let data = await req.json();

    const isAdmin = user.accountType === "admin";

    const [booking, existingReview, product] = await Promise.all([
      isAdmin
        ? Booking.findOne({
            product: data.product,
            status: { $in: ["received", "completed"] },
          })
        : Booking.findOne({
            user: user._id,
            status: { $in: ["received", "completed"] },
            product: data.product,
          }),
      isAdmin
        ? null
        : Review.findOne({ user: user._id, product: data.product }, { _id: 1 }),
      Product.findById(data.product),
    ]);

    if (!isAdmin && (!booking || existingReview))
      return NextResponse.json(
        {
          success: false,
          error: existingReview ? "Review already exists" : "No booking found",
        },
        { status: 404 },
      );

    if (isAdmin && !booking) {
      return NextResponse.json(
        { success: false, error: "Product must have at least one booking" },
        { status: 404 },
      );
    }

    // Handle user image if admin provided one
    if (isAdmin && data.userImage && data.userImage.startsWith("data:image")) {
      const result = await cloudinary.uploader.upload(data.userImage, {
        folder: "reviews/users",
      });
      data.userImage = result.secure_url;
    }

    // Handle review images if any
    if (data.reviewImages) {
      const imageUrls = await Promise.all(
        data.reviewImages.map((image) =>
          cloudinary.uploader
            .upload(image, { folder: "reviews" })
            .then((result) => result.secure_url),
        ),
      );
      data = { ...data, images: imageUrls };
    }
    // Create the review
    const review = await Review.create({
      product: data.product,
      owner: product.owner,
      user: user._id,
      userName: isAdmin ? data.userName : undefined,
      userImage: isAdmin ? data.userImage : undefined,
      ...data,
    });

    // Update both product and owner ratings
    const owner = await User.findById(product.owner);

    const newProductCount = product.rating.count + 1;
    const newProductSum = product.rating.sum + data.rating.overall;
    const newOwnerCount = owner.rating.count + 1;
    const newOwnerSum = owner.rating.sum + data.rating.overall;

    product.set({
      rating: {
        count: newProductCount,
        sum: newProductSum,
        average: newProductSum / newProductCount,
      },
    });

    owner.set({
      rating: {
        count: newOwnerCount,
        sum: newOwnerSum,
        average: newOwnerSum / newOwnerCount,
      },
    });

    await Promise.all([product.save(), owner.save()]);

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/review",
      method: "POST",
      req,
    });
  }
}
