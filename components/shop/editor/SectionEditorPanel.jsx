"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { getSectionMeta, THEMES } from "@/components/shop/themes/registry";
import PlanGate from "@/components/premium/PlanGate";

import HeroEditor from "./sections/HeroEditor";
import AboutEditor from "./sections/AboutEditor";
import SliderEditor from "./sections/SliderEditor";
import OfferBannersEditor from "./sections/OfferBannersEditor";
import CategoriesEditor from "./sections/CategoriesEditor";
import HowItWorksEditor from "./sections/HowItWorksEditor";
import FeaturesEditor from "./sections/FeaturesEditor";
import FaqEditor from "./sections/FaqEditor";
import ContactEditor from "./sections/ContactEditor";
import BannerEditor from "./sections/BannerEditor";
import HeaderEditor from "./sections/HeaderEditor";
import FooterEditor from "./sections/FooterEditor";
import GalleryEditor from "./sections/GalleryEditor";
import ProductHighlightEditor from "./sections/ProductHighlightEditor";

/**
 * Renders the edit form for a single section instance.
 */
export default function SectionEditorPanel({
  section,
  formData,
  setFormData,
  setActiveSectionInstance,
  onDataChange,
  handleImageUpload,
  lang,
  translate,
  categories,
  subCategories,
  onDeleteSection,
  userPlan = null,
  onUpgrade,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.editor.${key}`);

  if (!section) return null;

  const meta = getSectionMeta(section.themeId, section.sectionType);
  const data = section.data || {};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onDataChange((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThemeChange = (e) => {
    const newThemeId = e.target.value;
    const newTheme = THEMES.find((t) => t.id === newThemeId);
    if (!newTheme) return;

    const sectionMeta = newTheme.sections.find(
      (s) => s.id === section.sectionType,
    );
    const newDefaults = sectionMeta?.defaults || {};

    const updatedSection = {
      ...section,
      themeId: newThemeId,
      data: {
        ...newDefaults,
        ...section.data,
      },
    };

    setFormData((prev) => {
      let updatedSections = prev.sections.map((s) =>
        s.instanceId === section.instanceId ? updatedSection : s,
      );

      if (section.sectionType === "hero") {
        const isWhiteTextTheme = newThemeId === "classic" || newThemeId === "bold";
        const isAlwaysWhiteTheme = newThemeId === "elegant" || newThemeId === "minimal";
        updatedSections = updatedSections.map((s) => {
          if (s.sectionType === "header") {
            return {
              ...s,
              data: {
                ...s.data,
                alwaysWhite: isAlwaysWhiteTheme,
                headerDarkText: !isWhiteTextTheme && !isAlwaysWhiteTheme,
              },
            };
          }
          return s;
        });
      }

      return {
        ...prev,
        sections: updatedSections,
      };
    });

    if (setActiveSectionInstance) setActiveSectionInstance(updatedSection);
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border text-xs md:text-sm focus:outline-none transition-all shadow-sm";
  const inputStyle = {
    borderColor: "hsl(220 12% 88%)",
    background: "#fff",
    color: "hsl(225 35% 18%)",
  };
  const labelCls =
    "text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-0.5";
  const labelStyle = { color: "hsl(220 12% 52%)" };

  const isAr = lang === "ar";

  // Enhanced theme selector
  const themeSelector = (
    <div
      className="mb-5 p-4 rounded-xl flex flex-col gap-2.5"
      style={{
        background: "hsl(220 15% 97%)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "hsl(220 12% 90%)",
      }}
    >
      {/* Mini section badge */}
      <div className="flex items-center gap-2 mb-1">
        {meta?.icon && meta.icon.startsWith("<svg") ? (
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5"
            style={{
              background: "hsl(var(--primary-hsl, 24 89% 61%) / 0.1)",
              color: "var(--color-primary, #f48a42)",
            }}
            dangerouslySetInnerHTML={{ __html: meta.icon }}
          />
        ) : null}
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-bold truncate"
            style={{ color: "hsl(225 35% 20%)" }}
          >
            {isAr ? meta?.label?.ar : meta?.label?.en}
          </p>
          <p
            className="text-[10px] truncate"
            style={{ color: "hsl(220 12% 55%)" }}
          >
            {isAr ? meta?.description?.ar : meta?.description?.en}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls} style={labelStyle}>
          {t("sectionTheme")}
        </label>
        <select
          value={section.themeId}
          onChange={handleThemeChange}
          className="w-full px-3 py-2 rounded-lg text-xs md:text-sm font-semibold focus:outline-none transition-all cursor-pointer"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "hsl(220 12% 86%)",
            background: "#fff",
            color: "hsl(225 35% 18%)",
          }}
        >
          {THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {isAr ? theme.label.ar : theme.label.en}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const sectionColor = data.brandColor || formData?.brandColor || "#E04B2A";
  const hasCustomColor = !!data.brandColor;

  const sectionColorPicker = (
    <div
      className="mb-5 p-4 rounded-xl flex flex-col gap-2.5"
      style={{
        background: "hsl(220 15% 97%)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "hsl(220 12% 90%)",
      }}
    >
      <label className={labelCls} style={labelStyle}>
        {t("sectionColorOptional")}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={sectionColor}
          onChange={(e) =>
            onDataChange((prev) => ({ ...prev, brandColor: e.target.value }))
          }
          className="w-8 h-8 rounded-lg cursor-pointer p-0.5"
          style={{
            border: "1px solid hsl(220 15% 82%)",
            background: "transparent",
          }}
          title={t("sectionColor")}
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-bold"
            style={{ color: "hsl(225 35% 18%)" }}
          >
            {t("customizeSectionColor")}
          </p>
          <p className="text-[10px] font-mono text-neutral-400">
            {hasCustomColor
              ? data.brandColor
              : t("usingMainColor")}
          </p>
        </div>
        {hasCustomColor && (
          <button
            type="button"
            onClick={() =>
              onDataChange((prev) => {
                const updated = { ...prev };
                delete updated.brandColor;
                return updated;
              })
            }
            className="px-2.5 py-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
          >
            {t("reset")}
          </button>
        )}
      </div>
    </div>
  );

  const renderEditorFields = () => {
    const commonProps = {
      data,
      onDataChange,
      handleChange,
      handleImageUpload,
      t,
      trans,
      labelCls,
      inputCls,
      isAr,
      lang,
      translate,
      formData,
      onDeleteSection,
      categories,
      subCategories,
      themeId: section.themeId,
    };

    switch (section.sectionType) {
      case "hero":
        return <HeroEditor {...commonProps} />;
      case "about":
        return <AboutEditor {...commonProps} />;
      case "slider":
        return <SliderEditor {...commonProps} />;
      case "offerBanners":
        return <OfferBannersEditor {...commonProps} />;
      case "categories":
        return <CategoriesEditor {...commonProps} />;
      case "howItWorks":
        return <HowItWorksEditor {...commonProps} />;
      case "features":
        return <FeaturesEditor {...commonProps} />;
      case "faq":
        return <FaqEditor {...commonProps} />;
      case "contact":
        return <ContactEditor {...commonProps} />;
      case "banner":
        return <BannerEditor {...commonProps} />;
      case "header":
        return <HeaderEditor {...commonProps} />;
      case "footer":
        return <FooterEditor {...commonProps} />;
      case "gallery":
        return <GalleryEditor {...commonProps} />;
      case "productHighlight":
        return <ProductHighlightEditor {...commonProps} />;
      default:
        return (
          <div
            className="p-6 rounded-xl text-center text-sm"
            style={{
              background: "hsl(220 12% 96%)",
              color: "hsl(220 12% 55%)",
            }}
          >
            {t("noEditorForSection")}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col">
      <PlanGate
        withPadding={true}
        userPlan={userPlan}
        lang={lang}
        label="تغيير ثيم القسم"
        onUpgrade={onUpgrade}
      >
        {themeSelector}
      </PlanGate>
      <PlanGate
        withPadding={true}
        userPlan={userPlan}
        lang={lang}
        label="تخصيص لون القسم"
        onUpgrade={onUpgrade}
      >
        {sectionColorPicker}
      </PlanGate>
      {renderEditorFields()}
    </div>
  );
}
