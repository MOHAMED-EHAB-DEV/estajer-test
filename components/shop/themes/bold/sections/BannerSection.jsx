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
  const brandColor = shop?.brandColor || "#F48A42";

  const badge = isAr ? data?.badgeAr : data?.badgeEn;
  const title = isAr ? data?.titleAr : data?.titleEn;
  const subtitle = isAr ? data?.subtitleAr : data?.subtitleEn;
  const buttonText = isAr ? data?.buttonTextAr : data?.buttonTextEn;
  const buttonLink = data?.buttonLink || "#products";
  const imageSrc = isAr ? data?.imageAr : data?.imageEn;
  const finalSrc = imageSrc?.startsWith("data:")
    ? imageSrc
    : anyImgUrl({ src: imageSrc, size: 1400 });

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div
          className={`relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[300px] md:min-h-[420px] flex flex-col-reverse md:flex-row`}
        >
          {/* ── Content panel (brand color) ─────────────────────────────── */}
          <div
            className="relative z-10 flex flex-col justify-center gap-5 md:gap-7 px-8 md:px-14 lg:px-20 py-12 md:py-16 w-full md:w-[52%] shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {/* Stripe texture */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.9) 10px, rgba(255,255,255,0.9) 12px)",
              }}
            />
            {/* Circle accents */}
            <div className="absolute -bottom-10 -start-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute top-6 end-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute top-1/2 end-0 -translate-y-1/2 w-2 h-24 bg-white/20 rounded-full pointer-events-none" />

            <div className="relative flex flex-col gap-5 md:gap-6">
              {badge && (
                <span className="inline-flex w-fit items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border border-white/40 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  {badge}
                </span>
              )}
              {title && (
                <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-black text-white leading-[1.0] tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-sm">
                  {subtitle}
                </p>
              )}
              {buttonText && (
                <div>
                  <Link
                    href={buttonLink}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white font-black text-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                    style={{ color: brandColor }}
                  >
                    {buttonText}
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`}
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

          {/* ── Image panel ─────────────────────────────────────────────── */}
          <div className="relative min-h-[200px] flex-1">
            {imageSrc ? (
              <>
                <Image
                  unoptimized
                  src={finalSrc}
                  alt={title || ""}
                  fill
                  className="object-cover"
                />
                {/* Blend from brand color into image */}
                <div
                  className="absolute inset-y-0 start-0 w-16 md:w-24 z-10 pointer-events-none"
                  style={{
                    background: `linear-gradient(to ${isAr ? "left" : "right"}, ${brandColor}, transparent)`,
                  }}
                />
              </>
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${brandColor}44, ${brandColor}11)`,
                }}
              >
                <span className="text-7xl md:text-9xl opacity-15 select-none">
                  📢
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
