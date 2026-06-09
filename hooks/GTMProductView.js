"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

export default function GTMProductView({ product, lang }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!product) return;
    const price =
      product.pricingModel === "packages"
        ? product.rental?.packages?.[0]?.price
        : product.rental?.value;
    const value = +Number(price || 0).toFixed(2);
    try {
      sendGTMEvent({
        event: "view_item",
        page_location: window.location.href,
        value: value,
        items: [
          {
            item_id: product._id,
            item_name: product.name,
            price: value,
            quantity: 1,
            currency: "SAR",
            item_category: product.category,
            item_category2: product.subCategory,
            city: product.address?.city,
            seller_name: product.owner?.fullName,
            availability: "in stock",
            condition: "used",
            language: lang,
          },
        ],
      });
    } catch (_) {}
  }, [lang, pathname, product]);

  return null;
}
