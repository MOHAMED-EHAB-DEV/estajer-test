import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch all categories with optional filters
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const mainOnly = searchParams.get("mainOnly") === "true";
    const includeSubcategories =
      searchParams.get("includeSubcategories") === "true";
    const includeProductCount =
      searchParams.get("includeProductCount") === "true";
    const includeSubcategoryCount =
      searchParams.get("includeSubcategoryCount") === "true";
    const lang = searchParams.get("lang");
    const hideFromHome = searchParams.get("hideFromHome");
    const includeSeo = searchParams.get("seo") === "true";
    const nanaParam = searchParams.get("nana");
    const keysOnly = searchParams.get("keysOnly") === "true";

    let query = {};

    if (nanaParam === "true") {
      query.nana = true;
    } else if (nanaParam === "false") {
      // estajer: categories where nana is false OR not set
      query.nana = { $ne: true };
    }

    // Filter by status
    if (status && status !== "all") query.status = status;

    // remove categories that hideFromHome is true
    if (hideFromHome === "true") query.hideFromHome = { $ne: true };

    // Only main categories (parentCategory is null)
    if (mainOnly) query.parentCategory = null;

    const seoFields =
      "-richContentAr -richContentEn -seoTitleAr -seoTitleEn -seoDescriptionAr -seoDescriptionEn -seoKeywordsAr -seoKeywordsEn";

    let categoriesQuery = Category.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    if (keysOnly) {
      categoriesQuery = categoriesQuery.select("key");
    } else {
      categoriesQuery = categoriesQuery.populate("createdBy", "fullName");
      if (!includeSeo) {
        categoriesQuery = categoriesQuery.select(seoFields);
      }
    }

    // Include subcategories for main categories
    if (includeSubcategories) {
      categoriesQuery = categoriesQuery.populate({
        path: "subcategories",
        select: keysOnly ? "key parentCategory" : !includeSeo ? seoFields : "",
        options: { sort: { order: 1, createdAt: -1 } },
      });
    }

    let categories = await categoriesQuery;

    if (keysOnly) {
      const simplified = categories.map((cat) => {
        const catObj = cat.toObject ? cat.toObject() : cat;
        const item = { key: catObj.key };
        if (includeSubcategories && catObj.subcategories) {
          item.subcategories = catObj.subcategories.map((sub) => ({
            key: sub.key,
          }));
        }
        return item;
      });
      return NextResponse.json({ success: true, data: simplified });
    }

    // Count products for each category if requested
    if (includeProductCount) {
      // Count products by main category
      const mainCategoryCounts = await Product.aggregate([
        {
          $match: {
            category: { $in: categories.map((cat) => cat.key) },
            approved: true,
            hidden: false,
            deleted: { $ne: true },
          },
        },
        {
          $group: { _id: "$category", count: { $sum: 1 } },
        },
      ]);

      // Create map for quick lookup
      const mainCountMap = {};
      mainCategoryCounts.forEach((item) => {
        mainCountMap[item._id] = item.count;
      });

      // Count products by subcategory only if requested AND subcategories are included
      let subCountMap = {};
      if (includeSubcategoryCount && includeSubcategories) {
        const subCategoryCounts = await Product.aggregate([
          {
            $match: {
              subCategory: { $exists: true, $ne: null, $ne: "" },
              approved: true,
              hidden: false,
              deleted: { $ne: true },
            },
          },
          {
            $group: {
              _id: { category: "$category", subCategory: "$subCategory" },
              count: { $sum: 1 },
            },
          },
        ]);

        // Create map for subcategory counts
        subCategoryCounts.forEach((item) => {
          const key = `${item._id.category}__${item._id.subCategory}`;
          subCountMap[key] = item.count;
        });
      }

      // Add counts to categories
      categories = categories.map((cat) => {
        const catObj = cat.toObject();
        // Main category count = all products with this category
        catObj.productsCount = mainCountMap[catObj.key] || 0;

        // Add counts to subcategories only if subcategory counts are requested
        if (catObj.subcategories && includeSubcategoryCount) {
          catObj.subcategories = catObj.subcategories.map((sub) => {
            // Key format: parentCategoryKey__subcategoryKey
            const countKey = `${catObj.key}__${sub.key}`;
            return {
              ...sub,
              productsCount: subCountMap[countKey] || 0,
            };
          });
        }

        return catObj;
      });

      // Transform response if language is specified
      if (lang) {
        const langSuffix = lang === "en" ? "En" : "Ar";
        const transformed = categories.map((catObj) => ({
          ...catObj,
          name: catObj[`name${langSuffix}`],
          subcategories: catObj.subcategories?.map((sub) => ({
            ...sub,
            name: sub[`name${langSuffix}`],
          })),
        }));
        return NextResponse.json({ success: true, data: transformed });
      }

      return NextResponse.json({ success: true, data: categories });
    }

    // Transform response if language is specified
    if (lang) {
      const langSuffix = lang === "en" ? "En" : "Ar";
      const transformed = categories.map((cat) => {
        const catObj = cat.toObject();
        return {
          ...catObj,
          name: catObj[`name${langSuffix}`],
          subcategories: catObj.subcategories?.map((sub) => ({
            ...sub,
            name: sub[`name${langSuffix}`],
          })),
        };
      });
      return NextResponse.json({ success: true, data: transformed });
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/categories",
      method: "GET",
      req,
    });
  }
}

// POST - Create a new category
export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    // Check if user is admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const data = await req.json();

    // Validate required fields
    if (!data.nameAr || !data.nameEn) {
      return NextResponse.json(
        { success: false, error: "Name in both languages is required" },
        { status: 400 },
      );
    }

    if (!data.key) {
      return NextResponse.json(
        { success: false, error: "Category key is required" },
        { status: 400 },
      );
    }

    // Check if key already exists
    const existingCategory = await Category.findOne({ key: data.key });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category key already exists" },
        { status: 400 },
      );
    }

    // Main categories require an image
    const isSubcategory = data.parentCategory && data.parentCategory !== "main";
    if (!isSubcategory && !data.image) {
      return NextResponse.json(
        { success: false, error: "Image is required for main categories" },
        { status: 400 },
      );
    }

    let imageUrl = null;

    // Upload image to cloudinary if provided
    if (data.image) {
      const uploaded = await cloudinary.uploader.upload(data.image, {
        folder: "categories",
        format: "webp",
      });
      imageUrl = uploaded.secure_url;
    }

    // Get the order for the new category
    const lastCategory = await Category.findOne({
      parentCategory: isSubcategory ? data.parentCategory : null,
    }).sort({ order: -1 });
    const category = await Category.create({
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      key: data.key,
      image: imageUrl,
      status: data.status || "active",
      parentCategory: isSubcategory ? data.parentCategory : null,
      order:
        data.order !== undefined
          ? data.order
          : lastCategory
            ? lastCategory.order + 1
            : 0,
      createdBy: user._id,
      hideFromHome: data.hideFromHome || false,
      nana: data.nana || false,
      seoTitleAr: data.seoTitleAr,
      seoTitleEn: data.seoTitleEn,
      seoDescriptionAr: data.seoDescriptionAr,
      seoDescriptionEn: data.seoDescriptionEn,
      seoKeywordsAr: data.seoKeywordsAr,
      seoKeywordsEn: data.seoKeywordsEn,
      richContentAr: data.richContentAr,
      richContentEn: data.richContentEn,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/categories",
      method: "POST",
      req,
    });
  }
}

// DELETE - Bulk delete categories
export async function DELETE(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category IDs are required" },
        { status: 400 },
      );
    }

    // Delete subcategories first
    await Category.deleteMany({ parentCategory: { $in: ids } });

    // Delete main categories
    await Category.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      message: "Categories deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/categories",
      method: "DELETE",
      req,
    });
  }
}
