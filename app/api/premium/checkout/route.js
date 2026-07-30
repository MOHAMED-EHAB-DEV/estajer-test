import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import PremiumOrder from "@/models/PremiumOrder";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import waffyAuth from "@/lib/waffy-auth";
import waffyContract from "@/lib/waffy-contract";
import waffyPayment from "@/lib/waffy-payment";
import Coupon from "@/models/Coupon";
import { activatePremiumSubscription } from "@/lib/premium";
import { calculatePlanPrice } from "@/lib/pricingPlans";

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "growth" ? "growth" : "starter";
    const couponCode = body.couponCode;

    // Guard: check if active subscription has expired
    const isExpired =
      user.shopPlanExpiresAt && new Date(user.shopPlanExpiresAt) < new Date();

    if (!isExpired) {
      const isEffectiveGrowth =
        user.shopPlan === "growth" ||
        (user.premium && !user.shopPlan && user.hasShop);
      if (isEffectiveGrowth) {
        return NextResponse.json({ error: "already_growth" }, { status: 400 });
      }
      if (user.shopPlan === "starter" && plan === "starter") {
        return NextResponse.json({ error: "already_starter" }, { status: 400 });
      }
    }

    const isUpgrade = user.shopPlan === "starter" && plan === "growth";
    const calculated = calculatePlanPrice({ planId: plan, user, isUpgrade });
    const pricing = {
      base: calculated.priceBase,
      tax: calculated.priceTax,
      total: calculated.priceTotal,
      titleAr: isUpgrade
        ? "ترقية إلى باقة النمو - استأجر"
        : plan === "growth"
          ? "اشتراك باقة النمو - استأجر"
          : "اشتراك باقة Starter - استأجر",
      descAr: isUpgrade
        ? "ترقية من باقة Starter إلى باقة النمو على منصة استأجر"
        : plan === "growth"
          ? "اشتراك سنوي في باقة النمو على منصة استأجر"
          : "اشتراك سنوي في باقة Starter على منصة استأجر",
    };

    let appliedCoupon = null;
    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCode = couponCode.toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: cleanCode });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: "invalid_coupon" }, { status: 400 });
      }

      // Check expiration
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ error: "expired_coupon" }, { status: 400 });
      }

      // Check usage limit
      if (
        coupon.usageLimit !== null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        return NextResponse.json(
          { error: "usage_limit_exceeded" },
          { status: 400 },
        );
      }

      appliedCoupon = coupon;
    }

    if (appliedCoupon) {
      const discountPercent = appliedCoupon.discountPercent;
      if (discountPercent === 100) {
        const cleanCode = appliedCoupon.code;
        const milestoneId =
          "free_" +
          cleanCode +
          "_" +
          Math.random().toString(36).substring(2, 10);

        // 1. Create paid PremiumOrder
        const order = await PremiumOrder.create({
          userId: user._id,
          milestoneId,
          contractId: "free",
          paymentUrl: "",
          amount: 0,
          plan,
          orderType: isUpgrade ? "upgrade" : "new",
          status: "paid",
          waffyStatus: "PAID",
          couponCode: cleanCode,
          discountPercent: 100,
          trialMonths: appliedCoupon.trialMonths,
        });

        // 2. Increment coupon usage
        appliedCoupon.usageCount += 1;
        await appliedCoupon.save();

        // 3. Activate plan immediately
        await activatePremiumSubscription(
          user._id,
          plan,
          order.orderType,
          appliedCoupon.trialMonths,
        );

        return NextResponse.json({
          success: true,
          activated: true,
          milestoneId,
          plan,
        });
      } else {
        // Apply partial discount
        const discountMultiplier = (100 - discountPercent) / 100;
        pricing.base = Math.round(pricing.base * discountMultiplier);
        pricing.tax = Math.round(pricing.base * 0.15);
        pricing.total = pricing.base + pricing.tax;
      }
    }

    // Step 1: Create contract
    const contractResult = await waffyContract.createContract({
      title: pricing.titleAr,
      description: pricing.descAr,
      images: [],
    });
    if (!contractResult.success)
      throw new Error(`Contract creation failed: ${contractResult.error}`);

    const contractId = contractResult.contractId;

    // Step 2: Create milestone
    const milestonesResult = await waffyContract.createMilestones(contractId, [
      {
        title: pricing.titleAr,
        description: pricing.descAr,
        amount: pricing.total,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    if (!milestonesResult.success)
      throw new Error(`Milestone creation failed: ${milestonesResult.error}`);

    const milestoneId = milestonesResult.milestones[0].id;

    // Step 3: Ensure user has waffyId
    let clientUserToken = user.clientUserToken;
    if (user.phone && user.fullName) {
      clientUserToken = await waffyPayment.ensureUserSignup(
        user._id.toString(),
        user.phone,
        user.fullName,
      );
    }

    // Step 4: Add parties
    const partiesData = {};
    partiesData[milestoneId] = [
      {
        phoneNumber: `+966${user.phone.slice(1)}`,
        role: "CUSTOMER",
        amount: pricing.total,
      },
      {
        phoneNumber: process.env.WAFFY_PROVIDER_PHONE,
        role: "BROKER",
        amount: pricing.total,
        isSender: true,
        arbitrator: true,
      },
    ];

    const partiesResult = await waffyContract.addParties(
      contractId,
      partiesData,
    );
    if (!partiesResult.success)
      throw new Error(`Adding parties failed: ${partiesResult.error}`);

    // Step 5: Generate payment URL
    await new Promise((resolve) => setTimeout(resolve, 200));

    const referer = req.headers.get("referer");
    const refererUrl = referer ? new URL(referer) : null;
    const origin = refererUrl
      ? `${refererUrl.protocol}//${refererUrl.host}`
      : process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";

    const lang = user.lang || "ar";
    const redirectUrl = `${origin}${
      lang === "en" ? "/en" : ""
    }/premium-completed/${milestoneId}`;

    const userToken = await waffyAuth.getUserToken();
    const paymentUrlResponse = await fetch(
      `${process.env.WAFFY_API_URL}/api/external/contracts/startPayment/${milestoneId}/${
        process.env.WAFFY_CLIENT_ID
      }?redirectUrl=${encodeURIComponent(redirectUrl)}&paymentType=PURCHASE`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: "application/json",
        },
      },
    );
    if (!paymentUrlResponse.ok) {
      const err = await paymentUrlResponse.text();
      throw new Error(
        `Payment URL failed: ${paymentUrlResponse.status} ${err}`,
      );
    }
    const paymentUrlData = await paymentUrlResponse.json();
    const paymentUrl = paymentUrlData.data;

    // Step 6: Get customer token
    const customerToken = await waffyAuth.getCustomerToken({
      clientUserToken,
      phone: user.phone,
    });

    // Step 7: Store premium order
    await PremiumOrder.create({
      userId: user._id,
      milestoneId,
      contractId,
      paymentUrl,
      amount: pricing.total,
      plan,
      orderType: isUpgrade ? "upgrade" : "new",
      waffyStatus: "PAYMENT_PROCESSING",
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      discountPercent: appliedCoupon
        ? appliedCoupon.discountPercent
        : undefined,
      trialMonths: appliedCoupon ? appliedCoupon.trialMonths : undefined,
    });

    return NextResponse.json({
      success: true,
      paymentUrl,
      customerToken,
      milestoneId,
      plan,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/premium/checkout",
      method: "POST",
      req,
    });
  }
}
