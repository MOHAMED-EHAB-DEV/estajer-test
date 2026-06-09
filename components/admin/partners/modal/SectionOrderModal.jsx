"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaSave,
  FaGripVertical,
  FaArrowUp,
  FaArrowDown,
} from "@/components/ui/svgs/AdminIcons";
import Button from "@/components/ui/Button";
import { useTranslations } from "@/hooks/useTranslations";

export default function SectionOrderModal({
  isOpen,
  onClose,
  onSave,
  partner,
  lang,
  translate,
  translatePath = "admin.partners",
  shop,
}) {
  const trans = useTranslations(translate);

  const t = (key) => trans(`${translatePath}.${key}`);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (partner) {
      const allSections = [
        {
          id: "about",
          type: "about",
          label: t("aboutUs"),
          order: partner.aboutUsOrder ?? 1,
        },
        {
          id: "how-it-works",
          type: "how-it-works",
          label: t("howItWorks.title"),
          order: partner.howItWorksOrder ?? 4,
        },
        ...(shop
          ? [
              {
                id: "shop-categories",
                type: "shop-categories",
                label: t("shopCategories"),
                order: partner.shopCategoriesOrder ?? 3,
              },
              {
                id: "reviews",
                type: "reviews",
                label: t("reviews"),
                order: partner.reviewsOrder ?? 5,
              },
            ]
          : []),
      ];

      // Add sliders
      if (partner.sliders && partner.sliders.length > 0) {
        partner.sliders.forEach((slider, index) => {
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

      // Add offer banner sections
      if (partner.offerBanners && partner.offerBanners.length > 0) {
        partner.offerBanners.forEach((section, index) => {
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
    }
  }, [partner, lang]);

  const moveSection = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[index],
    ];
    setSections(newSections);
  };

  const handleSave = () => {
    let updatedAboutUsOrder = partner.aboutUsOrder;
    let updatedHowItWorksOrder = partner.howItWorksOrder;
    let updatedShopCategoriesOrder = partner.shopCategoriesOrder;
    let updatedReviewsOrder = partner.reviewsOrder;

    const updatedSliders = (partner.sliders || []).map((slider, sIdx) => {
      const section = sections.find(
        (s) => s.type === "slider" && s.sliderIndex === sIdx,
      );
      return section
        ? { ...slider, order: sections.indexOf(section) + 1 }
        : slider;
    });

    const updatedOfferBanners = (partner.offerBanners || []).map(
      (section, bIdx) => {
        const matchingSection = sections.find(
          (s) => s.type === "offer-banner" && s.bannerIndex === bIdx,
        );
        return matchingSection
          ? { ...section, order: sections.indexOf(matchingSection) + 1 }
          : section;
      },
    );

    sections.forEach((section, index) => {
      const orderValue = index + 1;
      if (section.type === "about") {
        updatedAboutUsOrder = orderValue;
      } else if (section.type === "how-it-works") {
        updatedHowItWorksOrder = orderValue;
      } else if (section.type === "shop-categories") {
        updatedShopCategoriesOrder = orderValue;
      } else if (section.type === "reviews") {
        updatedReviewsOrder = orderValue;
      }
    });

    onSave({
      ...partner,
      aboutUsOrder: updatedAboutUsOrder,
      howItWorksOrder: updatedHowItWorksOrder,
      shopCategoriesOrder: updatedShopCategoriesOrder,
      reviewsOrder: updatedReviewsOrder,
      sliders: updatedSliders,
      offerBanners: updatedOfferBanners,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-darkNavy">
            {t("reorder")}: {partner.nameAr}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-primary/30 transition-colors"
              >
                <div className="text-neutral-300 shrink-0">
                  <FaGripVertical size={14} />
                </div>
                <div className="flex-1 text-sm font-semibold text-darkNavy">
                  {section.label}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 text-neutral-400 hover:text-primary disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors rounded-lg hover:bg-neutral-100"
                    title={t("moveUp")}
                  >
                    <FaArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveSection(index, 1)}
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

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <Button
              onPress={handleSave}
              className="px-6 py-2 rounded-xl flex items-center gap-2 text-white text-sm shadow-lg shadow-primary/20"
            >
              <FaSave size={14} />
              {t("saveOrder")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
