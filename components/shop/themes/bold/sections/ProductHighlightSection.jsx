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
 * Bold ProductHighlightSection
 * Aesthetic: Full dark/brand-color background, diagonal image frame, oversized
 * typography, neon-accent pricing badge, geometric decorations.
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
  const brandColor = shop?.brandColor || "#F48A42";

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
      ? anyImgUrl({ src: rawImage, size: 700, quality: 90 })
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
    <section
      className="relative overflow-hidden my-6 md:my-12"
      id="product-highlight"
      style={{ backgroundColor: "#FAFAFA" }}
    >
      {/* Brand color radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 80% at ${imageOnEnd ? "80%" : "20%"} 50%, ${brandColor}15 0%, transparent 70%)`,
        }}
      />

      {/* Large number watermark */}
      <div
        className="absolute top-0 end-0 text-[20rem] font-black leading-none opacity-[0.04] select-none pointer-events-none translate-y-[-20%] translate-x-[10%]"
        style={{ color: brandColor }}
      >
        01
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div
          className={`flex flex-col ${imageOnEnd ? "md:flex-row" : "md:flex-row-reverse"} gap-10 md:gap-12 lg:gap-20 items-stretch`}
        >
          {/* ── Content ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span
                className="h-px w-8"
                style={{ backgroundColor: brandColor }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: brandColor }}
              >
                {t("featuredProduct")}
              </span>
            </div>

            {/* Title */}
            {title && (
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-neutral-900 leading-[1.05] tracking-tighter">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-sm md:text-base text-neutral-500 leading-relaxed max-w-md">
                {subtitle}
              </p>
            )}

            {/* Product name badge */}
            {name && name !== title && (
              <div className="inline-flex items-center gap-2.5 self-start">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: brandColor }}
                />
                <span className="text-base font-bold text-neutral-800">
                  {name}
                </span>
              </div>
            )}

            {/* Location + Rating */}
            <div className="flex flex-wrap items-center gap-4">
              {displayCity && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <Location color={brandColor} className="w-4 h-4 shrink-0" />
                  {displayCity}
                </div>
              )}
              {displayRating > 0 && (
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5"
                      viewBox="0 0 22 22"
                      fill={
                        i < Math.round(displayRating) ? brandColor : "#E5E7EB"
                      }
                    >
                      <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                    </svg>
                  ))}
                  <span className="text-xs font-bold text-neutral-600">
                    {displayRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {paras.length > 0 && (
              <div className="text-sm text-neutral-600 leading-[1.8] max-w-md">
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
                    className="text-xs font-bold flex items-center gap-1.5 mt-1 hover:underline"
                    style={{ color: brandColor }}
                  >
                    {descExpanded ? t("showLess") : t("showMore")}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
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

            {/* Price — bold badge */}
            {(displayPrice || displayDiscountPrice) && (
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {displayHasDiscount && displayDiscountPrice ? (
                  <>
                    <span
                      className="inline-flex items-center gap-1 text-3xl md:text-4xl font-black font-IBMPlex px-4 py-1.5 rounded-xl"
                      style={{
                        backgroundColor: `${brandColor}12`,
                        color: brandColor,
                        border: `1.5px solid ${brandColor}30`,
                      }}
                    >
                      {displayDiscountPrice}
                      <Currency className="w-5 h-5" color="currentColor" />
                    </span>
                    <span className="text-lg text-neutral-400 line-through font-IBMPlex flex items-center gap-0.5">
                      {displayPrice}
                      <Currency className="w-3.5 h-3.5" color="currentColor" />
                    </span>
                  </>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-3xl md:text-4xl font-black font-IBMPlex px-4 py-1.5 rounded-xl"
                    style={{
                      backgroundColor: `${brandColor}12`,
                      color: brandColor,
                      border: `1.5px solid ${brandColor}30`,
                    }}
                  >
                    {displayPrice}
                    <Currency className="w-5 h-5" color="currentColor" />
                  </span>
                )}
                {hasPricingLabel && (
                  <span className="text-sm text-neutral-500">
                    {pricingLabel}
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            {rawLink && (
              <Link
                href={rawLink}
                className="inline-flex items-center gap-3 self-start px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl group mt-2"
                style={{
                  backgroundColor: brandColor,
                  color: "#fff",
                  boxShadow: `0 0 30px ${brandColor}44`,
                }}
                aria-label={ctaText || t("rentNow")}
              >
                {ctaText || t("rentNow")}
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180" : ""}`}
                >
                  <path
                    d="M5 10h10M10 5l5 5-5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
          </div>

          {/* ── Image ───────────────────────────────────────────────── */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-lg md:max-w-none">
              {/* Slanted frame */}
              <div
                className="absolute inset-0 rounded-3xl translate-x-3 translate-y-3 md:translate-x-5 md:translate-y-5"
                style={{
                  backgroundColor: `${brandColor}15`,
                  border: `1.5px solid ${brandColor}25`,
                }}
              />
              <div
                className="relative aspect-[4/3] rounded-3xl overflow-hidden"
                style={{ border: `1px solid ${brandColor}22` }}
              >
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
                      className="object-contain relative z-10 hover:scale-105 transition-transform duration-700"
                    />
                    {/* Corner brand accent */}
                    <div
                      className="absolute bottom-0 end-0 w-24 h-24 opacity-60"
                      style={{
                        backgroundImage: `linear-gradient(135deg, transparent, ${brandColor}66)`,
                      }}
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}08` }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="w-16 h-16 text-neutral-300"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
