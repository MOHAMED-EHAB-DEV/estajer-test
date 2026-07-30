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

  const brandColor = shop?.brandColor || "#F48A42";

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
      {/* Container - Asymmetrical Cozy Curved Frame */}
      <div className="relative h-[320px] md:h-[500px] rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.2rem] rounded-bl-[1.2rem] overflow-hidden group shadow-lg border border-neutral-200/50">
        {/* Background Image or Gradient */}
        {imageSrc ? (
          <>
            <Image
              unoptimized
              src={finalSrc}
              alt={title || "Promo banner"}
              fill
              className="object-cover transition-transform [transition-duration:1600ms] group-hover:scale-105"
            />
            {/* Soft dimming overlay */}
            <div className="absolute inset-0 bg-neutral-900/35 transition-colors duration-500 group-hover:bg-neutral-900/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAF6F0] to-[#EFECE6]" />
        )}

        {/* Content Layout */}
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-14 lg:p-20 text-start">
          <div className="max-w-xl flex flex-col gap-3.5 items-start">
            {badge && (
              <span className="bg-white/95 backdrop-blur-sm text-neutral-800 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm border border-neutral-100">
                {badge}
              </span>
            )}

            {title && (
              <h2 className="text-2xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-sm">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-xs md:text-base text-white/90 leading-relaxed font-medium max-w-sm drop-shadow-sm">
                {subtitle}
              </p>
            )}

            {buttonText && (
              <div className="pt-2">
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-800 hover:bg-[#FAF6F0] text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <span>{buttonText}</span>
                  <IconArrow
                    size={13}
                    rtl={isAr}
                    className="text-neutral-800"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
