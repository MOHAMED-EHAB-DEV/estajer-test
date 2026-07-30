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
  const brandColor = shop?.brandColor || "#F48A42";

  if (!banners || banners.length === 0) return null;

  const gridClass =
    banners.length === 1
      ? "grid-cols-1"
      : banners.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : banners.length === 3
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-2 lg:grid-cols-4";

  return (
    <section className="bg-white my-6 md:my-12">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10 md:gap-14">
        {title && (
          <div className="flex items-center gap-5">
            <div
              className="h-10 w-2 rounded-full shrink-0"
              style={{ backgroundColor: brandColor }}
            />
            <h2 className="text-2xl md:text-4xl font-black text-neutral-900 tracking-tight">
              {title}
            </h2>
          </div>
        )}

        <div className={`grid gap-5 md:gap-6 ${gridClass}`}>
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
              : anyImgUrl({ src, size: 900, quality: 88 });

            const num = String(idx + 1).padStart(2, "0");

            return (
              <Link
                key={idx}
                href={banner.link || "#"}
                className={`group relative block overflow-hidden rounded-2xl ${
                  banners.length <= 2
                    ? "min-h-[210px] md:min-h-[420px]"
                    : "min-h-[180px] md:min-h-[360px]"
                }`}
              >
                {/* Image */}
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

                {/* Strong gradient overlay — always visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Giant background number */}
                <div className="absolute top-0 end-0 text-[10rem] md:text-[13rem] font-black leading-none select-none opacity-[0.06] text-white translate-x-4 -translate-y-4 pointer-events-none">
                  {num}
                </div>

                {/* Bottom content — always visible */}
                <div className="absolute bottom-0 start-0 end-0 p-5 md:p-7 flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-5 h-0.5 rounded-full bg-white" />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                        {num}
                      </span>
                    </div>
                    {bannerTitle && (
                      <h3 className="text-white text-lg md:text-2xl font-black leading-tight max-w-xs">
                        {bannerTitle}
                      </h3>
                    )}
                    {bannerSubtitle && (
                      <p className="text-white/70 text-xs md:text-sm font-medium line-clamp-2">
                        {bannerSubtitle}
                      </p>
                    )}
                  </div>

                  {ctaText && (
                    <span
                      className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
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

                {/* Top accent bar */}
                <div
                  className="absolute top-0 start-0 end-0 h-1"
                  style={{ backgroundColor: brandColor }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
