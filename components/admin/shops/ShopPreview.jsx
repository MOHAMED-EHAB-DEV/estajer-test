"use client";

import React from "react";
import PartnerHero from "@/components/partner/PartnerHero";
import PartnerAbout from "@/components/partner/PartnerAbout";
import PartnerHowItWorks from "@/components/partner/PartnerHowItWorks";
import PartnerProductSlider from "@/components/partner/PartnerProductSlider";
import PartnerOfferBanners from "@/components/partner/PartnerOfferBanners";
import ShopCategoriesCarousel from "@/components/shop/ShopCategoriesCarousel";
import ShopReviews from "@/components/shop/ShopReviews";

export default function ShopPreview({
  formData,
  lang,
  translate,
  categoriesData,
  subCategoriesData,
}) {
  const shop = formData;
  const t = () => translate;

  const sections = [];

  // Hero Section (Always at top, not part of reorderable list in the same way, but uses data)
  // Note: Hero is usually fixed at top in the page.jsx

  // Build reorderable sections
  // About Us
  sections.push({
    order: shop.aboutUsOrder || 1,
    component: (
      <div
        id="preview-section-basic-info"
        key="about"
        className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8"
      >
        <PartnerAbout partner={shop} lang={lang} translate={translate} />
      </div>
    ),
  });

  // Offer Banners
  if (shop.offerBanners && shop.offerBanners.length > 0) {
    shop.offerBanners.forEach((section, idx) => {
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
  if (shop.sliders && shop.sliders.length > 0) {
    shop.sliders.forEach((slider, idx) => {
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
              products={
                slider.type === "manual" || !slider.type ? slider.products : []
              }
              displayMode={slider.displayMode}
              sourceType={slider.type}
              lang={lang}
              userId={shop.owner?._id || shop.owner}
              translate={translate}
            />
          </div>
        ),
      });
    });
  }

  // Shop Categories
  if (shop.categories && shop.categories.length > 0) {
    sections.push({
      order: shop.shopCategoriesOrder || 3.5,
      component: (
        <div
          id="preview-section-categories"
          key="categories"
          className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 mt-14 lg:mt-24"
        >
          <ShopCategoriesCarousel
            categories={shop.categories}
            lang={lang}
            shopSlug={shop.slug}
            translate={translate}
          />
        </div>
      ),
    });
  }

  // How It Works
  sections.push({
    order: shop.howItWorksOrder || 4,
    component: (
      <div
        id="preview-section-how-it-works"
        key="how-it-works"
        className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8"
      >
        <PartnerHowItWorks partner={shop} lang={lang} translate={translate} />
      </div>
    ),
  });

  // Reviews
  sections.push({
    order: shop.reviewsOrder || 5,
    component: (
      <div
        id="preview-section-reviews"
        key="reviews"
        className="px-4 md:px-6 lg:px-8 mt-16 lg:mt-24"
      >
        {shop.showReviews && shop.reviews && shop.reviews.length > 0 && (
          <ShopReviews
            reviews={shop.reviews}
            lang={lang}
            translate={translate}
            reviewsOrder={shop.reviewsOrder}
          />
        )}
      </div>
    ),
  });

  // Sort sections by order
  sections.sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen pb-20 bg-gradient-to-b from-white via-neutral-50/30 to-white overflow-x-hidden">
      <PartnerHero
        id="preview-section-hero-banners"
        banners={shop.heroBanners}
        userId={shop.owner?._id || shop.owner}
        lang={lang}
        title={
          lang === "ar"
            ? shop.heroTitleAr || shop.nameAr
            : shop.heroTitleEn || shop.nameEn
        }
        subtitle={
          lang === "ar"
            ? shop.heroDescriptionAr || shop.descriptionAr
            : shop.heroDescriptionEn || shop.descriptionEn
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
