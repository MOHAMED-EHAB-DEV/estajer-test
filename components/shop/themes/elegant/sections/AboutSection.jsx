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
  const brandColor = shop?.brandColor || "#8B5E3C";

  if (!description && !name) return null;

  return (
    <section
      className="bg-[#FCFAF7] py-20 md:py-32 border-t border-b border-neutral-200/40 relative overflow-hidden"
      id="about"
    >
      {/* Decorative vertical background line */}
      <div className="absolute top-0 bottom-0 start-1/2 w-px bg-neutral-200/30 hidden lg:block -translate-x-1/2" />

      <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          {/* Narrative Text Column */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-start">
            <div className="flex items-center gap-3">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: brandColor }}
              >
                {t("about") || "About Us"}
              </span>
              <div
                className="w-1.5 h-1.5 rotate-45"
                style={{ backgroundColor: brandColor }}
              />
            </div>

            <h2 className="text-3xl md:text-5xl text-neutral-900 leading-tight">
              {name}
            </h2>

            {/* Elegant double divider line */}
            <div className="flex flex-col gap-0.5 w-24">
              <div
                className="h-[2px] w-full"
                style={{ backgroundColor: brandColor }}
              />
              <div
                className="h-[0.5px] w-3/4 opacity-60"
                style={{ backgroundColor: brandColor }}
              />
            </div>

            {description && (
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed italic max-w-xl">
                {description}
              </p>
            )}

            <div className="pt-2">
              <Link
                href={buttonLink}
                className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-800 hover:text-neutral-500 transition-colors"
              >
                <span>{buttonText || t("browseProducts")}</span>
                <IconArrow
                  size={14}
                  rtl={isAr}
                  className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          {/* Luxury Frame Image Column */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Gold/Brand-colored offset border */}
              <div
                className="absolute inset-0 border transform translate-x-4 translate-y-4 transition-transform duration-700 hover:translate-x-2 hover:translate-y-2"
                style={{ borderColor: `${brandColor}40` }}
              />

              {/* Image Frame */}
              <div className="absolute inset-0 bg-white border border-neutral-200/80 p-6 flex items-center justify-center">
                {logo ? (
                  <div className="relative w-full h-full">
                    <Image
                      unoptimized
                      src={
                        logo.startsWith("data:")
                          ? logo
                          : anyImgUrl({ src: logo, size: 500 })
                      }
                      alt={name || ""}
                      fill
                      className="object-contain p-4 hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-neutral-300">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.75"
                      className="w-16 h-16"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="0" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    <span className="text-[10px] tracking-widest uppercase">
                      Estajer Boutique
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
