import { NextResponse } from "next/server";
import Order from "@/models/Order";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import {
  sendNewOrderToOwnerEmail,
  sendOrderNotificationEmail,
  sendCashoutRequirementsEmail,
  sendPaymentNotificationEmail,
  sendMoneyTransferCompletionEmail,
} from "@/lib/email";
import User from "@/models/User";
import Product from "@/models/Product";

import waffyContract from "@/lib/waffy-contract";
import waffyAuth from "@/lib/waffy-auth";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";
import { createVomCustomer, createVomInvoice } from "@/lib/vom";
import { getOrCreateQoyodCustomer, createQoyodInvoice, createQoyodInvoicePayment } from "@/lib/qoyod";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

// Helper function to handle address creation from geocoding
async function handleUserAddress(location, waffyId, userId) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ar`,
  );
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No geocoding results found");
  }

  const result = data.results[0];
  const addressComponents = result.address_components;

  // Extract address components
  const addressData = {
    addressLabel: "HOME",
    street: "",
    district: "",
    postalCode: "",
    city: "",
    countryCode: "SA",
  };

  // Parse address components
  addressComponents.forEach((component) => {
    const types = component.types;

    if (types.includes("street_number") || types.includes("route")) {
      addressData.street = addressData.street
        ? `${addressData.street} ${component.long_name}`
        : component.long_name;
    }

    if (
      types.includes("sublocality") ||
      types.includes("sublocality_level_1") ||
      types.includes("neighborhood")
    ) {
      addressData.district = component.long_name;
    }

    if (types.includes("postal_code")) {
      addressData.postalCode = component.long_name;
    }

    if (
      types.includes("locality") ||
      types.includes("administrative_area_level_2")
    ) {
      addressData.city = component.long_name;
    }

    if (types.includes("country")) {
      addressData.countryCode = component.short_name;
    }
  });

  const res = await waffyAuth.addUserAddress({
    userId: waffyId,
    userData: addressData,
  });

  if (res.status === 201) {
    await User.findByIdAndUpdate(userId, {
      waffyAddress: true,
    });
  }

  return res;
}

import { updateAlert } from "@/lib/alert";

export async function POST(request) {
  await connectDB();
  try {
    const paymentResult = await request.json();
    console.log("paymentResult: ", paymentResult);
    const forwarded = request.headers.get("x-forwarded-for")?.split(",");
    const realIp =
      request.headers.get("x-real-ip") ||
      forwarded?.[1] ||
      forwarded?.[0] ||
      "anonymous";
    const ip = realIp.replace("::ffff:", "");
    if (ip !== "34.166.52.139") {
      console.log("Access denied from IP:", ip);
      return NextResponse.json(
        { status: "error", message: "Access denied" },
        { status: 403 },
      );
    }
    console.log("Access granted from IP: ", ip);
    const { contractId, status } = paymentResult;

    if (!contractId) {
      return NextResponse.json(
        { status: "error", message: "Contract ID is required" },
        { status: 400 },
      );
    }

    // Find the order by contractId
    const order = await Order.findOne({ milestoneId: contractId })
      .populate(
        "ownerData",
        "email fullName phone address nationalId vomId qoyodId lang commission iban waffyId location waffyAddress companyDetails",
      )
      .populate("userData.id", "waffyId location waffyAddress")
      .populate("source.refId", "shopCommission")
      .populate({
        path: "items",
        populate: {
          path: "product",
          select: "nameAr nameEn vomId category rental quantity",
        },
      });

    if (!order) {
      return NextResponse.json(
        { status: "error", message: "Order not found" },
        { status: 404 },
      );
    }

    if (status === "CASH_OUT_APPROVED") {
      order.waffyStatus = status;
      await order.save();
      return NextResponse.json({
        status: "success",
        message: "Cash out successfully",
      });
    }

    if (status === "READY_FOR_CASH_OUT") {
      // Validate required information for cash-out
      const hasValidLocation =
        order.ownerData?.location?.lng !== undefined &&
        order.ownerData?.location?.lng !== null;
      const hasValidIban = !!order.ownerData?.iban;
      const isCompanyWithTax =
        order.ownerData?.accountType === "company" &&
        !!order.ownerData?.companyDetails?.taxCode;
      const billing = order.ownerData?.companyDetails?.billingAddress;
      const hasValidBillingAddress =
        !isCompanyWithTax ||
        (!!billing?.street &&
          !!billing?.city &&
          !!billing?.district &&
          !!billing?.postalCode &&
          !!billing?.buildingNumber);

      // If location, IBAN, or billing address is missing, send notification email and prevent cash-out
      if (!hasValidLocation || !hasValidIban || !hasValidBillingAddress) {
        const ownerLang = order.ownerData?.lang || "ar";

        try {
          await sendCashoutRequirementsEmail(
            order.ownerData.email,
            order.ownerData.fullName,
            ownerLang,
          );
        } catch (emailError) {
          console.error(
            "Failed to send cashout requirements email:",
            emailError,
          );
        }

        return NextResponse.json(
          {
            status: "error",
            message: "Cash-out requirements missing",
            details: {
              missingLocation: !hasValidLocation,
              missingIban: !hasValidIban,
              missingBillingAddress: !hasValidBillingAddress,
            },
            orderId: order._id,
          },
          { status: 400 },
        );
      }
      // Proceed with existing cash-out logic if all requirements are met
      if (!order.ownerData?.waffyAddress) {
        await handleUserAddress(
          order.ownerData.location,
          order.ownerData.waffyId,
          order.ownerData._id,
        );
      }
      order.waffyStatus = status;

      let adminAmount, ownerAmount, customerAmount;
      if (order.adminAmount !== undefined && order.adminAmount !== null) {
        adminAmount = order.adminAmount;
        ownerAmount = order.ownerAmount;
        customerAmount = order.customerAmount || 0;
      } else {
        const totalWithoutTax = order.totalAmount - order.tax;
        const shopCommission = order.source?.refId?.shopCommission ?? 5;
        const adminCommission =
          order.source?.type === "shop"
            ? shopCommission / 100
            : (order.ownerData?.commission || 15) / 100;
        const adminWithoutTax = totalWithoutTax * adminCommission;
        const adminTax = adminWithoutTax * 0.15;
        adminAmount = +(adminWithoutTax + adminTax).toFixed(0);
        ownerAmount = order.totalAmount - adminAmount;
        customerAmount = 0;
      }

      order.ownerAmount = ownerAmount;
      order.adminAmount = adminAmount;
      order.customerAmount = customerAmount;
      await order.save();

      const customerWaffyId = order.userData?.id?.waffyId || null;

      await waffyContract.settleContract({
        milestoneId: order.milestoneId,
        providerId: order.ownerData.waffyId,
        receiverId: order.ownerData.waffyId,
        receiverAmount: ownerAmount,
        adminAmount,
        customerAmount,
        customerId: customerWaffyId,
      });

      return NextResponse.json({
        status: "success",
        message: "Contract settled successfully",
        orderId: order._id,
        orderStatus: order.status,
      });
    }

    if (status === "REFUND_IN_PROGRESS") {
      if (!order.userData?.id?.waffyAddress) {
        await handleUserAddress(
          order.userData.id.location,
          order.userData.id.waffyId,
          order.userData.id._id,
        );
      }

      let adminAmount, ownerAmount, customerAmount;
      if (order.adminAmount !== undefined && order.adminAmount !== null) {
        adminAmount = order.adminAmount;
        ownerAmount = order.ownerAmount;
        customerAmount =
          order.customerAmount !== undefined && order.customerAmount !== null
            ? order.customerAmount
            : 0;
      } else {
        adminAmount = 0;
        ownerAmount = 0;
        customerAmount = order.totalAmount;
      }

      await waffyContract.settleContract({
        milestoneId: contractId,
        providerId: order.ownerData.waffyId,
        receiverId: order.userData.id.waffyId,
        receiverAmount: customerAmount,
        adminAmount,
        customerId: order.ownerData.waffyId,
        customerAmount: ownerAmount,
      });
      order.waffyStatus = status;
      await order.save();
      return NextResponse.json({
        status: "success",
        message: "Refund in progress",
      });
    }

    // Handle rejection completion when waffy confirms the refund

    if (status === "COMPLETED") {
      if (order.status === "rejecting") {
        // Update order status to cancelled
        order.status = "cancelled";
        order.waffyStatus = status;
        // Update all bookings to cancelled
        await Booking.updateMany(
          { _id: { $in: order.items } },
          { status: "cancelled" },
        );
        await order.save();

        // Get customer data and language preference
        const customer = await User.findById(order.userData.id).select("lang");
        const customerLang = customer?.lang || "ar";

        // Create language-specific notification
        const notificationTitle =
          customerLang === "en"
            ? `Your order #${order._id} has been rejected`
            : `تم رفض طلبك رقم ${order._id}`;

        const payload = {
          title: notificationTitle,
          body:
            customerLang === "en"
              ? "Your order has been rejected and a refund is being processed."
              : "تم رفض طلبك وجاري استرداد المبلغ المدفوع.",
          data: {
            url: `${order.checkoutOrigin || process.env.NEXT_PUBLIC_APP_URL}/${customerLang}/dashboard/my-orders?id=${order._id}`,
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

        // Create notification
        await Notification.create({
          user: order.userData.id,
          title: notificationTitle,
          type: "canceled",
          relatedId: order._id,
        }).catch((error) => console.error("Notification error:", error));

        await sendNotifications({ id: order.userData.id, payload });

        // Send email notification to customer
        await sendOrderNotificationEmail(
          order.userData.email,
          order.items.map((item) => ({
            name:
              customerLang === "en" ? item.product.nameEn : item.product.nameAr,
            startDate: new Date(item.startDate).toLocaleDateString("ar"),
            endDate: new Date(item.endDate).toLocaleDateString("ar"),
          })),
          "cancelled",
          order.totalAmount,
          customerLang,
          order.checkoutOrigin,
        ).catch((error) => console.error("Email notification error:", error));
      } else {
        if (order.waffyStatus === "COMPLETED") {
          return NextResponse.json({
            status: "success",
            message: "Order completed successfully",
          });
        }
        order.waffyStatus = status;
        await order.save();
        try {
          // Create Purchase Bill for the completed order
          let owner = order.ownerData;
          if (!owner.vomId) {
            const vomOwnerId = await createVomCustomer({
              name: owner?.companyDetails?.companyName || owner.fullName,
              email: owner.email,
              mobile: owner.phone,
              taxCode: owner?.companyDetails?.taxCode || "",
              address: owner?.address || "",
            });
            await User.findByIdAndUpdate(owner._id, { vomId: vomOwnerId });
            owner.vomId = vomOwnerId;
          }
          let unit_price;
          if (order.adminAmount !== undefined && order.adminAmount !== null) {
            unit_price = +(order.adminAmount / 1.15).toFixed(2);
          } else {
            const totalWithoutTax = order.totalAmount - order.tax;
            const shopCommission = order.source?.refId?.shopCommission ?? 5;
            const adminCommission =
              order.source?.type === "shop"
                ? shopCommission / 100
                : (owner?.commission || 15) / 100;
            unit_price = totalWithoutTax * adminCommission;
          }
          const productsForInvoice = [{ product_id: 38, unit_price }];
          let invoiceId = order.invoiceId;
          if (!invoiceId) {
            // Atomic claim: only proceed if invoiceId is still unset, null, or 0 in DB
            const claimed = await Order.findOneAndUpdate(
              {
                _id: order._id,
                $or: [
                  { invoiceId: { $exists: false } },
                  { invoiceId: null },
                  { invoiceId: 0 },
                ],
              },
              { $set: { invoiceId: 0 } },
              { new: false },
            );
            if (!claimed) {
              // Another concurrent request already created the invoice
              console.log(
                `Invoice already being created for order ${order._id}, skipping duplicate`,
              );
            } else {
              const invoice = await createVomInvoice({
                invoiceType: owner?.companyDetails?.taxCode
                  ? "tax_invoice"
                  : "simplified_tax_invoice",
                customer: owner.vomId,
                products: productsForInvoice,
                orderId: order._id,
              });
              invoiceId = invoice?.data?.invoice?.id;
              await Order.findByIdAndUpdate(order._id, { invoiceId });

              // Sync to Qoyod
              try {
                console.log(
                  `Syncing invoice for order ${order._id} to Qoyod...`,
                );
                const qoyodContactId = await getOrCreateQoyodCustomer(owner);
                const issueDate = new Date().toISOString().split("T")[0];
                const qoyodInvoiceId = await createQoyodInvoice({
                  contactId: qoyodContactId,
                  issueDate,
                  reference: invoiceId
                    ? `vom-${invoiceId}`
                    : `order-${order._id}`,
                  description: `عمولات استأجر - رقم الطلب: ${order._id}`,
                  unitPrice: unit_price,
                });
                await Order.findByIdAndUpdate(order._id, { qoyodInvoiceId });
                console.log(
                  `Successfully synced invoice to Qoyod (ID: ${qoyodInvoiceId}) for order ${order._id}`,
                );

                // Create Qoyod Invoice Payment
                try {
                  const paymentAmount = order.adminAmount || +(unit_price * 1.15).toFixed(2);
                  console.log(`Creating payment for Qoyod invoice ${qoyodInvoiceId} of amount ${paymentAmount}...`);
                  await createQoyodInvoicePayment({
                    invoiceId: qoyodInvoiceId,
                    accountId: process.env.QOYOD_PAYMENT_ACCOUNT_ID || 8,
                    amount: paymentAmount,
                    date: issueDate,
                    reference: invoiceId
                      ? `pay-vom-${invoiceId}`
                      : `pay-order-${order._id}`,
                    description: `سداد آلي لعمولة استأجر - رقم الطلب: ${order._id}`,
                  });
                  console.log(`Successfully registered payment for Qoyod invoice ${qoyodInvoiceId}`);
                } catch (paymentError) {
                  console.error("Failed to register Qoyod payment:", paymentError);
                }
              } catch (qoyodError) {
                console.error("Failed to sync invoice to Qoyod:", qoyodError);
              }
            }
          }

          // Send money transfer completion email to provider
          const ownerLang = owner?.lang || "ar";
          const dashboardUrl = `${
            process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com"
          }/${ownerLang}/dashboard/my-orders`;

          await sendMoneyTransferCompletionEmail({
            email: owner.email,
            providerName: owner.fullName,
            orderId: order._id,
            transferAmount: order.ownerAmount || order.totalAmount,
            items: order.items.map((item) => ({
              name:
                ownerLang === "en" ? item.product.nameEn : item.product.nameAr,
              startDate: new Date(item.startDate).toLocaleDateString("ar"),
              endDate: new Date(item.endDate).toLocaleDateString("ar"),
            })),
            userLang: ownerLang,
            dashboardUrl,
          });

          console.log(
            "Money transfer completion email sent successfully to:",
            owner.email,
          );
        } catch (purchaseBillError) {
          console.error(
            "Failed to create Purchase Bill or send email:",
            purchaseBillError,
          );
          // Don't fail the entire callback if Purchase Bill creation fails
        }
      }
      return NextResponse.json({
        status: "success",
        message: "Order rejection completed successfully",
        orderId: order._id,
        orderStatus: order.status,
      });
    }

    // Update order and bookings status if payment is successful
    if (status === "PAID" && order.status === "not-paid") {
      order.waffyStatus = status;
      order.status = "pending";
      await Booking.updateMany(
        { _id: { $in: order.items } },
        { status: "pending" },
      );
      await order.save();
      await updateAlert("order", order._id);

      // Get customer data
      const customer = await User.findById(order.userData.id);

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
              customer.fullName.split(" ")[0]
            }`
          : `لديك طلب تأجير جديد من ${customer.fullName.split(" ")[0]}`;

      const payload = {
        title:
          ownerLang === "en"
            ? `You have a new rental request`
            : `لديك طلب تأجير جديد`,
        body: notificationTitle,
        data: {
          url: `${order.checkoutOrigin || process.env.NEXT_PUBLIC_APP_URL}/${ownerLang}/dashboard/requests?id=${order._id}`,
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

      await sendNewOrderToOwnerEmail({
        customerName: customer.fullName,
        orderId: order._id,
        ownerEmail: order.ownerData.email,
        items: order.items.map((item) => ({
          name: ownerLang === "en" ? item.product.nameEn : item.product.nameAr,
          startDate: item.startDate,
          endDate: item.endDate,
        })),
        totalEarnings: order.totalAmount,
        userLang: ownerLang,
      });

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
              text: customer.fullName,
            },
          ],
          buttonParameters: [order._id],
        }).catch((err) => console.error("WhatsApp Error:", err));
      }

      // Send payment success notification to customer
      try {
        const customerLang = customer?.lang || "ar";
        const dashboardUrl = `${
          order.checkoutOrigin ||
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://estajer.com"
        }/${customerLang}/dashboard/my-orders`;
        const invoiceUrl = `${order.checkoutOrigin || process.env.NEXT_PUBLIC_APP_URL}/api/orders/${order._id}/invoice`;

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
            url: `${order.checkoutOrigin || process.env.NEXT_PUBLIC_APP_URL}/${customerLang}/dashboard/my-orders?id=${order._id}`,
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

        await sendPaymentNotificationEmail({
          email: customer.email,
          customerName: customer.fullName,
          items: order.items.map((item) => ({
            name:
              customerLang === "en" ? item.product.nameEn : item.product.nameAr,
            startDate: new Date(item.startDate).toLocaleDateString("ar"),
            endDate: new Date(item.endDate).toLocaleDateString("ar"),
          })),
          totalAmount: order.totalAmount,
          orderId: order._id,
          paymentStatus: "success",
          userLang: customerLang,
          invoiceUrl,
          dashboardUrl,
          checkoutOrigin: order.checkoutOrigin,
        });
      } catch (emailError) {
        console.error("Failed to send payment notification email:", emailError);
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Payment callback processed successfully",
      orderId: order._id,
      orderStatus: order.status,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/waffy/callback",
      method: "POST",
      req: request,
    });
  }
}
