import { CronJob } from "cron";
import connectDB from "../db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import User from "@/models/User";
import {
  sendDeliveryConfirmationEmail,
  sendReturnReminderEmail,
} from "../emails/delivery";
import { sendRatingRequestEmail } from "../emails/rating-request";
import Booking from "@/models/Booking";
import sendNotifications from "@/lib/sendNotification";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

let activeJobs = [];

// Job 1: Handle delivery notifications for confirmed orders
// Generate a random 4-digit code
function generateDeliveryCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const startDeliveryNotificationsJob = () => {
  const deliveryJob = new CronJob(
    "0 5 * * *",
    async () => {
      try {
        await connectDB();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("Delivery notifications job - today: ", today);

        const orders = await Order.find({
          // deliveryNotificationSent: false,
          status: "confirmed",
          startDate: { $lte: today }, // Rental has started
          endDate: { $gte: today }, // Rental hasn't ended yet
        })
          .populate({
            path: "items",
            populate: {
              path: "product",
              select: "nameAr nameEn images",
            },
          })
          .populate("ownerData", "email lang phone");

        for (const order of orders) {
          // Generate delivery code if not already set
          if (!order.deliveryCode) {
            order.deliveryCode = generateDeliveryCode();
            await order.save();
          }

          const deliveryCode = order.deliveryCode;

          // Fetch user language preferences
          const renterUser = await User.findById(order.userData.id).select(
            "lang phone",
          );
          const renterLang = renterUser?.lang || "ar";
          const ownerLang = order.ownerData?.lang || "ar";

          const renterDocLink = `${process.env.NEXT_PUBLIC_APP_URL}/${
            renterLang === "ar" ? "" : "en/"
          }documentation/${order._id}`;

          const ownerDocLink = `${process.env.NEXT_PUBLIC_APP_URL}/${
            ownerLang === "ar" ? "" : "en/"
          }documentation/${order._id}`;

          // Create language-specific notifications
          const renterNotificationTitle =
            renterLang === "en"
              ? `Your delivery code is ${deliveryCode}. Please give it to the owner and upload photos.`
              : `رمز التسليم الخاص بك هو ${deliveryCode}. يرجى تزويد المؤجر به ورفع الصور.`;

          const ownerNotificationTitle =
            ownerLang === "en"
              ? "Ask the renter for the delivery code and verify the handover to ensure your payment."
              : "اطلب رمز التسليم من المستأجر ووثّق التسليم لضمان استلام مستحقاتك.";

          const renterPayload = {
            title:
              renterLang === "en"
                ? "Delivery Code & Documentation"
                : "رمز التسليم والتوثيق",
            body: renterNotificationTitle,
            data: {
              url: renterDocLink,
            },
            actions: [
              {
                action: "open",
                title: renterLang === "en" ? "Upload Photos" : "رفع الصور",
              },
              {
                action: "dismiss",
                title: renterLang === "en" ? "Dismiss" : "إلغاء",
              },
            ],
          };

          const ownerPayload = {
            title:
              ownerLang === "en"
                ? "Verify Order Handover"
                : "توثيق تسليم الطلب",
            body: ownerNotificationTitle,
            data: {
              url: ownerDocLink,
            },
            actions: [
              {
                action: "open",
                title: ownerLang === "en" ? "Verify Handover" : "توثيق التسليم",
              },
              {
                action: "dismiss",
                title: ownerLang === "en" ? "Dismiss" : "إلغاء",
              },
            ],
          };

          await Promise.all([
            // Send notification and email to user and owner
            Notification.create({
              user: order.userData.id,
              title: renterNotificationTitle,
              type: "order",
              relatedId: order._id,
            }),
            !order.deliveryNotificationSent &&
              Notification.create({
                user: order.ownerData._id,
                title: ownerNotificationTitle,
                type: "order",
                relatedId: order._id,
              }),
            sendDeliveryConfirmationEmail({
              email: order.userData.email,
              items: order.items.map((item) => ({
                name:
                  renterLang === "en"
                    ? item.product.nameEn
                    : item.product.nameAr,
              })),
              orderId: order._id,
              userLang: renterLang,
            }),
            !order.deliveryNotificationSent &&
              sendDeliveryConfirmationEmail({
                email: order.ownerData.email,
                items: order.items.map((item) => ({
                  name:
                    ownerLang === "en"
                      ? item.product.nameEn
                      : item.product.nameAr,
                })),
                isOwner: true,
                orderId: order._id,
                userLang: ownerLang,
              }),
            sendNotifications({
              id: order.userData.id,
              payload: renterPayload,
            }),
            !order.deliveryNotificationSent &&
              sendNotifications({
                id: order.ownerData._id,
                payload: ownerPayload,
              }),

            // Send WhatsApp Messages
            !order.deliveryNotificationSent &&
              sendWhatsAppTemplate({
                to: `+966${renterUser.phone.slice(1)}`,
                templateName: `renter_delivery_code_${renterLang}`,
                languageCode: renterLang,
                headerParameters: [deliveryCode],
                buttonParameters: [order._id],
              }),

            !order.deliveryNotificationSent &&
              sendWhatsAppTemplate({
                to: `+966${order.ownerData.phone.slice(1)}`,
                templateName: `owner_delivery_verification_${ownerLang}`,
                languageCode: ownerLang,
                bodyParameters: [{ name: "order_id", text: order._id }],
                buttonParameters: [order._id],
              }),
            // Mark notifications as sent & save delivery code
            Order.findByIdAndUpdate(order._id, {
              deliveryNotificationSent: true,
            }),
          ]);
          await new Promise((r) => setTimeout(r, 1000));
        }
        console.log(`Processed ${orders.length} delivery notifications`);
      } catch (error) {
        console.error("Delivery notification cron job error:", error);
      }
    },
    null,
    true,
    "Asia/Riyadh",
  );

  return deliveryJob;
};

// Job 2: Handle order completion for received orders
const startOrderCompletionJob = () => {
  const completionJob = new CronJob(
    "0 6 * * *",
    async () => {
      try {
        await connectDB();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("Order completion job - today: ", today);

        const ordersToComplete = await Order.find({
          status: "received",
          endDate: { $lt: today },
        }).populate({
          path: "items",
          populate: {
            path: "product",
            select: "nameAr nameEn images _id",
          },
        });

        // Update completed orders and send rating emails
        for (const order of ordersToComplete) {
          await Order.findByIdAndUpdate(order._id, { status: "completed" });
          await Promise.all(
            order.items.map((booking) =>
              Booking.findByIdAndUpdate(booking._id, { status: "completed" }),
            ),
          );

          // Send rating request email to customer
          try {
            // Get customer language preference
            const customer = await User.findById(order.userData.id).select(
              "lang",
            );
            const customerLang = customer?.lang || "ar";

            // Prepare items data for email
            const emailItems = order.items.map((item) => ({
              name:
                customerLang === "en"
                  ? item.product.nameEn
                  : item.product.nameAr,
              productId: item.product._id,
              image: item.product.images?.[0]?.preview || null,
              rentalPeriod: `${new Date(order.startDate).toLocaleDateString(
                "ar",
              )} - ${new Date(order.endDate).toLocaleDateString("ar")}`,
            }));

            await sendRatingRequestEmail({
              email: order.userData.email,
              customerName: order.userData.name,
              items: emailItems,
              orderId: order._id,
              userLang: customerLang,
            });

            console.log(`Rating request email sent for order ${order._id}`);
          } catch (emailError) {
            console.error(
              `Failed to send rating email for order ${order._id}:`,
              emailError,
            );
          }

          console.log(`Order ${order._id} marked as completed`);
        }
        console.log(`Completed ${ordersToComplete.length} orders`);
      } catch (error) {
        console.error("Order completion cron job error:", error);
      }
    },
    null,
    true,
    "Asia/Riyadh",
  );

  return completionJob;
};

// Job 3: Handle return notifications for orders ending today
const startReturnNotificationsJob = () => {
  const returnJob = new CronJob(
    "0 7 * * *",
    async () => {
      try {
        await connectDB();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("Return notifications job - today: ", today);

        const orders = await Order.find({
          status: { $in: ["confirmed", "received"] },
          endDate: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          startDate: { $lt: today },
          returnNotificationSent: false,
        })
          .populate({
            path: "items",
            populate: {
              path: "product",
              select: "nameAr nameEn images",
            },
          })
          .populate("ownerData", "email lang");

        for (const order of orders) {
          // Fetch user language preferences
          const renterUser = await User.findById(order.userData.id).select(
            "lang",
          );
          const renterLang = renterUser?.lang || "ar";
          const ownerLang = order.ownerData?.lang || "ar";

          await Promise.all([
            sendReturnReminderEmail({
              email: order.userData.email,
              items: order.items.map((item) => ({
                name:
                  renterLang === "en"
                    ? item.product.nameEn
                    : item.product.nameAr,
              })),
              orderId: order._id,
              userLang: renterLang,
            }),
            sendReturnReminderEmail({
              email: order.ownerData.email,
              items: order.items.map((item) => ({
                name:
                  ownerLang === "en"
                    ? item.product.nameEn
                    : item.product.nameAr,
              })),
              isOwner: true,
              userLang: ownerLang,
            }),
            // Mark notifications as sent
            Order.findByIdAndUpdate(order._id, {
              returnNotificationSent: true,
            }),
          ]);
          await new Promise((r) => setTimeout(r, 1000));
        }
        console.log(`Processed ${orders.length} return notifications`);
      } catch (error) {
        console.error("Return notification cron job error:", error);
      }
    },
    null,
    true,
    "Asia/Riyadh",
  );

  return returnJob;
};

export const startDeliveryNotifications = () => {
  if (activeJobs.length > 0) {
    console.log("Stopping existing cron jobs");
    activeJobs.forEach((job) => job.stop());
    activeJobs = [];
  }

  // Start both jobs
  const deliveryJob = startDeliveryNotificationsJob();
  const completionJob = startOrderCompletionJob();
  const returnJob = startReturnNotificationsJob();

  deliveryJob.start();
  completionJob.start();
  returnJob.start();

  activeJobs.push(deliveryJob, completionJob, returnJob);
  console.log(
    "Started delivery notifications job (5 AM), order completion job (6 AM), and return notifications job (7 AM)",
  );
};
