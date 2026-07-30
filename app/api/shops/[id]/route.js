import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Shop from "@/models/Shop";
import User from "@/models/User";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";
import Review from "@/models/review";

/**
 * Recursively walk an object and upload any base64 data: image strings to Cloudinary.
 */
async function uploadImagesInObject(obj, folder = "shops") {
  if (typeof obj === "string") {
    if (obj.startsWith("data:image/")) {
      const uploaded = await cloudinary.uploader.upload(obj, {
        folder,
        format: "webp",
      });
      return uploaded.secure_url;
    }
    return obj.replace("https://estajer.com", "").replace("/en/", "/");
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((item) => uploadImagesInObject(item, folder)));
  }
  if (obj && typeof obj === "object") {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = await uploadImagesInObject(obj[key], folder);
    }
    return result;
  }
  return obj;
}

// GET - Fetch a single shop by ID, OwnerID, or Slug
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    let query = {};
    if (mongoose.isValidObjectId(id)) {
      query.$or = [{ _id: id }, { owner: id }];
    } else {
      query.slug = id.toLowerCase();
      query.isActive = true;
    }

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "ar";
    const langSuffix = lang === "en" ? "En" : "Ar";

    const shop = await Shop.findOne(query).populate(
      "owner",
      "fullName email phone",
    );

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopObj = shop.toObject();

    // Populate product references inside sections[].data
    // We collect all product IDs from all sections then batch-fetch them
    const productIdSet = new Set();
    (shopObj.sections || []).forEach((section) => {
      if (section.data?.products && Array.isArray(section.data.products)) {
        section.data.products.forEach((p) => {
          const id = p?._id || p;
          if (id) productIdSet.add(id.toString());
        });
      }
      if (section.data?.product) {
        const id = section.data.product?._id || section.data.product;
        if (id) productIdSet.add(id.toString());
      }
      if (section.data?.categories && Array.isArray(section.data.categories)) {
        section.data.categories.forEach((cat) => {
          (cat.allowedProducts || []).forEach((p) => {
            const id = p?._id || p;
            if (id) productIdSet.add(id.toString());
          });
        });
      }
    });

    const commonFields = `images owner name${langSuffix} description${langSuffix} rental rating pricingModel location address${langSuffix} category subCategory approved`;
    const productsMap = {};
    if (productIdSet.size > 0) {
      const products = await Product.find({ _id: { $in: [...productIdSet] } })
        .select(commonFields)
        .lean();
      products.forEach((p) => {
        productsMap[p._id.toString()] = {
          ...p,
          name: p[`name${langSuffix}`] || p.name,
          description: p[`description${langSuffix}`] || p.description,
          address: p[`address${langSuffix}`] || p.address,
          images: p.images?.slice(0, 1) || [],
        };
      });
    }

    // Replace product IDs in sections with populated objects
    const populatedSections = (shopObj.sections || []).map((section) => {
      const newSection = { ...section, data: { ...(section.data || {}) } };
      if (newSection.data.products) {
        newSection.data.products = newSection.data.products
          .map((p) => productsMap[(p?._id || p)?.toString()])
          .filter(Boolean);
      }
      if (newSection.data.product) {
        newSection.data.product =
          productsMap[
            (
              newSection.data.product?._id || newSection.data.product
            )?.toString()
          ] || null;
      }
      if (newSection.data.categories) {
        newSection.data.categories = newSection.data.categories.map((cat) => ({
          ...cat,
          allowedProducts: (cat.allowedProducts || [])
            .map((p) => productsMap[(p?._id || p)?.toString()])
            .filter(Boolean),
        }));
      }
      return newSection;
    });

    const localizedShop = {
      ...shopObj,
      sections: populatedSections,
      name: shopObj[`name${langSuffix}`] || shopObj.name,
      description: shopObj[`description${langSuffix}`] || shopObj.description,
    };

    // Load reviews if a reviews section is present
    const hasReviewsSection = (localizedShop.sections || []).some(
      (s) => s.sectionType === "reviews",
    );
    if (hasReviewsSection) {
      const reviews = await Review.find({ owner: localizedShop.owner?._id })
        .populate({ path: "user", select: "fullName avatar address" })
        .populate({
          path: "product",
          select: `name${langSuffix} images address${langSuffix}`,
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      localizedShop.reviews = reviews.map((review) => {
        if (review.product) {
          const product = review.product;
          review.product = {
            ...product,
            name: product[`name${langSuffix}`] || product.name,
            address: product[`address${langSuffix}`] || product.address,
            image: product.images?.[0]?.preview || "",
          };
        }
        return review;
      });
    }

    return NextResponse.json({ success: true, data: localizedShop });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/shops/[id]",
      method: "GET",
      req,
    });
  }
}

// PUT - Update a shop (Admin or Owner)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    let data = await req.json();

    const shop = await Shop.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { owner: mongoose.isValidObjectId(id) ? id : null },
        { slug: id.toLowerCase() },
      ],
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    // Auth: Admin or Owner
    if (
      user.accountType !== "admin" &&
      shop.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Prevent non-admins from changing shopCommission and plan
    if (user.accountType !== "admin") {
      delete data.shopCommission;
      delete data.plan;
    }

    // Upload logo if changed
    if (data.logo && data.logo.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.logo, {
        folder: "shops",
        format: "webp",
      });
      data.logo = uploaded.secure_url;
    }

    // Upload OG image if changed
    if (data.ogImage && data.ogImage.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.ogImage, {
        folder: "shops/seo",
        format: "webp",
      });
      data.ogImage = uploaded.secure_url;
    }

    // Upload all images inside sections[].data generically
    if (data.sections && Array.isArray(data.sections)) {
      data.sections = await Promise.all(
        data.sections.map(async (section) => {
          const uploadedData = await uploadImagesInObject(
            section.data,
            `shops/${section.sectionType}`,
          );
          if (
            section.sectionType === "categories" &&
            uploadedData?.categories
          ) {
            uploadedData.categories = uploadedData.categories.map((cat) => {
              if (!cat._id) {
                cat._id = new mongoose.Types.ObjectId().toString();
              }
              return cat;
            });
          }
          return {
            ...section,
            data: uploadedData,
          };
        }),
      );
    }

    // Sync shopCategories on products (from categories sections)
    const categorySections = (data.sections || []).filter(
      (s) => s.sectionType === "categories",
    );
    const oldCategorySections = (shop.sections || []).filter(
      (s) => s.sectionType === "categories",
    );

    // Collect old category IDs to clean up
    const oldCategoryIds = [];
    oldCategorySections.forEach((s) => {
      (s.data?.categories || []).forEach((cat) => {
        if (cat._id) oldCategoryIds.push(cat._id);
      });
    });

    if (oldCategoryIds.length > 0) {
      await Product.updateMany(
        { shopCategories: { $in: oldCategoryIds } },
        { $pull: { shopCategories: { $in: oldCategoryIds } } },
      );
    }

    // Add new category links
    for (const section of categorySections) {
      for (const cat of section.data?.categories || []) {
        if (cat._id && cat.allowedProducts?.length > 0) {
          const productIds = cat.allowedProducts.map((p) => p._id || p);
          await Product.updateMany(
            { _id: { $in: productIds } },
            { $addToSet: { shopCategories: cat._id } },
          );
        }
      }
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      { ...data, slug: data.slug ? data.slug.toLowerCase() : shop.slug },
      { new: true },
    );

    // If plan is updated by admin, sync the plan to the owner user document
    if (user.accountType === "admin" && data.plan) {
      await User.findByIdAndUpdate(shop.owner, {
        shopPlan: data.plan,
        premium: true,
      });
    }

    // Sync hasShop status
    if (data.hasOwnProperty("isActive")) {
      await User.findByIdAndUpdate(shop.owner, { hasShop: !!data.isActive });
    }

    return NextResponse.json({ success: true, data: updatedShop });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/shops/[id]",
      method: "PUT",
      req,
    });
  }
}

// DELETE - Delete a shop (Admin only)
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;

    let deleted;
    if (mongoose.isValidObjectId(id)) {
      deleted = await Shop.findOneAndDelete({
        $or: [{ _id: id }, { owner: id }],
      });
    } else {
      deleted = await Shop.findOneAndDelete({ slug: id.toLowerCase() });
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    // Reset user hasShop status and shop plans
    await User.findByIdAndUpdate(deleted.owner, {
      hasShop: false,
      shopPlan: null,
      shopPlanExpiresAt: null,
      premium: false,
    });

    return NextResponse.json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/shops/[id]",
      method: "DELETE",
      req,
    });
  }
}
