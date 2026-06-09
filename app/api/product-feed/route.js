import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { logError } from "@/lib/errorHandler";
import { getUrlName } from "@/lib/sitemap";

// Mark this route as dynamic since it uses request.url to access query parameters
export const dynamic = "force-dynamic";

// Enable cache revalidation
export const revalidate = 3600; // Revalidate every hour (1 hour = 3600 seconds)

/**
 * GET /api/product-feed
 * Generates Google Merchant Center compatible XML product feed
 * Query params:
 * - lang: 'ar' or 'en' (optional, defaults to 'ar')
 */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "ar";
    const langSuffix = lang === "en" ? "En" : "Ar";

    // Cache the database query for 1 hour
    const getCachedProducts = unstable_cache(
      async () => {
        return await Product.find({
          approved: true,
          hidden: false,
          deleted: { $ne: true },
        })
          .sort({ _id: -1 }) // Sort by newest first (MongoDB _id contains timestamp)
          .populate("owner", "fullName phone pathName")
          .select(
            `nameAr nameEn descriptionAr descriptionEn images category subCategory rental addressAr addressEn location owner _id createdAt updatedAt`,
          )
          .lean()
          .limit(5000); // Google Merchant Center limit per feed - newest 5000 products
      },
      ["product-feed"], // Cache key
      {
        revalidate: 3600, // Cache for 1 hour
        tags: ["product-feed"],
      },
    );

    const products = await getCachedProducts();

    // Generate XML feed
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
    const langPrefix = lang === "ar" ? "" : "en/";

    // Helper function to escape XML special characters
    const escapeXml = (str) => {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // Helper function to remove emojis from text
    const removeEmojis = (text) => {
      if (!text) return "";
      // Remove all emojis using Unicode emoji property
      return text
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/\uFE0F/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Helper function to get URL-friendly product name

    // Helper function to get product price
    const getProductPrice = (product) => {
      if (
        product.pricingModel === "packages" &&
        product.rental?.packages?.length > 0
      ) {
        return product.rental.packages[0].price;
      }

      // Check for discount
      if (product.rental?.discountTiers?.length > 0) {
        const firstDiscount = product.rental.discountTiers[0];
        if (firstDiscount.discountPrice) {
          return firstDiscount.discountPrice;
        }
      }

      return product.rental?.value || 0;
    };

    // Helper function to get sale price if discount exists
    const getSalePrice = (product) => {
      if (
        product.pricingModel !== "packages" &&
        product.rental?.discountTiers?.length > 0 &&
        product.rental.discountTiers[0].discountPrice
      ) {
        return product.rental.discountTiers[0].discountPrice;
      }
      return null;
    };

    // Helper function to map category to Google Product Category
    const getGoogleProductCategory = (category) => {
      // Map your categories to Google's taxonomy
      // Reference: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
      const categoryMap = {
        electronics: "Electronics",
        "home-supplies": "Home & Garden > Household Supplies",
        "parties-and-events": "Arts & Entertainment > Party & Celebration",
        "trips-and-camping":
          "Sporting Goods > Outdoor Recreation > Camping & Hiking",
        furniture: "Furniture",
        arts: "Arts & Entertainment > Hobbies & Creative Arts",
        sports: "Sporting Goods",
        motors: "Vehicles & Parts",
        medical: "Health & Beauty > Health Care",
        "kids-accessories": "Baby & Toddler > Baby Transport",
        games: "Toys & Games",
        fashion: "Apparel & Accessories",
        tools: "Hardware > Tools",
        other: "Everything Else",
        default: "Everything Else",
      };
      return categoryMap[category] || categoryMap.default;
    };

    // Build XML items
    const xmlItems = products
      .map((product) => {
        const name = product[`name${langSuffix}`] || product.nameAr;
        const description = removeEmojis(
          product[`description${langSuffix}`] || product.descriptionAr,
        );
        const address = product[`address${langSuffix}`] || product.addressAr;
        const productUrl = `${baseUrl}/${langPrefix}products/${getUrlName(
          name,
        )}_ref_${product._id}`;
        const price = getProductPrice(product);
        const salePrice = getSalePrice(product);
        const mainImage = product.images?.[0]?.preview || "";
        const additionalImages =
          product.images?.slice(1, 10).map((img) => img.preview) || [];

        return `    <item>
      <g:id>${escapeXml(product._id.toString())}</g:id>
      <g:title>${escapeXml(name.substring(0, 150))}</g:title>
      <g:description>${escapeXml(
        description.substring(0, 5000),
      )}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
      ${additionalImages
        .map(
          (img) =>
            `<g:additional_image_link>${escapeXml(
              img,
            )}</g:additional_image_link>`,
        )
        .join("\n      ")}
      <g:availability>in_stock</g:availability>
      <g:price>${price.toFixed(2)} SAR</g:price>
      <g:brand>Estajer</g:brand>
      <g:condition>used</g:condition>
      <g:product_type>${escapeXml(product.category || "")}</g:product_type>
      <g:google_product_category>${escapeXml(
        getGoogleProductCategory(product.category),
      )}</g:google_product_category>
      ${
        product.subCategory
          ? `<g:item_group_id>${escapeXml(
              product.subCategory,
            )}</g:item_group_id>`
          : ""
      }
      ${
        address?.city
          ? `<g:custom_label_0>${escapeXml(address.city)}</g:custom_label_0>`
          : ""
      }
      ${
        product.owner?.fullName
          ? `<g:custom_label_1>${escapeXml(
              product.owner.fullName,
            )}</g:custom_label_1>`
          : ""
      }
      <g:custom_label_2>Rental</g:custom_label_2>
      ${
        product.pricingModel === "packages"
          ? `<g:custom_label_3>Package</g:custom_label_3>`
          : `<g:custom_label_3>Daily</g:custom_label_3>`
      }
      <g:identifier_exists>false</g:identifier_exists>
    </item>`;
      })
      .join("\n");
    //   ${salePrice ? `<g:sale_price>${salePrice.toFixed(2)} SAR</g:sale_price>` : ""}
    // Generate complete XML feed
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Estajer Product Feed - ${
      lang === "ar" ? "Arabic" : "English"
    }</title>
    <link>${baseUrl}</link>
    <description>Estajer rental products feed for Google Merchant Center</description>
    <language>${lang === "ar" ? "ar" : "en"}</language>
${xmlItems}
  </channel>
</rss>`;

    // Return XML response with aggressive caching headers
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cache for 1 hour in browser, 1 hour on CDN, serve stale for 2 hours while revalidating
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
        "CDN-Cache-Control": "public, max-age=3600",
        "Vercel-CDN-Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Product feed error:", error);
    await logError(error, {
      endpoint: "/api/product-feed",
      method: "GET",
      req,
    });

    // Return error as XML for better debugging
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error</title>
    <description>Error generating product feed: ${error.message}</description>
  </channel>
</rss>`;

    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
