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
  const brandColor = shop?.brandColor || "#111111";

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
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="flex flex-col md:flex-row min-h-[280px] md:min-h-[380px] rounded-2xl overflow-hidden border border-neutral-100">
          {/* ── Text panel ───────────────────────────────────────── */}
          <div className="relative flex flex-col justify-center gap-6 md:gap-8 px-8 md:px-12 lg:px-16 py-10 md:py-14 bg-white w-full md:w-1/2 shrink-0">
            {/* Brand color accent strip on the outer edge */}
            <div
              className="absolute inset-y-0 start-0 w-1 rounded-e-full"
              style={{ backgroundColor: brandColor }}
            />

            <div className="flex flex-col gap-4 md:gap-5">
              {badge && (
                <span
                  className="inline-block w-fit text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]"
                  style={{ color: brandColor }}
                >
                  {badge}
                </span>
              )}

              {title && (
                <h2 className="text-2xl md:text-4xl lg:text-[2.75rem] font-black text-neutral-900 leading-[1.1] tracking-tight">
                  {title}
                </h2>
              )}

              {subtitle && (
                <p className="text-sm md:text-[15px] text-neutral-500 leading-relaxed max-w-sm">
                  {subtitle}
                </p>
              )}
            </div>

            {buttonText && (
              <Link
                href={buttonLink}
                className="group inline-flex items-center gap-2.5 w-fit text-sm font-black uppercase tracking-widest transition-all duration-300 hover:gap-4"
                style={{ color: brandColor }}
              >
                {buttonText}
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110"
                  style={{ borderColor: brandColor }}
                >
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
              </Link>
            )}
          </div>

          {/* ── Image panel ──────────────────────────────────────── */}
          <div className="relative min-h-[200px] flex-1 bg-neutral-50">
            {imageSrc ? (
              <Image
                unoptimized
                src={finalSrc}
                alt={title || ""}
                fill
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${brandColor}18, ${brandColor}06)`,
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center"
                    style={{
                      borderColor: `${brandColor}40`,
                      color: `${brandColor}50`,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-7 h-7"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
