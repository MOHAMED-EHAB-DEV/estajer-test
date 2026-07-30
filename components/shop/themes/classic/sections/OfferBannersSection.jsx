"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function OfferBannersSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.offerBanners.${key}`);

  const banners = data?.banners || [];
  const title = lang === "ar" ? data?.titleAr : data?.titleEn;

  if (!banners || banners.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
        {title && (
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="w-1 md:w-1.5 h-6 md:h-10 rounded-full bg-gradient-to-b from-primary to-primary/40" />
            <h2 className="text-lg md:text-3xl font-black text-darkNavy">
              {title}
            </h2>
          </div>
        )}
        <div className="h-40 bg-neutral-50 rounded-xl md:rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-2xl md:text-3xl">🏷️</span>
          <p className="text-xs md:text-sm font-medium">
            {t("addOfferBanners")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12 flex flex-col gap-6 md:gap-8">
      {title && (
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-1 md:w-1.5 h-6 md:h-10 rounded-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-lg md:text-3xl font-black text-darkNavy">
            {title}
          </h2>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl md:rounded-[32px] aspect-[16/8] shadow-lg md:shadow-xl transition-transform hover:-translate-y-1"
          >
            <Link
              href={
                banner.link
                  ? `${lang === "ar" ? "" : "/en"}${banner.link}`
                  : "#"
              }
              className="block w-full h-full"
            >
              {(() => {
                const src = (lang === "ar" || data.singleLangImage === true) ? banner.imageAr : (banner.imageEn || banner.imageAr);
                const finalSrc = src?.startsWith("data:")
                  ? src
                  : anyImgUrl({ src, size: 700 });
                return (
                  <Image
                    unoptimized
                    src={finalSrc}
                    alt={
                      lang === "ar" ? banner.altAr || "" : banner.altEn || ""
                    }
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-8">
                <span className="text-white font-bold bg-primary/90 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-sm backdrop-blur-md">
                  {lang === "ar"
                    ? banner.ctaTextAr || t("shopNow")
                    : banner.ctaTextEn || t("shopNow")}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
