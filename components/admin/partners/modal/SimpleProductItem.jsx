"use client";

import React from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Checkbox } from "@heroui/react";

export default function SimpleProductItem({
  product,
  isSelected,
  onSelect,
  lang,
}) {
  const tax = 0.15;
  const hasTaxCode = !!product.owner?.companyDetails?.taxCode;
  const basePrice =
    product.pricingModel === "packages"
      ? product.rental?.packages?.[0]?.price
      : product.rental?.value;
  const priceWithTax = hasTaxCode
    ? Math.round(basePrice * (1 + tax))
    : basePrice;

  return (
    <div
      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
        isSelected
          ? "bg-gradient-to-br from-primary/8 to-primary/3 border-primary/30 shadow-sm shadow-primary/10 ring-1 ring-primary/10"
          : "bg-white border-neutral-100 hover:border-primary/15 hover:bg-[#fef7f2]/50 hover:shadow-sm"
      }`}
      onClick={() => onSelect(product)}
    >
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(product)}
          color="primary"
          size="sm"
        />
      </div>

      <div
        className={`w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 transition-all ${
          isSelected ? "ring-2 ring-primary/20" : "border border-neutral-100"
        }`}
      >
        <Image
          unoptimized
          src={anyImgUrl({
            src: product.images[0]?.preview || product.images[0],
            size: 100,
          })}
          alt={product.name || "product"}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-[12.5px] font-semibold truncate transition-colors ${
            isSelected
              ? "text-darkNavy"
              : "text-darkNavy/80 group-hover:text-darkNavy"
          }`}
        >
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors ${
              isSelected
                ? "bg-primary/10 text-primary"
                : "bg-neutral-100 text-neutral-400"
            }`}
          >
            {product.category}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">
            {`${priceWithTax || 0} ر.س`}
          </span>
        </div>
      </div>
    </div>
  );
}
