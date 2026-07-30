"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { normalizeShopLink } from "@/utils/normalizeShopLink";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";
import { Location } from "@/components/ui/svgs/icons/LocationSvg";
import { useProductCard } from "@/components/shop/themes/shared/useProductCard";

/**
 * Minimal ProductHighlightSection
 * Aesthetic: Pure white, extreme whitespace, thin hairline rules, floating
 * price card offset from image, monospaced price display, ultra-clean grid.
 */
export default function ProductHighlightSection({
  data,
  lang,
  shop,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.productHighlight.${key}`);
  const isAr = lang === "ar";
  const langPrefix = isAr ? "" : "en/";
  const brandColor = shop?.brandColor || "#111111";

  const title = isAr ? data?.titleAr : data?.titleEn;
  const subtitle = isAr ? data?.subtitleAr : data?.subtitleEn;
  const ctaText = isAr ? data?.ctaTextAr : data?.ctaTextEn;
  const imagePosition = data?.imagePosition || "right";

  const pickedProduct = data?.product || null;
  const {
    priceWithTax,
    discountPriceWithTax,
    hasDiscount,
    productUrl,
    pricingLabel,
  } = useProductCard({
    product: pickedProduct,
    lang,
    translate,
    shopSlug: shop?.slug,
  });

  const [descExpanded, setDescExpanded] = React.useState(false);

  const name = pickedProduct
    ? pickedProduct.name
    : isAr
      ? data?.manualNameAr
      : data?.manualNameEn;

  const description = pickedProduct
    ? isAr
      ? pickedProduct.descriptionAr || pickedProduct.description
      : pickedProduct.descriptionEn || pickedProduct.description
    : isAr
      ? data?.manualDescriptionAr
      : data?.manualDescriptionEn;

  const rawImage = pickedProduct
    ? pickedProduct.images?.[0]?.preview
    : data?.manualImage;
  const displayImageSrc = rawImage?.startsWith("data:")
    ? rawImage
    : rawImage
      ? anyImgUrl({ src: rawImage, size: 800, quality: 90 })
      : null;

  const displayPrice = pickedProduct ? priceWithTax : data?.manualPrice;
  const displayDiscountPrice = pickedProduct
    ? discountPriceWithTax
    : data?.manualDiscountPrice;
  const displayHasDiscount = pickedProduct
    ? hasDiscount
    : !!data?.manualDiscountPrice;
  const displayCity = pickedProduct ? pickedProduct.address?.city : null;
  const displayRating = pickedProduct ? pickedProduct.rating?.average : null;
  const hasPricingLabel = pickedProduct && pricingLabel;

  const rawLink = pickedProduct
    ? productUrl
    : normalizeShopLink(data?.manualLink, langPrefix);

  if (!name && !displayImageSrc) return null;

  const imageOnEnd = imagePosition === "left";

  const paras = description
    ? description
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((p) => p.trim())
    : [];
  const firstParas = paras.slice(0, 2);
  const restParas = paras.slice(2);
  const hasMoreDesc = restParas.length > 0;

  return (
    <section id="product-highlight" className="my-6 md:my-12">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Top rule with label */}
        <div className="flex items-center gap-6 mb-14 md:mb-20">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-400">
            {t("featuredProduct")}
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center`}
        >
          {/* ── Image column ─────────────────────────────────────────── */}
          <div
            className={`relative ${imageOnEnd ? "md:order-2" : "md:order-1"}`}
          >
            {/* Image frame */}
            <div className="relative aspect-[4/3] bg-neutral-50 overflow-hidden">
              {displayImageSrc ? (
                <>
                  {(pickedProduct?.images?.[0]?.gradientStyle ||
                    data?.manualImageGradientStyle) && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          pickedProduct?.images?.[0]?.gradientStyle ||
                          data?.manualImageGradientStyle,
                      }}
                    />
                  )}
                  <Image
                    unoptimized
                    fill
                    src={displayImageSrc}
                    alt={name || ""}
                    className="object-contain hover:scale-[1.04] transition-transform duration-700"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    className="w-16 h-16 text-neutral-300"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
              )}
            </div>

            {/* Floating price card — offset below image */}
            {(displayPrice || displayDiscountPrice) && (
              <div
                className="absolute -bottom-5 -end-5 z-10 bg-white border border-neutral-200 shadow-lg px-5 py-4"
                style={{ boxShadow: "4px 4px 0 0 #e5e7eb" }}
              >
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">
                  {t("price")}
                </div>
                {displayHasDiscount && displayDiscountPrice ? (
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl font-black font-IBMPlex flex items-center gap-1"
                      style={{ color: brandColor }}
                    >
                      {displayDiscountPrice}
                      <Currency className="w-4 h-4" color="currentColor" />
                    </span>
                    <span className="text-sm text-neutral-400 line-through font-IBMPlex flex items-center">
                      {displayPrice}
                      <Currency className="w-2.5 h-2.5" color="#A0AEC0" />
                    </span>
                  </div>
                ) : (
                  <span
                    className="text-2xl font-black font-IBMPlex flex items-center gap-1"
                    style={{ color: brandColor }}
                  >
                    {displayPrice}
                    <Currency className="w-4 h-4" color="currentColor" />
                  </span>
                )}
                {hasPricingLabel && (
                  <div className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wide">
                    {pricingLabel}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Content column ────────────────────────────────────────── */}
          <div
            className={`flex flex-col gap-6 pt-4 ${imageOnEnd ? "md:order-1" : "md:order-2"}`}
          >
            {/* Title */}
            {title && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-xs">
                {subtitle}
              </p>
            )}

            {/* Thin rule */}
            <div className="h-px w-12 bg-neutral-200" />

            {/* Product name */}
            {name && name !== title && (
              <p className="text-base font-semibold text-neutral-700">{name}</p>
            )}

            {/* Location + Rating */}
            <div className="flex flex-col gap-2.5">
              {displayCity && (
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Location
                    color={brandColor}
                    className="w-3.5 h-3.5 shrink-0"
                  />
                  {displayCity}
                </div>
              )}
              {displayRating > 0 && (
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          i < Math.round(displayRating)
                            ? brandColor
                            : "#e5e7eb",
                      }}
                    />
                  ))}
                  <span className="text-xs text-neutral-500 ms-1">
                    {displayRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Thin rule */}
            <div className="h-px w-full bg-neutral-100" />

            {/* Description */}
            {paras.length > 0 && (
              <div className="text-sm text-neutral-500 leading-[1.9]">
                {firstParas.map((para, i) => (
                  <p key={i} className="mb-2">
                    {para}
                  </p>
                ))}
                {hasMoreDesc && (
                  <div
                    style={{
                      maxHeight: descExpanded ? "1000px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.4s ease",
                    }}
                  >
                    {restParas.map((para, i) => (
                      <p key={i} className="mb-2">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
                {hasMoreDesc && (
                  <button
                    onClick={() => setDescExpanded((p) => !p)}
                    className="text-xs font-semibold flex items-center gap-1.5 mt-1.5 hover:underline"
                    style={{ color: brandColor }}
                  >
                    {descExpanded ? t("showLess") : t("showMore")}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-3 h-3"
                    >
                      {descExpanded ? (
                        <polyline points="18 15 12 9 6 15" />
                      ) : (
                        <polyline points="6 9 12 15 18 9" />
                      )}
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Thin rule */}
            <div className="h-px w-full bg-neutral-100" />

            {/* CTA — borderless text link style */}
            {rawLink && (
              <Link
                href={rawLink}
                className="inline-flex items-center gap-3 text-sm font-bold group self-start hover:opacity-70 transition-opacity"
                style={{ color: brandColor }}
                aria-label={ctaText || t("rentNow")}
              >
                {ctaText || t("rentNow")}
                <span
                  className="inline-flex items-center justify-center w-8 h-8 border rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{ borderColor: brandColor }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`}
                    style={{ color: brandColor }}
                  >
                    <path
                      d="M5 10h10M10 5l5 5-5 5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="h-px w-full bg-neutral-100 mt-14 md:mt-20" />
      </div>
    </section>
  );
}
