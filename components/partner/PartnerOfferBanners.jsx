"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function PartnerOfferBanners({ section, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`partner.offerBanners.${key}`);
  if (!section || !section.banners || section.banners.length === 0) return null;

  const { banners, titleAr, titleEn } = section;

  return (
    <div className="flex flex-col gap-8">
      {/* Section Header */}
      {(titleAr || titleEn) && (
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl lg:text-3xl font-black text-darkNavy">
            {lang === "ar" ? titleAr : titleEn}
          </h2>
        </div>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-[32px] aspect-[16/8] shadow-xl transition-transform hover:-translate-y-1"
          >
            <Link
              href={
                banner.link
                  ? `${lang === "ar" ? "" : "/en"}${banner.link}`
                  : "#"
              }
              className="block w-full h-full"
            >
              <Image
                unoptimized
                src={anyImgUrl({
                  src: lang === "ar" ? banner.imageAr : banner.imageEn,
                  size: 700,
                })}
                alt={lang === "ar" ? banner.altAr || "" : banner.altEn || ""}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <span className="text-white font-bold bg-primary/90 px-6 py-2 rounded-full text-sm backdrop-blur-md">
                  {lang === "ar"
                    ? banner.ctaTextAr || t("shopNow")
                    : banner.ctaTextEn || t("shopNow")}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
