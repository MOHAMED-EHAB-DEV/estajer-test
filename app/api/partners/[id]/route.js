import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Partner from "@/models/Partner";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";

// GET - Fetch a single partner by ID or Slug
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    let query = {};
    if (mongoose.isValidObjectId(id)) {
      query._id = id;
    } else {
      query.slug = id.toLowerCase();
      query.isActive = true;
    }

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "ar";
    const langSuffix = lang === "en" ? "En" : "Ar";

    const commonFields = `images owner name${langSuffix} rental rating pricingModel location address${langSuffix} category subCategory`;

    const partner = await Partner.findOne(query)
      .populate({
        path: "sliders.products",
        select: commonFields,
        options: { strictPopulate: false },
      })
      .select("-allowedProducts");

    if (!partner) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 },
      );
    }

    const transformProduct = (product) => {
      if (!product) return null;
      const p = product.toObject ? product.toObject() : product;
      const res = {
        ...p,
        name: p[`name${langSuffix}`] || p.name,
        address: p[`address${langSuffix}`] || p.address,
      };

      // Only first image
      if (res.images && res.images.length > 0) {
        res.images = [res.images[0]];
      }

      // Cleanup raw language fields
      delete res.nameAr;
      delete res.nameEn;
      delete res.addressAr;
      delete res.addressEn;

      return res;
    };

    const partnerObj = partner.toObject();
    const localizedPartner = {
      ...partnerObj,
      name: partnerObj[`name${langSuffix}`] || partnerObj.name,
      description:
        partnerObj[`description${langSuffix}`] || partnerObj.description,
    };

    if (localizedPartner.sliders) {
      localizedPartner.sliders.forEach((slider) => {
        if (slider.products) {
          slider.products = slider.products.map(transformProduct);
        }
      });
    }

    // if (localizedPartner.allowedProducts) {
    //   localizedPartner.allowedProducts =
    //     localizedPartner.allowedProducts.map(transformProduct);
    // }

    return NextResponse.json({ success: true, data: localizedPartner });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/partners/[id]",
      method: "GET",
      req,
    });
  }
}

// PUT - Update a partner (Admin only)
export async function PUT(req, { params }) {
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
    const data = await req.json();

    const partner = await Partner.findById(id);
    if (!partner) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 },
      );
    }

    // Handle Logo Upload if changed
    if (data.logo && data.logo.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.logo, {
        folder: "partners",
        format: "webp",
      });
      data.logo = uploaded.secure_url;
    }

    // Handle OG Image Upload if changed
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

    const updatedPartner = await Partner.findByIdAndUpdate(
      id,
      { ...data, slug: data.slug ? data.slug.toLowerCase() : partner.slug },
      { new: true },
    );

    // Update Product providers
    if (data.allowedProducts) {
      // 1. Remove this partner from ALL products
      await Product.updateMany({ providers: id }, { $pull: { providers: id } });

      // 2. Add this partner to the selected products
      if (data.allowedProducts.length > 0) {
        await Product.updateMany(
          { _id: { $in: data.allowedProducts } },
          { $addToSet: { providers: id } },
        );
      }
    }

    return NextResponse.json({ success: true, data: updatedPartner });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/partners/[id]",
      method: "PUT",
      req,
    });
  }
}

// DELETE - Delete a partner (Admin only)
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
    const deleted = await Partner.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 },
      );
    }

    // Remove this partner from ALL products
    await Product.updateMany({ providers: id }, { $pull: { providers: id } });

    return NextResponse.json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/partners/[id]",
      method: "DELETE",
      req,
    });
  }
}
