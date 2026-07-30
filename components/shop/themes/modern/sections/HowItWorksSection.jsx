"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";

export default function HowItWorksSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const isAr = lang === "ar";
  const sectionTitle = isAr ? data?.sectionTitleAr : data?.sectionTitleEn;

  const cols = [
    {
      title: isAr ? data?.estajerSide?.titleAr : data?.estajerSide?.titleEn,
      items: isAr ? data?.estajerSide?.itemsAr : data?.estajerSide?.itemsEn,
      iconType: data?.estajerSide?.iconType,
    },
    {
      title: isAr ? data?.partnerSide?.titleAr : data?.partnerSide?.titleEn,
      items: isAr ? data?.partnerSide?.itemsAr : data?.partnerSide?.itemsEn,
      iconType: data?.partnerSide?.iconType,
    },
    {
      title: isAr ? data?.sharedBenefits?.titleAr : data?.sharedBenefits?.titleEn,
      items: isAr ? data?.sharedBenefits?.itemsAr : data?.sharedBenefits?.itemsEn,
      iconType: data?.sharedBenefits?.iconType,
    },
  ];

  // Circle background colors from user's image (pink/red, orange, dark navy)
  const stepColors = ["#E11D48", "#F59E0B", "#1E1B4B"];

  return (
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100/60">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-14 md:gap-18">
        {sectionTitle && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-3.5 py-1.5 bg-neutral-50 border border-neutral-200/60 rounded-full">
                {isAr ? "آلية العمل" : "How It Works"}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight max-w-2xl leading-tight">
              {sectionTitle}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
          {cols.map((col, idx) => {
            const stepColor = stepColors[idx % stepColors.length];
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center gap-5 max-w-sm mx-auto"
              >
                {/* Circle with number or icon */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-md transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: stepColor }}
                >
                  {col.iconType ? (
                    <FeatureIcon type={col.iconType} className="w-5 h-5 text-white" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-lg md:text-xl font-bold text-neutral-800">
                    {col.title}
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-medium max-w-[290px] md:max-w-none">
                    {(col.items || []).join(" ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
