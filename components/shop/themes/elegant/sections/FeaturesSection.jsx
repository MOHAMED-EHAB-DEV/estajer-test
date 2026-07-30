"use client";

import React from "react";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";
import { useTranslations } from "@/hooks/useTranslations";

export default function FeaturesSection({ data, lang, translate, shop }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.features.${key}`);
  const isAr = lang === "ar";
  const features = data?.features || [];
  const brandColor = shop?.brandColor || "#8B5E3C";

  if (!features || features.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
        <div className="h-44 bg-[#FCFAF7] border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">✨</span>
          <p className="text-xs tracking-widest uppercase">
            {t("addFeatures") || "Configure Store Features"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
      {/* Luxury vertical/horizontal list layout instead of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 border-t border-b border-neutral-200/80 py-12">
        {features.map((feature, idx) => (
          <div key={idx} className="flex gap-5 items-start text-start group">
            {/* Elegant minimalist gold marker */}
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0 border border-neutral-300/80 rounded-none group-hover:border-neutral-800 transition-colors">
              <div
                className="w-1.5 h-1.5 rotate-45 transition-transform duration-500 group-hover:rotate-90"
                style={{ backgroundColor: brandColor }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-semibold text-neutral-800 tracking-wide">
                {isAr ? feature.titleAr : feature.titleEn}
              </h3>
              <p className="text-xs text-neutral-400 italic leading-relaxed">
                {isAr ? feature.descAr : feature.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
