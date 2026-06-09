import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import fs from "fs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Category from "@/models/Category";
import McpAuthCode from "@/models/McpAuthCode";
import cloudinary from "@/lib/cloudinary";
import { updateAlert } from "@/lib/alert";
import waffyAuth from "@/lib/waffy-auth";
import { NafathService } from "@/lib/nafath";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";

// ---------------------------------------------------------------------------
// Helper: call an internal Estajer API route (loopback-aware with fallback)
// ---------------------------------------------------------------------------
async function callInternal(path, params = {}, options = {}) {
  const port = process.env.PORT || 3000;
  const urlsToTry = [`http://127.0.0.1:${port}${path}`, `${BASE_URL}${path}`];

  let lastError;
  for (const baseUrl of urlsToTry) {
    try {
      const url = new URL(baseUrl);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, String(v));
        }
      });

      // Abort controller to prevent hanging forever on localhost if port is wrong
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(url.toString(), {
        cache: "no-store",
        signal: controller.signal,
        ...options,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }
      return res.json();
    } catch (err) {
      console.warn(`Failed internal fetch to ${baseUrl}:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error("Failed to call internal endpoint");
}

// ---------------------------------------------------------------------------
// Derive the human-readable pricing summary from a product object.
// Mirrors the logic in Product.jsx and the Product schema.
// ---------------------------------------------------------------------------
function buildPricingSummary(product) {
  const { pricingModel, rental } = product;
  const TAX_RATE = 0.15;
  const hasTax = !!product.owner?.companyDetails?.taxCode;

  const withTax = (price) =>
    hasTax ? Math.round(price * (1 + TAX_RATE)) : price;

  if (pricingModel === "packages") {
    // Packages: fixed-price bundles (e.g. "150 SAR per 3 days")
    const packages = (rental?.packages || []).map((pkg) => ({
      duration: pkg.duration,
      unit: pkg.unit, // "hours" | "days" | "weeks" | "months"
      price_sar: withTax(pkg.price),
      price_before_tax_sar: pkg.price,
      label: `${pkg.duration} ${pkg.unit}`,
    }));

    return {
      pricing_type: "packages",
      pricing_type_description:
        "Fixed packages: customer picks a bundle (duration + price). NOT charged per day.",
      currency: "SAR",
      tax_included: hasTax,
      packages,
      has_discount: false,
    };
  }

  // perDay pricing
  const basePrice = rental?.value ?? 0;
  const priceWithTax = withTax(basePrice);

  // Discount tiers: each tier has minDays (rent X+ days → get % off)
  const discountTiers = (rental?.discountTiers || []).map((tier) => ({
    min_days: tier.minDays,
    discount_percent: tier.discount,
    discounted_price_sar: withTax(tier.discountPrice ?? basePrice),
    date_ranges: tier.dateRanges?.length
      ? tier.dateRanges.map((r) => ({ from: r.from, to: r.to }))
      : null,
  }));

  const hasDiscount = discountTiers.length > 0;
  const firstDiscount = hasDiscount ? discountTiers[0] : null;

  // Quantity discount tiers
  const quantityDiscountTiers = (rental?.quantityDiscountTiers || []).map(
    (tier) => ({
      min_quantity: tier.minQuantity,
      discount_percent: tier.discount,
    }),
  );

  return {
    pricing_type: "per_day",
    pricing_type_description:
      "Daily rental: customer chooses number of days. Total = price_per_day × days (before any discounts).",
    currency: "SAR",
    tax_included: hasTax,
    price_per_day_sar: priceWithTax,
    price_per_day_before_tax_sar: basePrice,
    has_discount: hasDiscount,
    active_discount: firstDiscount
      ? {
          discount_percent: firstDiscount.discount_percent,
          discounted_price_per_day_sar: firstDiscount.discounted_price_sar,
          applies_from_days: firstDiscount.min_days,
          description: `${firstDiscount.discount_percent}% off when renting ${firstDiscount.min_days}+ days → ${firstDiscount.discounted_price_sar} SAR/day`,
        }
      : null,
    all_discount_tiers: discountTiers,
    quantity_discount_tiers: quantityDiscountTiers.length
      ? quantityDiscountTiers
      : null,
  };
}

// ---------------------------------------------------------------------------
// Build a delivery summary
// ---------------------------------------------------------------------------
function buildDeliverySummary(rental) {
  const d = rental?.delivery;
  if (!d?.type) return { available: false };

  const typeMap = {
    receive: "customer picks up (no delivery)",
    delivery: "seller delivers — cost varies",
    free: "free delivery by seller",
    deliveryCompany: "third-party delivery company",
  };

  const result = {
    available: true,
    delivery_type: d.type,
    delivery_type_description: typeMap[d.type] ?? d.type,
  };

  if (d.type === "delivery" || d.type === "deliveryCompany") {
    if (d.pricingModel === "fixedCity") {
      result.delivery_pricing = "fixed price per city";
      result.city_prices = (d.fixedCityPricing || []).map((c) => ({
        location:
          c.displayName ||
          c.governorateEn ||
          c.governorateAr ||
          c.cityEn ||
          c.cityAr ||
          "Unknown",
        price_sar: c.price,
        free_delivery: c.price === 0,
      }));
    } else {
      result.delivery_pricing = "per km";
      result.cost_per_km_sar = d.cost ?? null;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Shape a product for list results (search_products tool)
// ---------------------------------------------------------------------------
function formatProduct(product) {
  const pricing = buildPricingSummary(product);
  const delivery = buildDeliverySummary(product.rental);

  return {
    id: product._id,
    name: product.name || product.nameEn || product.nameAr,
    category: product.category,
    sub_category: product.subCategory ?? null,
    rating:
      product.rating?.count > 0
        ? { average: product.rating.average, count: product.rating.count }
        : null,
    image_url: product.images?.[0]?.preview ?? null,
    pricing,
    delivery,
    product_url: `${BASE_URL}/products/${product._id}`,
  };
}

// ---------------------------------------------------------------------------
// Shape a product for full detail (get_product tool)
// ---------------------------------------------------------------------------
function formatProductDetail(product) {
  const base = formatProduct(product);

  return {
    ...base,
    description:
      product.description ||
      product.descriptionEn ||
      product.descriptionAr ||
      null,
    address: product.address ?? null,
    quantity_available: product.quantity ?? null,
    min_quantity: product.minQuantity ?? 1,
    condition: product.status ?? null, // "excellent" | "veryGood" | "good"
    insurance_sar: product.rental?.insurance ?? 0,
    min_rental_days: product.rental?.minDays ?? 1,
    specs: product.specs?.length ? product.specs : null,
    features: product.features?.length ? product.features : null,
    use_cases: product.useCases?.length ? product.useCases : null,
    services: product.services?.length
      ? product.services.map((s) => ({
          name: s.name || s.nameEn || s.nameAr,
          price_sar: s.price,
          pricing_type: s.pricingType, // "perDay" | "fixed"
          quantity: s.quantity,
        }))
      : null,
    owner: product.owner
      ? {
          name: product.owner.fullName,
          rating: product.owner.rating,
          is_online: product.owner.isOnline,
          premium: product.owner.premium ?? false,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Helpers for Product Management Tools (add_product, edit_product)
// ---------------------------------------------------------------------------

async function validateCategory(category, subCategory) {
  try {
    await connectDB();

    // Find active main category by key
    const mainCat = await Category.findOne({
      key: category,
      parentCategory: null,
      status: "active",
    });
    if (!mainCat) {
      const allActiveCats = await Category.find({
        parentCategory: null,
        status: "active",
      }).select("key");
      const validKeys = allActiveCats.map((c) => c.key);
      return {
        valid: false,
        error: "INVALID_CATEGORY",
        message: `Category '${category}' does not exist. Call get_categories to see valid keys.`,
        valid_category_keys: validKeys,
      };
    }

    // If subCategory is specified, validate it exists as a child of the main category
    if (subCategory) {
      const subCatObj = await Category.findOne({
        key: subCategory,
        parentCategory: mainCat._id,
        status: "active",
      });
      if (!subCatObj) {
        const allActiveSubs = await Category.find({
          parentCategory: mainCat._id,
          status: "active",
        }).select("key");
        const validSubs = allActiveSubs.map((s) => s.key);
        return {
          valid: false,
          error: "INVALID_SUBCATEGORY",
          message: `Subcategory '${subCategory}' does not exist in category '${category}'. Pick from the valid list.`,
          valid_subcategory_keys: validSubs,
        };
      }
    }
  } catch (catErr) {
    console.error("MCP category validation error:", catErr);
  }
  return { valid: true };
}

async function resolveCoordinates(lat, lng) {
  const addressAr = {
    country: "",
    governorate: "",
    city: "",
    neighborhood: "",
  };
  const addressEn = {
    country: "",
    governorate: "",
    city: "",
    neighborhood: "",
  };
  try {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const [geoResAr, geoResEn] = await Promise.all([
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=ar`,
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=en`,
      ),
    ]);
    const geoDataAr = await geoResAr.json();
    const geoDataEn = await geoResEn.json();

    const parseComponents = (results, addressObj) => {
      if (results && results.length > 0) {
        const comps = results[0].address_components;
        const typeToField = {
          country: "country",
          administrative_area_level_1: "governorate",
          administrative_area_level_2: "city",
          locality: "city",
          neighborhood: "neighborhood",
          sublocality_level_1: "neighborhood",
          administrative_area_level_3: "neighborhood",
        };
        comps.forEach((c) => {
          const compType = c.types.find((t) => typeToField[t]);
          if (compType) {
            const field = typeToField[compType];
            if (!addressObj[field]) addressObj[field] = c.long_name;
          }
        });
      }
    };

    if (geoResAr.ok) parseComponents(geoDataAr.results, addressAr);
    if (geoResEn.ok) parseComponents(geoDataEn.results, addressEn);
  } catch (e) {
    console.error("MCP Geocoding error:", e);
  }

  if (addressAr.city) {
    addressAr.city = addressAr.city.replace("امارة منطقة الرياض", "الرياض");
  }

  return { addressAr, addressEn };
}

async function processProductImages(images, auth_code) {
  const uploadedImages = [];
  for (const img of images) {
    // ── Full image object from the upload page → use directly ─────────────
    // Shape: { preview: "https://...", gradientColors: [...], gradientStyle: "..." }
    if (img && typeof img === "object" && img.preview) {
      uploadedImages.push({
        preview: img.preview,
        ...(img.gradientColors ? { gradientColors: img.gradientColors } : {}),
        ...(img.gradientStyle ? { gradientStyle: img.gradientStyle } : {}),
      });
      continue;
    }

    const url = typeof img === "string" ? img : String(img);

    // ── Already hosted on our Cloudinary account → use directly ──────────
    if (url.startsWith("https://res.cloudinary.com/dhfzkadm2")) {
      uploadedImages.push({ preview: url });
      continue;
    }

    // ── Local file path → user must use the browser upload page ──────────
    if (url.startsWith("file:///")) {
      return {
        success: false,
        error: "IMAGE_LOCAL_PATH",
        message:
          "The image is a local file on your device. The MCP server cannot read local files directly. " +
          "Please open the upload page in your browser, upload the image(s), then copy the JSON array " +
          "and paste it back into the chat so I can use it.",
        upload_page_url: `${BASE_URL}/ar/mcp-upload-images?auth_code=${auth_code}`,
        next_step:
          "Open the upload_page_url in your browser → upload all images → click 'Copy Array' → paste the JSON array back here.",
      };
    }

    // ── External URL → upload to Cloudinary ──────────────────────────────
    const uploaded = await cloudinary.uploader.upload(url, {
      folder: "products",
      format: "webp",
      transformation: [{ width: 1500, height: 1500, crop: "limit" }],
    });
    uploadedImages.push({
      preview: uploaded.secure_url,
    });
  }
  return { success: true, uploadedImages };
}

// ---------------------------------------------------------------------------
// MCP handler — three read-only tools
// ---------------------------------------------------------------------------
const handler = createMcpHandler(
  (server) => {
    // ── Tool 1: search_products ────────────────────────────────────────────
    server.tool(
      "search_products",
      [
        "Search rental products on Estajer marketplace.",
        "Returns a list where each product includes: name, category, pricing (per-day OR packages with exact prices and any active discounts), delivery options, rating, and image.",
        "Use the 'id' field to call get_product for full details.",
        "Set 'priceOnly' to true when searching for price suggestions to minimize token usage.",
      ].join(" "),
      {
        name: z
          .string()
          .optional()
          .describe(
            "Keyword to search by product name or description. Use this field — NOT 'query'.",
          ),
        query: z
          .string()
          .optional()
          .describe("Alias for 'name' — use if name is not available."),
        category: z
          .string()
          .optional()
          .describe("Main category key (e.g. 'electronics', 'furniture')"),
        subCategory: z.string().optional().describe("Subcategory key"),
        sortBy: z
          .enum([
            "newest",
            "discounts",
            "bestSelling",
            "highestRated",
            "mostLiked",
            "date-desc",
            "date-asc",
          ])
          .optional()
          .describe("Sort order"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Number of results per page (max 50)"),
        page: z.number().int().min(1).default(1).describe("Page number"),
        lang: z
          .enum(["ar", "en"])
          .default("en")
          .describe("Language for returned names/descriptions"),
        bounds: z
          .string()
          .optional()
          .describe(
            'Geo filter as JSON, e.g. {"north":25,"south":24,"east":47,"west":46}',
          ),
        priceOnly: z
          .boolean()
          .default(false)
          .describe(
            "If true, returns only name, category, subcategory, and simplified price to minimize token usage.",
          ),
      },
      async ({
        name,
        query,
        category,
        subCategory,
        sortBy,
        limit,
        page,
        lang,
        bounds,
        priceOnly,
      }) => {
        // Accept `query` as alias for `name`
        const searchName = name || query;
        // Atlas Search stage, so pagination.total is always wrong (it counts
        // ALL approved products). Fix: fetch with limit=100 internally so we
        // can compute the real total, then slice down to the requested limit.
        const internalLimit = searchName ? 100 : limit;
        const data = await callInternal("/api/products", {
          name: searchName,
          category,
          subCategory,
          sortBy,
          limit: internalLimit,
          page,
          lang,
          bounds,
          excludeFields:
            "descriptionAr,descriptionEn,seoTitleAr,seoTitleEn,seoDescriptionAr,seoDescriptionEn,specs,features,useCases,services,vomId,providers,shopCategories",
        });

        if (!data.success) {
          return {
            content: [{ type: "text", text: `Error: ${JSON.stringify(data)}` }],
          };
        }

        const allProducts = (data.data || []).map((prod) => {
          if (priceOnly) {
            const pricing = buildPricingSummary(prod);
            const simplifiedPrice = {};
            if (pricing.pricing_type === "packages") {
              simplifiedPrice.pricing_type = "packages";
              simplifiedPrice.packages = (pricing.packages || [])
                .slice(0, 2)
                .map((pkg) => ({
                  duration: pkg.duration,
                  unit: pkg.unit,
                  price_sar: pkg.price_sar,
                }));
            } else {
              simplifiedPrice.pricing_type = "per_day";
              simplifiedPrice.price_per_day_sar = pricing.price_per_day_sar;
              if (pricing.active_discount) {
                simplifiedPrice.active_discount = {
                  discounted_price_per_day_sar:
                    pricing.active_discount.discounted_price_per_day_sar,
                  applies_from_days: pricing.active_discount.applies_from_days,
                };
              }
            }
            return {
              id: prod._id,
              name: prod.name || prod.nameEn || prod.nameAr,
              category: prod.category,
              sub_category: prod.subCategory ?? null,
              pricing: simplifiedPrice,
            };
          }
          return formatProduct(prod);
        });

        // Slice down to requested limit for the actual response
        const requestedLimit = limit ?? 10;
        const products = searchName
          ? allProducts.slice(0, requestedLimit)
          : allProducts;

        let pagination = data.pagination;
        if (searchName) {
          // allProducts.length is the real total for this page's search results
          // (since we fetched up to 100). If it's still 100, more may exist.
          const realTotal =
            allProducts.length < internalLimit
              ? (page - 1) * internalLimit + allProducts.length
              : null; // >100 results — unknown

          pagination = {
            results_this_page: products.length,
            total_matched: realTotal,
            page: data.pagination.page,
            limit: requestedLimit,
            has_more:
              realTotal === null || products.length < allProducts.length,
            total_note:
              realTotal !== null
                ? `${realTotal} products match this search.`
                : "More than 100 results exist — narrow the search with category, bounds, or a more specific name.",
          };
        }

        const result = {
          products,
          pagination,
          _note:
            "pricing.pricing_type tells you if it's per_day or packages. " +
            "pricing.has_discount=true means there's a discount active. " +
            "Call get_product with the product id for full details including description, specs, and services.",
        };

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      },
    );

    // ── Tool 2: get_product ────────────────────────────────────────────────
    server.tool(
      "get_product",
      [
        "Get complete details of a single rental product by its ID.",
        "Includes full pricing breakdown (perDay or packages, all discount tiers, quantity discounts),",
        "delivery options, insurance, minimum rental days, specs, features, use cases, and add-on services.",
      ].join(" "),
      {
        id: z
          .string()
          .length(24)
          .describe("MongoDB ObjectId of the product (24 hex characters)"),
        lang: z
          .enum(["ar", "en"])
          .default("en")
          .describe("Language for returned text fields"),
      },
      async ({ id, lang }) => {
        const data = await callInternal(`/api/products/${id}`, { lang });
        if (!data.success) {
          return {
            content: [{ type: "text", text: `Error: ${JSON.stringify(data)}` }],
          };
        }

        const product = formatProductDetail(data.data);
        return {
          content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
        };
      },
    );

    // ── Tool 3: get_categories ─────────────────────────────────────────────
    server.tool(
      "get_categories",
      "List all main rental categories on Estajer, optionally including subcategories and product counts.",
      {
        lang: z
          .enum(["ar", "en"])
          .default("en")
          .describe("Language for category names"),
        includeSubcategories: z
          .boolean()
          .default(false)
          .describe("Whether to include subcategories in the response"),
        includeProductCount: z
          .boolean()
          .default(false)
          .describe("Whether to include a count of products per category"),
        keysOnly: z
          .boolean()
          .default(true)
          .describe(
            "Whether to return only keys and subcategory keys to reduce token usage.",
          ),
      },
      async ({ lang, includeSubcategories, includeProductCount, keysOnly }) => {
        const data = await callInternal("/api/categories", {
          lang,
          mainOnly: "true",
          status: "active",
          includeSubcategories: includeSubcategories ? "true" : undefined,
          includeProductCount: includeProductCount ? "true" : undefined,
          keysOnly: keysOnly ? "true" : undefined,
        });

        if (!data.success) {
          return {
            content: [{ type: "text", text: `Error: ${JSON.stringify(data)}` }],
          };
        }

        // Shape categories for AI: key fields only
        const categories = (data.data || []).map((cat) => {
          if (keysOnly) {
            const item = { key: cat.key };
            if (includeSubcategories && cat.subcategories) {
              item.subcategories = cat.subcategories.map((sub) => ({
                key: sub.key,
              }));
            }
            return item;
          }
          return {
            key: cat.key,
            name: cat.name || cat.nameEn || cat.nameAr,
            image: cat.image ?? null,
            products_count: cat.productsCount ?? null,
            subcategories:
              cat.subcategories?.map((sub) => ({
                key: sub.key,
                name: sub.name || sub.nameEn || sub.nameAr,
                products_count: sub.productsCount ?? null,
              })) ?? null,
          };
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ categories }, null, 2),
            },
          ],
        };
      },
    );

    // ── Tool 4: get_auth_link ──────────────────────────────────────────────
    server.tool(
      "get_auth_link",
      [
        "Generate a one-time authorization link that the user must open in their browser to grant the AI permission to act on their behalf (e.g. add products).",
        "Show ONLY the auth_url to the user as a clickable link — nothing else. Do NOT show or mention the raw code string to the user.",
        "The link expires in 24 hours.",
        "After the user says they authorized (or clicked the link), call check_auth with the code to confirm.",
      ].join(" "),
      {}, // no input params
      async () => {
        try {
          const data = await callInternal(
            "/api/mcp/create-auth-code",
            {},
            { method: "POST" },
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    auth_url: data.auth_url,
                    _internal_code: data.code,
                    expires_in_minutes: data.expires_in_minutes,
                    instruction:
                      "Show ONLY the auth_url to the user as a clickable link. Do NOT display _internal_code. After user confirms they clicked, call check_auth with _internal_code.",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: `Error generating auth link: ${err.message}`,
              },
            ],
          };
        }
      },
    );

    // ── Tool 5: check_auth ─────────────────────────────────────────────────
    server.tool(
      "check_auth",
      [
        "Check if the user has completed authorization for a given auth code.",
        "Call this after the user says they clicked the authorization link.",
        "Returns authorized:true, the user's name/email, and the upload_images_url if successful.",
        "If not yet authorized, tell the user to click the link first.",
      ].join(" "),
      {
        code: z.string().describe("The auth code returned by get_auth_link"),
      },
      async ({ code }) => {
        try {
          const data = await callInternal("/api/mcp/auth", { code });
          if (data.authorized) {
            data.upload_images_url = `${BASE_URL}/ar/mcp-upload-images?auth_code=${code}`;
          }
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: false, error: err.message }),
              },
            ],
          };
        }
      },
    );

    // ── Tool 5.5: get_upload_images_link ───────────────────────────────────
    server.tool(
      "get_upload_images_link",
      [
        "Generate the Estajer upload images page URL for a given auth code.",
        "ALWAYS call this tool to get the upload URL when the user needs to upload product images. Do NOT suggest third-party websites (like imgbb.com, imgur, etc.).",
        "The URL MUST use the parameter name 'auth_code' (i.e. ?auth_code=...). Do NOT use 'code', 'code_auth', or any other parameter key.",
      ].join(" "),
      {
        auth_code: z.string().describe("The user authorization code"),
      },
      async ({ auth_code }) => {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  upload_images_url: `${BASE_URL}/ar/mcp-upload-images?auth_code=${auth_code}`,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    // ── Tool 6: mcp_verify_nafath_send ─────────────────────────────────────
    server.tool(
      "mcp_verify_nafath_send",
      [
        "Start the Nafath identity verification process for a user.",
        "Use this if add_product fails with NAFATH_REQUIRED.",
        "Asks the user for their 10-digit National ID, sends a push notification to their Nafath app,",
        "and returns a 2-digit matching random number. Instruct the user to open the Nafath app",
        "and select this matching number.",
      ].join(" "),
      {
        auth_code: z.string().describe("The user authorization code"),
        nationalId: z
          .string()
          .describe("The user's 10-digit Saudi National ID"),
        locale: z
          .enum(["ar", "en"])
          .default("en")
          .describe("Locale for the Nafath request"),
      },
      async ({ auth_code, nationalId, locale }) => {
        try {
          await connectDB();
          const record = await McpAuthCode.findOne({ code: auth_code });
          if (!record || !record.used || !record.userId) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "Invalid auth code",
                  }),
                },
              ],
            };
          }

          const existingUser = await User.findOne({ nationalId });
          if (
            existingUser &&
            existingUser._id.toString() !== record.userId.toString()
          ) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "National ID already registered to another account",
                  }),
                },
              ],
            };
          }

          const nafath = new NafathService();
          const requestId = nafath.generateRequestId();
          const service = "DigitalServiceEnrollmentWithoutBio";

          const response = await fetch(
            `${nafath.baseUrl}/api/v1/mfa/request?local=${locale}&requestId=${requestId}`,
            {
              method: "POST",
              headers: nafath.getHeaders(),
              body: JSON.stringify({ nationalId, service }),
            },
          );
          const data = await response.json();
          if (!response.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error:
                      data.message || data.detail || "Nafath request failed",
                  }),
                },
              ],
            };
          }

          await User.findByIdAndUpdate(record.userId, {
            $set: { nafathTempId: nationalId },
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    transId: data.transId,
                    random: data.random,
                    message: `Successfully sent request. Tell the user to open Nafath app and select: ${data.random}. After they approve, call mcp_verify_nafath_check to finalize.`,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: false, error: err.message }),
              },
            ],
          };
        }
      },
    );

    // ── Tool 7: mcp_verify_nafath_check ────────────────────────────────────
    server.tool(
      "mcp_verify_nafath_check",
      [
        "Check the status of a Nafath verification request and complete verification.",
        "Call this after the user claims they approved the request in their Nafath app.",
        "If the response status is COMPLETED, the user's account will be successfully verified.",
      ].join(" "),
      {
        auth_code: z.string().describe("The user authorization code"),
        nationalId: z.string().describe("The user's 10-digit National ID"),
        transId: z
          .string()
          .describe("The transaction ID returned by mcp_verify_nafath_send"),
        random: z
          .string()
          .describe("The 2-digit random number shown to the user"),
      },
      async ({ auth_code, nationalId, transId, random }) => {
        try {
          await connectDB();
          const record = await McpAuthCode.findOne({ code: auth_code });
          if (!record || !record.used || !record.userId) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "Invalid auth code",
                  }),
                },
              ],
            };
          }

          const nafath = new NafathService();
          const response = await fetch(
            `${nafath.baseUrl}/api/v1/mfa/request/status`,
            {
              method: "POST",
              headers: nafath.getHeaders(),
              body: JSON.stringify({ nationalId, transId, random }),
            },
          );
          const data = await response.json();
          if (!response.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: data.message || "Status check failed",
                  }),
                },
              ],
            };
          }

          if (data.status === "COMPLETED") {
            await User.findByIdAndUpdate(record.userId, {
              nationalId,
              nafathVerified: true,
              nafathTempId: undefined,
            });
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    status: data.status,
                    message:
                      data.status === "COMPLETED"
                        ? "Identity verified successfully. You can now add products."
                        : `Current request status: ${data.status}`,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: false, error: err.message }),
              },
            ],
          };
        }
      },
    );

    // ── Tool 8: mcp_update_iban ────────────────────────────────────────────
    server.tool(
      "mcp_update_iban",
      [
        "Add or update the landlord's bank account details (IBAN).",
        "Use this if add_product fails with IBAN_REQUIRED.",
        "Requires IBAN (starting with SA followed by 22 digits).",
        "For company accounts, unifiedNumber is also required (10 digits starting with 700).",
      ].join(" "),
      {
        auth_code: z.string().describe("The user authorization code"),
        iban: z.string().describe("The bank account IBAN (SA + 22 digits)"),
        unifiedNumber: z
          .string()
          .optional()
          .describe(
            "Company unified registration number (required for company accounts)",
          ),
      },
      async ({ auth_code, iban, unifiedNumber }) => {
        try {
          await connectDB();
          const record = await McpAuthCode.findOne({ code: auth_code });
          if (!record || !record.used || !record.userId) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "Invalid auth code",
                  }),
                },
              ],
            };
          }

          const user = await User.findById(record.userId);
          if (!user) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "User not found",
                  }),
                },
              ],
            };
          }

          const cleanedIban = iban.replace(/\s/g, "");
          if (!cleanedIban.match(/^SA\d{22}$/)) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error:
                      "Invalid IBAN format. Must be SA followed by 22 digits",
                  }),
                },
              ],
            };
          }

          if (user.accountType === "company") {
            if (!unifiedNumber) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      error: "Unified number is required for company accounts",
                    }),
                  },
                ],
              };
            }
          } else {
            if (!user.nationalId) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      error:
                        "National ID is required. Please verify identity with Nafath first.",
                    }),
                  },
                ],
              };
            }
          }

          if (!user.waffyId) {
            try {
              const [firstName, ...lastNameParts] = user.fullName.split(" ");
              const lastName = lastNameParts.join(" ") || "User";

              const signupResult = await waffyAuth.signUpUser({
                clientUserId: user._id.toString(),
                phoneNumber: `+966${user.phone.slice(1)}`,
                firstName: firstName,
                lastName: lastName,
                password: `temp_${Date.now()}`,
              });

              if (signupResult.data?.userId) {
                user.waffyId = signupResult.data.userId;
                user.clientUserToken = signupResult.data.clientUserToken;
                await user.save();
              } else {
                throw new Error("Failed to get waffyId from signup");
              }
            } catch (err) {
              console.error("Waffy signup error:", err);
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      error: "Failed to register with payment provider",
                    }),
                  },
                ],
              };
            }
          }

          try {
            const userData = {
              iban: cleanedIban,
              currency: "SAR",
              beneficiaryName: user.fullName,
              nationalId:
                user.accountType === "company"
                  ? unifiedNumber
                  : user.nationalId,
            };

            await waffyAuth.addUserIban({
              userId: user.waffyId,
              userData: userData,
            });
          } catch (err) {
            console.error("Waffy add IBAN error:", err);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "Failed to add bank details to payment provider",
                  }),
                },
              ],
            };
          }

          user.iban = cleanedIban;
          if (user.accountType === "company" && unifiedNumber) {
            user.unifiedNumber = unifiedNumber;
          }
          await user.save();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message:
                      user.lang === "ar"
                        ? "تم تحديث رقم الحساب بنجاح"
                        : "IBAN updated successfully",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: false, error: err.message }),
              },
            ],
          };
        }
      },
    );

    // ── Tool 9: add_product ────────────────────────────────────────────────
    server.tool(
      "add_product",
      [
        "Create a new rental listing on Estajer.",
        "Requires authorization code from get_auth_link / check_auth.",
        "",
        "=== SMART WORKFLOW — follow this order ===",
        "0. CATEGORIES: Before calling add_product, call get_categories with includeSubcategories:true to get the real category and subcategory keys. You MUST use keys from this list — never guess or invent them.",
        "1. IMAGES FIRST: If the user shares or pastes a product image directly in the chat, use your vision to identify the product. If you need the user to upload images, ALWAYS call the tool get_upload_images_link to get the upload URL (or use the upload_images_url from the check_auth response) and provide it to the user. Do NOT ask them for external links or to upload to third-party image sites like imgbb.com. Construct any upload page URLs to use the 'auth_code' query parameter (i.e. ?auth_code=...) and never 'code' or 'code_auth'. Extract name, category, and key details automatically.",
        "2. PRICE (silent): Call search_products with priceOnly:true silently to find similar listings. Do NOT announce that you are searching or comparing prices. Wait to see if the user mentions a price first. If they do, use it. If they don't, suggest one based on the market data — e.g. 'Similar products rent for 80–120 SAR/day — I suggest 100 SAR/day. Confirm?'",
        "3. LOCATION: Ask the user for their city or neighborhood — do NOT ask for raw GPS coordinates.",
        "4. CONFIRM & SUBMIT: Summarize everything (name, price, location, delivery) and ask for one final confirmation before calling this tool.",
        "",
        "=== FIELDS THE AI GENERATES (do NOT ask user) ===",
        "nameAr, nameEn — translate/generate from images.",
        "descriptionAr, descriptionEn — write professionally from images and product name.",
        "subCategory — infer automatically.",
        "",
        "=== FIELDS ADDED AUTOMATICALLY (do NOT include) ===",
        "approved, rejected, hidden, deleted, status, useCases, specs, features, seoTitle, seoDescription, gradientColors, gradientStyle.",
        "",
        "Images: Never ask the user to upload to third-party sites like imgbb.com. Ask them to use Estajer's image upload page (get the link via get_upload_images_link or check_auth, ensuring the query parameter is '?auth_code='). They will open it in their browser, upload the images, click 'Copy Array', and paste back a JSON array of image objects. Pass that array directly as the images field — do NOT convert to base64. Public https:// URLs also work directly.",
        "Performs prerequisite checks: Nafath identity verification and IBAN bank account must be registered first.",
      ].join(" "),
      {
        auth_code: z
          .string()
          .describe("The user authorization code from check_auth"),
        nameAr: z
          .string()
          .min(2)
          .describe(
            "Product name in Arabic — extract/translate from the image or product name. Do NOT ask the user.",
          ),
        nameEn: z
          .string()
          .min(2)
          .describe(
            "Product name in English — extract from the image or product name. Do NOT ask the user.",
          ),
        descriptionAr: z
          .string()
          .min(60)
          .describe(
            "Product description in Arabic (min 60 chars) — write professionally based on name and images. Do NOT ask the user.",
          ),
        descriptionEn: z
          .string()
          .min(60)
          .describe(
            "Product description in English (min 60 chars) — write professionally based on name and images. Do NOT ask the user.",
          ),
        category: z
          .string()
          .describe(
            "Main category key. MUST be a real key from get_categories — never guess. Call get_categories with includeSubcategories:true first.",
          ),
        subCategory: z
          .string()
          .optional()
          .describe(
            "Subcategory key. MUST be a real key from the subcategories list inside the chosen category. Never invent or guess a key.",
          ),
        quantity: z
          .number()
          .int()
          .min(1)
          .default(1)
          .describe(
            "Total quantity available for rent. Default: 1. Ask the user only if they mention having multiple units.",
          ),
        minQuantity: z
          .number()
          .int()
          .min(1)
          .default(1)
          .describe("Minimum quantity per booking. Default: 1"),
        images: z
          .array(
            z.union([
              z.string().describe("Public https:// URL or local file:/// path"),
              z
                .object({
                  preview: z
                    .string()
                    .describe("Cloudinary URL of the uploaded image"),
                  gradientColors: z.array(z.string()).optional(),
                  gradientStyle: z.string().optional(),
                })
                .describe("Full image object returned by the MCP upload page"),
            ]),
          )
          .min(1)
          .max(10)
          .describe(
            "Array of images. Accepted formats: " +
              "(1) Plain URL string — local file:/// path or public https:// URL. " +
              "(2) Full image object with { preview, gradientColors, gradientStyle } — paste directly from the upload page 'Copy Array' output. " +
              "If you get IMAGE_LOCAL_PATH error, send the user the upload_page_url from the error response. " +
              "NEVER convert images to base64.",
          ),
        location: z
          .object({
            lat: z.number().describe("Latitude"),
            lng: z.number().describe("Longitude"),
          })
          .describe(
            "Product coordinates. Ask the user for their city or neighborhood name, then resolve to coordinates. Do NOT ask for raw GPS numbers.",
          ),
        pricingModel: z
          .enum(["perDay", "packages"])
          .default("perDay")
          .describe(
            "'perDay' = daily price × days. 'packages' = fixed bundles. Default to perDay unless user explicitly asks for packages.",
          ),
        rentalValue: z
          .number()
          .min(0)
          .optional()
          .describe(
            "Daily rental price in SAR. REQUIRED when pricingModel is 'perDay'. ALWAYS call search_products first for similar items, show the market price range, suggest a specific value, then let the user confirm or adjust. Do NOT ask blindly for a price.",
          ),
        insurance: z
          .number()
          .min(0)
          .default(0)
          .describe("Refundable security deposit in SAR. Default: 0"),
        minDays: z
          .number()
          .int()
          .min(1)
          .default(1)
          .describe("Minimum rental period in days. Default: 1"),
        packages: z
          .array(
            z.object({
              duration: z
                .number()
                .int()
                .min(1)
                .describe("Duration length number"),
              unit: z
                .enum(["hours", "days", "weeks", "months"])
                .describe("Duration unit"),
              price: z.number().min(0).describe("Package price in SAR"),
            }),
          )
          .optional()
          .describe(
            "Package list. REQUIRED when pricingModel is 'packages'. Each entry = one bundle option.",
          ),
        deliveryType: z
          .enum(["receive", "delivery", "free"])
          .default("receive")
          .describe(
            "'receive' = customer picks up (default, free). 'delivery' = seller delivers (paid). 'free' = seller delivers free.",
          ),
        deliveryPricingModel: z
          .enum(["perKm", "fixedCity"])
          .optional()
          .describe(
            "How delivery is charged. Only used when deliveryType is 'delivery'.",
          ),
        deliveryCost: z
          .number()
          .min(0)
          .optional()
          .describe(
            "Delivery cost per km in SAR. Used when deliveryPricingModel is 'perKm'.",
          ),
        fixedCityPricing: z
          .array(
            z.object({
              cityAr: z.string().describe("City name in Arabic"),
              cityEn: z.string().describe("City name in English"),
              governorateAr: z.string().describe("Governorate in Arabic"),
              governorateEn: z.string().describe("Governorate in English"),
              displayName: z.string().describe("Human-readable display name"),
              isGovernorate: z.boolean().default(false),
              price: z
                .number()
                .min(0)
                .describe("Delivery price to this city/governorate in SAR"),
            }),
          )
          .optional()
          .describe(
            "City-based delivery pricing. REQUIRED when deliveryPricingModel is 'fixedCity'.",
          ),
        discountTiers: z
          .union([
            z.array(
              z.object({
                minDays: z
                  .number()
                  .int()
                  .min(1)
                  .describe("Minimum rental days for this discount tier"),
                discount: z
                  .number()
                  .min(0)
                  .max(100)
                  .describe("Percentage discount (e.g. 10 for 10% off)"),
              }),
            ),
            z
              .string()
              .describe(
                "JSON-encoded array of discount tiers (fallback if AI serializes as string)",
              ),
          ])
          .optional()
          .describe(
            "Duration-based volume discount tiers. Each tier: { minDays, discount }. " +
              "Example: [{ minDays: 1, discount: 10 }] gives 10% off when renting 1+ days. " +
              "IMPORTANT: pass as a real JSON array, NOT a string.",
          ),
        quantityDiscountTiers: z
          .union([
            z.array(
              z.object({
                minQuantity: z
                  .number()
                  .int()
                  .min(1)
                  .describe("Minimum quantity for this discount tier"),
                discount: z
                  .number()
                  .min(0)
                  .max(100)
                  .describe("Percentage discount (e.g. 10 for 10% off)"),
              }),
            ),
            z
              .string()
              .describe(
                "JSON-encoded array (fallback if AI serializes as string)",
              ),
          ])
          .optional()
          .describe(
            "Quantity-based discount tiers. Each tier: { minQuantity, discount }.",
          ),
      },
      async (params) => {
        try {
          await connectDB();
          const {
            auth_code,
            nameAr,
            nameEn,
            descriptionAr,
            descriptionEn,
            category,
            subCategory,
            quantity,
            minQuantity,
            images,
            location,
            pricingModel,
            rentalValue,
            insurance,
            minDays,
            packages,
            deliveryType,
            deliveryPricingModel,
            deliveryCost,
            fixedCityPricing,
          } = params;

          // Defensively parse discount tiers in case the AI serializes them as a JSON string
          const parseJsonIfString = (value) => {
            if (!value) return undefined;
            if (typeof value === "string") {
              try {
                return JSON.parse(value);
              } catch {
                return undefined;
              }
            }
            return value;
          };
          const discountTiers = parseJsonIfString(params.discountTiers);
          const quantityDiscountTiers = parseJsonIfString(
            params.quantityDiscountTiers,
          );

          // ── Auth check ───────────────────────────────────────────────────
          const record = await McpAuthCode.findOne({ code: auth_code });
          if (!record || !record.used || !record.userId) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "UNAUTHORIZED",
                    message:
                      "Invalid or expired auth code. Generate a new link using get_auth_link.",
                  }),
                },
              ],
            };
          }

          const user = await User.findById(record.userId);
          if (!user) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "USER_NOT_FOUND",
                    message: "User not found.",
                  }),
                },
              ],
            };
          }

          // ── Prerequisite checks ──────────────────────────────────────────
          if (user.accountType !== "admin" && !user.skipIbanVerification) {
            if (user.accountType === "personal" && !user.nafathVerified) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      error: "NAFATH_REQUIRED",
                      message:
                        "User has not completed Nafath identity verification. Ask for their 10-digit National ID and call mcp_verify_nafath_send.",
                      settings_url: `${BASE_URL}/${user.lang || "ar"}/dashboard/renter-settings`,
                    }),
                  },
                ],
              };
            }

            if (!user.iban) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      error: "IBAN_REQUIRED",
                      accountType: user.accountType,
                      message:
                        user.accountType === "company"
                          ? "Company accounts require IBAN and Unified Number. Ask the user for both, then call mcp_update_iban."
                          : "IBAN is required to list products. Ask the user for their IBAN, then call mcp_update_iban.",
                      settings_url: `${BASE_URL}/${user.lang || "ar"}/dashboard/renter-settings`,
                    }),
                  },
                ],
              };
            }
          }

          // ── Category validation ────────────────────────────────────────────
          const catValidation = await validateCategory(category, subCategory);
          if (!catValidation.valid) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: catValidation.error,
                    message: catValidation.message,
                    valid_category_keys: catValidation.valid_category_keys,
                    valid_subcategory_keys:
                      catValidation.valid_subcategory_keys,
                  }),
                },
              ],
            };
          }

          // ── Pricing validation ────────────────────────────────────────────
          if (pricingModel === "perDay" && (!rentalValue || rentalValue <= 0)) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "VALIDATION_ERROR",
                    message:
                      "rentalValue is required and must be > 0 when pricingModel is 'perDay'.",
                  }),
                },
              ],
            };
          }

          if (
            pricingModel === "packages" &&
            (!packages || packages.length === 0)
          ) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "VALIDATION_ERROR",
                    message:
                      "packages array is required and must have at least one entry when pricingModel is 'packages'.",
                  }),
                },
              ],
            };
          }

          if (
            deliveryType === "delivery" &&
            deliveryPricingModel === "fixedCity" &&
            (!fixedCityPricing || fixedCityPricing.length === 0)
          ) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "VALIDATION_ERROR",
                    message:
                      "fixedCityPricing is required when deliveryType is 'delivery' and deliveryPricingModel is 'fixedCity'.",
                  }),
                },
              ],
            };
          }

          // ── Reverse geocoding ────────────────────────────────────────────
          const { addressAr, addressEn } = await resolveCoordinates(
            location.lat,
            location.lng,
          );

          // ── Image upload ─────────────────────────────────────────────────
          const imgResult = await processProductImages(images, auth_code);
          if (!imgResult.success) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(imgResult),
                },
              ],
            };
          }
          const uploadedImages = imgResult.uploadedImages;

          // ── Build rental object ──────────────────────────────────────────
          const rental = {
            value: pricingModel === "perDay" ? (rentalValue ?? 0) : 0,
            insurance: insurance ?? 0,
            minDays: minDays ?? 1,
            delivery: {
              type: deliveryType,
              cost:
                deliveryType === "delivery" && deliveryPricingModel === "perKm"
                  ? (deliveryCost ?? 0)
                  : 0,
              pricingModel: deliveryPricingModel ?? "fixedCity",
              fixedCityPricing:
                deliveryType === "delivery" &&
                deliveryPricingModel === "fixedCity"
                  ? (fixedCityPricing ?? []).map((city, idx) => ({
                      ...city,
                      id: Date.now() + idx,
                    }))
                  : [],
            },
            discountTiers:
              discountTiers && discountTiers.length > 0
                ? discountTiers.map((tier, idx) => {
                    const minDaysVal = tier.minDays || 1;
                    const discountVal = tier.discount || 0;
                    const rentVal = rentalValue ?? 0;
                    const totalOriginal = rentVal * minDaysVal;
                    return {
                      id: Date.now() + idx,
                      minDays: minDaysVal,
                      discount: discountVal,
                      discountPrice:
                        totalOriginal - (totalOriginal * discountVal) / 100,
                      discountType: "percentage",
                      dateRanges: [],
                    };
                  })
                : [],
            quantityDiscountTiers:
              quantityDiscountTiers && quantityDiscountTiers.length > 0
                ? quantityDiscountTiers.map((tier, idx) => ({
                    id: Date.now() + idx,
                    minQuantity: tier.minQuantity || 1,
                    discount: tier.discount || 0,
                  }))
                : [],
            packages:
              pricingModel === "packages" && packages
                ? packages.map((pkg) => {
                    const factorMap = {
                      hours: 1 / 24,
                      days: 1,
                      weeks: 7,
                      months: 30,
                    };
                    const factor = factorMap[pkg.unit] ?? 1;
                    return {
                      id: Date.now() + Math.random(),
                      unit: pkg.unit,
                      duration: pkg.duration,
                      price: pkg.price,
                      daysNumber: pkg.duration * factor,
                    };
                  })
                : [],
          };

          // ── Create product ───────────────────────────────────────────────
          const newProduct = await Product.create({
            nameAr,
            nameEn,
            descriptionAr,
            descriptionEn,
            quantity: quantity ?? 1,
            minQuantity: minQuantity ?? 1,
            category,
            subCategory: subCategory || undefined,
            images: uploadedImages,
            location: {
              type: "Point",
              coordinates: [location.lng, location.lat],
            },
            addressAr,
            addressEn,
            rental,
            pricingModel,
            owner: user._id,
          });

          // ── Update user ──────────────────────────────────────────────────
          user.productsCount = (user.productsCount || 0) + 1;
          if (!user?.location?.lat) {
            user.location = { lat: location.lat, lng: location.lng };
            user.address = [
              addressAr.neighborhood,
              addressAr.city,
              addressAr.governorate,
              addressAr.country,
            ]
              .filter(Boolean)
              .join(", ");
          }
          await user.save();

          // ── Alert ────────────────────────────────────────────────────────
          try {
            await updateAlert("product", newProduct._id);
          } catch (e) {
            console.error("Alert failed:", e);
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    productId: newProduct._id,
                    preview_url: `${BASE_URL}/my-products/preview/${newProduct._id}`,
                    edit_url: `${BASE_URL}/edit-product/${newProduct._id}`,
                    message:
                      "Product created successfully and is now pending admin review.",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          console.error("MCP Add Product error:", error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "SERVER_ERROR",
                  message: error.message,
                }),
              },
            ],
          };
        }
      },
    );

    // ── Tool 10: edit_product ───────────────────────────────────────────────
    server.tool(
      "edit_product",
      [
        "Edit an existing rental listing on Estajer.",
        "Requires authorization code from get_auth_link / check_auth, and the product's 24-character ObjectId.",
        "Pass only the fields that need to be updated. Undefined fields will remain unchanged.",
        "If images or location are updated, the tool handles geocoding and image uploading automatically (similar to add_product).",
        "Never ask the user to upload images to third-party hosting sites (like imgbb.com, imgur, etc.). If images need to be uploaded/updated, call get_upload_images_link (or use upload_images_url from check_auth) to get the Estajer upload page URL. Provide this URL to the user to upload their images and paste the JSON array back to you. Ensure the URL uses the parameter name 'auth_code' (i.e. ?auth_code=...).",
      ].join(" "),
      {
        auth_code: z
          .string()
          .describe("The user authorization code from check_auth"),
        id: z
          .string()
          .length(24)
          .describe("MongoDB ObjectId of the product (24 hex characters)"),
        nameAr: z
          .string()
          .min(2)
          .optional()
          .describe("Updated Arabic product name"),
        nameEn: z
          .string()
          .min(2)
          .optional()
          .describe("Updated English product name"),
        descriptionAr: z
          .string()
          .min(60)
          .optional()
          .describe("Updated Arabic description (min 60 chars)"),
        descriptionEn: z
          .string()
          .min(60)
          .optional()
          .describe("Updated English description (min 60 chars)"),
        category: z
          .string()
          .optional()
          .describe("Updated category key from get_categories"),
        subCategory: z
          .string()
          .optional()
          .describe("Updated subcategory key from get_categories"),
        quantity: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Updated total quantity"),
        minQuantity: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Updated minimum booking quantity"),
        images: z
          .array(
            z.union([
              z.string().describe("Public https:// URL or local file:/// path"),
              z
                .object({
                  preview: z
                    .string()
                    .describe("Cloudinary URL of the uploaded image"),
                  gradientColors: z.array(z.string()).optional(),
                  gradientStyle: z.string().optional(),
                })
                .describe("Full image object returned by the MCP upload page"),
            ]),
          )
          .optional()
          .describe(
            "Updated images. Accepts plain URL strings OR full image objects " +
              "{ preview, gradientColors, gradientStyle } from the upload page 'Copy Array' output.",
          ),
        location: z
          .object({ lat: z.number(), lng: z.number() })
          .optional()
          .describe("Updated coordinates"),
        pricingModel: z
          .enum(["perDay", "packages"])
          .optional()
          .describe("Updated pricing model"),
        rentalValue: z
          .number()
          .min(0)
          .optional()
          .describe("Updated daily rental price (for perDay model)"),
        insurance: z
          .number()
          .min(0)
          .optional()
          .describe("Updated security deposit"),
        minDays: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Updated minimum rental days"),
        packages: z
          .array(
            z.object({
              duration: z.number().int().min(1),
              unit: z.enum(["hours", "days", "weeks", "months"]),
              price: z.number().min(0),
            }),
          )
          .optional()
          .describe(
            "Updated package list (required if pricingModel is packages)",
          ),
        deliveryType: z
          .enum(["receive", "delivery", "free"])
          .optional()
          .describe("Updated delivery type"),
        deliveryPricingModel: z
          .enum(["perKm", "fixedCity"])
          .optional()
          .describe("Updated delivery pricing model"),
        deliveryCost: z
          .number()
          .min(0)
          .optional()
          .describe("Updated cost per km"),
        fixedCityPricing: z
          .array(
            z.object({
              cityAr: z.string(),
              cityEn: z.string(),
              governorateAr: z.string(),
              governorateEn: z.string(),
              displayName: z.string(),
              isGovernorate: z.boolean().default(false),
              price: z.number().min(0),
            }),
          )
          .optional()
          .describe("Updated fixed city pricing array"),
        discountTiers: z
          .union([
            z.array(
              z.object({
                minDays: z
                  .number()
                  .int()
                  .min(1)
                  .describe("Minimum rental days for this discount tier"),
                discount: z
                  .number()
                  .min(0)
                  .max(100)
                  .describe("Percentage discount (e.g. 10 for 10% off)"),
              }),
            ),
            z
              .string()
              .describe(
                "JSON-encoded array of discount tiers (fallback if AI serializes as string)",
              ),
          ])
          .optional()
          .describe(
            "Duration-based volume discount tiers. Each tier: { minDays, discount }. " +
              "Example: [{ minDays: 1, discount: 10 }] gives 10% off when renting 1+ days. " +
              "IMPORTANT: pass as a real JSON array, NOT a string.",
          ),
        quantityDiscountTiers: z
          .union([
            z.array(
              z.object({
                minQuantity: z
                  .number()
                  .int()
                  .min(1)
                  .describe("Minimum quantity for this discount tier"),
                discount: z
                  .number()
                  .min(0)
                  .max(100)
                  .describe("Percentage discount"),
              }),
            ),
            z
              .string()
              .describe(
                "JSON-encoded array (fallback if AI serializes as string)",
              ),
          ])
          .optional()
          .describe(
            "Quantity-based discount tiers. Each tier: { minQuantity, discount }.",
          ),
      },
      async (params) => {
        try {
          await connectDB();
          const {
            auth_code,
            id,
            nameAr,
            nameEn,
            descriptionAr,
            descriptionEn,
            category,
            subCategory,
            quantity,
            minQuantity,
            images,
            location,
            pricingModel,
            rentalValue,
            insurance,
            minDays,
            packages,
            deliveryType,
            deliveryPricingModel,
            deliveryCost,
            fixedCityPricing,
          } = params;

          // Defensively parse discount tiers in case the AI serializes them as a JSON string
          const parseJsonIfString = (value) => {
            if (!value) return undefined;
            if (typeof value === "string") {
              try {
                return JSON.parse(value);
              } catch {
                return undefined;
              }
            }
            return value;
          };
          const discountTiers = parseJsonIfString(params.discountTiers);
          const quantityDiscountTiers = parseJsonIfString(
            params.quantityDiscountTiers,
          );

          // ── Auth check ───────────────────────────────────────────────────
          const record = await McpAuthCode.findOne({ code: auth_code });
          if (!record || !record.used || !record.userId) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "UNAUTHORIZED",
                    message:
                      "Invalid or expired auth code. Generate a new link using get_auth_link.",
                  }),
                },
              ],
            };
          }

          const user = await User.findById(record.userId);
          if (!user) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "USER_NOT_FOUND",
                    message: "User not found.",
                  }),
                },
              ],
            };
          }

          // ── Fetch Product ────────────────────────────────────────────────
          const product = await Product.findById(id);
          if (!product) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "PRODUCT_NOT_FOUND",
                    message: "Product not found.",
                  }),
                },
              ],
            };
          }

          // Verify ownership
          if (
            user.accountType !== "admin" &&
            product.owner.toString() !== user._id.toString()
          ) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: "NOT_AUTHORIZED",
                    message: "You are not authorized to edit this product.",
                  }),
                },
              ],
            };
          }

          // ── Category validation ──────────────────────────────────────────
          const checkCat = category || product.category;
          const checkSub = subCategory || product.subCategory;
          if (category || subCategory) {
            const catValidation = await validateCategory(checkCat, checkSub);
            if (!catValidation.valid) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      error: catValidation.error,
                      message: catValidation.message,
                      valid_category_keys: catValidation.valid_category_keys,
                      valid_subcategory_keys:
                        catValidation.valid_subcategory_keys,
                    }),
                  },
                ],
              };
            }
          }

          // ── Apply simple fields ──────────────────────────────────────────
          if (nameAr !== undefined) product.nameAr = nameAr;
          if (nameEn !== undefined) product.nameEn = nameEn;
          if (descriptionAr !== undefined)
            product.descriptionAr = descriptionAr;
          if (descriptionEn !== undefined)
            product.descriptionEn = descriptionEn;
          if (category !== undefined) product.category = category;
          if (subCategory !== undefined)
            product.subCategory = subCategory || undefined;
          if (quantity !== undefined) product.quantity = quantity;
          if (minQuantity !== undefined) product.minQuantity = minQuantity;
          if (pricingModel !== undefined) product.pricingModel = pricingModel;

          // ── Images update ────────────────────────────────────────────────
          if (images !== undefined) {
            const imgResult = await processProductImages(images, auth_code);
            if (!imgResult.success) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(imgResult),
                  },
                ],
              };
            }
            product.images = imgResult.uploadedImages;
          }

          // ── Location & geocoding update ──────────────────────────────────
          if (location !== undefined) {
            product.location = {
              type: "Point",
              coordinates: [location.lng, location.lat],
            };
            const { addressAr, addressEn } = await resolveCoordinates(
              location.lat,
              location.lng,
            );
            product.addressAr = addressAr;
            product.addressEn = addressEn;
          }

          // ── Rental updates ───────────────────────────────────────────────
          const checkModel = pricingModel || product.pricingModel || "perDay";

          if (rentalValue !== undefined) {
            product.rental.value = checkModel === "perDay" ? rentalValue : 0;
          }
          if (insurance !== undefined) {
            product.rental.insurance = insurance;
          }
          if (minDays !== undefined) {
            product.rental.minDays = minDays;
          }

          // Delivery updates
          if (deliveryType !== undefined) {
            product.rental.delivery.type = deliveryType;
          }
          if (deliveryPricingModel !== undefined) {
            product.rental.delivery.pricingModel = deliveryPricingModel;
          }
          if (deliveryCost !== undefined) {
            product.rental.delivery.cost =
              (deliveryType || product.rental.delivery.type) === "delivery" &&
              (deliveryPricingModel || product.rental.delivery.pricingModel) ===
                "perKm"
                ? deliveryCost
                : 0;
          }
          if (fixedCityPricing !== undefined) {
            product.rental.delivery.fixedCityPricing =
              (deliveryType || product.rental.delivery.type) === "delivery" &&
              (deliveryPricingModel || product.rental.delivery.pricingModel) ===
                "fixedCity"
                ? fixedCityPricing.map((city, idx) => ({
                    ...city,
                    id: Date.now() + idx,
                  }))
                : [];
          }

          // Packages updates
          if (packages !== undefined) {
            if (checkModel === "packages") {
              const factorMap = {
                hours: 1 / 24,
                days: 1,
                weeks: 7,
                months: 30,
              };
              product.rental.packages = packages.map((pkg) => {
                const factor = factorMap[pkg.unit] ?? 1;
                return {
                  id: Date.now() + Math.random(),
                  unit: pkg.unit,
                  duration: pkg.duration,
                  price: pkg.price,
                  daysNumber: pkg.duration * factor,
                };
              });
            } else {
              product.rental.packages = [];
            }
          } else if (pricingModel === "perDay") {
            product.rental.packages = [];
          }

          // ── Discount tier updates ─────────────────────────────────────────
          // The effective rental value to use for price calculation
          const effectiveRentalValue = rentalValue ?? product.rental.value ?? 0;

          if (discountTiers !== undefined && discountTiers.length >= 0) {
            // Replace tiers with the newly provided list
            product.rental.discountTiers = discountTiers.map((tier, idx) => {
              const minDaysVal = tier.minDays || 1;
              const discountVal = tier.discount || 0;
              const totalOriginal = effectiveRentalValue * minDaysVal;
              return {
                id: Date.now() + idx,
                minDays: minDaysVal,
                discount: discountVal,
                discountPrice:
                  totalOriginal - (totalOriginal * discountVal) / 100,
                discountType: "percentage",
                dateRanges: [],
              };
            });
          } else if (
            rentalValue !== undefined &&
            product.rental.discountTiers?.length > 0
          ) {
            // rentalValue changed but no new discountTiers provided — recalculate existing tiers
            product.rental.discountTiers = product.rental.discountTiers.map(
              (tier) => {
                const totalOriginal =
                  effectiveRentalValue * (tier.minDays || 1);
                return {
                  ...tier,
                  discountPrice:
                    totalOriginal -
                    (totalOriginal * (tier.discount || 0)) / 100,
                };
              },
            );
          }
          product.markModified("rental.discountTiers");

          if (
            quantityDiscountTiers !== undefined &&
            quantityDiscountTiers.length >= 0
          ) {
            product.rental.quantityDiscountTiers = quantityDiscountTiers.map(
              (tier, idx) => ({
                id: Date.now() + idx,
                minQuantity: tier.minQuantity || 1,
                discount: tier.discount || 0,
              }),
            );
            product.markModified("rental.quantityDiscountTiers");
          }

          // ── Reset status if rejected ─────────────────────────────────────
          if (product.rejected) {
            product.rejected = false;
            product.approved = false;
            product.rejectMessage = undefined;
          }

          // Save product
          await product.save();

          // Trigger Alert
          try {
            await updateAlert("product", product._id);
          } catch (e) {
            console.error("Alert failed:", e);
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    productId: product._id,
                    preview_url: `${BASE_URL}/my-products/preview/${product._id}`,
                    edit_url: `${BASE_URL}/edit-product/${product._id}`,
                    message: "Product updated successfully.",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          console.error("MCP Edit Product error:", error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "SERVER_ERROR",
                  message: error.message,
                }),
              },
            ],
          };
        }
      },
    );
  },
  {
    name: "estajer-mcp",
    version: "1.0.0",
  },
  {
    basePath: "/api/mcp",
    maxDuration: 60,
    redisUrl: process.env.REDIS_URL,
  },
);

export { handler as GET, handler as POST };
