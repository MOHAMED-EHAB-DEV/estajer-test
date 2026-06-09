import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import { authHeaders } from "@/middleware/authHeaders";
import {
  sendNewOrderToOwnerEmail,
  sendPaymentNotificationEmail,
} from "@/lib/email";
import Product from "@/models/Product";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

import { updateAlert } from "@/lib/alert";

export async function POST(req) {
  try {
    await connectDB();
    const user = await authHeaders(req, true);

    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { success: false, error: "Payment reference ID is required" },
        { status: 400 },
      );
    }
    // Find the order
    const order = await Order.findOne({
      $or: [{ milestoneId: data.id }, { _id: data.id }],
      ...(user.accountType !== "admin" && { "userData.id": user._id }),
    })
      .populate(
        "ownerData",
        "email fullName phone address nationalId vomId lang companyDetails unifiedNumber",
      )
      .populate(
        "userData.id",
        "email fullName phone address nationalId vomId lang companyDetails unifiedNumber nafathData",
      )
      .populate({
        path: "items",
        populate: {
          path: "product",
          select: "nameAr nameEn vomId category subCategory rental quantity",
        },
      })
      .select(
        "status userData ownerData items totalAmount paymentUrl contractId deliveryCost invoiceId startDate endDate deliveryCode renterConfirmedAt ownerConfirmedAt",
      );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const paymentData = await fetch(
      `https://miniapps.nana.sa/api/v2/mobile-user-activities/get-payment-session/${data.paymentId}`,
      {
        headers: {
          Accept: "application/json",
          "miniapp-user-token": `Bearer ${data.token}`,
          "miniapp-api-key": process.env.MINIAPP_API_KEY,
        },
      },
    ).then((res) => res.json());
    if (order.status === "not-paid") {
      const status = paymentData?.data?.payment_status;
      order.nanaStatus = status;
      await order.save();
      // Update order and bookings status based on payment status
      if (status === "cancelled") {
        order.nanaStatus = status;
        await order.save();
        return NextResponse.json({
          success: true,
          data: {
            orderId: order._id,
            status: status,
            paymentUrl: order.paymentUrl,
            startDate: order.startDate,
          },
        });
      }
      if (status === "success") {
        order.status = "pending";
        order.nanaStatus = status;
        await Booking.updateMany(
          { _id: { $in: order.items } },
          { status: "pending" },
        );
        await order.save();
        await updateAlert("order", order._id);

        // Increment sales count for each product in the order
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        for (const item of order.items) {
          const product = await Product.findById(item.product._id);
          if (product) {
            const lastReset = new Date(product.sales.lastMonthlyReset);
            const resetMonth = lastReset.getMonth();
            const resetYear = lastReset.getFullYear();

            // Reset monthly count if it's a new month
            if (currentMonth !== resetMonth || currentYear !== resetYear) {
              product.sales.monthlyCount = 0;
              product.sales.lastMonthlyReset = currentDate;
            }

            // Increment both total and monthly sales
            product.sales.totalCount += item.quantity || 1;
            product.sales.monthlyCount += item.quantity || 1;

            await product.save();
          }
        }
        // Get owner's language preference
        const ownerLang = order.ownerData?.lang || "ar";

        // Create language-specific notification title
        const notificationTitle =
          ownerLang === "en"
            ? `You have a new rental request from ${
                user.fullName.split(" ")[0]
              }`
            : `لديك طلب تأجير جديد من ${user.fullName.split(" ")[0]}`;

        const payload = {
          title:
            ownerLang === "en"
              ? `You have a new rental request`
              : `لديك طلب تأجير جديد رقم الطلب`,
          body: notificationTitle,
          data: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/${ownerLang}/dashboard/requests?id=${order._id}`,
          },
          actions: [
            {
              action: "open",
              title: ownerLang === "en" ? "View Order" : "عرض الطلب",
            },
            {
              action: "dismiss",
              title: ownerLang === "en" ? "Dismiss" : "إلغاء",
            },
          ],
        };

        await Notification.create({
          user: order.ownerData._id,
          title: notificationTitle,
          type: "order",
          relatedId: order._id,
        }).catch((error) => console.error("Notification error:", error));

        await sendNotifications({ id: order.ownerData._id, payload });

        process.env.NODE_ENV !== "development" &&
          (await sendNewOrderToOwnerEmail({
            customerName: user.fullName,
            orderId: order._id,
            ownerEmail: order.ownerData.email,
            items: order.items.map((item) => ({
              name:
                ownerLang === "en" ? item.product.nameEn : item.product.nameAr,
              startDate: item.startDate,
              endDate: item.endDate,
            })),
            totalEarnings: order.totalAmount,
            userLang: ownerLang,
          }));

        // Send WhatsApp to Owner
        if (order.ownerData?.phone) {
          await sendWhatsAppTemplate({
            to: `+966${order.ownerData.phone.slice(1)}`,
            templateName: `owner_new_order_${ownerLang}`,
            languageCode: ownerLang,
            bodyParameters: [
              { name: "order_id", text: order._id },
              {
                name: "customer_name",
                text: order.userData.id.fullName,
              },
            ],
            buttonParameters: [order._id],
          }).catch((err) => console.error("WhatsApp Error:", err));
        }

        try {
          const customer = order.userData.id;
          const customerLang = customer?.lang || "ar";
          const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${order._id}/invoice`;
          const dashboardUrl = `${
            process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com"
          }/${customerLang}/dashboard/my-orders`;

          const notificationTitle =
            customerLang === "en"
              ? `Payment for order #${order._id} was successful`
              : `تم الدفع بنجاح للطلب رقم ${order._id}`;

          const payload = {
            title: notificationTitle,
            body:
              customerLang === "en"
                ? "Your payment was successful and the order is now being processed."
                : "تم الدفع بنجاح وجاري معالجة الطلب.",
            data: {
              url: `${process.env.NEXT_PUBLIC_APP_URL}/${customerLang}/dashboard/my-orders?id=${order._id}`,
            },
            actions: [
              {
                action: "open",
                title: customerLang === "en" ? "View Order" : "عرض الطلب",
              },
              {
                action: "dismiss",
                title: customerLang === "en" ? "Dismiss" : "إلغاء",
              },
            ],
          };

          await Notification.create({
            user: customer._id,
            title: notificationTitle,
            type: "order",
            relatedId: order._id,
          });

          await sendNotifications({ id: customer._id, payload });

          process.env.NODE_ENV !== "development" &&
            (await sendPaymentNotificationEmail({
              email: customer.email,
              customerName: customer.fullName,
              items: order.items.map((item) => ({
                name:
                  customerLang === "en"
                    ? item.product.nameEn
                    : item.product.nameAr,
                startDate: new Date(item.startDate).toLocaleDateString("ar"),
                endDate: new Date(item.endDate).toLocaleDateString("ar"),
              })),
              totalAmount: order.totalAmount,
              orderId: order._id,
              paymentStatus: "success",
              userLang: customerLang,
              invoiceUrl,
              dashboardUrl,
            }));
        } catch (emailError) {
          console.error(
            "Failed to send payment notification email:",
            emailError,
          );
        }
      }
      return NextResponse.json({
        success: true,
        data: {
          ...(data?.full
            ? { order, paymentData }
            : {
                orderId: order._id,
                status: order.status,
                paymentUrl: order.paymentUrl,
                startDate: order.startDate,
              }),
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          ...(data?.full
            ? { order, paymentData }
            : {
                orderId: order._id,
                status: order.status,
                paymentUrl: order.paymentUrl,
                startDate: order.startDate,
              }),
        },
      });
    }
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/payment-status/nana",
      method: "POST",
      req,
    });
  }
}
