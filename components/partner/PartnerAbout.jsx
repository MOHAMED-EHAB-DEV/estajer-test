"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

// Decorative SVG background shape
const DecorativeSVG = () => (
  <svg
    className="absolute -bottom-10 -end-10 w-[320px] h-[320px] opacity-[0.06] pointer-events-none"
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

// Floating dots pattern
const DotsPattern = () => (
  <svg
    className="absolute top-6 end-6 w-24 h-24 opacity-[0.07] pointer-events-none"
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

// Verified badge icon
const VerifiedIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path
      fillRule="evenodd"
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

// Arrow icon for the button
const ArrowIcon = ({ isRtl }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-4 h-4 transition-transform duration-300  ${isRtl ? "rotate-180 group-hover/btn:-translate-x-0.5" : "group-hover/btn:translate-x-0.5"}`}
  >
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default function PartnerAbout({ partner, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`partner.about.${key}`);
  const isAr = lang === "ar";
  const name = isAr ? partner.nameAr : partner.nameEn;
  const description = isAr ? partner.descriptionAr : partner.descriptionEn;

  if (!description && !name) return null;

  return (
    <section className="mt-16 lg:mt-16">
      {/* Section Header */}

      {/* About Card */}
      <div className="relative overflow-hidden shadow-sm rounded-3xl ">
        {/* Decorative elements */}
        <DecorativeSVG />
        <DotsPattern />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-primary/[0.03] pointer-events-none" />

        <div className="relative p-6 md:p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-[24px] bg-white shadow-2xl shadow-primary/10 border border-neutral-100 flex items-center justify-center overflow-hidden ring-4 ring-white relative group">
                <Image
                  unoptimized
                  src={anyImgUrl({ src: partner.logo, size: 160 })}
                  alt={name}
                  width={160}
                  height={160}
                  className="object-contain w-full h-full relative z-10"
                />
              </div>

              {/* Verified badge below logo */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-3 py-1.5 rounded-full text-xs font-bold border border-primary/15">
                <VerifiedIcon />
                {t("verifiedPartner")}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col gap-5 text-center lg:text-start">
              {/* Partner Name */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-darkNavy leading-tight">
                {name}
              </h3>

              {/* Description */}
              {description && (
                <p className="text-neutral-500 text-base md:text-lg max-w-3xl leading-relaxed font-medium">
                  {description}
                </p>
              )}

              {/* Stats/Info Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
                {/* Products count indicator */}
                {partner.sliders && partner.sliders.length > 0 && (
                  <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-100">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-5 h-5 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                    <span className="text-sm font-bold text-darkNavy">
                      {partner.sliders.reduce(
                        (acc, s) => acc + (s.products?.length || 0),
                        0,
                      )}{" "}
                      {t("products")}
                    </span>
                  </div>
                )}

                {/* Offers indicator */}
                {partner.offerBanners && partner.offerBanners.length > 0 && (
                  <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-100">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-5 h-5 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h.008v.008H6V6z"
                      />
                    </svg>
                    <span className="text-sm font-bold text-darkNavy">
                      {t("exclusiveOffers")}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="mt-3">
                <Link
                  href={
                    partner.aboutUsLink ||
                    `/${lang}/partners/${partner.slug}#products`
                  }
                  className="group/btn inline-flex items-center gap-2.5 bg-gradient-to-r from-primary to-primary/90 text-white px-7 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {isAr
                    ? partner.aboutUsButtonTextAr || t("browseProducts")
                    : partner.aboutUsButtonTextEn || t("browseProducts")}
                  <ArrowIcon isRtl={isAr} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
