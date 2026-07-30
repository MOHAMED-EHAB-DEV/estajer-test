import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
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

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Reject message is required" },
        { status: 400 },
      );
    }

    const product = await Product.findById(id).populate("owner");

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (!product.pendingChanges?.needsReview) {
      return NextResponse.json(
        { success: false, error: "No pending changes to reject" },
        { status: 400 },
      );
    }

    // Mark needsReview = false, keep the pending values so user can see what they submitted
    // Store the rejection reason inside pendingChanges
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        "pendingChanges.needsReview": false,
        "pendingChanges.rejectMessage": message,
      },
      { new: true },
    );

    // Notify owner
    const userLang = product.owner?.lang || "ar";
    const productName =
      userLang === "en" ? product.nameEn : product.nameAr;

    const notificationTitle =
      userLang === "en"
        ? `Your changes to "${productName}" have been rejected`
        : `تم رفض تعديلاتك على "${productName}"`;

    const payload = {
      title: notificationTitle,
      body:
        userLang === "en"
          ? `Your product changes were rejected. Reason: ${message}`
          : `تم رفض تعديلاتك. السبب: ${message}`,
      data: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${userLang}/edit-product/${product._id}`,
      },
      actions: [
        {
          action: "open",
          title: userLang === "en" ? "Edit Product" : "تعديل المنتج",
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
      productName,
      "edit-rejected",
      message,
      userLang,
      product.owner?.unsubscribed,
    );

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]/reject-changes",
      method: "POST",
      id,
      req,
    });
  }
}
