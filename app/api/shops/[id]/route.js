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

// GET - Fetch a single shop by ID or Slug or OwnerID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    let query = {};
    if (mongoose.isValidObjectId(id)) {
      // Check if it's an ID or OwnerID
      query.$or = [{ _id: id }, { owner: id }];
    } else {
      query.slug = id.toLowerCase();
      query.isActive = true;
    }

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "ar";
    const langSuffix = lang === "en" ? "En" : "Ar";

    const commonFields = `images owner name${langSuffix} rental rating pricingModel location address${langSuffix} category subCategory`;

    const shop = await Shop.findOne(query)
      .populate({
        path: "sliders.products",
        select: commonFields,
        options: { strictPopulate: false },
      })
      .populate({
        path: "categories.allowedProducts",
        select: commonFields,
        options: { strictPopulate: false },
      })
      .populate("owner", "fullName email phone");

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
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

      if (res.images && res.images.length > 0) {
        res.images = [res.images[0]];
      }

      delete res.nameAr;
      delete res.nameEn;
      delete res.addressAr;
      delete res.addressEn;

      return res;
    };

    const shopObj = shop.toObject();
    const localizedShop = {
      ...shopObj,
      name: shopObj[`name${langSuffix}`] || shopObj.name,
      description: shopObj[`description${langSuffix}`] || shopObj.description,
    };

    if (localizedShop.sliders) {
      localizedShop.sliders.forEach((slider) => {
        if (slider.products) {
          slider.products = slider.products.map(transformProduct);
        }
      });
    }

    if (localizedShop.categories) {
      localizedShop.categories.forEach((cat) => {
        if (cat.allowedProducts) {
          cat.allowedProducts = cat.allowedProducts.map(transformProduct);
        }
      });
    }

    if (localizedShop.showReviews) {
      const reviews = await Review.find({ owner: localizedShop.owner._id })
        .populate({ path: "user", select: "fullName avatar address" })
        .populate({
          path: "product",
          select: `name${langSuffix} images address${langSuffix}`,
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // Transform product data in reviews to include localized name and first image
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
    const data = await req.json();

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

    // Check if user is Admin OR the Owner of the shop
    if (
      user.accountType !== "admin" &&
      shop.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Handle Logo Upload if changed
    if (data.logo && data.logo.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(data.logo, {
        folder: "shops",
        format: "webp",
      });
      data.logo = uploaded.secure_url;
    }

    // Handle OG Image Upload if changed
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
        // Ensure new categories have an ID for product syncing
        if (!category._id) {
          category._id = new mongoose.Types.ObjectId();
        }
      }
    }

    // Sync Shop Categories with Products
    if (data.categories) {
      // 1. Get current category IDs to clean up
      const oldCategoryIds = shop.categories.map((c) => c._id);

      // 2. Remove old category links from ALL products
      if (oldCategoryIds.length > 0) {
        await Product.updateMany(
          { shopCategories: { $in: oldCategoryIds } },
          { $pull: { shopCategories: { $in: oldCategoryIds } } },
        );
      }

      // 3. Add new category links to selected products
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

    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      { ...data, slug: data.slug ? data.slug.toLowerCase() : shop.slug },
      { new: true },
    );

    // Sync hasShop status with User model
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

    // Reset user hasShop status
    await User.findByIdAndUpdate(deleted.owner, { hasShop: false });

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
