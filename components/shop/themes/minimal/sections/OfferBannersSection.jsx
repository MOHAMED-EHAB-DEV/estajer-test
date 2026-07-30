"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function OfferBannersSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const isAr = lang === "ar";
  const banners = data?.banners || [];
  const title = isAr ? data?.titleAr : data?.titleEn;
  const brandColor = shop?.brandColor || "#111111";

  if (!banners || banners.length === 0) return null;

  // Minimal: Swiss-grid — image on one side, caption text panel on the other (2-column split)
  // For > 2, switch to a clean stacked list with numbered labels
  const isSingle = banners.length === 1;
  const isTwo = banners.length === 2;
  const isListMode = banners.length >= 3;

  if (isListMode) {
    return (
      <section className="bg-white py-16 md:py-24 border-t border-neutral-100">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-10 md:gap-14">
          {title && (
            <div className="flex items-end justify-between border-b border-neutral-100 pb-6">
              <div className="flex flex-col gap-1">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: brandColor }}
                >
                  {isAr ? "العروض" : "Offers"}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                  {title}
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {banners.length} {isAr ? "عروض" : "promotions"}
              </span>
            </div>
          )}

          <div
            className={`grid gap-4 md:gap-5 ${
              banners.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {banners.map((banner, idx) => {
              const src = (isAr || data.singleLangImage === true) ? banner.imageAr : (banner.imageEn || banner.imageAr);
              const alt = isAr ? banner.altAr : banner.altEn;
              const ctaText = isAr ? banner.ctaTextAr : banner.ctaTextEn;
              const bannerTitle = isAr ? banner.titleAr : banner.titleEn;
              const finalSrc = src?.startsWith("data:")
                ? src
                : anyImgUrl({ src, size: 800, quality: 85 });

              return (
                <Link
                  key={idx}
                  href={banner.link || "#"}
                  className="group flex flex-col gap-0"
                >
                  {/* Image */}
                  <div
                    className="relative overflow-hidden bg-neutral-100"
                    style={{ minHeight: "300px" }}
                  >
                    {src ? (
                      <Image
                        unoptimized
                        src={finalSrc}
                        alt={alt || ""}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: `${brandColor}18` }}
                      />
                    )}
                    {/* Thin top number bar */}
                    <div
                      className="absolute top-0 start-0 end-0 h-0.5"
                      style={{ backgroundColor: brandColor }}
                    />
                    <span className="absolute top-3 start-3 text-[10px] font-black text-white bg-black/50 px-2 py-0.5 rounded">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Caption panel */}
                  <div className="flex items-center justify-between px-1 pt-3 pb-1 border-b border-neutral-100">
                    {bannerTitle && (
                      <p className="text-sm font-semibold text-neutral-800 truncate">
                        {bannerTitle}
                      </p>
                    )}
                    {ctaText && (
                      <span
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wider ms-2 transition-all group-hover:underline"
                        style={{ color: brandColor }}
                      >
                        {ctaText} →
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 1-2 banners: Swiss split layout — image left/right, text panel beside
  return (
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-10 md:gap-14">
        {title && (
          <div className="flex flex-col gap-1 border-b border-neutral-100 pb-6">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: brandColor }}
            >
              {isAr ? "العروض" : "Offers"}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              {title}
            </h2>
          </div>
        )}

        <div className="flex flex-col gap-8 md:gap-12">
          {banners.map((banner, idx) => {
            const src = (isAr || data.singleLangImage === true) ? banner.imageAr : (banner.imageEn || banner.imageAr);
            const alt = isAr ? banner.altAr : banner.altEn;
            const ctaText = isAr ? banner.ctaTextAr : banner.ctaTextEn;
            const bannerTitle = isAr ? banner.titleAr : banner.titleEn;
            const bannerSubtitle = isAr ? banner.subtitleAr : banner.subtitleEn;
            const finalSrc = src?.startsWith("data:")
              ? src
              : anyImgUrl({ src, size: 900, quality: 88 });

            // Alternate: even idx has image start, odd has image end
            const imageEnd = idx % 2 !== 0;

            return (
              <Link
                key={idx}
                href={banner.link || "#"}
                className={`group flex flex-col md:flex-row gap-0 border border-neutral-100 overflow-hidden hover:border-neutral-200 transition-all duration-300 hover:shadow-sm ${imageEnd ? "md:flex-row-reverse" : ""}`}
              >
                {/* Image side */}
                <div
                  className="relative flex-1 overflow-hidden bg-neutral-50"
                  style={{ minHeight: "380px" }}
                >
                  {src ? (
                    <Image
                      unoptimized
                      src={finalSrc}
                      alt={alt || ""}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: `${brandColor}18` }}
                    />
                  )}
                </div>

                {/* Text panel */}
                <div className="flex flex-col justify-between p-8 md:p-12 bg-white md:w-72 lg:w-80 shrink-0 border-t md:border-t-0 border-neutral-100">
                  <div className="flex flex-col gap-4">
                    <span
                      className="text-[10px] font-black uppercase tracking-[0.3em]"
                      style={{ color: brandColor }}
                    >
                      {isAr ? "عرض خاص" : "Special Offer"} ·{" "}
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {bannerTitle && (
                      <h3 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
                        {bannerTitle}
                      </h3>
                    )}
                    {bannerSubtitle && (
                      <p className="text-sm text-neutral-500 leading-relaxed">
                        {bannerSubtitle}
                      </p>
                    )}
                  </div>

                  {ctaText && (
                    <div className="mt-8 flex items-center gap-3">
                      <span
                        className="text-sm font-bold tracking-wide transition-all group-hover:underline"
                        style={{ color: brandColor }}
                      >
                        {ctaText}
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:translate-x-0" : ""}`}
                        style={{ color: brandColor }}
                      >
                        <path
                          d="M5 10h10M10 5l5 5-5 5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
