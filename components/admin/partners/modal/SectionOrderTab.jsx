"use client";

import React, { useState, useEffect } from "react";
import {
  FaGripVertical,
  FaArrowUp,
  FaArrowDown,
} from "@/components/ui/svgs/AdminIcons";

export default function SectionOrderTab({
  formData,
  setFormData,
  lang,
  t,
  shop,
}) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const allSections = [
      {
        id: "about",
        type: "about",
        label: t("aboutUs"),
        order: formData.aboutUsOrder ?? 1,
      },
      {
        id: "how-it-works",
        type: "how-it-works",
        label: t("howItWorks.title"),
        order: formData.howItWorksOrder ?? 4,
      },
      ...(shop
        ? [
            {
              id: "shop-categories",
              type: "shop-categories",
              label: t("shopCategories"),
              order: formData.shopCategoriesOrder ?? 3,
            },
            {
              id: "reviews",
              type: "reviews",
              label: t("reviews"),
              order: formData.reviewsOrder ?? 5,
            },
          ]
        : []),
    ];

    // Add sliders
    if (formData.sliders && formData.sliders.length > 0) {
      formData.sliders.forEach((slider, index) => {
        allSections.push({
          id: `slider-${index}`,
          type: "slider",
          sliderIndex: index,
          label: `${t("productSliders")} - ${
            lang === "ar" ? slider.titleAr : slider.titleEn
          }`,
          order: slider.order ?? 3,
        });
      });
    }

    // Add offer banner sections (multi-section)
    if (formData.offerBanners && formData.offerBanners.length > 0) {
      formData.offerBanners.forEach((section, index) => {
        allSections.push({
          id: `offer-banner-${index}`,
          type: "offer-banner",
          bannerIndex: index,
          label: `${t("offerBanners")} - ${
            lang === "ar" ? section.titleAr : section.titleEn
          }`,
          order: section.order ?? 2,
        });
      });
    }

    // Sort by current order
    allSections.sort((a, b) => a.order - b.order);
    setSections(allSections);
  }, [
    formData.aboutUsOrder,
    formData.howItWorksOrder,
    formData.shopCategoriesOrder,
    formData.reviewsOrder,
    formData.sliders,
    formData.offerBanners,
    lang,
    t,
  ]);

  const updateOrders = (newSections) => {
    const updatedSliders = [...(formData.sliders || [])];
    const updatedOfferBanners = [...(formData.offerBanners || [])];
    const updates = {
      aboutUsOrder: formData.aboutUsOrder,
      howItWorksOrder: formData.howItWorksOrder,
      shopCategoriesOrder: formData.shopCategoriesOrder,
      reviewsOrder: formData.reviewsOrder,
    };

    newSections.forEach((section, index) => {
      const orderValue = index + 1;
      if (section.type === "about") {
        updates.aboutUsOrder = orderValue;
      } else if (section.type === "how-it-works") {
        updates.howItWorksOrder = orderValue;
      } else if (section.type === "shop-categories") {
        updates.shopCategoriesOrder = orderValue;
      } else if (section.type === "reviews") {
        updates.reviewsOrder = orderValue;
      } else if (section.type === "slider") {
        updatedSliders[section.sliderIndex].order = orderValue;
      } else if (section.type === "offer-banner") {
        updatedOfferBanners[section.bannerIndex].order = orderValue;
      }
    });

    setFormData((prev) => ({
      ...prev,
      ...updates,
      sliders: updatedSliders,
      offerBanners: updatedOfferBanners,
    }));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    setSections(newSections);
    updateOrders(newSections);
  };

  const handleMoveDown = (index) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index + 1], newSections[index]] = [
      newSections[index],
      newSections[index + 1],
    ];
    setSections(newSections);
    updateOrders(newSections);
  };

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-primary/30 transition-colors"
        >
          <div className="text-neutral-300 shrink-0">
            <FaGripVertical size={14} />
          </div>
          <div className="flex-1 text-sm font-semibold text-darkNavy truncate">{section.label}</div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              className="p-1.5 text-neutral-400 hover:text-primary disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors rounded-lg hover:bg-neutral-100"
              title={t("moveUp")}
            >
              <FaArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleMoveDown(index)}
              disabled={index === sections.length - 1}
              className="p-1.5 text-neutral-400 hover:text-primary disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors rounded-lg hover:bg-neutral-100"
              title={t("moveDown")}
            >
              <FaArrowDown size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
