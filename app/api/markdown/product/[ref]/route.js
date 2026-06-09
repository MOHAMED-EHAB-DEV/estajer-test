import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { ref } = await params;

  try {
    await connectDB();

    const decodedRef = decodeURIComponent(ref);
    const id = decodedRef.includes("_ref_")
      ? decodedRef.split("_ref_")[1]
      : decodedRef;

    const product = await Product.findById(id);

    if (!product) {
      return new NextResponse("Product not found.", { status: 404 });
    }

    let md = `# ${product.seoTitleEn || product.nameEn} | ${product.seoTitleAr || product.nameAr}\n\n`;

    md += `**Category:** ${product.category} ${product.subCategory ? `> ${product.subCategory}` : ""}\n`;
    md += `**Condition:** ${product.status}\n\n`;

    md += `## Pricing\n`;
    if (
      product.pricingModel === "packages" &&
      product.rental?.packages?.length
    ) {
      md += `This product is rented in packages:\n`;
      product.rental.packages.forEach((pkg) => {
        md += `- **${pkg.duration} ${pkg.unit}**: ${pkg.price} SAR\n`;
      });
    } else {
      md += `- **Daily Rate:** ${product.rental?.value} SAR (Minimum ${product.rental?.minDays || 1} days)\n`;

      if (product.rental?.discountTiers?.length > 0) {
        md += `\n### Volume Discounts:\n`;
        product.rental.discountTiers.forEach((tier) => {
          md += `- Rent for ${tier.minDays}+ days: ${tier.discount}% off\n`;
        });
      }
    }

    if (product.rental?.insurance > 0) {
      md += `\n**Insurance Deposit:** ${product.rental.insurance} SAR\n`;
    }

    if (product.rental?.delivery) {
      md += `\n## Delivery Options\n`;
      const deliveryType = product.rental.delivery.type;
      
      if (deliveryType === "receive") {
        md += `- **Type:** Pickup Only (Customer must collect the item)\n`;
      } else if (deliveryType === "free") {
        const gov = product.addressEn?.governorate || product.addressAr?.governorate;
        md += `- **Type:** Free Delivery\n`;
        if (gov) {
          md += `- **Coverage:** Free delivery within ${gov}\n`;
        }
      } else if (deliveryType === "deliveryCompany") {
        md += `- **Type:** Shipping via Delivery Company\n`;
      } else if (deliveryType === "delivery") {
        md += `- **Type:** Delivery by Owner\n`;
        
        if (product.rental.delivery.pricingModel === "perKm") {
          md += `- **Pricing Model:** Per Kilometer\n`;
          md += `- **Cost:** ${product.rental.delivery.cost || 0} SAR per km\n`;
        } else if (product.rental.delivery.pricingModel === "fixedCity") {
          md += `- **Pricing Model:** Fixed price per city\n`;
          const fixedCities = product.rental.delivery.fixedCityPricing || [];
          
          if (fixedCities.length === 0) {
            md += `- **Coverage:** All governorates available\n`;
          } else {
            md += `\n### Available Cities for Delivery:\n`;
            const grouped = fixedCities.reduce((acc, city) => {
              const gov = city.governorateEn || city.governorateAr || "Other";
              if (!acc[gov]) acc[gov] = [];
              acc[gov].push(city);
              return acc;
            }, {});
            
            for (const [gov, cities] of Object.entries(grouped)) {
              md += `- **Governorate: ${gov}**\n`;
              cities.forEach(city => {
                const cityName = city.isGovernorate ? "All Cities" : (city.cityEn || city.cityAr);
                const priceText = city.price === 0 ? "Free" : `${city.price} SAR`;
                md += `  - ${cityName}: ${priceText}\n`;
              });
            }
          }
        }
      }
    }

    md += `\n## Description\n`;
    md += `**English:**\n${product.seoDescriptionEn || product.descriptionEn}\n\n`;
    md += `**Arabic:**\n${product.seoDescriptionAr || product.descriptionAr}\n\n`;

    if (product.specs && product.specs.length > 0) {
      md += `## Specifications\n`;
      product.specs.forEach((spec) => {
        md += `- **${spec.keyEn} / ${spec.keyAr}:** ${spec.valueEn} / ${spec.valueAr}\n`;
      });
    }

    if (product.features && product.features.length > 0) {
      md += `\n## Features\n`;
      product.features.forEach((feat) => {
        md += `- **${feat.titleEn}**: ${feat.descEn}\n`;
      });
    }

    if (product.services && product.services.length > 0) {
      md += `\n## Add-on Services\n`;
      product.services.forEach((srv) => {
        md += `- **${srv.nameEn}**: ${srv.price} SAR (${srv.pricingType})\n`;
      });
    }

    md += `\n## How to Rent\n`;
    md += `You can rent this product directly on Estajer by visiting: \n`;
    md += `[Rent Product](https://estajer.com/products/${ref})\n`;

    return new NextResponse(md.trim(), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Markdown generation error:", error);
    return new NextResponse("Error generating markdown.", { status: 500 });
  }
}
