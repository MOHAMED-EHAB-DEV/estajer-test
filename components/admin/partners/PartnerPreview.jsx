"use client";

import React from "react";
import PartnerHero from "@/components/partner/PartnerHero";
import PartnerAbout from "@/components/partner/PartnerAbout";
import PartnerHowItWorks from "@/components/partner/PartnerHowItWorks";
import PartnerProductSlider from "@/components/partner/PartnerProductSlider";
import PartnerOfferBanners from "@/components/partner/PartnerOfferBanners";

export default function PartnerPreview({
  formData,
  lang,
  translate,
  categoriesData,
  subCategoriesData,
}) {
  const partner = formData;

  const sections = [];

  sections.push({
    order: partner.aboutUsOrder || 1,
    component: (
      <div
        id="preview-section-basic-info"
        key="about"
        className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8"
      >
        <PartnerAbout partner={partner} lang={lang} translate={translate} />
      </div>
    ),
  });

  // Offer Banners
  if (partner.offerBanners && partner.offerBanners.length > 0) {
    partner.offerBanners.forEach((section, idx) => {
      sections.push({
        order: section.order ?? 2,
        component: (
          <div
            id={`preview-section-banner-${idx}`}
            key={`offer-${idx}`}
            className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 mt-16 lg:mt-24"
          >
            <PartnerOfferBanners
              section={section}
              lang={lang}
              translate={translate}
            />
          </div>
        ),
      });
    });
  }

  // Product Sliders
  if (partner.sliders && partner.sliders.length > 0) {
    partner.sliders.forEach((slider, idx) => {
      sections.push({
        order: slider.order || 3,
        component: (
          <div
            id={`preview-section-slider-${idx}`}
            key={`slider-${idx}`}
            className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 mt-14 lg:mt-24"
          >
            <PartnerProductSlider
              title={lang === "ar" ? slider.titleAr : slider.titleEn}
              products={slider.products}
              displayMode={slider.displayMode}
              lang={lang}
              userId={partner._id}
              translate={translate}
            />
          </div>
        ),
      });
    });
  }

  // How It Works
  sections.push({
    order: partner.howItWorksOrder || 4,
    component: (
      <div
        id="preview-section-how-it-works"
        key="how-it-works"
        className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8"
      >
        <PartnerHowItWorks
          partner={partner}
          lang={lang}
          translate={translate}
        />
      </div>
    ),
  });

  // Sort sections by order
  sections.sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen pb-20 bg-gradient-to-b from-white via-neutral-50/30 to-white overflow-x-hidden">
      <PartnerHero
        id="preview-section-hero-banners"
        banners={partner.heroBanners}
        providerId={partner._id}
        lang={lang}
        title={
          lang === "ar"
            ? partner.heroTitleAr || partner.nameAr
            : partner.heroTitleEn || partner.nameEn
        }
        subtitle={
          lang === "ar"
            ? partner.heroDescriptionAr || partner.descriptionAr
            : partner.heroDescriptionEn || partner.descriptionEn
        }
        categoriesData={categoriesData}
        subCategoriesData={subCategoriesData}
        translation={translate}
      />

      <div className="relative z-10 flex flex-col">
        {sections.map((section, idx) => (
          <div key={idx} style={{ order: section.order }}>
            {section.component}
          </div>
        ))}
      </div>
    </main>
  );
}
