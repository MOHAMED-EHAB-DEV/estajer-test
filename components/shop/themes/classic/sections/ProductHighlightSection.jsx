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
 * Classic ProductHighlightSection
 * Aesthetic: Magazine editorial — warm cream background, ornamental dividers,
 * serif-feel headings, large asymmetric image taking full height on one side,
 * thin ruled lines, understated elegance.
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
  const brandColor = shop?.brandColor || "#8B5E3C";

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
    <section
      id="product-highlight"
      className="relative overflow-hidden my-6 md:my-12 "
      style={{ backgroundColor: "#FAF7F2" }}
    >
      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #d4c4b0 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div
        className={`flex flex-col ${imageOnEnd ? "md:flex-row-reverse" : "md:flex-row"} min-h-[500px] md:min-h-[600px] max-w-screen-2xl mx-auto w-full`}
      >
        {/* ── Image — full-height bleed ──────────────────────────── */}
        <div className="relative w-full md:w-[45%] lg:w-[50%] min-h-[320px] shrink-0 overflow-hidden">
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
                className="object-contain hover:scale-[1.03] transition-transform duration-700"
              />
            </>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: `${brandColor}10` }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="w-16 h-16"
                style={{ color: `${brandColor}50` }}
              >
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
          )}

          {/* Price overlay on image corner */}
          {(displayPrice || displayDiscountPrice) && (
            <div className="absolute bottom-6 start-6 z-20">
              <div
                className="px-4 py-3 rounded-2xl shadow-xl"
                style={{ backgroundColor: brandColor }}
              >
                {displayHasDiscount && displayDiscountPrice ? (
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white font-IBMPlex flex items-center gap-1">
                      {displayDiscountPrice}
                      <Currency className="w-4 h-4" color="#fff" />
                    </span>
                    <span className="text-xs text-white/60 line-through font-IBMPlex flex items-center gap-0.5">
                      {displayPrice}
                      <Currency className="w-2.5 h-2.5" color="currentColor" />
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-white font-IBMPlex flex items-center gap-1">
                    {displayPrice}
                    <Currency className="w-4 h-4" color="#fff" />
                  </span>
                )}
                {hasPricingLabel && (
                  <span className="text-[10px] text-white/70 mt-0.5 block">
                    {pricingLabel}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-4 md:px-6 lg:px-8 py-16 md:py-20 relative z-10 gap-5">
          {/* Title — editorial headline */}
          {title && (
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-neutral-800"
              style={{ fontFeatureSettings: "'liga' on" }}
            >
              {title}
            </h2>
          )}

          {/* Ornamental rule */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px w-6" style={{ backgroundColor: brandColor }} />
            <div
              className="w-1.5 h-1.5 rounded-full rotate-45"
              style={{ backgroundColor: brandColor }}
            />
            <div className="h-px w-6" style={{ backgroundColor: brandColor }} />
          </div>

          {subtitle && (
            <p className="text-sm md:text-base text-neutral-500 leading-relaxed max-w-sm italic">
              {subtitle}
            </p>
          )}

          {/* Product name */}
          {name && name !== title && (
            <p className="text-lg font-bold text-neutral-700">{name}</p>
          )}

          {/* Location + Rating */}
          <div className="flex flex-wrap items-center gap-4">
            {displayCity && (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Location color={brandColor} className="w-3.5 h-3.5 shrink-0" />
                {displayCity}
              </div>
            )}
            {displayRating > 0 && (
              <div className="flex items-center gap-1.5 border-s border-neutral-300 ps-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5"
                    viewBox="0 0 22 22"
                    fill={i < Math.round(displayRating) ? "#E8A838" : "#E5E7EB"}
                  >
                    <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                  </svg>
                ))}
                <span className="text-xs text-neutral-500 font-semibold">
                  {displayRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {paras.length > 0 && (
            <div
              className="text-sm text-neutral-600 leading-[1.9] max-w-lg border-s-2 ps-4"
              style={{ borderColor: `${brandColor}40` }}
            >
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
                  className="text-xs font-bold flex items-center gap-1.5 mt-2 hover:underline"
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

          {/* CTA */}
          {rawLink && (
            <div className="flex items-center gap-4 mt-2">
              <Link
                href={rawLink}
                className="inline-flex items-center gap-3 px-8 py-3.5 text-white text-sm font-bold rounded-full transition-all duration-300 hover:opacity-90 hover:scale-105 group shadow-lg"
                style={{ backgroundColor: brandColor }}
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
