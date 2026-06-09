import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ErrorLog from "@/models/ErrorLog";
import { authHeaders } from "@/middleware/authHeaders";
import { authenticateUser } from "@/middleware/auth";

// GET - Fetch error logs with grouping and filtering
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
    const viewMode = searchParams.get("viewMode") || "grouped"; // grouped | flat
    const endpoint = searchParams.get("endpoint");
    const method = searchParams.get("method");
    const statusCode = searchParams.get("statusCode");
    const resolved = searchParams.get("resolved");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;

    // Build match query
    const matchQuery = {};

    if (endpoint) matchQuery.endpoint = { $regex: endpoint, $options: "i" };
    if (method) matchQuery.method = method;
    if (statusCode) matchQuery.statusCode = parseInt(statusCode);
    if (resolved !== null && resolved !== undefined && resolved !== "") {
      matchQuery.resolved = resolved === "true";
    }
    if (search) {
      matchQuery.$or = [
        { message: { $regex: search, $options: "i" } },
        { endpoint: { $regex: search, $options: "i" } },
        { stack: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    if (viewMode === "grouped") {
      // Grouped view: by endpoint -> method -> similar errors
      const groupedData = await ErrorLog.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              endpoint: "$endpoint",
              method: "$method",
              message: "$message",
            },
            count: { $sum: 1 },
            lastOccurrence: { $first: "$createdAt" },
            firstOccurrence: { $last: "$createdAt" },
            statusCode: { $first: "$statusCode" },
            resolved: { $first: "$resolved" },
            stack: { $first: "$stack" },
            sampleId: { $first: "$_id" },
            userAgents: { $addToSet: "$userAgent" },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        {
          $addFields: {
            uniqueUsersCount: { $size: { $ifNull: ["$uniqueUsers", []] } },
          },
        },
        {
          $group: {
            _id: {
              endpoint: "$_id.endpoint",
              method: "$_id.method",
            },
            errors: {
              $push: {
                message: "$_id.message",
                count: "$count",
                lastOccurrence: "$lastOccurrence",
                firstOccurrence: "$firstOccurrence",
                statusCode: "$statusCode",
                resolved: "$resolved",
                stack: "$stack",
                sampleId: "$sampleId",
                uniqueUsersCount: "$uniqueUsersCount",
              },
            },
            totalErrors: { $sum: "$count" },
          },
        },
        {
          $group: {
            _id: "$_id.endpoint",
            methods: {
              $push: {
                method: "$_id.method",
                errors: "$errors",
                totalErrors: "$totalErrors",
              },
            },
            totalErrors: { $sum: "$totalErrors" },
          },
        },
        { $sort: { totalErrors: -1 } },
      ]);

      // Get overall stats
      const stats = await ErrorLog.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalErrors: { $sum: 1 },
            uniqueEndpoints: { $addToSet: "$endpoint" },
            uniqueMessages: { $addToSet: "$message" },
            resolvedCount: {
              $sum: { $cond: ["$resolved", 1, 0] },
            },
            unresolvedCount: {
              $sum: { $cond: ["$resolved", 0, 1] },
            },
          },
        },
        {
          $project: {
            totalErrors: 1,
            uniqueEndpoints: { $size: { $ifNull: ["$uniqueEndpoints", []] } },
            uniqueMessages: { $size: { $ifNull: ["$uniqueMessages", []] } },
            resolvedCount: 1,
            unresolvedCount: 1,
          },
        },
      ]);

      // Get status code distribution
      const statusDistribution = await ErrorLog.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$statusCode",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return NextResponse.json({
        success: true,
        viewMode: "grouped",
        data: groupedData,
        stats: stats[0] || {
          totalErrors: 0,
          uniqueEndpoints: 0,
          uniqueMessages: 0,
          resolvedCount: 0,
          unresolvedCount: 0,
        },
        statusDistribution,
      });
    } else {
      // Flat view: just errors with counts
      const flatData = await ErrorLog.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$message",
            count: { $sum: 1 },
            lastOccurrence: { $first: "$createdAt" },
            firstOccurrence: { $last: "$createdAt" },
            endpoints: { $addToSet: "$endpoint" },
            methods: { $addToSet: "$method" },
            statusCodes: { $addToSet: "$statusCode" },
            stack: { $first: "$stack" },
            sampleId: { $first: "$_id" },
            resolved: { $first: "$resolved" },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        {
          $project: {
            message: "$_id",
            count: 1,
            lastOccurrence: 1,
            firstOccurrence: 1,
            endpoints: 1,
            methods: 1,
            statusCodes: 1,
            stack: 1,
            sampleId: 1,
            resolved: 1,
            uniqueUsersCount: { $size: { $ifNull: ["$uniqueUsers", []] } },
          },
        },
        { $sort: { count: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);

      const totalCount = await ErrorLog.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$message" } },
        { $count: "total" },
      ]);

      return NextResponse.json({
        success: true,
        viewMode: "flat",
        data: flatData,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.total || 0,
          totalPages: Math.ceil((totalCount[0]?.total || 0) / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update error log (mark as resolved, add notes)
export async function PATCH(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { ids, resolved, notes, bulkAction, message, messages } =
      await req.json();

    if (bulkAction && (message || messages)) {
      // Bulk update all errors with the same message(s)
      const messageArray = messages || (message ? [message] : []);

      if (messageArray.length === 0) {
        return NextResponse.json(
          { success: false, error: "No messages provided" },
          { status: 400 }
        );
      }

      const result = await ErrorLog.updateMany(
        { message: { $in: messageArray } },
        { $set: { resolved, ...(notes && { notes }) } }
      );
      return NextResponse.json({
        success: true,
        message: `Updated ${result.modifiedCount} error logs`,
      });
    }

    if (ids && Array.isArray(ids)) {
      // Update multiple specific errors
      const result = await ErrorLog.updateMany(
        { _id: { $in: ids } },
        { $set: { resolved, ...(notes && { notes }) } }
      );
      return NextResponse.json({
        success: true,
        message: `Updated ${result.modifiedCount} error logs`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating error logs:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete old error logs
export async function DELETE(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { ids, deleteResolved, olderThan } = await req.json();

    if (ids && Array.isArray(ids)) {
      const result = await ErrorLog.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} error logs`,
      });
    }

    if (deleteResolved) {
      const result = await ErrorLog.deleteMany({ resolved: true });
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} resolved error logs`,
      });
    }

    if (olderThan) {
      const date = new Date(olderThan);
      const result = await ErrorLog.deleteMany({ createdAt: { $lt: date } });
      return NextResponse.json({
        success: true,
        message: `Deleted ${
          result.deletedCount
        } error logs older than ${date.toISOString()}`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting error logs:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
