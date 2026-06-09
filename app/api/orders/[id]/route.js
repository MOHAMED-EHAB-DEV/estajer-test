import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Booking from "@/models/Booking";
import { authenticateUser } from "@/middleware/auth";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { sendOrderNotificationEmail } from "@/lib/email";
import { sendDeliveryConfirmationEmail } from "@/lib/emails/delivery";
import { authHeaders } from "@/middleware/authHeaders";
import waffyContract from "@/lib/waffy-contract";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

// GET - Fetch a specific order
export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await authHeaders(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const showDetails = searchParams.get("details") === "true";

    const populateSpec = [
      {
        path: "items",
        populate: {
          path: "product",
          select: "nameAr nameEn images location",
        },
      },
    ];
    const isAdmin = user.accountType === "admin";

    if (isAdmin && showDetails) {
      populateSpec.push(
        {
          path: "ownerData",
          select:
            "fullName email phone createdAt notes rating address avatar location",
        },
        {
          path: "userData.id",
          select: "avatar createdAt rating",
        },
      );
    }

    const order = await Order.findById(id).populate(populateSpec);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const isOwner = order.ownerData.toString() === user._id.toString();
    const isCustomer = order.userData.id.toString() === user._id.toString();

    // Check if user has permission to view this order
    if (!isCustomer && !isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/orders/[id]",
      method: "GET",
      id,
      req,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const user = client ? await authenticateUser() : await authHeaders(req);
    const { id } = await params;
    const body = await req.json();
    const { action, startDate, endDate } = body;

    if (action === "delivery") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const order = await Order.findOne({
        _id: id,
        ownerData: user._id,
        deliveryNotificationSent: false,
        status: "confirmed",
        startDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      }).populate({
        path: "items",
        populate: { path: "product", select: "nameAr nameEn" },
      });

      if (!order)
        throw new Error("Order not eligible for delivery notification");
      const customer = await User.findById(order.userData.id).select("lang");
      const customerLang = customer?.lang || "ar";
      console.log("customer: ", customer);

      // Create language-specific notificationZ
      const notificationTitle =
        customerLang === "en"
          ? "Please confirm receipt of your rented products"
          : "يرجى تأكيد استلام منتجاتك المؤجرة";

      const payload = {
        title: notificationTitle,
        body:
          customerLang === "en"
            ? "Please confirm that you have received your rented products."
            : "يرجى تأكيد استلامك للمنتجات المؤجرة.",
        data: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/${customerLang}/dashboard/my-orders#${order._id}`,
        },
        actions: [
          {
            action: "open",
            title:
              customerLang === "en" ? "Confirm Delivery" : "تأكيد الاستلام",
          },
          {
            action: "dismiss",
            title: customerLang === "en" ? "Dismiss" : "إلغاء",
          },
        ],
      };

      await Notification.create({
        user: order.userData.id,
        title: notificationTitle,
        type: "order",
        relatedId: order._id,
      });

      await sendNotifications({ id: order.userData.id, payload });

      await sendDeliveryConfirmationEmail({
        email: order.userData.email,
        items: order.items.map((item) => ({
          name:
            customerLang === "en" ? item.product.nameEn : item.product.nameAr,
        })),
        orderId: order._id,
        userLang: customerLang,
      });

      await Order.findByIdAndUpdate(order._id, {
        deliveryNotificationSent: true,
      });

      return NextResponse.json({ success: true });
    }
    if (action === "delete") {
      // Check if user is admin
      const isAdmin = user.accountType === "admin";
      // Build query - admin can delete any unpaid order, customer can only delete their own
      const query = { _id: id, status: "not-paid" };
      if (!isAdmin) query["userData.id"] = user._id;

      const order = await Order.findOneAndDelete(query).populate({
        path: "items",
      });
      if (!order) throw new Error("Order not found or already deleted");
      await Promise.all(
        order.items.map((booking) => Booking.findByIdAndDelete(booking._id)),
      );
      return NextResponse.json({ success: true });
    }

    // Handle admin updating order dates
    if (action === "updateDates") {
      const isAdmin = user.accountType === "admin";
      if (!isAdmin) throw new Error("Unauthorized - Admin only");

      if (!startDate || !endDate)
        throw new Error("Start date and end date are required");

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (parsedEndDate < parsedStartDate) {
        throw new Error("End date must be after start date");
      }

      const order = await Order.findById(id).populate({ path: "items" });
      if (!order) throw new Error("Order not found");

      // Update order dates
      order.startDate = parsedStartDate;
      order.endDate = parsedEndDate;
      await order.save();

      // Update all associated bookings with new dates
      await Promise.all(
        order.items.map((booking) =>
          Booking.findByIdAndUpdate(booking._id, {
            startDate: parsedStartDate,
            endDate: parsedEndDate,
          }),
        ),
      );

      return NextResponse.json({ success: true, data: order });
    }

    // Handle cancel confirm action (revert confirmed order to pending)
    if (action === "cancelConfirm") {
      const isAdmin = user.accountType === "admin";
      if (!isAdmin) throw new Error("Unauthorized - Admin only");

      const order = await Order.findOne({ _id: id, status: "confirmed" });

      if (!order) throw new Error("Order not found or not in confirmed status");

      // Update all bookings back to pending
      await Promise.all(
        order.items.map((booking) =>
          Booking.findByIdAndUpdate(booking._id, { status: "pending" }),
        ),
      );

      // Update order status back to pending
      order.status = "pending";
      await order.save();

      return NextResponse.json({ success: true });
    }

    // Handle marking completed order as not-returned
    if (action === "markNotReturned") {
      const isAdmin = user.accountType === "admin";
      if (!isAdmin) throw new Error("Unauthorized - Admin only");

      const order = await Order.findOne({ _id: id, status: "completed" });

      if (!order) throw new Error("Order not found or not in completed status");

      // Update order status to not-returned
      order.status = "not-returned";
      await order.save();

      return NextResponse.json({ success: true });
    }

    // Handle marking not-returned order as completed (returned)
    if (action === "markReturned") {
      const isAdmin = user.accountType === "admin";
      if (!isAdmin) throw new Error("Unauthorized - Admin only");

      const order = await Order.findOne({ _id: id, status: "not-returned" });

      if (!order)
        throw new Error("Order not found or not in not-returned status");

      // Update order status back to completed
      order.status = "completed";
      await order.save();

      return NextResponse.json({ success: true });
    }

    const order = await Order.findOne({
      _id: id,
      status:
        action === "confirmRejection" || action === "restoreOrder"
          ? "rejecting"
          : "pending",
    })
      .populate({
        path: "items",
        populate: { path: "product", select: "nameAr nameEn" },
      })
      .populate("userData.id", "lang email phone fullName");

    if (!order) throw new Error("Order not found");

    // Check if user is the owner or an admin
    const isOwner = order.ownerData.toString() === user._id.toString();
    const isAdmin = user.accountType === "admin";

    if (!isOwner && !isAdmin) throw new Error("Unauthorized");

    // Handle admin-only actions for rejecting orders
    if (action === "confirmRejection" || action === "restoreOrder") {
      const isAdmin = user.accountType === "admin";
      if (!isAdmin) throw new Error("Unauthorized - Admin only");
      if (action === "confirmRejection") {
        if (!order.milestoneId) {
          throw new Error(
            "milestoneId not found for this order. Cannot process refund.",
          );
        }
        await waffyContract.handelContract({
          milestoneId: order.milestoneId,
          action: "REJECT_CONTRACT",
        });
        order.rejectionApproved = true;
        await order.save();
        return NextResponse.json({ success: true });
      } else if (action === "restoreOrder") {
        order.status = "pending";
        order.rejectionApproved = false;
        await order.save();
        return NextResponse.json({ success: true });
      }
    }

    const newStatus = action === "confirm" ? "confirmed" : "rejecting";
    if (newStatus === "rejecting") {
      order.status = "rejecting";
      await order.save();
      return NextResponse.json({ success: true });
    }

    // Update all bookings
    await Promise.all(
      order.items.map((booking) =>
        Booking.findByIdAndUpdate(booking._id, { status: newStatus }),
      ),
    );

    // Update order status
    order.status = newStatus;
    await order.save();

    // Fetch user language preference
    const customer = await User.findById(order.userData.id).select("lang");
    const customerLang = customer?.lang || "ar";

    // Create language-specific notification
    const orderNotificationTitle =
      customerLang === "en"
        ? `Your order #${order._id} has been ${
            newStatus === "confirmed" ? "accepted" : "rejected"
          }`
        : `تم ${newStatus === "confirmed" ? "قبول" : "رفض"} طلبك رقم ${
            order._id
          }`;

    const payload = {
      title: orderNotificationTitle,
      data: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${customerLang}/dashboard/my-orders#${order._id}`,
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
      title: orderNotificationTitle,
      type: newStatus === "confirmed" ? "accepted" : "canceled",
      relatedId: order._id,
    });

    await sendNotifications({ id: order.userData.id, payload });

    // Send email notification
    await sendOrderNotificationEmail(
      order.userData.email,
      order.items.map((item) => ({
        name: customerLang === "en" ? item.product.nameEn : item.product.nameAr,
        startDate: new Date(item.startDate).toLocaleDateString("ar"),
      })),
      newStatus,
      order.totalAmount,
      customerLang,
    );

    // Send WhatsApp to Customer if confirmed
    if (newStatus === "confirmed" && order.userData.id.phone) {
      await sendWhatsAppTemplate({
        to: `+966${order.userData.id.phone.slice(1)}`,
        templateName: `customer_order_confirmed_${customerLang}`,
        languageCode: customerLang,
        bodyParameters: [{ name: "order_id", text: order._id }],
        buttonParameters: [order._id],
      }).catch((err) => console.error("WhatsApp Error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/orders/[id]",
      method: "PATCH",
      id,
      req,
    });
  }
}
