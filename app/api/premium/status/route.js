import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PremiumOrder from "@/models/PremiumOrder";
import User from "@/models/User";
import Shop from "@/models/Shop";
import Coupon from "@/models/Coupon";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";
import waffyContract from "@/lib/waffy-contract";
import { activatePremiumSubscription } from "@/lib/premium";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    const { searchParams } = new URL(req.url);
    const milestoneId = searchParams.get("id");

    if (!milestoneId) {
      return NextResponse.json(
        { success: false, error: "Milestone ID required" },
        { status: 400 },
      );
    }

    const premiumOrder = await PremiumOrder.findOne({
      milestoneId,
      userId: user._id,
    });

    if (!premiumOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    // Already activated
    if (premiumOrder.status === "paid") {
      return NextResponse.json({
        success: true,
        status: "paid",
        plan: premiumOrder.plan,
      });
    }

    // Check Waffy milestone status
    const milestonesData = await waffyContract.getContractMilestones(
      premiumOrder.contractId,
    );
    const waffyStatus = milestonesData?.data?.content?.[0]?.status;

    if (waffyStatus && premiumOrder.waffyStatus !== waffyStatus) {
      premiumOrder.waffyStatus = waffyStatus;
      await premiumOrder.save();
    }

    if (waffyStatus === "PAYMENT_PROCESSING") {
      return NextResponse.json({
        success: true,
        status: "processing",
        paymentUrl: premiumOrder.paymentUrl,
      });
    }

    if (waffyStatus === "PAID") {
      const plan = premiumOrder.plan; // "starter" | "growth"

      // Activate using shared helper
      await activatePremiumSubscription(user._id, plan, premiumOrder.orderType, premiumOrder.trialMonths);

      // Increment coupon usage count if coupon was used
      if (premiumOrder.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: premiumOrder.couponCode.toUpperCase().trim() },
          { $inc: { usageCount: 1 } }
        ).catch((err) => console.error("Error updating coupon usage:", err));
      }

      premiumOrder.status = "paid";
      await premiumOrder.save();

      return NextResponse.json({
        success: true,
        status: "paid",
        plan,
      });
    }

    // not-paid or unknown
    return NextResponse.json({
      success: true,
      status: "not-paid",
      paymentUrl: premiumOrder.paymentUrl,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/premium/status",
      method: "GET",
      req,
    });
  }
}
