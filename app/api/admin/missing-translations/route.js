import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MissingTranslation from "@/models/MissingTranslation";
import { authHeaders } from "@/middleware/authHeaders";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = req.headers.get("authorization")
      ? await authHeaders(req)
      : await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const resolved = searchParams.get("resolved");
    const source = searchParams.get("source");
    const lang = searchParams.get("lang");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 30;

    const query = {};

    if (resolved !== null && resolved !== undefined && resolved !== "") {
      query.resolved = resolved === "true";
    }
    if (source) {
      query.source = source;
    }
    if (lang) {
      query.lang = lang;
    }
    if (search) {
      query.$or = [
        { key: { $regex: search, $options: "i" } },
        { pageUrl: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      MissingTranslation.find(query)
        .sort({ count: -1, lastSeen: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MissingTranslation.countDocuments(query),
    ]);

    const stats = await MissingTranslation.aggregate([
      {
        $group: {
          _id: null,
          totalKeys: { $sum: 1 },
          totalOccurrences: { $sum: "$count" },
          unresolvedCount: {
            $sum: { $cond: ["$resolved", 0, 1] },
          },
          resolvedCount: {
            $sum: { $cond: ["$resolved", 1, 0] },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        totalKeys: 0,
        totalOccurrences: 0,
        unresolvedCount: 0,
        resolvedCount: 0,
      },
    });
  } catch (error) {
    console.error("[Admin API Error] missing-translations GET:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const user = req.headers.get("authorization")
      ? await authHeaders(req)
      : await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { ids, resolved } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: "Invalid 'ids' array" },
        { status: 400 }
      );
    }

    await MissingTranslation.updateMany(
      { _id: { $in: ids } },
      { $set: { resolved: Boolean(resolved) } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin API Error] missing-translations PATCH:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const user = req.headers.get("authorization")
      ? await authHeaders(req)
      : await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { ids, deleteResolved } = await req.json();

    if (deleteResolved) {
      await MissingTranslation.deleteMany({ resolved: true });
      return NextResponse.json({ success: true });
    }

    if (ids && Array.isArray(ids)) {
      await MissingTranslation.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Admin API Error] missing-translations DELETE:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
