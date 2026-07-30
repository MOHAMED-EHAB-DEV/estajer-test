import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import connectDB from "@/lib/db";
import { sendProductNotificationEmail } from "@/lib/email";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";
import { revalidateTag } from "next/cache";

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
    const product = await Product.findById(id).populate("owner");

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (!product.pendingChanges?.needsReview) {
      return NextResponse.json(
        { success: false, error: "No pending changes to approve" },
        { status: 400 },
      );
    }

    // Build the update from pendingChanges — only apply fields that exist
    const apply = {};
    const pc = product.pendingChanges;
    if (pc.nameAr !== undefined) apply.nameAr = pc.nameAr;
    if (pc.nameEn !== undefined) apply.nameEn = pc.nameEn;
    if (pc.descriptionAr !== undefined) apply.descriptionAr = pc.descriptionAr;
    if (pc.descriptionEn !== undefined) apply.descriptionEn = pc.descriptionEn;
    if (pc.category !== undefined) apply.category = pc.category;
    if (pc.subCategory !== undefined) apply.subCategory = pc.subCategory;
    if (pc.images?.length) apply.images = pc.images;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...apply,
        $unset: { pendingChanges: 1 },
      },
      { new: true, runValidators: false },
    );

    // Revalidate cache
    revalidateTag(`product-${id}`);

    // Notify owner
    const userLang = product.owner?.lang || "ar";
    const productName =
      userLang === "en"
        ? pc.nameEn || product.nameEn
        : pc.nameAr || product.nameAr;

    const notificationTitle =
      userLang === "en"
        ? `Your changes to "${productName}" have been approved`
        : `تم قبول تعديلاتك على "${productName}"`;

    const payload = {
      title: notificationTitle,
      body:
        userLang === "en"
          ? "Your product changes have been approved and are now live."
          : "تمت الموافقة على تعديلاتك وهي الآن مرئية للعموم.",
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
      productName,
      "edit-approved",
      "",
      userLang,
      product.owner?.unsubscribed,
    );

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]/approve-changes",
      method: "POST",
      id,
      req,
    });
  }
}
