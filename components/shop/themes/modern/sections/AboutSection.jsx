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
    <section
      className="bg-white py-20 md:py-28 border-t border-neutral-100/60"
      id="about"
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">
          {/* Image/Logo grid-break layout */}
          <div className={`${isAr ? "md:order-2" : ""}`}>
            <div className="relative aspect-square max-w-md mx-auto md:mx-0 p-4 bg-[#F9FAFB] rounded-[2.5rem] border border-neutral-200/50 shadow-sm">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white flex items-center justify-center">
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
                    className="object-contain p-10 hover:scale-105 transition-transform duration-500"
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
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`flex flex-col gap-6 text-center md:text-start items-center md:items-start ${isAr ? "md:order-1" : ""}`}
          >
            <div className="inline-flex items-center gap-2">
              <span
                className="w-6 h-[1px]"
                style={{ backgroundColor: brandColor }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: brandColor }}
              >
                {t("about") || "About Us"}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-[1.2] tracking-tight max-w-md">
              {name}
            </h2>

            {description && (
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-lg">
                {description}
              </p>
            )}

            <Link
              href={buttonLink}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
              style={{ backgroundColor: brandColor }}
            >
              {buttonText || t("browseProducts")}
              <IconArrow
                size={14}
                rtl={isAr}
                className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
