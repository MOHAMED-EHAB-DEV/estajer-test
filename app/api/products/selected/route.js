import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import connectDB from "@/lib/db";
import { sendProductNotificationEmail } from "@/lib/email";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";
import { enrichProduct, enrichProductsBulk } from "@/lib/ai/productEnricher";

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { productIds, action } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Selected product IDs are required" },
        { status: 400 },
      );
    }

    // Get selected products with their owners
    const validProducts = await Product.find({
      _id: { $in: productIds },
    }).populate("owner");

    if (validProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid products found" },
        { status: 404 },
      );
    }

    if (action === "approve") {
      // Update selected products to approved
      await Product.updateMany(
        { _id: { $in: productIds }, approved: false, rejected: false },
        { approved: true },
      );

      // AI enrichment for newly approved products (processed in batches of 10)
      await enrichProductsBulk(productIds);

      const products = await Product.find({
        _id: { $in: productIds },
        rejected: false,
      }).populate("owner");

      // Group products by owner
      const productsByOwner = products.reduce((acc, product) => {
        const ownerId = product.owner._id.toString();
        if (!acc[ownerId]) {
          acc[ownerId] = {
            owner: product.owner,
            products: [],
          };
        }
        acc[ownerId].products.push(product);
        return acc;
      }, {});

      // Send one notification and email per owner
      await Promise.all(
        Object.values(productsByOwner).map(
          async ({ owner, products: ownerProducts }) => {
            const productCount = ownerProducts.length;
            const userLang = owner?.lang || "ar";

            // Create language-specific notification title
            let title;
            let body;
            let url;

            if (productCount === 1) {
              const productName =
                userLang === "en"
                  ? ownerProducts[0].nameEn
                  : ownerProducts[0].nameAr;
              title =
                userLang === "en"
                  ? `Your product "${productName}" has been approved`
                  : `تم قبول منتجك "${productName}"`;
              body =
                userLang === "en"
                  ? "Your product has been approved and is now live on the platform."
                  : "تمت الموافقة على منتجك وهو الآن معروض على المنصة.";
              url = `${process.env.NEXT_PUBLIC_APP_URL}/${userLang}/products/${ownerProducts[0]._id}`;
            } else {
              title =
                userLang === "en"
                  ? `${productCount} of your products have been approved`
                  : `تم قبول ${productCount} منتجات لك`;
              body =
                userLang === "en"
                  ? `${productCount} of your products have been approved and are now live on the platform.`
                  : `تمت الموافقة على ${productCount} من منتجاتك وهي الآن معروضة على المنصة.`;
              url = `${process.env.NEXT_PUBLIC_APP_URL}/${userLang}/dashboard/products`;
            }

            const payload = {
              title,
              body,
              data: { url },
              actions: [
                {
                  action: "open",
                  title:
                    userLang === "en"
                      ? `View ${productCount === 1 ? "Product" : "Products"}`
                      : `عرض ${productCount === 1 ? "المنتج" : "منتجاتك"}`,
                },
                {
                  action: "dismiss",
                  title: userLang === "en" ? "Dismiss" : "إلغاء",
                },
              ],
            };

            // Create notification
            await Notification.create({
              user: owner._id,
              title,
              type: "accepted",
              relatedId: ownerProducts[0]._id,
            });

            await sendNotifications({ id: owner._id, payload });

            // Send email with language preference
            if (productCount === 1) {
              await sendProductNotificationEmail(
                owner.email,
                userLang === "en"
                  ? ownerProducts[0].nameEn
                  : ownerProducts[0].nameAr,
                "approved",
                "",
                userLang,
                owner?.unsubscribed,
              );
            } else {
              // For multiple products, send a general approval email
              const productName =
                userLang === "en"
                  ? `${productCount} products`
                  : `عدد ${productCount} منتجات`;
              await sendProductNotificationEmail(
                owner.email,
                productName,
                "approved",
                "",
                userLang,
                owner?.unsubscribed,
              );
            }
          },
        ),
      );
    } else if (action === "addToNana") {
      await Product.updateMany({ _id: { $in: productIds } }, { nana: true });
    } else if (action === "removeFromNana") {
      await Product.updateMany({ _id: { $in: productIds } }, { nana: false });
    } else if (action === "hide") {
      await Product.updateMany({ _id: { $in: productIds } }, { hidden: true });
    } else if (action === "unhide") {
      await Product.updateMany({ _id: { $in: productIds } }, { hidden: false });
    } else if (action === "delete") {
      await Product.updateMany({ _id: { $in: productIds } }, { deleted: true });
    }

    return NextResponse.json({
      success: true,
      message: `${validProducts.length} products ${action} successfully`,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products/selected",
      method: "POST",
      req,
    });
  }
}
