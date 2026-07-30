"use client";

import React from "react";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";
import { useTranslations } from "@/hooks/useTranslations";

export default function FeaturesSection({ data, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.features.${key}`);
  const isAr = lang === "ar";
  const features = data?.features || [];

  if (!features || features.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
        <div className="h-40 bg-neutral-50 rounded-2xl md:rounded-3xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-2xl md:text-3xl">✨</span>
          <p className="text-sm font-medium">{t("addFeatures")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group p-4 md:p-8 rounded-2xl md:rounded-[32px] bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-primary/5 rounded-bl-[60px] md:rounded-bl-[100px] -mr-6 md:-mr-8 -mt-6 md:-mt-8 group-hover:scale-110 transition-transform duration-500" />

            <div className="relative flex flex-col gap-3 md:ga4">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <FeatureIcon type={feature.iconType} />
              </div>

              <div className="flex flex-col gap-1 md:gap-2">
                <h3 className="text-base md:text-lg font-black text-darkNavy group-hover:text-primary transition-colors">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-[11px] md:text-sm text-neutral-500 leading-relaxed font-medium">
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
