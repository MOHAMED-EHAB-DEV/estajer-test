import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const bookings = await Booking.find({
      product: id,
      status: { $in: ["confirmed", "pending"] },
    }).select("startDate endDate quantity");

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/bookings/[id]",
      method: "GET",
      id,
      req,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;
    const data = await req.json();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user owns the booking
    if (booking.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    // Handle review images if any
    if (data.reviewImages) {
      const imageUrls = await Promise.all(
        data.reviewImages.map((image) =>
          cloudinary.uploader
            .upload(image, { folder: "reviews" })
            .then((result) => result.secure_url)
        )
      );
      data.review = {
        ...data.review,
        images: imageUrls,
        createdAt: new Date(),
      };
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/bookings/[id]",
      method: "PATCH",
      id,
      req,
    });
  }
}
