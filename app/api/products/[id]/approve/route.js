import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { sendProductNotificationEmail } from "@/lib/email";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";
import { enrichProduct } from "@/lib/ai/productEnricher";

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
    const product = await Product.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true },
    ).populate("owner");

    // Enrich product with AI
    await enrichProduct(id);
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
        ? `Your product "${product.nameEn}" has been approved`
        : `تم قبول منتجك "${product.nameAr}"`;

    const payload = {
      title: notificationTitle,
      body:
        userLang === "en"
          ? "Your product has been approved and is now live on the platform."
          : "تمت الموافقة على منتجك وهو الآن معروض على المنصة.",
      data: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${userLang}/products/${product._id}`,
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
      type: "accepted",
      relatedId: product._id,
    });

    await sendNotifications({ id: product.owner._id, payload });

    await sendProductNotificationEmail(
      product.owner.email,
      userLang === "en" ? product.nameEn : product.nameAr,
      "approved",
      "",
      userLang,
      product.owner?.unsubscribed,
    );

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]/approve",
      method: "POST",
      id,
      req,
    });
  }
}
