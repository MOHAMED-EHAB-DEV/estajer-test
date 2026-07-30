import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import PageVisit from "@/models/PageVisit";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isClient = searchParams.get("isClient") === "true";
    const user = isClient ? await authenticateUser() : await authHeaders(req);

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;
    const status = searchParams.get("status");
    const nameQuery = searchParams.get("name");
    const lang = searchParams.get("lang") || "ar";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let matchQuery = {};

    if (status) {
      if (status === "approved") {
        matchQuery = {
          approved: true,
          rejected: false,
          hidden: false,
          deleted: { $ne: true },
        };
      } else if (status === "rejected") {
        matchQuery = { rejected: true, deleted: { $ne: true } };
      } else if (status === "pending") {
        matchQuery = {
          approved: false,
          rejected: false,
          deleted: { $ne: true },
        };
      } else if (status === "pendingChanges") {
        matchQuery = {
          approved: true,
          "pendingChanges.needsReview": true,
          deleted: { $ne: true },
        };
      } else if (status === "hidden") {
        matchQuery = { hidden: true, deleted: { $ne: true } };
      } else if (status === "deleted") {
        matchQuery = { deleted: true };
      } else if (status === "edited") {
        matchQuery = { edited: true, rejected: false, deleted: { $ne: true } };
      } else if (status === "main") {
        matchQuery = {
          isMain: true,
          approved: true,
          rejected: false,
          hidden: false,
          deleted: { $ne: true },
        };
      } else if (status === "all") {
        matchQuery = { deleted: { $ne: true } };
      }
    } else {
      matchQuery = { deleted: { $ne: true } };
    }

    if (nameQuery) {
      matchQuery.$or = [
        { nameAr: { $regex: nameQuery, $options: "i" } },
        { nameEn: { $regex: nameQuery, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = end;
      }
    }

    const totalProducts = await Product.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(matchQuery)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ _id: -1 })
      .select(
        "images owner nameAr nameEn rental rating pricingModel location addressAr addressEn rejected approved deleted hidden rejectMessage category subCategory quantity minQuantity status isMain nana pendingChanges createdAt updatedAt",
      )
      .populate("owner", "fullName email phone avatar companyDetails.taxCode")
      .lean();

    const mappedProducts = products.map((p) => {
      const { nameAr, nameEn, ...rest } = p;
      return {
        ...rest,
        name: lang === "ar" ? nameAr || nameEn : nameEn || nameAr,
      };
    });

    // Stats
    const statsQuery = { deleted: { $ne: true } };
    if (matchQuery.createdAt) {
      statsQuery.createdAt = matchQuery.createdAt;
    }
    const productStatsAggr = await Product.aggregate([
      { $match: statsQuery },
      {
        $group: {
          _id: null,
          allProducts: { $sum: 1 },
          newPendingProducts: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$approved", false] }, { $eq: ["$rejected", false] }] },
                1, 0
              ]
            }
          },
          acceptedProducts: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$approved", true] }, { $eq: ["$rejected", false] }, { $eq: ["$hidden", false] }] },
                1, 0
              ]
            }
          },
          cancelledProducts: {
            $sum: { $cond: [{ $eq: ["$rejected", true] }, 1, 0] }
          }
        }
      }
    ]);

    const statsResult = productStatsAggr[0] || {
      allProducts: 0,
      newPendingProducts: 0,
      acceptedProducts: 0,
      cancelledProducts: 0,
    };

    const {
      allProducts,
      newPendingProducts,
      acceptedProducts,
      cancelledProducts,
    } = statsResult;

    const categoriesCount = await Category.countDocuments({});

    // For empty categories and most visited, we could run aggregations, but for simplicity let's mock or use basic queries.
    // Or just run aggregate for empty categories:
    const categoriesWithProducts = await Product.distinct(
      "category",
      statsQuery,
    );
    const emptyCategories = categoriesCount - categoriesWithProducts.length;

    const pageVisitMatch = { productId: { $ne: null } };
    if (matchQuery.createdAt) {
      pageVisitMatch.createdAt = matchQuery.createdAt;
    }

    const categoryVisitsAggr = await PageVisit.aggregate([
      { $match: pageVisitMatch },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.deleted": { $ne: true } } },
      {
        $group: {
          _id: "$product.category",
          visits: { $sum: "$count" },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 7 },
    ]);
    
    // We fetch categories to get the localized name
    const allCategories = await Category.find({}).lean();
    const catMap = {};
    allCategories.forEach((c) => {
      catMap[c.key] = lang === "ar" ? c.nameAr || c.nameEn : c.nameEn || c.nameAr;
    });

    const barData = categoryVisitsAggr.map(c => ({
      category: catMap[c._id] || c._id,
      value: c.visits
    }));

    const mostVisitedCategoryData =
      categoryVisitsAggr.length > 0
        ? {
            name: catMap[categoryVisitsAggr[0]._id] || categoryVisitsAggr[0]._id,
            visits: categoryVisitsAggr[0].visits,
          }
        : null;

    return NextResponse.json({
      success: true,
      data: {
        products: mappedProducts,
        pagination: {
          total: totalProducts,
          pages: totalPages,
          page,
          limit,
        },
        stats: {
          allProducts,
          newPendingProducts,
          acceptedProducts,
          cancelledProducts,
          categoriesCount,
          emptyCategories,
          mostVisitedCategory: mostVisitedCategoryData,
          barData,
        },
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/products",
      method: "GET",
      req,
    });
  }
}
