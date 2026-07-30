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

  if (!banners || banners.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-8 md:my-16">
        <div className="h-52 bg-[#FAF6F0] rounded-3xl border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">🏷️</span>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {t("addOfferBanners") || "Configure promotional banners"}
          </p>
        </div>
      </section>
    );
  }

  // Cozy: Warm editorial — staggered masonry-feel with visible warm-colored label ribbons
  const isSingle = banners.length === 1;
  const isTwo = banners.length === 2;

  return (
    <section className="bg-[#FEFCF8] py-14 md:py-24 border-t border-b border-[#EDE8DE]">
      <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16">
        {title && (
          <div className="mb-10 md:mb-14 flex flex-col gap-1">
            <span
              className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: brandColor }}
            >
              {isAr ? "عروضنا" : "Our Offers"}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800 leading-tight">
              {title}
            </h2>
          </div>
        )}

        {/* Cozy staggered grid — alternating vertical offset for warmth */}
        <div
          className={`grid gap-6 md:gap-8 ${
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
              : anyImgUrl({ src, size: 900, quality: 88 });

            const isStaggered = idx % 2 !== 0 && !isSingle && !isTwo;

            return (
              <div key={idx} className={isStaggered ? "md:mt-10" : ""}>
                <Link
                  href={banner.link || "#"}
                  className="group block relative overflow-hidden rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1rem] rounded-bl-[1rem]"
                  style={{
                    minHeight: isSingle ? "560px" : isTwo ? "500px" : "400px",
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
                        background: `linear-gradient(135deg, ${brandColor}99, ${brandColor}44)`,
                      }}
                    />
                  )}

                  {/* Warm bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Warm ribbon tag — always visible at top */}
                  <div
                    className="absolute top-5 start-5 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md"
                    style={{ backgroundColor: brandColor }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="white"
                      className="w-3 h-3 opacity-90"
                    >
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z" />
                      <path d="M14 3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3h11V2h-11v1z" />
                    </svg>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {isAr ? "عرض" : "Sale"}
                    </span>
                  </div>

                  {/* Bottom text area */}
                  <div className="absolute bottom-0 start-0 end-0 p-5 md:p-8">
                    {bannerTitle && (
                      <h3 className="text-white text-xl md:text-2xl font-bold leading-snug mb-1">
                        {bannerTitle}
                      </h3>
                    )}
                    {bannerSubtitle && (
                      <p className="text-white/75 text-sm font-medium mb-4 line-clamp-2">
                        {bannerSubtitle}
                      </p>
                    )}
                    {ctaText && (
                      <span className="inline-flex items-center gap-2 bg-white/95 text-neutral-800 text-xs font-bold px-4 py-2 rounded-full shadow-sm group-hover:bg-white transition-all duration-300 group-hover:shadow-md">
                        {ctaText}
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`}
                          style={{ color: brandColor }}
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
