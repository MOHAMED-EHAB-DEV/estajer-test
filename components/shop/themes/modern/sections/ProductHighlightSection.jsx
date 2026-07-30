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
 * Modern ProductHighlightSection
 * Aesthetic: Soft gradient bg blobs, the image sits inside a rounded card
 * with floating glassmorphic info badges (rating, city), a bold price pill,
 * smooth animations and a generous two-column layout.
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
  const imagePosition = data?.imagePosition || "left";

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

  const imageOnEnd = imagePosition === "right";

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
      className="relative overflow-hidden py-16 md:py-24 lg:py-32"
      style={{
        background:
          "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #F8FAFC 100%)",
      }}
    >
      {/* Background blobs */}
      <div
        className="absolute -top-24 -start-24 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${brandColor}0d` }}
      />
      <div
        className="absolute -bottom-24 -end-24 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${brandColor}08` }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div
          className={`flex flex-col ${imageOnEnd ? "md:flex-row" : "md:flex-row-reverse"} gap-10 md:gap-14 lg:gap-20 items-center`}
        >
          {/* ── Image card ──────────────────────────────────────────── */}
          <div className="flex-1 w-full max-w-lg md:max-w-none">
            {/* Outer card with subtle border */}
            <div
              className="relative rounded-[2.5rem] p-2 shadow-xl"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: `0 20px 60px ${brandColor}18, 0 4px 20px rgba(0,0,0,0.08)`,
              }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-white">
                {displayImageSrc ? (
                  <>
                    {(pickedProduct?.images?.[0]?.gradientStyle || data?.manualImageGradientStyle) && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: pickedProduct?.images?.[0]?.gradientStyle || data?.manualImageGradientStyle,
                        }}
                      />
                    )}
                    <Image
                      unoptimized
                      fill
                      src={displayImageSrc}
                      alt={name || ""}
                      className="object-contain hover:scale-105 transition-transform duration-700"
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
                      className="w-14 h-14 text-neutral-300"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      <circle cx="9" cy="9" r="2" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Floating rating badge */}
              {displayRating > 0 && (
                <div
                  className="absolute top-5 start-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 22 22"
                    fill="#F59E0B"
                  >
                    <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                  </svg>
                  <span className="text-xs font-bold text-neutral-700">
                    {displayRating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Floating city badge */}
              {displayCity && (
                <div
                  className="absolute top-5 end-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <Location color={brandColor} className="w-3 h-3 shrink-0" />
                  <span className="text-xs font-semibold text-neutral-600">
                    {displayCity}
                  </span>
                </div>
              )}

              {/* Price pill on bottom */}
              {(displayPrice || displayDiscountPrice) && (
                <div className="absolute bottom-5 end-6 z-10">
                  <div
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap"
                    style={{
                      background: brandColor,
                      boxShadow: `0 8px 24px ${brandColor}40`,
                    }}
                  >
                    {displayHasDiscount && displayDiscountPrice ? (
                      <>
                        <span className="text-xl font-black font-IBMPlex text-white flex items-center gap-1">
                          {displayDiscountPrice}
                          <Currency
                            className="w-4 h-4"
                            color="rgba(255,255,255,0.9)"
                          />
                        </span>
                        <span className="text-sm text-white/60 line-through font-IBMPlex flex items-center gap-0.5">
                          {displayPrice}
                          <Currency className="w-3 h-3" color="currentColor" />
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-black font-IBMPlex text-white flex items-center gap-1">
                        {displayPrice}
                        <Currency
                          className="w-4 h-4"
                          color="rgba(255,255,255,0.9)"
                        />
                      </span>
                    )}
                    {hasPricingLabel && (
                      <span className="text-[10px] text-white/70 ms-0.5">
                        {pricingLabel}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Content ───────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Eyebrow pill */}
            <div
              className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest"
              style={{
                borderColor: `${brandColor}30`,
                backgroundColor: `${brandColor}0a`,
                color: brandColor,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              {t("featuredProduct")}
            </div>

            {/* Title */}
            {title && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 leading-[1.1] tracking-tight">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-sm">
                {subtitle}
              </p>
            )}

            {/* Product name */}
            {name && name !== title && (
              <p className="text-base font-semibold text-neutral-600">{name}</p>
            )}

            {/* Separator */}
            <div
              className="h-px w-16"
              style={{
                backgroundImage: `linear-gradient(to end, ${brandColor}, transparent)`,
              }}
            />

            {/* Description */}
            {paras.length > 0 && (
              <div className="text-sm text-neutral-500 leading-[1.9] max-w-md">
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
                    className="text-xs font-bold flex items-center gap-1.5 mt-1.5 hover:underline"
                    style={{ color: brandColor }}
                  >
                    {descExpanded
                      ? t("showLess")
                      : t("showMore")}
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
              <div className="mt-2">
                <Link
                  href={rawLink}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl text-white text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                  style={{
                    backgroundColor: brandColor,
                    boxShadow: `0 8px 24px ${brandColor}30`,
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
