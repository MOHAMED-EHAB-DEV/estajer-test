"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";

export default function FeaturesSection({ data, lang, translate, shop }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.features.${key}`);
  const isAr = lang === "ar";
  const features = data?.features || [];
  const brandColor = shop?.brandColor || "#F48A42";

  if (!features || features.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
          <h2 className="text-xl md:text-3xl font-black text-darkNavy">{t("title") || "Features"}</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col gap-4 p-5 md:p-7 rounded-2xl md:rounded-3xl border-2 border-neutral-100 hover:border-transparent bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Hover bg fill */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ backgroundColor: brandColor }}
              />
              {/* Top accent bar */}
              <div
                className="absolute top-0 start-0 end-0 h-1 rounded-t-2xl"
                style={{ backgroundColor: brandColor }}
              />

              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: brandColor }}
              >
                <FeatureIcon type={feature.iconType} className="w-6 h-6 text-white" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base md:text-lg font-black text-darkNavy leading-tight">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
                  {isAr ? feature.descAr : feature.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
