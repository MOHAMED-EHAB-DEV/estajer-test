"use client";

import React from "react";
import PartnerHowItWorks from "@/components/partner/PartnerHowItWorks";
import { useTranslations } from "@/hooks/useTranslations";

export default function HowItWorksSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.howItWorks.${key}`);
  // PartnerHowItWorks reads partner.howItWorks — we adapt the data shape
  const adaptedShop = {
    ...shop,
    howItWorks: {
      sectionTitleAr: data?.sectionTitleAr || "",
      sectionTitleEn: data?.sectionTitleEn || "",
      estajerSide: data?.estajerSide || {
        titleAr: "",
        titleEn: "",
        itemsAr: [],
        itemsEn: [],
      },
      partnerSide: data?.partnerSide || {
        titleAr: "",
        titleEn: "",
        itemsAr: [],
        itemsEn: [],
      },
      sharedBenefits: data?.sharedBenefits || {
        titleAr: "",
        titleEn: "",
        itemsAr: [],
        itemsEn: [],
      },
    },
  };

  const hasContent =
    data?.estajerSide?.itemsAr?.length > 0 ||
    data?.estajerSide?.itemsEn?.length > 0 ||
    data?.partnerSide?.itemsAr?.length > 0 ||
    data?.partnerSide?.itemsEn?.length > 0 ||
    data?.sharedBenefits?.itemsAr?.length > 0 ||
    data?.sharedBenefits?.itemsEn?.length > 0;

  if (!hasContent) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
        <div className="h-40 md:h-48 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-2xl md:text-3xl">⚙️</span>
          <p className="text-xs md:text-sm font-medium">{t("addSteps")}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
      <PartnerHowItWorks
        partner={adaptedShop}
        lang={lang}
        translate={translate}
      />
    </div>
  );
}
