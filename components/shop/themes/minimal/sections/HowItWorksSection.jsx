"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";

export default function HowItWorksSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const isAr = lang === "ar";
  const brandColor = shop?.brandColor || "#111111";
  const sectionTitle = isAr ? data?.sectionTitleAr : data?.sectionTitleEn;

  const cols = [
    {
      title: isAr ? data?.estajerSide?.titleAr : data?.estajerSide?.titleEn,
      items: isAr ? data?.estajerSide?.itemsAr : data?.estajerSide?.itemsEn,
      iconType: data?.estajerSide?.iconType,
      num: "01",
    },
    {
      title: isAr ? data?.partnerSide?.titleAr : data?.partnerSide?.titleEn,
      items: isAr ? data?.partnerSide?.itemsAr : data?.partnerSide?.itemsEn,
      iconType: data?.partnerSide?.iconType,
      num: "02",
    },
    {
      title: isAr
        ? data?.sharedBenefits?.titleAr
        : data?.sharedBenefits?.titleEn,
      items: isAr
        ? data?.sharedBenefits?.itemsAr
        : data?.sharedBenefits?.itemsEn,
      iconType: data?.sharedBenefits?.iconType,
      num: "03",
    },
  ];

  return (
    <section className="bg-neutral-50 py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-10 md:gap-14">
        {sectionTitle && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Process
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              {sectionTitle}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          {cols.map((col, idx) => (
            <div
              key={idx}
              className="py-8 md:py-0 md:px-8 first:md:ps-0 last:md:pe-0 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-4xl md:text-5xl font-bold tracking-tight leading-none"
                  style={{ color: `${brandColor}20` }}
                >
                  {col.num}
                </span>
                {col.iconType && (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-neutral-200/50 text-neutral-500"
                  >
                    <FeatureIcon type={col.iconType} className="w-5 h-5" />
                  </div>
                )}
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {(col.items || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div
                      className="w-1 h-1 rounded-full shrink-0 mt-2"
                      style={{ backgroundColor: brandColor }}
                    />
                    <span className="text-sm text-neutral-500 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
