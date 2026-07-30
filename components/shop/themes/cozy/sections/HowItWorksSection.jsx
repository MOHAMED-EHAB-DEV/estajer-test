"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function HowItWorksSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.howItWorks.${key}`);
  const isAr = lang === "ar";
  const brandColor = shop?.brandColor || "#F48A42";

  const title = isAr ? data?.sectionTitleAr : data?.sectionTitleEn;

  const steps = [
    {
      numLabel: "01",
      title: isAr ? data?.estajerSide?.titleAr : data?.estajerSide?.titleEn,
      items: isAr ? data?.estajerSide?.itemsAr : data?.estajerSide?.itemsEn,
    },
    {
      numLabel: "02",
      title: isAr ? data?.partnerSide?.titleAr : data?.partnerSide?.titleEn,
      items: isAr ? data?.partnerSide?.itemsAr : data?.partnerSide?.itemsEn,
    },
    {
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
        <div className="h-44 bg-[#FAF6F0] rounded-3xl border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">⚙️</span>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {t("addSteps") || "Configure timeline steps"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12 lg:mb-20">
        <span className="bg-[#FAF6F0] text-neutral-600 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-neutral-200/50 mb-3">
          {t("badge") || "Bespoke Journey"}
        </span>
        {title && (
          <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800 leading-tight">
            {title}
          </h2>
        )}
      </div>

      {/* Cozy Steps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center bg-[#FAF6F0] border border-neutral-200/40 p-6 md:p-8 rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-[0.8rem] rounded-bl-[0.8rem] shadow-sm relative group"
          >
            {/* Step leaf circle badge */}
            <div
              className="w-16 h-16 rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-md rounded-bl-md bg-white border flex items-center justify-center transition-all duration-500 shadow-sm mb-6 group-hover:rotate-12"
              style={{ borderColor: `${brandColor}40` }}
            >
              <span className="text-sm font-bold text-neutral-800">
                {step.numLabel}
              </span>
            </div>

            {/* Title */}
            {step.title && (
              <h3 className="text-base md:text-lg font-bold text-neutral-800 mb-3">
                {step.title}
              </h3>
            )}

            {/* Description lines */}
            {step.items && step.items.length > 0 && (
              <div className="flex flex-col gap-2 max-w-xs text-neutral-500 text-xs font-semibold leading-relaxed">
                {step.items.map((item, i) => (
                  <p key={i}>{item}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
