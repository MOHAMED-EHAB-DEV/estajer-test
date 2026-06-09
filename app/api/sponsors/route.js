import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sponsor from "@/models/Sponsor";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch all sponsors
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const maxLimit = 100;
    const limit =
      (parseInt(searchParams.get("limit")) || 10) > maxLimit
        ? maxLimit
        : parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const fields = searchParams.get("fields");
    const excludeFields = searchParams.get("excludeFields");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const showAll = searchParams.get("showAll") === "true";
    const lang = searchParams.get("lang");
    const langSuffix = lang ? (lang === "en" ? "En" : "Ar") : "";

    // Build aggregation pipeline for complex queries
    let pipeline = [];
    let matchStage = {};
    let sort = {};
    let projection = {};

    // Build match stage
    if (category) matchStage.category = category;
    if (isActive !== null) matchStage.isActive = isActive === "true";

    // Add sponsorship end date filter for active sponsors
    if (isActive === "true") {
      matchStage.$or = [
        { sponsorshipEndDate: null },
        { sponsorshipEndDate: { $gte: new Date() } },
      ];
    }

    if (userId) {
      const user =
        userId.length === 24
          ? { _id: userId }
          : await User.findOne({ $or: [{ pathName: userId }] }, { _id: 1 });
      matchStage.user = user?._id;
    }

    // Handle status filtering
    if (status && !showAll) {
      if (status === "active") {
        matchStage.isActive = true;
        matchStage.$or = [
          { sponsorshipEndDate: null },
          { sponsorshipEndDate: { $gte: new Date() } },
        ];
      } else if (status === "inactive") {
        matchStage.isActive = false;
      } else if (status === "expired") {
        matchStage.sponsorshipEndDate = { $lt: new Date() };
      }
    }

    // Add lookup stage for user data
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });

    pipeline.push({ $unwind: "$user" });

    // Add match stage
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Handle search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.fullName": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "user.shopName": { $regex: search, $options: "i" } },
            { "user.shopDescription": { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Handle sorting
    if (sortBy === "createdAt") {
      sort = sortOrder === "asc" ? { createdAt: 1 } : { createdAt: -1 };
    } else if (sortBy === "priority") {
      sort = sortOrder === "asc" ? { priority: 1 } : { priority: -1 };
    } else if (sortBy === "category") {
      sort = sortOrder === "asc" ? { category: 1 } : { category: -1 };
    } else if (sortBy === "user.name") {
      sort =
        sortOrder === "asc" ? { "user.fullName": 1 } : { "user.fullName": -1 };
    } else {
      sort = { priority: -1, _id: -1 };
    }

    pipeline.push({ $sort: sort });

    // Handle field projection
    if (fields) {
      const fieldList = fields.split(",");
      fieldList.forEach((field) => (projection[field] = 1));
      projection._id = 1;
      pipeline.push({ $project: projection });
    } else if (excludeFields) {
      const excludeList = excludeFields.split(",");
      excludeList.forEach((field) => (projection[field] = 0));
      pipeline.push({ $project: projection });
    } else {
      // Default projection to include user fields
      pipeline.push({
        $project: {
          _id: 1,
          category: 1,
          isActive: 1,
          priority: 1,
          sponsorshipStartDate: 1,
          sponsorshipEndDate: 1,
          createdAt: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.fullName": 1,
          "user.email": 1,
          "user.avatar": 1,
          "user.shopName": 1,
          "user.shopDescription": 1,
          "user.rating": 1,
          "user.bioAr": 1,
          "user.bioEn": 1,
          "user.isOnline": 1,
          "user.lastSeen": 1,
          "user.pathName": 1,
          "user.premium": 1,
        },
      });
    }

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute aggregation
    const sponsors = await Sponsor.aggregate(pipeline);

    // Get product, request, and order counts for each sponsor
    const sponsorsWithCounts = await Promise.all(
      sponsors.map(async (sponsor) => {
        const [productsCount, ordersCount] = await Promise.all([
          Product.countDocuments({
            owner: sponsor.user._id,
            approved: true,
            hidden: false,
            deleted: { $ne: true },
          }),
          Order.countDocuments({
            ownerData: sponsor.user._id,
            status: { $nin: ["not-paid", "cancelled"] },
          }),
        ]);

        return {
          ...sponsor,
          productsCount,
          ordersCount,
        };
      })
    );

    // Calculate total count using aggregation pipeline for consistency
    let countPipeline = [];

    // Add lookup stage for user data
    countPipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });

    countPipeline.push({ $unwind: "$user" });

    // Add match stage for basic filters
    if (Object.keys(matchStage).length > 0) {
      countPipeline.push({ $match: matchStage });
    }

    // Add search functionality for count
    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { "user.fullName": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "user.shopName": { $regex: search, $options: "i" } },
            { "user.shopDescription": { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    countPipeline.push({ $count: "total" });

    const totalResult = await Sponsor.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Apply language transformation for bio fields
    if (lang && sponsorsWithCounts.length > 0) {
      sponsorsWithCounts.forEach((sponsor) => {
        if (sponsor.user && (sponsor.user.bioAr || sponsor.user.bioEn)) {
          sponsor.user.bio =
            sponsor.user[`bio${langSuffix}`] || sponsor.user.bio;
          delete sponsor.user.bioEn;
          delete sponsor.user.bioAr;
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: sponsorsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/sponsors",
      method: "GET",
      req: request,
    });
  }
}

// POST - Create new sponsor
export async function POST(request) {
  try {
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { userId, category, priority, sponsorshipEndDate } = body;

    // Validate required fields
    if (!userId || !category) {
      return NextResponse.json(
        { success: false, error: "User ID and category are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already a sponsor
    const existingSponsor = await Sponsor.findOne({ user: userId });
    if (existingSponsor) {
      return NextResponse.json(
        { success: false, error: "User is already a sponsor" },
        { status: 400 }
      );
    }

    // Create new sponsor
    const sponsor = new Sponsor({
      user: userId,
      category,
      priority: priority || 0,
      sponsorshipEndDate: sponsorshipEndDate || null,
    });

    await sponsor.save();
    await sponsor.populate(
      "user",
      "name email avatar shopName shopDescription"
    );

    return NextResponse.json({
      success: true,
      data: sponsor,
      message: "Sponsor created successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/sponsors",
      method: "POST",
      req: request,
    });
  }
}
