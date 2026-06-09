import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import User from "@/models/User";
import mongoose from "mongoose";
import { handleApiError } from "@/lib/errorHandler";

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
  maxDuration: 20,
};

import { updateAlert } from "@/lib/alert";

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const data = await req.json();

    if (!data.productImages || !Array.isArray(data.productImages))
      return NextResponse.json(
        { error: "Invalid product images" },
        { status: 400 },
      );
    if (!data.location || !data.location.lat || !data.location.lng)
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    if (!data.category)
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    if (!data.nameEn || !data.nameAr)
      return NextResponse.json(
        { error: "Product name in both languages is required" },
        { status: 400 },
      );
    if (!data.descriptionEn || !data.descriptionAr)
      return NextResponse.json(
        { error: "Product description in both languages is required" },
        { status: 400 },
      );
    if (!data.addressEn || !data.addressAr)
      return NextResponse.json(
        { error: "Product address in both languages is required" },
        { status: 400 },
      );
    if (!data.rental?.value && data.pricingModel !== "packages")
      return NextResponse.json(
        { error: "Rental value is required" },
        { status: 400 },
      );

    if (!data.rental?.value && data.pricingModel === "packages")
      data.rental.value = 0;

    if (data.pricingModel === "packages" && !data.rental?.packages?.length) {
      return NextResponse.json(
        { error: "Packages are required" },
        { status: 400 },
      );
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

    if (data.rental?.discountTiers && data.rental.discountTiers.length > 0) {
      data.rental.discountTiers.forEach((tier) => {
        if (!tier.minDays || !tier.discount)
          return NextResponse.json(
            { error: "Discount tiers must have minDays and discount" },
            { status: 400 },
          );
      });
    }

    if (
      data.rental?.quantityDiscountTiers &&
      data.rental.quantityDiscountTiers.length > 0
    ) {
      data.rental.quantityDiscountTiers.forEach((tier) => {
        if (!tier.minQuantity || !tier.discount)
          return NextResponse.json(
            {
              error:
                "Quantity discount tiers must have minQuantity and discount",
            },
            { status: 400 },
          );
      });
    }
    if (data.rental?.packages) {
      data.rental.packages.forEach((pkg) => {
        if (!pkg.duration || !pkg.price)
          return NextResponse.json(
            { error: "Packages must have duration and price" },
            { status: 400 },
          );
      });
      const validUnits = ["hours", "days", "weeks", "months"];
      data.rental.packages = data.rental.packages.map((pkg) => ({
        ...pkg,
        unit: validUnits.includes(pkg.unit) ? pkg.unit : "days",
      }));
    }

    // Upload images to cloudinary and construct image objects
    const images = await Promise.all(
      data.productImages.map(async (image) => {
        const uploaded = await cloudinary.uploader.upload(image.preview, {
          folder: "products",
          format: "webp",
        });
        return {
          preview: uploaded.secure_url,
          gradientColors: image.gradientColors,
          gradientStyle: image.gradientStyle,
        };
      }),
    );

    const product = await Product.create({
      ...data,
      addressAr: {
        ...data.addressAr,
        city: data.addressAr?.city?.replace("امارة منطقة الرياض", "الرياض"),
      },
      images,
      location: {
        type: "Point",
        coordinates: [data.location.lng, data.location.lat],
      },
      owner: user._id,
    });
    user.productsCount = (user.productsCount || 0) + 1;
    if (!user?.location?.lat) {
      user.location = { lat: data.location.lat, lng: data.location.lng };
      user.address = [
        data.addressAr?.neighborhood,
        data.addressAr?.city,
        data.addressAr?.governorate,
        data.addressAr?.country,
      ]
        .filter(Boolean)
        .join(", ");
    }
    await user.save();
    await updateAlert("product", product._id);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products",
      method: "POST",
      req,
    });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const fetchAll = searchParams.get("fetch");
    const maxLimit = fetchAll === "all" ? 5000 : 100;
    const limit =
      (parseInt(searchParams.get("limit")) || 10) > maxLimit
        ? maxLimit
        : parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const bounds = searchParams.get("bounds");
    const userId = searchParams.get("userId");
    const shopCategory = searchParams.get("shopCategory");
    const fields = searchParams.get("fields");
    const excludeFields = searchParams.get("excludeFields");
    const lang = searchParams.get("lang");
    const name = searchParams.get("name");
    const isNana = searchParams.get("nana") === "true";
    const deliveryType = searchParams.get("deliveryType");
    const compressed = searchParams.get("compressed");
    const excludeProducts = searchParams.get("excludeProducts");
    const approved = searchParams.get("approved") === "true";
    const rejected = searchParams.get("rejected") === "true";
    const showAll = searchParams.get("showAll") === "true";
    const owner = searchParams.get("owner") === "true";
    const showDeleted = searchParams.get("showDeleted") === "true";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy");
    const random = searchParams.get("random") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const providerId = searchParams.get("providerId");
    const langSuffix = lang ? (lang === "en" ? "En" : "Ar") : "";
    const pipeline = [];

    if (name) {
      pipeline.push({
        $search: {
          index: "products_search",
          compound: {
            should: [
              // Autocomplete match on nameAr - HIGHEST priority
              {
                autocomplete: {
                  query: name,
                  path: "nameAr",
                  score: { boost: { value: 20 } },
                  tokenOrder: "sequential",
                },
              },
              // Autocomplete match on nameEn - HIGHEST priority
              {
                autocomplete: {
                  query: name,
                  path: "nameEn",
                  score: { boost: { value: 20 } },
                  tokenOrder: "sequential",
                },
              },
              // Exact phrase match in name - very high priority
              {
                phrase: {
                  query: name,
                  path: ["nameAr", "nameEn"],
                  score: { boost: { value: 20 } },
                },
              },
              // Fuzzy text match in name - medium priority
              {
                text: {
                  query: name,
                  path: ["nameAr", "nameEn"],
                  score: { boost: { value: 1 } },
                  fuzzy: { maxEdits: 1, prefixLength: 2 },
                },
              },
              // Description match - very low priority
              {
                text: {
                  query: name,
                  path: ["descriptionAr", "descriptionEn"],
                  score: { boost: { value: 1 } },
                  fuzzy: { maxEdits: 1 },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      });

      pipeline.push({
        $addFields: {
          score: { $meta: "searchScore" },
        },
      });
    }
    let matchQuery = showAll
      ? {}
      : { approved: true, rejected: false, hidden: false };

    if (!showDeleted && status !== "deleted") {
      matchQuery.deleted = { $ne: true };
    }

    if (deliveryType) matchQuery["rental.delivery.type"] = deliveryType;

    if (isNana) matchQuery.nana = true;

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
      } else if (status === "hidden") {
        matchQuery = { hidden: true, deleted: { $ne: true } };
      } else if (status === "deleted") {
        matchQuery = { deleted: true };
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
    }

    if (userId) {
      const user =
        userId.length === 24
          ? { _id: userId }
          : await User.findOne({ $or: [{ pathName: userId }] }, { _id: 1 });
      if (user) {
        matchQuery.owner = new mongoose.Types.ObjectId(user._id);
      }
    }

    if (category) matchQuery.category = category;
    if (subCategory) matchQuery.subCategory = subCategory;
    if (shopCategory) {
      if (mongoose.isValidObjectId(shopCategory)) {
        matchQuery.shopCategories = {
          $in: [new mongoose.Types.ObjectId(shopCategory), shopCategory],
        };
      } else matchQuery.shopCategories = shopCategory;
    }
    if (approved) matchQuery.approved = approved;
    if (rejected) matchQuery.rejected = rejected;

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchQuery.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = end;
      }
    }

    if (bounds) {
      const { north, south, east, west } = JSON.parse(bounds);
      matchQuery.location = {
        $geoWithin: {
          $box: [
            [west, south],
            [east, north],
          ],
        },
      };
    }
    if (excludeProducts) {
      matchQuery._id = {
        $nin: excludeProducts
          .split(",")
          .map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (providerId) {
      matchQuery.providers = new mongoose.Types.ObjectId(providerId);
    }

    pipeline.push({ $match: matchQuery });

    let sort = {};
    if (name) {
      sort = { score: -1 };
    } else if (sortBy === "newest") {
      sort = { _id: -1 };
    } else if (sortBy === "discounts") {
      sort = { "rental.discountTiers.0.discount": -1, _id: -1 };
      if (random) matchQuery["rental.discountTiers.0"] = { $exists: true };
    } else if (sortBy === "bestSelling") {
      sort = { "sales.monthlyCount": -1, "sales.totalCount": -1, _id: -1 };
    } else if (sortBy === "highestRated") {
      sort = { "rating.average": -1, "rating.count": -1, _id: -1 };
    } else if (sortBy === "mostLiked") {
      sort = { lovedCount: -1, _id: -1 };
    } else if (sortBy === "date-desc") {
      sort = { _id: -1 };
    } else if (sortBy === "date-asc") {
      sort = { _id: 1 };
    } else if (sortBy) {
      sort = { [sortBy]: -1, _id: -1 };
    } else {
      sort = { _id: -1 };
    }
    if (!random) pipeline.push({ $sort: sort });

    let projection = {};
    if (fields) {
      const fieldList = fields.split(",");
      fieldList.forEach((field) => {
        if (compressed) {
          if (field === "images") {
            projection["images"] = { $slice: ["$images", 1] };
          } else if (field === "location") {
            projection["location"] = { coordinates: 1 };
          } else if (field === "rental") {
            projection.rental = {
              value: "$rental.value",
              discountTiers: {
                $filter: {
                  input: "$rental.discountTiers",
                  as: "tier",
                  cond: { $eq: ["$$tier.minDays", 1] },
                },
              },
              packages: { $slice: ["$rental.packages", 1] },
            };
            projection.rental.delivery = 1;
          } else {
            projection[field] = 1;
          }
        } else {
          projection[field] = 1;
        }
      });
      projection._id = 1;
    }

    if (!fields && excludeFields) {
      const excludeList = excludeFields.split(",");
      excludeList.forEach((field) => {
        projection[field] = 0;
      });
    }
    if (Object.keys(projection).length > 0) {
      pipeline.push({ $project: projection });
    }

    const skip = excludeProducts ? 0 : (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.aggregate([
        ...pipeline,
        ...(random
          ? [{ $sample: { size: limit } }]
          : [{ $skip: skip }, { $limit: limit }]),
      ]),
      Product.countDocuments(matchQuery),
    ]);

    if (owner) {
      await Product.populate(products, {
        path: "owner",
        select: "fullName email phone avatar companyDetails.taxCode",
      });
    } else if (fields?.includes("owner")) {
      // Populate only taxCode for public product listings to determine tax application
      await Product.populate(products, {
        path: "owner",
        select: "companyDetails.taxCode",
      });
    }

    if (lang && products.length > 0) {
      products.forEach((product) => {
        if (
          !excludeFields?.includes("name") &&
          (fields?.includes("name") || !fields)
        ) {
          product.name = product[`name${langSuffix}`] || product.name;
          delete product.nameEn;
          delete product.nameAr;
        }
        if (
          !excludeFields?.includes("description") &&
          (fields?.includes("description") || !fields)
        ) {
          product.description =
            product[`description${langSuffix}`] || product.description;
          delete product.descriptionEn;
          delete product.descriptionAr;
        }
        if (
          !excludeFields?.includes("seo") &&
          (fields?.includes("seo") || !fields)
        ) {
          product.seoTitle =
            product[`seoTitle${langSuffix}`] || product.seoTitle;
          product.seoDescription =
            product[`seoDescription${langSuffix}`] || product.seoDescription;
          delete product.seoTitleEn;
          delete product.seoTitleAr;
          delete product.seoDescriptionEn;
          delete product.seoDescriptionAr;
        }
        if (
          !excludeFields?.includes("address") &&
          (fields?.includes("address") || !fields)
        ) {
          product.address = product[`address${langSuffix}`] || product.address;
          delete product.addressEn;
          delete product.addressAr;
        }
        if (
          !excludeFields?.includes("services") &&
          (fields?.includes("services") || !fields) &&
          product.services
        ) {
          product.services = product.services.map((service) => {
            const transformedService = {
              ...service,
              name: service[`name${langSuffix}`] || service.name,
            };
            delete transformedService.nameEn;
            delete transformedService.nameAr;
            return transformedService;
          });
        }
        if (
          !excludeFields?.includes("useCases") &&
          (fields?.includes("useCases") || !fields) &&
          product.useCases
        ) {
          product.useCases = product.useCases.map((uc) => {
            const transformedUc = {
              ...uc,
              name: uc[`name${langSuffix}`] || uc.name,
            };
            delete transformedUc.nameEn;
            delete transformedUc.nameAr;
            return transformedUc;
          });
        }
        if (
          !excludeFields?.includes("specs") &&
          (fields?.includes("specs") || !fields) &&
          product.specs
        ) {
          product.specs = product.specs.map((spec) => {
            const transformedSpec = {
              ...spec,
              key: spec[`key${langSuffix}`] || spec.key,
              value: spec[`value${langSuffix}`] || spec.value,
            };
            delete transformedSpec.keyEn;
            delete transformedSpec.keyAr;
            delete transformedSpec.valueEn;
            delete transformedSpec.valueAr;
            return transformedSpec;
          });
        }
        if (
          !excludeFields?.includes("features") &&
          (fields?.includes("features") || !fields) &&
          product.features
        ) {
          product.features = product.features.map((feat) => {
            const transformedFeat = {
              ...feat,
              title: feat[`title${langSuffix}`] || feat.title,
              desc: feat[`desc${langSuffix}`] || feat.desc,
            };
            delete transformedFeat.titleEn;
            delete transformedFeat.titleAr;
            delete transformedFeat.descEn;
            delete transformedFeat.descAr;
            return transformedFeat;
          });
        }
      });
    }
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        pages: totalPages,
        page,
        limit,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products",
      method: "GET",
      req,
    });
  }
}
