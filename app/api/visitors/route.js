import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import VisitorCount from "@/models/VisitorCount";
import PageVisit from "@/models/PageVisit";
import Product from "@/models/Product";
import User from "@/models/User";
import { rateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/errorHandler";

// GET endpoint to retrieve overall visitor count + chart data
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Get today's date with time set to midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find today's count
    const todayCountDoc = await VisitorCount.findOne({ date: today });
    const todayCount = todayCountDoc ? todayCountDoc.count : 0;

    // Get total count (sum of all days)
    const totalCountResult = await VisitorCount.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].total : 0;

    let chartData = [];

    // If date range is provided, fetch specific data
    if (startDateParam && endDateParam) {
      const start = new Date(startDateParam);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDateParam);
      end.setUTCHours(23, 59, 59, 999);

      chartData = await VisitorCount.find({
        date: { $gte: start, $lte: end },
      }).sort({ date: 1 });
    } else {
      // Default to last 30 days if no range provided
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

      chartData = await VisitorCount.find({
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: 1 });
    }

    return NextResponse.json({
      success: true,
      data: {
        today: todayCount,
        total: totalCount,
        chartData: chartData.map((item) => ({
          date: item.date,
          value: item.count,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/visitors",
      method: "GET",
      req,
    });
  }
}

// Rate limiter: one visit counted per IP per page per day
const postLimiter = rateLimit({
  interval: 24 * 60 * 60 * 1000, // 1 day
  uniqueTokenPerInterval: 5000,
  limit: 1,
});

// POST endpoint to increment visitor count (overall) + per-page count
export async function POST(req) {
  try {
    // Ignore development environment
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ success: true });
    }

    const body = await req.json().catch(() => ({}));
    const { page, productId, ownerId } = body;

    // --- Overall site visit (rate-limit by IP only, once per day) ---
    try {
      await postLimiter.check(req, null); // null = IP-only key
      await connectDB();

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      await VisitorCount.findOneAndUpdate(
        { date: today },
        { $inc: { count: 1 } },
        { upsert: true, new: true },
      );
    } catch (e) {
      // Rate limit hit for overall count – that's fine, still track the page
      if (e?.status !== 429) throw e;
      await connectDB();
    }

    // --- Per-page visit (rate-limit by IP + page, once per day) ---
    if (page) {
      try {
        if (page.includes("/admin") || page.includes("/dashboard"))
          return NextResponse.json({ success: true });
        await postLimiter.check(req, page); // IP + page key
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Cast productId string → ObjectId (it arrives as a hex string from the URL)
        const resolvedProductId =
          productId && mongoose.Types.ObjectId.isValid(productId)
            ? new mongoose.Types.ObjectId(productId)
            : null;

        // Resolve ownerId server-side when we have a productId
        let resolvedOwnerId = null;
        if (resolvedProductId) {
          try {
            const product = await Product.findById(resolvedProductId)
              .select("owner")
              .lean();
            if (product?.owner) resolvedOwnerId = product.owner;
          } catch (_) {}
        }

        // If no product ID, check if it's a profile page visit
        if (!resolvedOwnerId && page) {
          const profileMatch = page.match(
            /(?:\/(?:ar|en))?\/profile\/([^\/]+)/,
          );
          if (profileMatch) {
            const profileIdOrPath = profileMatch[1];
            try {
              const userMatch = await User.findOne(
                { pathName: profileIdOrPath },
                { _id: 1 },
              ).lean();
              if (userMatch) resolvedOwnerId = userMatch._id;
            } catch (_) {}
          }
        }

        const updateParams = { $inc: { count: 1 } };
        const setParams = {};
        if (resolvedProductId) setParams.productId = resolvedProductId;
        if (resolvedOwnerId) setParams.ownerId = resolvedOwnerId;
        if (Object.keys(setParams).length > 0) updateParams.$set = setParams;

        await PageVisit.findOneAndUpdate({ page, date: today }, updateParams, {
          upsert: true,
          new: true,
        });
      } catch (e) {
        if (e?.status !== 429) throw e;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 200 },
    );
  }
}
