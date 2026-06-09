import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Shop from "@/models/Shop";
import User from "@/models/User";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";

// GET - Fetch all shops (with pagination for admin)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const all = searchParams.get("all") === "true";
    const owner = searchParams.get("owner");

    const query = {};
    if (!all) {
      query.isActive = true;
    } else if (isActive !== null && isActive !== undefined && isActive !== "") {
      query.isActive = isActive === "true";
    }

    if (owner) {
      query.owner = owner;
    }

    if (search) {
      query.$or = [
        { nameAr: { $regex: search, $options: "i" } },
        { nameEn: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const logosOnly = searchParams.get("logosOnly") === "true";

    let shopsQuery = Shop.find(query);
    if (logosOnly) {
      shopsQuery = shopsQuery.select("_id nameAr nameEn logo");
    } else {
      shopsQuery = shopsQuery.populate("owner", "fullName email phone");
    }

    const shops = await shopsQuery
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(logosOnly ? 50 : limit);

    const total = await Shop.countDocuments(query);

    const lang = searchParams.get("lang") || "ar";
    const langSuffix = lang === "en" ? "En" : "Ar";

    const localizedShops = shops.map((shop) => {
      const s = shop.toObject();
      return {
        ...s,
        name: s[`name${langSuffix}`] || s.name,
        description: s[`description${langSuffix}`] || s.description,
      };
    });

    return NextResponse.json({
      success: true,
      data: localizedShops,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/shops",
      method: "GET",
      req,
    });
  }
}

// POST - Create a new shop (Admin only)
export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const data = await req.json();

    // Validation
    if (
      !data.owner ||
      !data.nameAr ||
      !data.nameEn ||
      !data.slug ||
      !data.logo
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Required fields are missing (owner, nameAr, nameEn, slug, logo)",
        },
        { status: 400 },
      );
    }

    // Check if slug exists
    const existingSlug = await Shop.findOne({ slug: data.slug.toLowerCase() });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 400 },
      );
    }

    // Check if user already has a shop
    const existingOwner = await Shop.findOne({ owner: data.owner });
    if (existingOwner) {
      return NextResponse.json(
        { success: false, error: "This user already has a shop" },
        { status: 400 },
      );
    }

    // Handle Logo Upload
    if (data.logo && data.logo.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.logo, {
        folder: "shops",
        format: "webp",
      });
      data.logo = uploaded.secure_url;
    }

    // Handle OG Image Upload
    if (data.ogImage && data.ogImage.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.ogImage, {
        folder: "shops/seo",
        format: "webp",
      });
      data.ogImage = uploaded.secure_url;
    }

    // Handle Hero Banners Upload
    if (data.heroBanners && Array.isArray(data.heroBanners)) {
      for (let banner of data.heroBanners) {
        if (banner.imageAr && banner.imageAr.startsWith("data:")) {
          const uploadedAr = await cloudinary.uploader.upload(banner.imageAr, {
            folder: "shops/banners",
            format: "webp",
          });
          banner.imageAr = uploadedAr.secure_url;
        }
        if (banner.imageEn && banner.imageEn.startsWith("data:")) {
          const uploadedEn = await cloudinary.uploader.upload(banner.imageEn, {
            folder: "shops/banners",
            format: "webp",
          });
          banner.imageEn = uploadedEn.secure_url;
        }
        if (banner.link) {
          banner.link = banner.link
            .replace("https://estajer.com", "")
            .replace("/en/", "/");
        }
      }
    }

    // Handle Offer Banners Upload (Multi-section)
    if (data.offerBanners && Array.isArray(data.offerBanners)) {
      for (let section of data.offerBanners) {
        if (section.banners && Array.isArray(section.banners)) {
          for (let banner of section.banners) {
            if (banner.imageAr && banner.imageAr.startsWith("data:")) {
              const uploadedAr = await cloudinary.uploader.upload(
                banner.imageAr,
                {
                  folder: "shops/offers",
                  format: "webp",
                },
              );
              banner.imageAr = uploadedAr.secure_url;
            }
            if (banner.imageEn && banner.imageEn.startsWith("data:")) {
              const uploadedEn = await cloudinary.uploader.upload(
                banner.imageEn,
                {
                  folder: "shops/offers",
                  format: "webp",
                },
              );
              banner.imageEn = uploadedEn.secure_url;
            }
            if (banner.link) {
              banner.link = banner.link
                .replace("https://estajer.com", "")
                .replace("/en/", "/");
            }
          }
        }
      }
    }

    // Handle Shop Categories Upload and IDs
    if (data.categories && Array.isArray(data.categories)) {
      for (let category of data.categories) {
        if (category.image && category.image.startsWith("data:")) {
          const uploaded = await cloudinary.uploader.upload(category.image, {
            folder: "shops/categories",
            format: "webp",
          });
          category.image = uploaded.secure_url;
        }
        // Ensure categories have an ID for product syncing
        if (!category._id) {
          category._id = new mongoose.Types.ObjectId();
        }
      }
    }

    // Sync Shop Categories with Products (Only if categories exist)
    if (data.categories && Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        if (cat.allowedProducts && cat.allowedProducts.length > 0) {
          const productIds = cat.allowedProducts.map((p) =>
            p._id ? p._id : p,
          );
          await Product.updateMany(
            { _id: { $in: productIds } },
            { $addToSet: { shopCategories: cat._id } },
          );
        }
      }
    }

    const shop = await Shop.create({
      ...data,
      slug: data.slug.toLowerCase(),
    });

    // Update user hasShop status
    if (shop.isActive) {
      await User.findByIdAndUpdate(data.owner, { hasShop: true });
    }

    return NextResponse.json({ success: true, data: shop });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/shops",
      method: "POST",
      req,
    });
  }
}
