import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PageVisit from "@/models/PageVisit";
import { authHeaders } from "@/middleware/authHeaders";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    // Get client parameter to determine authentication method
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");

    // Use appropriate authentication method
    const user = client ? await authenticateUser() : await authHeaders(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let match = { ownerId: user._id };

    if (startDateParam && endDateParam) {
      const start = new Date(startDateParam);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDateParam);
      end.setUTCHours(23, 59, 59, 999);
      match.date = { $gte: start, $lte: end };
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setUTCHours(0, 0, 0, 0);
      match.date = { $gte: thirtyDaysAgo };
    }

    // 1. Get total hits for owner
    const totalResult = await PageVisit.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);
    const total = totalResult[0]?.total || 0;

    // 2. Get today hits
    const todayStr = new Date();
    todayStr.setUTCHours(0, 0, 0, 0);
    const todayMatch = { ...match, date: todayStr };
    const todayResult = await PageVisit.aggregate([
      { $match: todayMatch },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);
    const today = todayResult[0]?.total || 0;

    // 3. Group by date for chart data
    const chartResult = await PageVisit.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$date",
          value: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map to expected format
    let chartData = chartResult.map((item) => ({
      date: item._id,
      value: item.value,
    }));

    // Fill in dates with zero to ensure continuous line chart
    if (chartData.length > 0) {
      const startDate = new Date(match.date.$gte || chartData[0].date);
      const endDate = match.date.$lte
        ? new Date(match.date.$lte)
        : new Date(chartData[chartData.length - 1].date);

      const filledData = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const found = chartData.find(
          (d) => new Date(d.date).getTime() === currentDate.getTime(),
        );
        filledData.push({
          date: new Date(currentDate),
          value: found ? found.value : 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      chartData = filledData;
    }

    // 4. Get the detailed breakdown of visited products/pages for this owner
    const topPages = await PageVisit.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$page",
          totalVisits: { $sum: "$count" },
          productId: { $first: "$productId" },
          lastVisit: { $max: "$date" },
        },
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
          pipeline: [{ $project: { nameAr: 1, nameEn: 1 } }],
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    ]);

    return NextResponse.json({
      success: true,
      data: { total, today, chartData, topPages },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/dashboard/visits",
      method: "GET",
      req,
    });
  }
}
