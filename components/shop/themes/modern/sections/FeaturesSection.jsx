"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";

export default function FeaturesSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.features.${key}`);
  const isAr = lang === "ar";
  const features = data?.features || [];
  const brandColor = shop?.brandColor || "#111111";

  if (!features.length) return null;

  return (
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100/60">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Why us
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {t("title") || "Features"}
          </h2>
        </div>

        {/* Modern 3-column / 4-column card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 bg-[#F9FAFB] rounded-[2rem] border border-neutral-200/50 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col gap-5"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: brandColor }}
              >
                <FeatureIcon type={feature.iconType} className="w-5 h-5 text-white" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm md:text-base font-bold text-neutral-800 transition-colors">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
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
