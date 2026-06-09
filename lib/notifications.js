import Visitor from "@/models/Visitor";
import PushSubscription from "@/models/PushSubscription";

export async function syncVisitorNotifications(user, req) {
  try {
    const headers = req.headers;
    const forwarded =
      headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
    const ip = forwarded
      ? forwarded.split(",")[0].trim().replace("::ffff:", "")
      : undefined;

    const visitor = await Visitor.findOne({ ip });

    if (!visitor) return;

    // Find subscription associated with this visitor ID
    const visitorSubscription = await PushSubscription.findOne({
      visitor: visitor._id,
    });

    if (
      visitorSubscription &&
      visitorSubscription.subscription &&
      visitorSubscription.subscription.length > 0
    ) {
      let userSubscription = await PushSubscription.findOne({ user: user._id });

      if (!userSubscription) {
        // Transfer the entire subscription document to the user
        userSubscription = new PushSubscription({
          user: user._id,
          subscription: visitorSubscription.subscription,
        });
        await userSubscription.save();
      } else {
        // Merge subscriptions avoiding duplicates
        const existingEndpoints = userSubscription.subscription.map(
          (sub) => sub.endpoint,
        );
        const newSubscriptions = visitorSubscription.subscription.filter(
          (sub) => !existingEndpoints.includes(sub.endpoint),
        );

        if (newSubscriptions.length > 0) {
          userSubscription.subscription.push(...newSubscriptions);
          await userSubscription.save();
        }
      }

      // Remove the visitor subscription record as it's now synced to the user
      await PushSubscription.deleteOne({ _id: visitorSubscription._id });
    }
  } catch (error) {
    console.error("Failed to sync visitor notifications:", error);
  }
}
