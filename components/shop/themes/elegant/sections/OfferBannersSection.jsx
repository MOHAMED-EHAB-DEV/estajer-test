"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function OfferBannersSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.offerBanners.${key}`);
  const isAr = lang === "ar";
  const banners = data?.banners || [];
  const title = isAr ? data?.titleAr : data?.titleEn;
  const brandColor = shop?.brandColor || "#8B5E3C";

  if (!banners || banners.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-8 md:my-16">
        <div className="h-52 bg-[#FCFAF7] border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">🏷️</span>
          <p className="text-xs tracking-widest uppercase">
            {t("addOfferBanners") || "Configure promotional banners"}
          </p>
        </div>
      </section>
    );
  }

  // Elegant: Full-bleed cinematic — centered text overlay, letterspace, editorial feel
  const isSingle = banners.length === 1;
  const isTwo = banners.length === 2;

  return (
    <section className="bg-[#FCFAF7] py-16 md:py-28 border-t border-neutral-200/60">
      <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-12 md:gap-16">
        {title && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="w-10 h-px"
              style={{ backgroundColor: brandColor }}
            />
            <h2 className="text-2xl md:text-4xl text-neutral-900 tracking-[0.08em] font-light uppercase">
              {title}
            </h2>
            <div
              className="w-10 h-px"
              style={{ backgroundColor: brandColor }}
            />
          </div>
        )}

        {/* Elegant full-bleed cinematic grid */}
        <div
          className={`grid gap-4 md:gap-6 ${
            isSingle
              ? "grid-cols-1"
              : isTwo
                ? "grid-cols-1 md:grid-cols-2"
                : banners.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {banners.map((banner, idx) => {
            const src =
              isAr || data.singleLangImage === true
                ? banner.imageAr
                : banner.imageEn || banner.imageAr;
            const alt = isAr ? banner.altAr : banner.altEn;
            const ctaText = isAr ? banner.ctaTextAr : banner.ctaTextEn;
            const bannerTitle = isAr ? banner.titleAr : banner.titleEn;
            const bannerSubtitle = isAr ? banner.subtitleAr : banner.subtitleEn;
            const finalSrc = src?.startsWith("data:")
              ? src
              : anyImgUrl({ src, size: 900, quality: 90 });

            // Alternate aspect: first banner is taller for editorial look
            const isTall = banners.length >= 2 && idx === 0 && !isSingle;

            return (
              <Link
                key={idx}
                href={banner.link || "#"}
                className={`group relative block overflow-hidden ${isTall && isTwo ? "md:row-span-2" : ""}`}
                style={{
                  minHeight: isSingle
                    ? "600px"
                    : isTwo && isTall
                      ? "600px"
                      : "420px",
                }}
              >
                {/* Image */}
                {src ? (
                  <Image
                    unoptimized
                    src={finalSrc}
                    alt={alt || ""}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(160deg, ${brandColor}bb, ${brandColor}33)`,
                    }}
                  />
                )}

                {/* Cinematic gradient — heavy at bottom for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                {/* Center-aligned luxury label */}
                <div className="absolute top-6 start-0 end-0 flex justify-center">
                  <div
                    className="px-5 py-1.5 border"
                    style={{ borderColor: `${brandColor}80` }}
                  >
                    <span
                      className="text-[9px] font-semibold uppercase tracking-[0.35em]"
                      style={{ color: brandColor }}
                    >
                      {isAr ? "عرض حصري" : "Exclusive Offer"}
                    </span>
                  </div>
                </div>

                {/* Bottom centered text — always visible */}
                <div className="absolute bottom-0 start-0 end-0 p-6 md:p-10 flex flex-col items-center text-center gap-3">
                  {bannerTitle && (
                    <h3 className="text-white text-xl md:text-3xl font-light tracking-[0.06em] leading-snug">
                      {bannerTitle}
                    </h3>
                  )}
                  {bannerSubtitle && (
                    <p className="text-white/65 text-xs tracking-widest uppercase font-light line-clamp-1">
                      {bannerSubtitle}
                    </p>
                  )}

                  {/* Thin elegant divider */}
                  <div
                    className="w-8 h-px mt-1"
                    style={{ backgroundColor: brandColor }}
                  />

                  {ctaText && (
                    <span className="mt-1 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/90 transition-all duration-500 group-hover:text-white">
                      {ctaText}
                      <span
                        className="w-6 h-px block"
                        style={{ backgroundColor: brandColor }}
                      />
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
