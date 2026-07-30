"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

// Premium SVG Icons
const StoreIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M3 12h18" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
  </svg>
);

const BoltIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2 L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
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
  const buttonLink = data?.aboutUsLink || "#products";
  const brandColor = shop?.brandColor || "#F48A42";

  if (!description && !name) return null;

  const highlights = [
    {
      icon: (
        <ShieldIcon className="w-6 h-6" style={{ color: brandColor }} />
      ),
      title: t("safeRental"),
      desc: t("safeRentalDesc"),
    },
    {
      icon: <BoltIcon className="w-6 h-6" style={{ color: brandColor }} />,
      title: t("quickResponse"),
      desc: t("quickResponseDesc"),
    },
  ];

  return (
    <section className="bg-neutral-50/50 py-16 md:py-24 border-y border-neutral-100 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
          {/* Left Column: Premium Logo/Image Display */}
          <div
            className={`col-span-1 lg:col-span-5 flex justify-center relative ${isAr ? "lg:order-2" : ""}`}
          >
            <div
              className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full filter blur-2xl opacity-10 pointer-events-none"
              style={{ backgroundColor: brandColor }}
            />

            <div className="relative">
              {/* Outer decorative card frame */}
              <div
                className="absolute -bottom-5 -end-5 w-full h-full rounded-[2.5rem] opacity-10 transform rotate-3 transition-transform hover:rotate-0 duration-500"
                style={{ backgroundColor: brandColor }}
              />

              {/* Main Image Frame */}
              <div
                className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[2rem] overflow-hidden bg-white shadow-2xl flex items-center justify-center p-4 border transition-all duration-500 hover:scale-[1.02]"
                style={{ borderColor: `${brandColor}20` }}
              >
                {logo ? (
                  <Image
                    unoptimized
                    src={
                      logo.startsWith("data:")
                        ? logo
                        : anyImgUrl({ src: logo, size: 400 })
                    }
                    alt={name || "About us"}
                    fill
                    className="object-contain p-6 transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-[1.5rem] text-neutral-400"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)`,
                    }}
                  >
                    <StoreIcon
                      className="w-16 h-16 opacity-80"
                      style={{ color: brandColor }}
                    />
                    <span className="text-[12px] font-bold uppercase tracking-wider opacity-40">
                      Estajer Partner
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Premium Typography & Details */}
          <div
            className={`col-span-1 lg:col-span-7 flex flex-col gap-6 text-start ${isAr ? "lg:order-1" : ""}`}
          >
            {/* Section Tag */}
            <div className="flex">
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm"
                style={{
                  backgroundColor: `${brandColor}12`,
                  color: brandColor,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                {t("title")}
              </span>
            </div>

            {/* Shop Name Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 leading-tight tracking-tight">
              {name}
            </h2>

            {/* Custom geometric underline */}
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 w-16 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <div
                className="h-1.5 w-3 rounded-full opacity-40"
                style={{ backgroundColor: brandColor }}
              />
              <div
                className="h-1.5 w-1.5 rounded-full opacity-20"
                style={{ backgroundColor: brandColor }}
              />
            </div>

            {/* Description */}
            {description && (
              <p className="text-neutral-600 text-base md:text-lg leading-relaxed max-w-3xl font-medium opacity-90">
                {description}
              </p>
            )}

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-w-2xl">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex gap-3.5 p-4 rounded-2xl bg-white border border-neutral-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-neutral-200/60"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-50">
                    {h.icon}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-neutral-800 text-sm md:text-base">
                      {h.title}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium leading-normal">
                      {h.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-4 flex">
              <Link
                href={buttonLink}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                style={{
                  backgroundColor: brandColor,
                  boxShadow: `0 10px 20px -10px ${brandColor}80`,
                }}
              >
                {buttonText || t("browseProducts")}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 transition-transform duration-300 ${isAr ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
