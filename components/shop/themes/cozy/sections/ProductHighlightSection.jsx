"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { normalizeShopLink } from "@/utils/normalizeShopLink";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";
import { Location } from "@/components/ui/svgs/icons/LocationSvg";
import { useProductCard } from "@/components/shop/themes/shared/useProductCard";

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

  const [descExpanded, setDescExpanded] = useState(false);

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
      className="relative overflow-hidden my-6 md:my-12 border-t border-b border-neutral-200/40 bg-[#FCFAF6] py-16 lg:py-24"
    >
      <div className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8">
        <div
          className={`flex flex-col ${imageOnEnd ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-20 items-center`}
        >
          {/* ── Left/Right Leaf Image Frame ─────────────────────────── */}
          <div className="relative w-full lg:w-[45%] aspect-square shrink-0 overflow-hidden bg-white p-3 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.2rem] rounded-bl-[1.2rem] border border-neutral-200/50 shadow-md">
            <div className="w-full h-full rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1rem] rounded-bl-[1rem] overflow-hidden relative">
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
                    className="object-contain hover:scale-105 transition-transform duration-700 p-4"
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FAF6F0] text-neutral-300">
                  🌿
                </div>
              )}
            </div>

            {/* Cozy Price Overlay */}
            {(displayPrice || displayDiscountPrice) && (
              <div className="absolute bottom-6 start-6 z-20">
                <div
                  className="bg-white border rounded-full px-5 py-2.5 shadow-md flex items-center gap-1"
                  style={{ borderColor: `${brandColor}40` }}
                >
                  {displayHasDiscount && displayDiscountPrice ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-neutral-800 flex items-center gap-0.5">
                        {displayDiscountPrice}
                        <Currency className="w-3.5 h-3.5" color="#111" />
                      </span>
                      <span className="text-[10px] text-neutral-400 line-through flex items-center gap-0.5">
                        {displayPrice}
                        <Currency
                          className="w-2.5 h-2.5"
                          color="currentColor"
                        />
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-neutral-800 flex items-center gap-0.5">
                      {displayPrice}
                      <Currency className="w-3.5 h-3.5" color="#111" />
                    </span>
                  )}
                  {hasPricingLabel && (
                    <span className="text-[9px] text-neutral-400 font-semibold border-s border-neutral-200 ps-2 uppercase">
                      {pricingLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Content Details ────────────────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center items-start gap-5 text-start">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {t("featuredProduct")}
              </span>
            </div>

            {title && (
              <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800 leading-tight">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-sm italic">
                {subtitle}
              </p>
            )}

            {name && name !== title && (
              <h3 className="text-base md:text-lg font-bold text-neutral-700">
                {name}
              </h3>
            )}

            {/* Location + Rating */}
            <div className="flex flex-wrap items-center gap-4 my-1">
              {displayCity && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
                  <Location color={brandColor} className="w-3 h-3.5 shrink-0" />
                  {displayCity}
                </div>
              )}
              {displayRating > 0 && (
                <div className="flex items-center gap-1.5 border-s border-neutral-300 ps-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3 h-3"
                      viewBox="0 0 22 22"
                      fill={
                        i < Math.round(displayRating) ? brandColor : "#E5E7EB"
                      }
                    >
                      <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                    </svg>
                  ))}
                  <span className="text-[11px] text-neutral-500 font-bold">
                    {displayRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Description Paragraph Blocks */}
            {paras.length > 0 && (
              <div
                className="text-xs md:text-sm text-neutral-500 leading-relaxed font-medium max-w-md border-s-2 ps-4"
                style={{ borderColor: `${brandColor}40` }}
              >
                {firstParas.map((para, i) => (
                  <p key={i} className="mb-2.5">
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
                      <p key={i} className="mb-2.5">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
                {hasMoreDesc && (
                  <button
                    onClick={() => setDescExpanded((p) => !p)}
                    className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-2.5 hover:underline"
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

            {/* CTA Action button */}
            {rawLink && (
              <div className="pt-2">
                <Link
                  href={rawLink}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: brandColor }}
                  aria-label={ctaText || t("rentNow")}
                >
                  {ctaText || t("rentNow")}
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`}
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
      </div>
    </section>
  );
}
