import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";
import Review from "@/models/review";
import { handleApiError } from "@/lib/errorHandler";

// get user booking
export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { searchParams } = new URL(req.url);
    const product = searchParams.get("product");
    if (user.accountType === "admin") {
      const bookings = await Booking.findOne({
        status: { $in: ["received", "completed"] },
        product,
      });
      return NextResponse.json({ success: !!bookings, data: bookings });
    }

    const review = await Review.findOne(
      { user: user._id, product },
      { _id: 1 },
    );
    if (review) return NextResponse.json({ success: false });

    const bookings = await Booking.findOne({
      user: user._id,
      status: { $in: ["received", "completed"] },
      product,
    });
    return NextResponse.json({ success: !!bookings, data: bookings });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/bookings",
      method: "GET",
      req,
    });
  }
}
