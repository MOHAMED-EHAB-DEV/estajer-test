import connectDB from "@/lib/db";
import { authenticateUser } from "@/middleware/auth";
import SearchQuery from "@/models/SearchQuery";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const sortBy = searchParams.get("sortBy") || "count"; // count, recent, term
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const source = searchParams.get("source") || "";
    const language = searchParams.get("language") || "";
    const hasResults = searchParams.get("hasResults"); // "true" | "false" | ""
    const period = searchParams.get("period") || "all"; // today, week, month, all
    const skip = (page - 1) * limit;
    // Build match query
    const matchQuery = {};

    if (search) {
      matchQuery.term = { $regex: search, $options: "i" };
    }
    if (source) {
      // Filter: only terms that have at least 1 search from this source
      matchQuery[`sources.${source}`] = { $gt: 0 };
    }
    if (language) {
      matchQuery.language = language;
    }
    if (hasResults === "true") {
      matchQuery.hasResults = true;
    } else if (hasResults === "false") {
      matchQuery.hasResults = false;
    }

    // Time period filter
    if (period !== "all") {
      const now = new Date();
      let startDate;

      if (period === "today") {
        startDate = new Date(now);
        startDate.setUTCHours(0, 0, 0, 0);
      } else if (period === "week") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "month") {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
      }

      if (startDate) {
        matchQuery.lastSearchedAt = { $gte: startDate };
      }
    }

    // Build sort
    const sortMap = {
      count: { count: order === "desc" ? -1 : 1 },
      recent: { lastSearchedAt: order === "desc" ? -1 : 1 },
      term: { term: order === "desc" ? -1 : 1 },
    };
    const sort = sortMap[sortBy] || sortMap.count;

    // Simple find — no aggregation needed (one doc per term+language)
    const [raw, total, stats] = await Promise.all([
      SearchQuery.find(matchQuery).sort(sort).skip(skip).limit(limit).lean(),
      SearchQuery.countDocuments(matchQuery),
      getSearchStats(period),
    ]);

    // Transform sources object { hero: 3, filters: 1 } → array for the UI
    const searches = raw.map((doc) => ({
      ...doc,
      sources: Object.entries(doc.sources || {})
        .filter(([, c]) => c > 0)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
    }));

    return NextResponse.json({
      success: true,
      data: searches,
      stats,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/search-analytics",
      method: "GET",
      req,
    });
  }
}

async function getSearchStats(period) {
  const now = new Date();
  let periodFilter = {};

  if (period === "today") {
    const startDate = new Date(now);
    startDate.setUTCHours(0, 0, 0, 0);
    periodFilter = { lastSearchedAt: { $gte: startDate } };
  } else if (period === "week") {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
    periodFilter = { lastSearchedAt: { $gte: startDate } };
  } else if (period === "month") {
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 1);
    periodFilter = { lastSearchedAt: { $gte: startDate } };
  }

  const [
    totalSearches,
    uniqueTerms,
    noResultsCount,
    topSearches,
    sourceBreakdown,
    languageBreakdown,
    trendData,
  ] = await Promise.all([
    // Total search count
    SearchQuery.aggregate([
      { $match: periodFilter },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]),
    // Unique terms (now = countDocuments since 1 doc per term+language)
    SearchQuery.countDocuments(periodFilter),
    // No results — terms where hasResults is false
    SearchQuery.countDocuments({ ...periodFilter, hasResults: false }),
    // Top 10 searches
    SearchQuery.aggregate([
      { $match: periodFilter },
      {
        $group: {
          _id: "$term",
          totalCount: { $sum: "$count" },
          originalTerm: { $first: "$originalTerm" },
          lastSearchedAt: { $max: "$lastSearchedAt" },
          hasResults: { $max: "$hasResults" },
        },
      },
      { $sort: { totalCount: -1 } },
      { $limit: 10 },
    ]),
    // Source breakdown — sum sources sub-document fields across all docs
    SearchQuery.aggregate([
      { $match: periodFilter },
      {
        $group: {
          _id: null,
          hero: { $sum: "$sources.hero" },
          header: { $sum: "$sources.header" },
          filters: { $sum: "$sources.filters" },
          unknown: { $sum: "$sources.unknown" },
        },
      },
      {
        $project: {
          _id: 0,
          result: [
            { _id: "hero",    count: "$hero" },
            { _id: "header",  count: "$header" },
            { _id: "filters", count: "$filters" },
            { _id: "unknown", count: "$unknown" },
          ],
        },
      },
    ]).then((r) => (r[0]?.result || []).filter((s) => s.count > 0)),
    // Language breakdown
    SearchQuery.aggregate([
      { $match: periodFilter },
      {
        $group: {
          _id: "$language",
          count: { $sum: "$count" },
        },
      },
    ]),
    // Trend data (last 30 days)
    SearchQuery.aggregate([
      { $unwind: "$dailySearches" },
      {
        $match: {
          "dailySearches.date": {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: "$dailySearches.date",
          count: { $sum: "$dailySearches.count" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    totalSearches: totalSearches[0]?.total || 0,
    uniqueTerms,
    noResultsCount,
    topSearches,
    sourceBreakdown,
    languageBreakdown,
    trendData,
  };
}

// DELETE: removes all source records for a given term+language
export async function DELETE(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");
    const language = searchParams.get("language");

    if (term && language) {
      // Delete all source records for this term+language combination
      const result = await SearchQuery.deleteMany({ term, language });
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} record(s) for "${term}"`,
      });
    }

    // Fallback: clear all data older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const result = await SearchQuery.deleteMany({
      lastSearchedAt: { $lt: cutoffDate },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} old search records`,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/search-analytics",
      method: "DELETE",
      req,
    });
  }
}
