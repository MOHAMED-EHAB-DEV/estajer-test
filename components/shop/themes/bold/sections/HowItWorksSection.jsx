"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";

export default function HowItWorksSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.howItWorks.${key}`);
  const isAr = lang === "ar";
  const brandColor = shop?.brandColor || "#F48A42";

  const sectionTitle = isAr ? data?.sectionTitleAr : data?.sectionTitleEn;
  const estajerSide = data?.estajerSide;
  const partnerSide = data?.partnerSide;
  const sharedBenefits = data?.sharedBenefits;

  const columns = [
    {
      title: isAr ? estajerSide?.titleAr : estajerSide?.titleEn,
      items: isAr ? estajerSide?.itemsAr : estajerSide?.itemsEn,
      iconType: estajerSide?.iconType,
      fallbackIcon: "🤝",
      accent: true,
    },
    {
      title: isAr ? partnerSide?.titleAr : partnerSide?.titleEn,
      items: isAr ? partnerSide?.itemsAr : partnerSide?.itemsEn,
      iconType: partnerSide?.iconType,
      fallbackIcon: "🏪",
      accent: false,
    },
    {
      title: isAr ? sharedBenefits?.titleAr : sharedBenefits?.titleEn,
      items: isAr ? sharedBenefits?.itemsAr : sharedBenefits?.itemsEn,
      iconType: sharedBenefits?.iconType,
      fallbackIcon: "✨",
      accent: true,
    },
  ];

  return (
    <section className="bg-neutral-50 py-12 md:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10">
        {sectionTitle && (
          <div className="text-center flex flex-col items-center gap-3">
            <h2 className="text-2xl md:text-4xl font-black text-darkNavy">{sectionTitle}</h2>
            <div className="flex items-center gap-2">
              <div className="h-1 w-16 rounded-full" style={{ backgroundColor: brandColor }} />
              <div className="h-1 w-4 rounded-full opacity-40" style={{ backgroundColor: brandColor }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              className={`rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col gap-5 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                col.accent ? "border-transparent" : "border-neutral-200 bg-white"
              }`}
              style={col.accent ? { backgroundColor: `${brandColor}10`, borderColor: `${brandColor}30` } : {}}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md text-white"
                  style={{ backgroundColor: col.accent ? brandColor : "#f3f4f6" }}
                >
                  {col.iconType ? (
                    <FeatureIcon type={col.iconType} className={`w-6 h-6 ${col.accent ? "text-white" : "text-primary"}`} />
                  ) : (
                    <span className={col.accent ? "text-white" : "text-neutral-700"}>{col.fallbackIcon}</span>
                  )}
                </div>
                <h3 className="text-base md:text-lg font-black text-darkNavy">{col.title}</h3>
              </div>

              <ul className="flex flex-col gap-3">
                {(col.items || []).map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${brandColor}20` }}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3" style={{ color: brandColor }}>
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-600 font-medium leading-snug">{item}</span>
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
