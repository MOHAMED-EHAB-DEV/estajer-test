"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function HowItWorksSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.howItWorks.${key}`);
  const isAr = lang === "ar";
  const brandColor = shop?.brandColor || "#8B5E3C";

  const title = isAr ? data?.sectionTitleAr : data?.sectionTitleEn;

  const steps = [
    {
      num: "I",
      numLabel: "01",
      title: isAr ? data?.estajerSide?.titleAr : data?.estajerSide?.titleEn,
      items: isAr ? data?.estajerSide?.itemsAr : data?.estajerSide?.itemsEn,
    },
    {
      num: "II",
      numLabel: "02",
      title: isAr ? data?.partnerSide?.titleAr : data?.partnerSide?.titleEn,
      items: isAr ? data?.partnerSide?.itemsAr : data?.partnerSide?.itemsEn,
    },
    {
      num: "III",
      numLabel: "03",
      title: isAr
        ? data?.sharedBenefits?.titleAr
        : data?.sharedBenefits?.titleEn,
      items: isAr
        ? data?.sharedBenefits?.itemsAr
        : data?.sharedBenefits?.itemsEn,
    },
  ];

  const hasContent = steps.some((step) => step.title || step.items?.length > 0);

  if (!hasContent) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
        <div className="h-44 bg-[#FCFAF7] border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">⚙️</span>
          <p className="text-xs tracking-widest uppercase">
            {t("addSteps") || "Configure timeline steps"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center mb-12 md:mb-20">
        <span
          className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-2"
          style={{ color: brandColor }}
        >
          {t("badge") || "Bespoke Services"}
        </span>
        {title && (
          <h2 className="text-2xl md:text-4xl text-neutral-900 leading-tight">
            {title}
          </h2>
        )}
        <div className="w-12 h-px bg-neutral-300 mt-4" />
      </div>

      {/* Timeline steps */}
      <div className="relative">
        {/* Horizontal connector line on desktop */}
        <div className="absolute top-10 inset-x-12 h-px bg-neutral-200/60 hidden lg:block" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 relative z-10">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center group"
            >
              {/* Step number button */}
              <div
                className="w-20 h-20 bg-white border flex items-center justify-center transition-all duration-700 shadow-sm relative mb-6"
                style={{ borderColor: `${brandColor}40` }}
              >
                <div
                  className="absolute inset-1 border border-dashed opacity-50 transition-all duration-700"
                  style={{ borderColor: `${brandColor}20` }}
                />
                <span className="text-xl font-black tracking-widest text-neutral-800 group-hover:scale-110 transition-transform">
                  {step.num}
                </span>
              </div>

              {/* Step title */}
              {step.title && (
                <h3 className="text-base md:text-lg font-bold text-neutral-800 mb-3">
                  {step.title}
                </h3>
              )}

              {/* Step description bullet lines */}
              {step.items && step.items.length > 0 && (
                <div className="flex flex-col gap-2 max-w-xs text-neutral-500 italic text-xs leading-relaxed">
                  {step.items.map((item, i) => (
                    <p key={i}>{item}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
