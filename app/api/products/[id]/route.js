import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang");

  const approved = searchParams.get("approved");
  const rejected = searchParams.get("rejected");
  const showAll = searchParams.get("showAll") === "true";
  const showDeleted = searchParams.get("showDeleted") === "true";
  const userId = searchParams.get("userId");
  const bothLangs = searchParams.get("bothLangs") === "true";
  const fields = searchParams.get("fields")?.split(",");
  const excludeFields = searchParams.get("excludeFields")?.split(",");

  let query = showAll ? {} : { approved: true, rejected: false, hidden: false };

  if (userId) query.owner = userId;
  if (approved) query.approved = approved;
  if (rejected) query.rejected = rejected;
  if (!showDeleted) query.deleted = { $ne: true };

  const excludeName = lang ? (lang === "en" ? "Ar" : "En") : "";
  const langSuffix = lang ? (lang === "en" ? "En" : "Ar") : "";

  try {
    await connectDB();

    // Validate that the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID format" },
        { status: 400 },
      );
    }

    const product = await Product.findOne(
      { _id: id, ...query },
      {
        ...(bothLangs
          ? {}
          : {
              [`name${excludeName}`]: 0,
              [`address${excludeName}`]: 0,
              [`description${excludeName}`]: 0,
              services: { [`name${excludeName}`]: 0 },
              useCases: { [`name${excludeName}`]: 0 },
              specs: {
                [`key${excludeName}`]: 0,
                [`value${excludeName}`]: 0,
              },
              features: {
                [`title${excludeName}`]: 0,
                [`desc${excludeName}`]: 0,
              },
              ...(!fields && !excludeFields
                ? {
                    [`seoTitle${excludeName}`]: 0,
                    [`seoDescription${excludeName}`]: 0,
                  }
                : {}),
            }),
      },
    ).populate({
      path: "owner",
      select:
        "fullName email premium createdAt pathName avatar rating isOnline lastSeen accountType documentCode hasBranches branches companyDetails.taxCode hasShop holidayPeriods",
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const productObj = product.toObject();
    const transformedProduct = {
      ...productObj,
      name: productObj[`name${langSuffix}`],
      description: productObj[`description${langSuffix}`],
      address: productObj[`address${langSuffix}`],
      services: productObj.services?.map((service) => {
        const tempService = { ...service, name: service[`name${langSuffix}`] };
        if (!bothLangs) {
          delete tempService.nameEn;
          delete tempService.nameAr;
        }
        return tempService;
      }),
      useCases: productObj.useCases?.map((uc) => {
        const tempUc = { ...uc, name: uc[`name${langSuffix}`] };
        if (!bothLangs) {
          delete tempUc.nameEn;
          delete tempUc.nameAr;
        }
        return tempUc;
      }),
      specs: productObj.specs?.map((spec) => {
        const tempSpec = {
          ...spec,
          key: spec[`key${langSuffix}`],
          value: spec[`value${langSuffix}`],
        };
        if (!bothLangs) {
          delete tempSpec.keyEn;
          delete tempSpec.keyAr;
          delete tempSpec.valueEn;
          delete tempSpec.valueAr;
        }
        return tempSpec;
      }),
      features: productObj.features?.map((feat) => {
        const tempFeat = {
          ...feat,
          title: feat[`title${langSuffix}`],
          desc: feat[`desc${langSuffix}`],
        };
        if (!bothLangs) {
          delete tempFeat.titleEn;
          delete tempFeat.titleAr;
          delete tempFeat.descEn;
          delete tempFeat.descAr;
        }
        return tempFeat;
      }),
      owner: productObj.owner
        ? {
            ...productObj.owner,
            branches: productObj.owner.branches?.map((branch) => ({
              ...branch,
              name: branch.name[lang || "ar"],
              address: branch.address[lang || "ar"],
            })),
          }
        : undefined,
    };

    if (
      !excludeFields?.includes("seo") &&
      (fields?.includes("seo") || !fields)
    ) {
      transformedProduct.seoTitle =
        productObj[`seoTitle${langSuffix}`] || productObj.seoTitle;
      transformedProduct.seoDescription =
        productObj[`seoDescription${langSuffix}`] || productObj.seoDescription;

      if (!bothLangs) {
        delete transformedProduct.seoTitleEn;
        delete transformedProduct.seoTitleAr;
        delete transformedProduct.seoDescriptionEn;
        delete transformedProduct.seoDescriptionAr;
      }
    }

    // Remove all language-specific fields if not requested
    if (!bothLangs) {
      delete transformedProduct.nameEn;
      delete transformedProduct.nameAr;
      delete transformedProduct.descriptionEn;
      delete transformedProduct.descriptionAr;
      delete transformedProduct.addressEn;
      delete transformedProduct.addressAr;
    }

    return NextResponse.json({ success: true, data: transformedProduct });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]",
      method: "GET",
      req,
      id,
    });
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    const data = await req.json();

    if (data?.approved !== undefined || data?.rejected !== undefined)
      return NextResponse.json(
        { success: false, error: "not allowed" },
        { status: 403 },
      );

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Check if user owns the product
    if (
      user.accountType !== "admin" &&
      product.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this product" },
        { status: 403 },
      );
    }

    if (data.hidden === false || data.hidden === true) {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { hidden: data.hidden },
        { new: true },
      );
      return NextResponse.json({ success: true, data: updatedProduct });
    }

    // Handle isMain update (admin only)
    if (data.isMain === false || data.isMain === true) {
      if (user.accountType !== "admin") {
        return NextResponse.json(
          { success: false, error: "Only admins can set main products" },
          { status: 403 },
        );
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { isMain: data.isMain },
        { new: true },
      );
      return NextResponse.json({ success: true, data: updatedProduct });
    }

    // Handle image updates if any
    if (data.productImages) {
      const imageUrls = await Promise.all(
        data.productImages.map(async (image) => {
          if (image.preview.startsWith("http")) {
            return {
              preview: image.preview,
              gradientColors: image.gradientColors,
              gradientStyle: image.gradientStyle,
            };
          }
          const result = await cloudinary.uploader.upload(image.preview, {
            folder: "products",
            format: "webp",
          });
          return {
            preview: result.secure_url,
            gradientColors: image.gradientColors,
            gradientStyle: image.gradientStyle,
          };
        }),
      );
      data.images = imageUrls;
    }

    // Ensure packages have valid unit values (must be one of: days, weeks, months)
    if (data.rental?.packages) {
      const validUnits = ["hours", "days", "weeks", "months"];
      data.rental.packages = data.rental.packages.map((pkg) => ({
        ...pkg,
        unit: validUnits.includes(pkg.unit) ? pkg.unit : "days",
      }));
    }

    if (
      data.rental?.delivery?.pricingModel === "fixedCity" &&
      (!data.rental?.delivery?.fixedCityPricing ||
        data.rental.delivery.fixedCityPricing.length === 0)
    ) {
      return NextResponse.json(
        { error: "Delivery city is required for fixed city pricing model" },
        { status: 400 },
      );
    }

    const updatedStatus = {};
    if (product.rejected) {
      updatedStatus.rejected = false;
      updatedStatus.approved = false;
      updatedStatus.rejectMessage = undefined;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...data,
        addressAr: {
          ...data.addressAr,
          city: data.addressAr?.city?.replace("امارة منطقة الرياض", "الرياض"),
        },
        ...updatedStatus,
        location: {
          type: "Point",
          coordinates: [data.location.lng, data.location.lat],
        },
        $unset: product.rejected ? { rejectMessage: 1 } : {},
      },
      { new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]",
      method: "PATCH",
      id,
      req,
    });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Check if user owns the product
    if (
      user.accountType !== "admin" &&
      product.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this product" },
        { status: 403 },
      );
    }

    // Soft delete: mark as deleted instead of permanent deletion
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { deleted: true, deletedAt: new Date() },
      { new: true },
    );

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/products/[id]",
      method: "DELETE",
      id,
      req,
    });
  }
}
