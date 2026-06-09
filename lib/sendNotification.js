import webpush from "web-push";
import admin from "firebase-admin"; // 1. Add this
import PushSubscription from "@/models/PushSubscription";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

webpush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

const sendNotifications = async ({ id, payload }) => {
  const subDoc = await PushSubscription.findOne({
    $or: [{ user: id }, { visitor: id }],
  });
  if (!subDoc || subDoc.subscription.length === 0) return;

  const results = await processSubscriptions(subDoc.subscription, payload);

  const failedEndpoints = results
    .filter((result) => result.status === "error")
    .map((result) => result.subscription.endpoint);

  if (failedEndpoints.length > 0) {
    subDoc.subscription = subDoc.subscription.filter(
      (sub) => !failedEndpoints.includes(sub.endpoint),
    );
    if (subDoc.subscription.length === 0) {
      await PushSubscription.deleteOne({ _id: subDoc._id });
    } else {
      await subDoc.save();
    }
  }
};

const processSubscriptions = async (subscriptions, payload) => {
  const notificationPromises = subscriptions.map(async (sub) => {
    try {
      // --- NEW LOGIC FOR APP USERS ---
      if (sub.endpoint.startsWith("android-fcm:")) {
        const token = sub.endpoint.replace("android-fcm:", "");

        const message = {
          token: token,
          notification: { title: payload.title, body: payload.body },
          data: { url: payload.data.url || "/" },
          android: { notification: { image: payload.icon, sound: "default" } },
        };

        await admin.messaging().send(message);
        return { status: "success", subscription: sub };
      }

      // --- EXISTING LOGIC FOR WEB USERS ---
      else {
        await webpush.sendNotification(sub, JSON.stringify(payload));
        return { status: "success", subscription: sub };
      }
    } catch (error) {
      // Clean up dead tokens (Expired app tokens or unsubscribed web users)
      if (
        error.statusCode === 410 ||
        error.statusCode === 404 ||
        error.code === "messaging/registration-token-not-registered" // FCM Error
      ) {
        return { status: "error", error, subscription: sub };
      }

      console.error("Notification delivery failed:", error);
      return { status: "success", subscription: sub }; // Don't delete on random errors
    }
  });
  return await Promise.all(notificationPromises);
};

const BATCH_SIZE = 50;

export const sendToAllUsers = async (payload, subscriptionIds = []) => {
  let query = {};
  if (subscriptionIds.length > 0) {
    query = { _id: { $in: subscriptionIds } };
  }

  const allSubs = await PushSubscription.find(query);
  console.log("allSubs: ", allSubs);

  for (let i = 0; i < allSubs.length; i += BATCH_SIZE) {
    const batch = allSubs.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (subDoc) => {
        try {
          const results = await processSubscriptions(
            subDoc.subscription.slice(-2),
            payload,
          );

          const failedEndpoints = results
            .filter((result) => result.status === "error")
            .map((result) => result.subscription.endpoint);

          if (failedEndpoints.length > 0) {
            subDoc.subscription = subDoc.subscription.filter(
              (sub) => !failedEndpoints.includes(sub.endpoint),
            );
            if (subDoc.subscription.length === 0) {
              await PushSubscription.deleteOne({ _id: subDoc._id });
            } else {
              await subDoc.save();
            }
          }
        } catch (err) {
          console.error(`Failed to process subscription ${subDoc._id}:`, err);
        }
      }),
    );

    await new Promise((r) => setTimeout(r, 100));
  }
};

export default sendNotifications;
