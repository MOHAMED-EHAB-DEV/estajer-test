"use client";

import React from "react";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";
import { useTranslations } from "@/hooks/useTranslations";

export default function FeaturesSection({ data, lang, translate, shop }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.features.${key}`);
  const isAr = lang === "ar";
  const features = data?.features || [];
  const brandColor = shop?.brandColor || "#F48A42";

  if (!features || features.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
        <div className="h-44 bg-[#FAF6F0] rounded-3xl border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">🌿</span>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {t("addFeatures") || "Store Features"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
      
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group p-6 bg-[#FAF6F0] border border-neutral-200/40 rounded-tl-[2.2rem] rounded-br-[2.2rem] rounded-tr-[0.7rem] rounded-bl-[0.7rem] shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
          >
            {/* Soft decorative blob indicator */}
            <div
              className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-[0.04] transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundColor: brandColor }}
            />

            <div className="relative flex flex-col gap-4 items-start text-start">
              {/* Cozy Squircle Icon wrapper */}
              <div className="w-12 h-12 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-white border border-neutral-200/40 text-neutral-700 flex items-center justify-center group-hover:rotate-6 transition-all shadow-sm">
                <FeatureIcon type={feature.iconType} />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-neutral-800">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  {isAr ? feature.descAr : feature.descEn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
