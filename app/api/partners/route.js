import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Partner from "@/models/Partner";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch all partners (with pagination for admin)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const all = searchParams.get("all") === "true";

    const query = {};
    if (!all) {
      query.isActive = true;
    } else if (isActive !== null && isActive !== undefined && isActive !== "") {
      query.isActive = isActive === "true";
    }

    if (search) {
      query.$or = [
        { nameAr: { $regex: search, $options: "i" } },
        { nameEn: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const partners = await Partner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Partner.countDocuments(query);

    const lang = searchParams.get("lang") || "ar";
    const langSuffix = lang === "en" ? "En" : "Ar";

    const localizedPartners = partners.map((partner) => {
      const p = partner.toObject();
      return {
        ...p,
        name: p[`name${langSuffix}`] || p.name,
        description: p[`description${langSuffix}`] || p.description,
      };
    });

    return NextResponse.json({
      success: true,
      data: localizedPartners,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/partners",
      method: "GET",
      req,
    });
  }
}

// POST - Create a new partner (Admin only)
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
    if (!data.nameAr || !data.nameEn || !data.slug || !data.logo) {
      return NextResponse.json(
        {
          success: false,
          error: "Required fields are missing (nameAr, nameEn, slug, logo)",
        },
        { status: 400 },
      );
    }

    // Check if slug exists
    const existing = await Partner.findOne({ slug: data.slug.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 400 },
      );
    }

    // Handle Logo Upload
    if (data.logo && data.logo.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.logo, {
        folder: "partners",
        format: "webp",
      });
      data.logo = uploaded.secure_url;
    }

    // Handle OG Image Upload
    if (data.ogImage && data.ogImage.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.ogImage, {
        folder: "partners/seo",
        format: "webp",
      });
      data.ogImage = uploaded.secure_url;
    }

    // Handle Hero Banners Upload
    if (data.heroBanners && Array.isArray(data.heroBanners)) {
      for (let banner of data.heroBanners) {
        if (banner.imageAr && banner.imageAr.startsWith("data:")) {
          const uploadedAr = await cloudinary.uploader.upload(banner.imageAr, {
            folder: "partners/banners",
            format: "webp",
          });
          banner.imageAr = uploadedAr.secure_url;
        }
        if (banner.imageEn && banner.imageEn.startsWith("data:")) {
          const uploadedEn = await cloudinary.uploader.upload(banner.imageEn, {
            folder: "partners/banners",
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
                  folder: "partners/offers",
                  format: "webp",
                },
              );
              banner.imageAr = uploadedAr.secure_url;
            }
            if (banner.imageEn && banner.imageEn.startsWith("data:")) {
              const uploadedEn = await cloudinary.uploader.upload(
                banner.imageEn,
                {
                  folder: "partners/offers",
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

    const partner = await Partner.create({
      ...data,
      slug: data.slug.toLowerCase(),
    });

    // Update Product providers
    if (data.allowedProducts && data.allowedProducts.length > 0) {
      await Product.updateMany(
        { _id: { $in: data.allowedProducts } },
        { $addToSet: { providers: partner._id } },
      );
    }

    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/partners",
      method: "POST",
      req,
    });
  }
}
