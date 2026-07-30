"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { IconArrow } from "../Icons";

export default function BannerSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.banner.${key}`);
  const isAr = lang === "ar";

  const badge = isAr ? data?.badgeAr : data?.badgeEn;
  const title = isAr ? data?.titleAr : data?.titleEn;
  const subtitle = isAr ? data?.subtitleAr : data?.subtitleEn;
  const buttonText = isAr ? data?.buttonTextAr : data?.buttonTextEn;
  const buttonLink = data?.buttonLink || "#";
  const imageSrc = isAr ? data?.imageAr : data?.imageEn;
  const finalSrc = imageSrc?.startsWith("data:")
    ? imageSrc
    : anyImgUrl({ src: imageSrc, size: 1600 });

  const brandColor = shop?.brandColor || "#8B5E3C";

  return (
    <section
      className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
      
    >
      {/* Container - full bleed aspect */}
      <div className="relative h-[380px] md:h-[580px] rounded-none overflow-hidden group shadow-xl border border-neutral-200">
        {/* Background Image or Slate */}
        {imageSrc ? (
          <>
            <Image
              unoptimized
              src={finalSrc}
              alt={title || "Banner"}
              fill
              className="object-cover transition-transform [transition-duration:1800ms] group-hover:scale-105"
            />
            {/* Subtle elegant dimming overlay */}
            <div className="absolute inset-0 bg-black/25 transition-opacity duration-500 group-hover:bg-black/35" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#EFECE6]" />
        )}

        {/* Centered Cream Invitation Card Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2]/95 border border-[#8B5E3C]/20 max-w-xl w-full p-6 md:p-12 text-center shadow-2xl relative">
            {/* Double Border Framing Effect */}
            <div
              className="absolute inset-2 border"
              style={{ borderColor: `${brandColor}40` }}
            />
            <div
              className="absolute inset-3 border-2"
              style={{ borderColor: `${brandColor}15` }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-4 items-center">
              {badge && (
                <span
                  className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase"
                  style={{ color: brandColor }}
                >
                  {badge}
                </span>
              )}

              {title && (
                <h2 className="text-xl md:text-3xl text-neutral-800 leading-tight">
                  {title}
                </h2>
              )}

              {/* Decorative line */}
              <div className="w-16 h-px bg-neutral-300 my-1" />

              {subtitle && (
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed italic max-w-sm">
                  {subtitle}
                </p>
              )}

              {buttonText && (
                <div className="pt-2">
                  <Link
                    href={buttonLink}
                    className="inline-flex items-center gap-2 border-b border-neutral-900 pb-1 text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-800 hover:text-neutral-500 hover:border-neutral-500 transition-all"
                  >
                    <span>{buttonText}</span>
                    <IconArrow size={12} rtl={isAr} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
