import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Shop from "@/models/Shop";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";

/**
 * Recursively walk an object and upload any base64 data: image strings to Cloudinary.
 * Returns a new object with all base64 strings replaced with Cloudinary URLs.
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
    // Strip full domain from internal links
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

    if (owner) query.owner = owner;

    if (search) {
      query.$or = [
        { nameAr: { $regex: search, $options: "i" } },
        { nameEn: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const logosOnly = searchParams.get("logosOnly") === "true";

    let shopsQuery;
    if (logosOnly) {
      shopsQuery = Shop.find(query).select("_id nameAr nameEn logo isActive");
    } else if (all) {
      shopsQuery = Shop.find(query)
        .select("_id nameAr nameEn slug logo shopCommission plan isActive createdAt owner")
        .populate("owner", "fullName email phone shopPlanExpiresAt shopPlan");
    } else {
      shopsQuery = Shop.find(query)
        .select("_id nameAr nameEn slug logo descriptionAr descriptionEn sections owner isActive")
        .populate("owner", "shopPlanExpiresAt");
    }

    const shops = await shopsQuery
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(logosOnly ? 50 : limit);

    const total = await Shop.countDocuments(query);

    const lang = searchParams.get("lang") || "ar";
    const langSuffix = lang === "en" ? "En" : "Ar";

    const localizedShops = [];
    for (const shop of shops) {
      const s = shop.toObject();
      let isExpired = false;

      if (s.owner && s.owner.shopPlanExpiresAt) {
        const expiryDate = new Date(s.owner.shopPlanExpiresAt);
        if (expiryDate < new Date()) {
          isExpired = true;
          if (s.isActive) {
            await Shop.findByIdAndUpdate(s._id, { isActive: false });
            s.isActive = false;
          }
        }
      }

      if (!all && !s.isActive) {
        continue;
      }

      if (!all && !logosOnly) {
        // Extract heroBanners, sliders, and categories from sections
        const heroSection = s.sections?.find((sec) => sec.sectionType === "hero");
        s.heroBanners = heroSection?.data?.heroBanners || [];

        const sliderSections = s.sections?.filter((sec) => sec.sectionType === "slider") || [];
        s.sliders = sliderSections.map((sec) => ({
          products: sec.data?.products || [],
        }));

        const categoriesSection = s.sections?.find((sec) => sec.sectionType === "categories");
        s.categories = categoriesSection?.data?.categories || [];

        const aboutSection = s.sections?.find((sec) => sec.sectionType === "about");
        s.descriptionAr = aboutSection?.data?.aboutDescriptionAr || "";
        s.descriptionEn = aboutSection?.data?.aboutDescriptionEn || "";

        // Remove the massive sections array and owner details from response
        delete s.sections;
        delete s.owner;
      }

      localizedShops.push({
        ...s,
        isExpired,
        name: s[`name${langSuffix}`] || s.name,
        description: s[`description${langSuffix}`] || s.description,
      });
    }

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

    let data = await req.json();

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

    // Upload logo
    if (data.logo && data.logo.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.logo, {
        folder: "shops",
        format: "webp",
      });
      data.logo = uploaded.secure_url;
    }

    // Upload OG image
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
          if (section.sectionType === "categories" && uploadedData?.categories) {
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
