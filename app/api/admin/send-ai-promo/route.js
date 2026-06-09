import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { sendAiAssistFeatureEmail } from "@/lib/email";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const adminUser = await authenticateUser();

    if (adminUser.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const testEmail = "alaaelbana58@gmail.com";

    if (testEmail) {
      // Send a single test email
      const targetUser = await User.findOne({ email: testEmail });
      console.log("targetUser: ", targetUser);
      await sendAiAssistFeatureEmail({
        email: testEmail,
        name: targetUser ? targetUser.name || "" : "User",
        lang: targetUser?.lang || "ar",
      });

      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
      });
    }

    if (allUsers) {
      // Find all active, unsubscribed=false users
      const users = await User.find({
        email: { $exists: true, $ne: "" },
        unsubscribed: { $ne: true },
      });

      // Send emails in background
      // sendEmailsInBatches(users);

      return NextResponse.json({
        success: true,
        message: `Started sending emails to ${users.length} users in the background.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Missing testEmail or allUsers parameter" },
      { status: 400 },
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/send-ai-promo",
      method: "POST",
      req,
    });
  }
}

async function sendEmailsInBatches(users) {
  const batchSize = 10;
  const batchDelayMs = 5000; // 5 seconds delay between batches
  const emailDelayMs = 500;  // 0.5 seconds delay between each email

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    for (let j = 0; j < batch.length; j++) {
      const user = batch[j];
      try {
        await sendAiAssistFeatureEmail({
          email: user.email,
          name: user.name || "",
          lang: user.lang || "ar",
        });
      } catch (err) {
        console.error(`Failed to send promo email to ${user.email}:`, err);
      }

      // Wait 0.5s after each email within the batch, except the very last one
      if (j < batch.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, emailDelayMs));
      }
    }

    // Wait 5s between batches
    if (i + batchSize < users.length) {
      await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
    }
  }
}
