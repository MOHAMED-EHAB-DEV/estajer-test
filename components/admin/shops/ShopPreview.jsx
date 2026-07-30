"use client";

import React, { Suspense, lazy } from "react";
import {
  getSectionMeta,
  getSectionComponent,
} from "@/components/shop/themes/registry";
import { useTranslations } from "@/hooks/useTranslations";

// Theme Layout Components
import ClassicHeader from "@/components/shop/themes/classic/Header";
import ClassicFooter from "@/components/shop/themes/classic/Footer";

// We need a client-side dynamic resolver since ShopPreview is a client component.
// We cache loaded modules to avoid re-importing on every render.
const moduleCache = {};

function useSectionComponent(themeId, sectionType) {
  const key = `${themeId}/${sectionType}`;
  if (!moduleCache[key]) {
    moduleCache[key] = getSectionComponent(themeId, sectionType).catch(
      () => null,
    );
  }
  return moduleCache[key];
}

// A wrapper that handles async import for each section in preview
function PreviewSection({
  section,
  formData,
  lang,
  translate,
  categoriesData,
  subCategoriesData,
}) {
  const [Component, setComponent] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    getSectionComponent(section.themeId, section.sectionType)
      .then((mod) => {
        setComponent(() => mod?.default || null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [section.themeId, section.sectionType]);

  const meta = getSectionMeta(section.themeId, section.sectionType);

  // Merge section data with defaults (defaults fill gaps before user fills real data)
  const data = {
    ...(meta?.defaults || {}),
    ...(section.data || {}),
  };

  if (!loaded) {
    return (
      <div className="h-32 bg-neutral-50 rounded-xl animate-pulse mx-4 my-4" />
    );
  }

  if (!Component) return null;

  const sectionColor = section.data?.brandColor || formData?.brandColor || "#E04B2A";
  const customShop = { ...formData, brandColor: sectionColor };

  return (
    <Component
      data={data}
      lang={lang}
      shop={customShop}
      translate={translate}
      categoriesData={categoriesData}
      subCategoriesData={subCategoriesData}
      previewMode={true}
    />
  );
}

// A wrapper that handles async import for the footer in preview
function PreviewFooter({ footerSection, formData, lang, translate }) {
  const [Component, setComponent] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const themeId = footerSection?.themeId || "classic";
    getSectionComponent(themeId, "footer")
      .then((mod) => {
        setComponent(() => mod?.default || null);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [footerSection?.themeId]);

  if (!loaded) return null;
  const FooterComp = Component || ClassicFooter;

  const footerColor = footerSection?.data?.brandColor || formData?.brandColor || "#E04B2A";
  const customShop = { ...formData, brandColor: footerColor };

  return (
    <FooterComp
      shop={customShop}
      lang={lang}
      translate={translate}
      data={footerSection?.data || {}}
    />
  );
}

// A wrapper that handles async import for the header in preview
function PreviewHeader({ headerSection, formData, lang, translate }) {
  const [Component, setComponent] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const themeId = headerSection?.themeId || "classic";
    getSectionComponent(themeId, "header")
      .then((mod) => {
        setComponent(() => mod?.default || null);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [headerSection?.themeId]);

  if (!loaded) return null;
  const HeaderComp = Component || ClassicHeader;

  const headerColor = headerSection?.data?.brandColor || formData?.brandColor || "#E04B2A";
  const customShop = { ...formData, brandColor: headerColor };

  return (
    <HeaderComp
      shop={customShop}
      lang={lang}
      translate={translate}
      data={headerSection?.data || {}}
    />
  );
}

export default function ShopPreview({
  formData,
  lang,
  translate,
  categoriesData,
  subCategoriesData,
  scrollContainerId,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.shops.${key}`);
  const sortedSections = [...(formData.sections || [])].sort(
    (a, b) => a.order - b.order,
  );
  const brandColor = formData.brandColor || "#E04B2A";

  // Extract Header/Footer data
  const headerSection = sortedSections.find((s) => s.sectionType === "header");
  const footerSection = sortedSections.find((s) => s.sectionType === "footer");

  // Filter them out from the main content loop
  const contentSections = sortedSections.filter(
    (s) => s.sectionType !== "header" && s.sectionType !== "footer",
  );

  const hexToRgbNumbers = (hex) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "244 138 66";
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `${r} ${g} ${b}`;
  };

  const alwaysWhite = headerSection?.data?.alwaysWhite === true;
  const headerColor = headerSection?.data?.brandColor;
  const footerColor = footerSection?.data?.brandColor;

  const headerContent = (
    <PreviewHeader
      headerSection={headerSection}
      formData={formData}
      lang={lang}
      translate={translate}
    />
  );

  const footerContent = (
    <PreviewFooter
      footerSection={footerSection}
      formData={formData}
      lang={lang}
      translate={translate}
    />
  );

  return (
    <div
      style={{
        "--primary-color": brandColor,
        "--primary-rgb": hexToRgbNumbers(brandColor),
      }}
    >
      {headerColor ? (
        <div
          style={{
            "--primary-color": headerColor,
            "--primary-rgb": hexToRgbNumbers(headerColor),
            display: "contents",
          }}
        >
          {headerContent}
        </div>
      ) : (
        headerContent
      )}

      <main className={`${alwaysWhite ? "" : "-mt-[5.5rem]"} min-h-screen flex flex-col bg-white overflow-x-hidden relative flex-1 bg-gradient-to-b from-white via-neutral-50/30 to-white`}>
        {contentSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-8">
            <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-4xl">
              🏪
            </div>
            <h2 className="text-lg font-black text-darkNavy">
              {t("shopIsEmpty")}
            </h2>
            <p className="text-sm text-neutral-400 max-w-[220px]">
              {t("addSectionsFromSidebar")}
            </p>
          </div>
        ) : (
          contentSections.map((section) => {
            const sectionColor = section.data?.brandColor;
            const sectionStyle = sectionColor
              ? {
                  "--primary-color": sectionColor,
                  "--primary-rgb": hexToRgbNumbers(sectionColor),
                }
              : undefined;
            return (
              <div
                key={section.instanceId}
                id={`preview-section-${section.instanceId}`}
                style={{ ...sectionStyle, display: "flow-root" }}
              >
                <PreviewSection
                  section={section}
                  formData={formData}
                  lang={lang}
                  translate={translate}
                  categoriesData={categoriesData}
                  subCategoriesData={subCategoriesData}
                />
              </div>
            );
          })
        )}
      </main>

      {footerColor ? (
        <div
          style={{
            "--primary-color": footerColor,
            "--primary-rgb": hexToRgbNumbers(footerColor),
            display: "contents",
          }}
        >
          {footerContent}
        </div>
      ) : (
        footerContent
      )}
    </div>
  );
}
