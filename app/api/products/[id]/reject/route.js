import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { sendProductNotificationEmail } from "@/lib/email";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const { message } = await req.json();

    const product = await Product.findByIdAndUpdate(
      id,
      {
        rejected: true,
        rejectMessage: message,
      },
      { new: true },
    ).populate("owner");

    // Get user's language preference
    const userLang = product.owner?.lang || "ar";

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Create language-specific notification
    const notificationTitle =
      userLang === "en"
        ? `Your product "${product.nameEn}" has been rejected`
        : `تم رفض منتجك "${product.nameAr}"`;

    const payload = {
      title: notificationTitle,
      body:
        userLang === "en"
          ? `Your product has been rejected. Reason: ${message}`
          : `تم رفض منتجك. السبب: ${message}`,
      data: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${userLang}/dashboard/products?status=rejected`,
      },
      actions: [
        {
          action: "open",
          title: userLang === "en" ? "View Product" : "عرض المنتج",
        },
        {
          action: "dismiss",
          title: userLang === "en" ? "Dismiss" : "إلغاء",
        },
      ],
    };

    await Notification.create({
      user: product.owner._id,
      title: notificationTitle,
      type: "canceled",
      relatedId: product._id,
    });

    await sendNotifications({ id: product.owner._id, payload });

    await sendProductNotificationEmail(
      product.owner.email,
      userLang === "en" ? product.nameEn : product.nameAr,
      "rejected",
      message,
      userLang,
      product.owner?.unsubscribed,
    );

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]/reject",
      method: "POST",
      id,
      req,
    });
  }
}
