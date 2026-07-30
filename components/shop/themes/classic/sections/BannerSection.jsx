"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

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

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
      {/* Outer container — full bleed image */}
      <div className="relative h-[300px] md:h-[520px] rounded-[28px] md:rounded-[44px] overflow-hidden group shadow-2xl">
        {/* Background image or gradient */}
        {imageSrc ? (
          <>
            <Image
              unoptimized
              src={finalSrc}
              alt={title || "Banner"}
              fill
              className="object-cover transition-transform [transition-duration:1400ms] group-hover:scale-105"
            />
            {/* Deep overlay — stronger on text side, lighter on image side */}
            <div
              className="absolute inset-0"
              style={{
                background: isAr
                  ? "linear-gradient(to left, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.05) 100%)"
                  : "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.05) 100%)",
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-500" />
        )}

        {/* Decorative top border line */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/10" />

        {/* Content — bottom aligned, editorial style */}
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-14 lg:p-20">
          <div className="max-w-2xl flex flex-col gap-3 md:gap-5">
            {badge && (
              <div className="flex items-center gap-3">
                {/* Decorative line */}
                <div className="w-8 h-px bg-white/50" />
                <span className="text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em]">
                  {badge}
                </span>
              </div>
            )}

            {title && (
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
                {title}
              </h2>
            )}

            {/* Thin decorative rule below title */}
            <div className="flex items-center gap-3 py-1 md:py-2">
              <div className="w-12 md:w-16 h-0.5 bg-white/30 rounded-full" />
              <div className="w-2 h-2 rounded-full border border-white/40" />
            </div>

            {subtitle && (
              <p className="text-sm md:text-base text-white/65 leading-relaxed max-w-lg">
                {subtitle}
              </p>
            )}

            {buttonText && (
              <div className="pt-1 md:pt-2">
                <Link
                  href={buttonLink}
                  className="group/btn inline-flex items-center gap-3 px-7 md:px-10 py-3 md:py-4 rounded-2xl border-2 border-white/40 text-white text-xs md:text-sm font-black uppercase tracking-widest backdrop-blur-sm bg-white/10 hover:bg-white hover:border-white hover:text-neutral-900 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                >
                  {buttonText}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 ${isAr ? "rotate-180 group-hover/btn:translate-x-0" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Corner decorative elements */}
        <div className="absolute top-6 end-6 md:top-10 md:end-10 w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/15" />
        <div className="absolute top-10 end-10 md:top-16 md:end-16 w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/10" />
      </div>
    </section>
  );
}
