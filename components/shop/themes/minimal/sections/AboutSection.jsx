"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { IconArrow } from "../Icons";

export default function AboutSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.about.${key}`);
  const isAr = lang === "ar";
  const name = isAr ? data?.shopNameAr : data?.shopNameEn;
  const description = isAr
    ? data?.aboutDescriptionAr
    : data?.aboutDescriptionEn;
  const logo = data?.aboutImage || shop?.logo;
  const buttonText = isAr
    ? data?.aboutUsButtonTextAr
    : data?.aboutUsButtonTextEn;
  const buttonLink = data?.aboutUsLink || "#products";
  const brandColor = shop?.brandColor || "#111111";

  if (!description && !name) return null;

  return (
    <section className="bg-white py-20 md:py-32 border-t border-neutral-100">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 lg:gap-32 items-center`}
        >
          {/* Image */}
          <div className={`${isAr ? "md:order-2" : ""}`}>
            <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
              {/* Offset frame line */}
              <div
                className="absolute inset-0 rounded-2xl translate-x-3 translate-y-3 border"
                style={{ borderColor: `${brandColor}30` }}
              />
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-50">
                {logo ? (
                  <Image
                    unoptimized
                    src={
                      logo.startsWith("data:")
                        ? logo
                        : anyImgUrl({ src: logo, size: 500 })
                    }
                    alt={name || ""}
                    fill
                    className="object-contain p-8"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-200">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="w-16 h-16"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`flex flex-col gap-6 md:gap-8 ${isAr ? "md:order-1" : ""}`}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: brandColor }}
            >
              {t("about") || "About Us"}
            </p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
              {name}
            </h2>

            {description && (
              <p className="text-neutral-400 text-base leading-relaxed">
                {description}
              </p>
            )}

            <Link
              href={buttonLink}
              className="inline-flex items-center gap-3 text-sm font-medium text-neutral-900 hover:gap-5 transition-all duration-300 w-fit group"
            >
              {buttonText || t("browseProducts")}
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: brandColor }}
              >
                <IconArrow size={14} rtl={isAr} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
