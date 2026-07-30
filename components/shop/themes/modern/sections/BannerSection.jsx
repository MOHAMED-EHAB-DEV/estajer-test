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
  const brandColor = shop?.brandColor || "#6C63FF";

  const badge = isAr ? data?.badgeAr : data?.badgeEn;
  const title = isAr ? data?.titleAr : data?.titleEn;
  const subtitle = isAr ? data?.subtitleAr : data?.subtitleEn;
  const buttonText = isAr ? data?.buttonTextAr : data?.buttonTextEn;
  const buttonLink = data?.buttonLink || "#products";
  const imageSrc = isAr ? data?.imageAr : data?.imageEn;
  const finalSrc = imageSrc?.startsWith("data:")
    ? imageSrc
    : anyImgUrl({ src: imageSrc, size: 1200 });

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Outer wrapper: soft gradient background behind the card */}
        <div
          className="relative rounded-[2rem] md:rounded-[3rem] p-1"
          style={{
            background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}08, #f8f8f8)`,
          }}
        >
          {/* Inner floating card */}
          <div className="relative bg-white rounded-[1.75rem] md:rounded-[2.75rem] shadow-xl shadow-neutral-200/60 overflow-hidden min-h-[300px] md:min-h-[400px] flex flex-col md:flex-row items-stretch">
            {/* ── Left content ─────────────────────────────────── */}
            <div className="flex flex-col justify-center gap-5 md:gap-7 px-8 md:px-12 lg:px-16 py-10 md:py-14 w-full md:w-1/2 shrink-0">
              {badge && (
                <span
                  className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: `${brandColor}15`,
                    color: brandColor,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                  {badge}
                </span>
              )}

              {title && (
                <h2 className="text-2xl md:text-4xl lg:text-[2.8rem] font-black text-neutral-900 leading-[1.1] tracking-tight">
                  {title}
                </h2>
              )}

              {subtitle && (
                <p className="text-sm md:text-[15px] text-neutral-500 leading-relaxed max-w-sm">
                  {subtitle}
                </p>
              )}

              {buttonText && (
                <div>
                  <Link
                    href={buttonLink}
                    className="inline-flex items-center gap-2.5 px-6 md:px-8 py-3 md:py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:shadow-xl hover:shadow-[var(--brand-color)]/25 hover:-translate-y-0.5 active:scale-95"
                    style={{
                      backgroundColor: brandColor,
                      // @ts-ignore
                      "--brand-color": brandColor,
                    }}
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

            {/* ── Right: floating image ─────────────────────────── */}
            <div className="relative flex items-center justify-center flex-1 p-4 md:p-8">
              {imageSrc ? (
                <div className="relative w-full h-full min-h-[180px] md:min-h-0 rounded-xl md:rounded-2xl overflow-hidden shadow-lg shadow-neutral-300/40">
                  <Image
                    unoptimized
                    src={finalSrc}
                    alt={title || ""}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                /* No image: soft decorative mesh */
                <div
                  className="w-full h-full min-h-[180px] md:min-h-0 rounded-xl md:rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, ${brandColor}25 0%, transparent 55%), radial-gradient(circle at 80% 70%, ${brandColor}15 0%, transparent 50%)`,
                    backgroundColor: `${brandColor}08`,
                  }}
                >
                  <div className="flex flex-col items-center gap-3 opacity-30">
                    <div
                      className="w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center"
                      style={{ borderColor: brandColor, color: brandColor }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="w-6 h-6"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtle accent blobs */}
              <div
                className="absolute top-2 end-2 w-12 h-12 md:w-16 md:h-16 rounded-full blur-2xl pointer-events-none"
                style={{ backgroundColor: `${brandColor}30` }}
              />
              <div
                className="absolute bottom-4 start-4 w-8 h-8 md:w-12 md:h-12 rounded-full blur-xl pointer-events-none"
                style={{ backgroundColor: `${brandColor}20` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
