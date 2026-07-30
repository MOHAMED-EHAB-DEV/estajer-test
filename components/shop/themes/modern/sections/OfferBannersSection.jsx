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

  // Modern: Bento grid layout — first card spans 2 rows/cols, rest fill in; glassmorphism floating labels
  const isSingle = banners.length === 1;
  const isTwo = banners.length === 2;

  // Bento: first is hero, rest smaller
  const heroBanner = banners[0];
  const restBanners = banners.slice(1);
  const showBento = banners.length >= 3 && banners.length <= 4;

  if (showBento) {
    const heroSrc = (isAr || data.singleLangImage === true) ? heroBanner.imageAr : (heroBanner.imageEn || heroBanner.imageAr);
    const heroFinalSrc = heroSrc?.startsWith("data:")
      ? heroSrc
      : anyImgUrl({ src: heroSrc, size: 1200, quality: 90 });

    return (
      <section className="bg-white py-16 md:py-24 border-t border-neutral-100/60">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
          {title && (
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {isAr ? "العروض" : "Offers"}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {title}
                </h2>
              </div>
            </div>
          )}

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Hero banner */}
            <Link
              href={heroBanner.link || "#"}
              className="group relative block overflow-hidden rounded-[2rem] md:row-span-2"
              style={{ minHeight: "480px" }}
            >
              {heroSrc ? (
                <Image
                  unoptimized
                  src={heroFinalSrc}
                  alt={isAr ? heroBanner.altAr || "" : heroBanner.altEn || ""}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}cc, ${brandColor}55)`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

              {/* Glassmorphism floating badge */}
              <div className="absolute top-5 start-5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: brandColor }}
                  />
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                    {isAr ? "مميز" : "Featured"}
                  </span>
                </div>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 start-0 end-0 p-6 md:p-8">
                {(() => {
                  const bannerTitle = isAr
                    ? heroBanner.titleAr
                    : heroBanner.titleEn;
                  const bannerSubtitle = isAr
                    ? heroBanner.subtitleAr
                    : heroBanner.subtitleEn;
                  const ctaText = isAr
                    ? heroBanner.ctaTextAr
                    : heroBanner.ctaTextEn;
                  return (
                    <>
                      {bannerTitle && (
                        <h3 className="text-white text-2xl md:text-3xl font-extrabold leading-snug mb-2">
                          {bannerTitle}
                        </h3>
                      )}
                      {bannerSubtitle && (
                        <p className="text-white/70 text-sm mb-4 line-clamp-2">
                          {bannerSubtitle}
                        </p>
                      )}
                      {ctaText && (
                        <span
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]"
                          style={{ backgroundColor: brandColor }}
                        >
                          {ctaText}
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </Link>

            {/* Rest banners in vertical stack */}
            <div className="flex flex-col gap-4 md:gap-5">
              {restBanners.map((banner, idx) => {
                const src = (isAr || data.singleLangImage === true) ? banner.imageAr : (banner.imageEn || banner.imageAr);
                const alt = isAr ? banner.altAr : banner.altEn;
                const ctaText = isAr ? banner.ctaTextAr : banner.ctaTextEn;
                const bannerTitle = isAr ? banner.titleAr : banner.titleEn;
                const finalSrc = src?.startsWith("data:")
                  ? src
                  : anyImgUrl({ src, size: 700, quality: 85 });

                return (
                  <Link
                    key={idx}
                    href={banner.link || "#"}
                    className="group relative block overflow-hidden rounded-[1.5rem] flex-1"
                    style={{ minHeight: "210px" }}
                  >
                    {src ? (
                      <Image
                        unoptimized
                        src={finalSrc}
                        alt={alt || ""}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: `${brandColor}${(12 + idx * 8).toString(16)}`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex items-center p-5 md:p-6">
                      <div className="flex flex-col gap-1.5">
                        {bannerTitle && (
                          <h3 className="text-white text-base md:text-lg font-bold leading-tight max-w-[200px]">
                            {bannerTitle}
                          </h3>
                        )}
                        {ctaText && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest transition-all group-hover:underline"
                            style={{
                              color:
                                brandColor === "#111111"
                                  ? "#F9FAFB"
                                  : brandColor,
                            }}
                          >
                            {ctaText} →
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 1-2 banners: large, full width or side-by-side with pill glassmorphism labels
  return (
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100/60">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        {title && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                {isAr ? "العروض" : "Offers"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {title}
            </h2>
          </div>
        )}

        <div
          className={`grid gap-4 md:gap-5 ${isSingle ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
        >
          {banners.map((banner, idx) => {
            const src = (isAr || data.singleLangImage === true) ? banner.imageAr : (banner.imageEn || banner.imageAr);
            const alt = isAr ? banner.altAr : banner.altEn;
            const ctaText = isAr ? banner.ctaTextAr : banner.ctaTextEn;
            const bannerTitle = isAr ? banner.titleAr : banner.titleEn;
            const bannerSubtitle = isAr ? banner.subtitleAr : banner.subtitleEn;
            const finalSrc = src?.startsWith("data:")
              ? src
              : anyImgUrl({ src, size: 900, quality: 88 });

            return (
              <Link
                key={idx}
                href={banner.link || "#"}
                className="group relative block overflow-hidden rounded-[2rem] border border-neutral-200/40 shadow-sm hover:shadow-md transition-all duration-300"
                style={{ minHeight: isSingle ? "560px" : "440px" }}
              >
                {src ? (
                  <Image
                    unoptimized
                    src={finalSrc}
                    alt={alt || ""}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}cc, ${brandColor}55)`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                {/* Glassmorphism top badge */}
                <div className="absolute top-5 start-5">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-sm">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: brandColor }}
                    />
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                      {isAr ? "عرض" : "Offer"}
                    </span>
                  </div>
                </div>

                {/* Bottom */}
                <div className="absolute bottom-0 start-0 end-0 p-6 md:p-8">
                  {bannerTitle && (
                    <h3 className="text-white text-xl md:text-2xl font-extrabold leading-snug mb-1">
                      {bannerTitle}
                    </h3>
                  )}
                  {bannerSubtitle && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {bannerSubtitle}
                    </p>
                  )}
                  {ctaText && (
                    <span
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]"
                      style={{ backgroundColor: brandColor }}
                    >
                      {ctaText}
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
                          clipRule="evenodd"
                        />
                      </svg>
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
