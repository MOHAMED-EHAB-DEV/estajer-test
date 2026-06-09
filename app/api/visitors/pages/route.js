import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PageVisit from "@/models/PageVisit";
import { handleApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";

/**
 * GET /api/visitors/pages
 *
 * Query params:
 *   startDate, endDate      – date range filter (YYYY-MM-DD)
 *   page         (string)   – filter by page path (partial match)
 *   productId    (ObjectId) – filter by product
 *   ownerId      (ObjectId) – filter by owner
 *   tab          – "pages" | "products" | "owners"  (default: "pages")
 *   limit        – number of results (default: 20)
 */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const pageFilter = searchParams.get("page") || "";
    const productIdFilter = searchParams.get("productId") || "";
    const ownerIdFilter = searchParams.get("ownerId") || "";
    const tab = searchParams.get("tab") || "pages";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    // Build date range
    const dateMatch = {};
    if (startDateParam) {
      const start = new Date(startDateParam);
      start.setUTCHours(0, 0, 0, 0);
      dateMatch.$gte = start;
    }
    if (endDateParam) {
      const end = new Date(endDateParam);
      end.setUTCHours(23, 59, 59, 999);
      dateMatch.$lte = end;
    }

    // Build base match
    const match = {};
    if (Object.keys(dateMatch).length) match.date = dateMatch;
    if (pageFilter) match.page = { $regex: pageFilter, $options: "i" };
    if (productIdFilter && mongoose.Types.ObjectId.isValid(productIdFilter))
      match.productId = new mongoose.Types.ObjectId(productIdFilter);
    if (ownerIdFilter && mongoose.Types.ObjectId.isValid(ownerIdFilter))
      match.ownerId = new mongoose.Types.ObjectId(ownerIdFilter);

    let results = [];

    if (tab === "pages") {
      // Top pages
      results = await PageVisit.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$page",
            totalVisits: { $sum: "$count" },
            productId: { $first: "$productId" },
            ownerId: { $first: "$ownerId" },
            lastVisit: { $max: "$date" },
          },
        },
        { $sort: { totalVisits: -1 } },
        { $limit: limit },
        // Optionally populate product name
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
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner",
            pipeline: [{ $project: { fullName: 1, email: 1, phone: 1 } }],
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      ]);
    } else if (tab === "products") {
      // Top products
      const productMatch = { ...match, productId: { $ne: null } };
      if (productIdFilter && mongoose.Types.ObjectId.isValid(productIdFilter))
        productMatch.productId = new mongoose.Types.ObjectId(productIdFilter);

      results = await PageVisit.aggregate([
        { $match: productMatch },
        {
          $group: {
            _id: "$productId",
            totalVisits: { $sum: "$count" },
            ownerId: { $first: "$ownerId" },
            page: { $first: "$page" },
            lastVisit: { $max: "$date" },
          },
        },
        { $sort: { totalVisits: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
            pipeline: [{ $project: { nameAr: 1, nameEn: 1 } }],
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner",
            pipeline: [{ $project: { fullName: 1, email: 1, phone: 1 } }],
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      ]);
    } else if (tab === "owners") {
      // Top owners (most visited product owners)
      const ownerMatch = { ...match, ownerId: { $ne: null } };
      if (ownerIdFilter && mongoose.Types.ObjectId.isValid(ownerIdFilter))
        ownerMatch.ownerId = new mongoose.Types.ObjectId(ownerIdFilter);

      results = await PageVisit.aggregate([
        { $match: ownerMatch },
        {
          $group: {
            _id: "$ownerId",
            totalVisits: { $sum: "$count" },
            productCount: { $addToSet: "$productId" },
            lastVisit: { $max: "$date" },
          },
        },
        {
          $addFields: { productCount: { $size: "$productCount" } },
        },
        { $sort: { totalVisits: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "owner",
            pipeline: [{ $project: { fullName: 1, email: 1, phone: 1 } }],
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      ]);
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/visitors/pages",
      method: "GET",
      req,
    });
  }
}
