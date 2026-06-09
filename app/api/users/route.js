import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { authHeaders } from "@/middleware/authHeaders";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const accountType = searchParams.get("accountType") || "";
    const isVerified = searchParams.get("isVerified");
    const isBanned = searchParams.get("isBanned");
    const isRenter = searchParams.get("isRenter");
    const hasApprovedProduct = searchParams.get("hasApprovedProduct");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const client = searchParams.get("client");

    await connectDB();
    const user = client ? await authenticateUser() : await authHeaders(request);

    // Check if user is admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Build query
    let query = {};

    // Helper function to escape regex special characters
    const escapeRegex = (str) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    // Search functionality
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { fullName: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
        { pathName: { $regex: escapedSearch, $options: "i" } },
        {
          "companyDetails.companyName": {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    // Filter by account type
    if (accountType && accountType !== "all") {
      if (accountType === "freelance") {
        query.accountType = "personal";
        query.documentCode = { $exists: true, $ne: "" };
      } else {
        query.accountType = accountType;
      }
    }

    // Filter by verification status
    if (isVerified !== null && isVerified !== undefined && isVerified !== "") {
      query.isVerified = isVerified === "true";
    }

    // Filter by ban status
    if (isBanned !== null && isBanned !== undefined && isBanned !== "") {
      query.isBanned = isBanned === "true";
    }

    // Filter by renter status
    if (isRenter !== null && isRenter !== undefined && isRenter !== "") {
      query.isRenter = isRenter === "true";
    }

    // Filter by having approved products
    if (hasApprovedProduct === "true") {
      const owners = await Product.distinct("owner", {
        approved: true,
        deleted: { $ne: true },
      });
      query._id = { $in: owners };
    }

    // Filter by review requested
    const reviewRequested = searchParams.get("reviewRequested");
    if (
      reviewRequested !== null &&
      reviewRequested !== undefined &&
      reviewRequested !== ""
    ) {
      query.reviewRequested = reviewRequested === "true";
    }

    // Filter by date range
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password -verificationCode")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users",
      method: "GET",
      req: request,
    });
  }
}
