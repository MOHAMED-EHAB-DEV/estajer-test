"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

const DecorativeSVG = () => (
  <svg
    className="absolute -bottom-12 -end-12 w-[360px] h-[360px] opacity-[0.06] pointer-events-none text-primary"
    viewBox="0 0 400 400"
    fill="none"
  >
    <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="2" />
    <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
    <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="0.5" />
    <path
      d="M200 20 L200 380 M20 200 L380 200"
      stroke="currentColor"
      strokeWidth="0.5"
    />
    <path
      d="M72 72 L328 328 M328 72 L72 328"
      stroke="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);

const DotsPattern = () => (
  <svg
    className="absolute top-6 end-6 w-24 h-24 opacity-[0.08] pointer-events-none text-primary"
    viewBox="0 0 100 100"
    fill="currentColor"
  >
    {[0, 20, 40, 60, 80].map((x) =>
      [0, 20, 40, 60, 80].map((y) => (
        <circle key={`${x}-${y}`} cx={x + 10} cy={y + 10} r="2" />
      )),
    )}
  </svg>
);

const ArrowIcon = ({ isRtl }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-4 h-4 transition-transform duration-300 ${isRtl ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"}`}
  >
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
      clipRule="evenodd"
    />
  </svg>
);

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
  const buttonLink = data?.aboutUsLink || `#products`;

  if (!description && !name) return null;

  return (
    <section className="my-6 md:my-12 max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[32px] border border-neutral-200/50 bg-gradient-to-br from-neutral-50/50 via-white to-neutral-50/30 p-6 md:p-12 lg:p-16 shadow-sm">
        <DecorativeSVG />
        <DotsPattern />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16">
          {/* Logo Container */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative w-24 h-24 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 border border-neutral-100 flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-[1.03] group/logo ring-8 ring-neutral-50/50">
              {logo ? (
                <Image
                  unoptimized
                  src={
                    logo?.startsWith("data:")
                      ? logo
                      : anyImgUrl({ src: logo, size: 200 })
                  }
                  alt={name}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover/logo:scale-105"
                />
              ) : (
                <span className="text-3xl md:text-5xl">🏪</span>
              )}
            </div>
          </div>

          {/* Content Block */}
          <div className="flex-1 flex flex-col gap-4 text-center lg:text-start items-center lg:items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-black tracking-wider uppercase bg-primary/10 text-primary">
              {isAr ? "من نحن" : "About Us"}
            </div>

            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-darkNavy leading-tight tracking-tight">
              {name}
            </h3>

            {description && (
              <p className="text-neutral-500 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed font-medium">
                {description}
              </p>
            )}

            <div className="mt-4">
              <Link
                href={buttonLink}
                className="group/btn inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {buttonText || t("browseProducts")}
                <ArrowIcon isRtl={isAr} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
