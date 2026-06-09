import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { authenticateUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";
import Booking from "@/models/Booking";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    const { id } = await params;
    const { documentationImages, ownerDocumentationImages, deliveryCode } =
      await req.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find order where user is either the renter OR the owner
    const order = await Order.findOne({
      $and: [
        { $or: [{ milestoneId: id }, { _id: id }] },
        ...(user.accountType !== "admin"
          ? [{ $or: [{ ownerData: user._id }, { "userData.id": user._id }] }]
          : []),
      ],
      status: { $in: ["confirmed", "received"] },
      // startDate: {
      //   $gte: today,
      //   $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      // },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or not confirmed" },
        { status: 404 },
      );
    }

    const isRenter = order.userData.id.toString() === user._id.toString();
    const isOwner = order.ownerData.toString() === user._id.toString();
    const isAdmin = user.accountType === "admin";

    // --- RENTER FLOW ---
    if (isRenter || (isAdmin && !deliveryCode)) {
      // Upload renter documentation images to cloudinary
      const imageUrls =
        documentationImages && documentationImages.length > 0
          ? await Promise.all(
              documentationImages.map((image) =>
                cloudinary.uploader
                  .upload(image.preview, { folder: "documentation" })
                  .then((result) => result.secure_url),
              ),
            )
          : [];
      await Promise.all(
        order.items.map((booking) =>
          Booking.findByIdAndUpdate(booking, { status: "received" }),
        ),
      );
      order.documentationImages = imageUrls;
      order.renterConfirmedAt = new Date();
      order.status = "received";
      await order.save();

      return NextResponse.json({
        success: true,
        message: "تم تأكيد استلام الطلب",
      });
    }

    // --- OWNER FLOW ---
    if (isOwner || (isAdmin && deliveryCode)) {
      // Validate the delivery code
      if (!deliveryCode || deliveryCode !== order.deliveryCode) {
        return NextResponse.json(
          { success: false, error: "INVALID_CODE" },
          { status: 400 },
        );
      }

      // Upload owner documentation images to cloudinary
      const ownerImageUrls =
        ownerDocumentationImages && ownerDocumentationImages.length > 0
          ? await Promise.all(
              ownerDocumentationImages.map((image) =>
                cloudinary.uploader
                  .upload(image.preview, { folder: "documentation/owner" })
                  .then((result) => result.secure_url),
              ),
            )
          : [];

      // Update all booking items status to "received"
      await Promise.all(
        order.items.map((booking) =>
          Booking.findByIdAndUpdate(booking, { status: "received" }),
        ),
      );

      order.ownerDocumentationImages = ownerImageUrls;
      order.ownerConfirmedAt = new Date();
      order.status = "received";
      await order.save();

      return NextResponse.json({
        success: true,
        message: "تم تأكيد استلام الطلب",
      });
    }

    return NextResponse.json(
      { success: false, error: "Unable to determine user role" },
      { status: 400 },
    );
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/order-received/[id]",
      method: "PATCH",
      id,
      req,
      requestBody: { documentationImages: "REDACTED" },
    });
  }
}
