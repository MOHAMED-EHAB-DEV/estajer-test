import React from "react";

import CategoriesCarousel from "./CategoriesCarousel";
import SectionTitle from "../shared/SectionTitle";
import { getTranslations } from "@/hooks/getTranslations";

// Fetch categories from backend with product counts
async function getCategories(lang) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/categories?mainOnly=true&status=active&hideFromHome=true&lang=${lang}`, //includeProductCount=true&
      { next: { revalidate: 60 * 60 * 24 * 2 }, tags: ["categories"] }, // Cache for 2 days
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return null;
  }
}

export default async function Categories({ lang }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang, ["home"]);
  const t = (key) => translate(`categories.categoriesSection.${key}`);

  // Fetch categories from backend (includes product counts)
  const categoriesData = await getCategories(lang);

  // Map categories data with product counts
  const categoriesWithCounts =
    categoriesData?.map((item) => ({
      name: item.name,
      key: item.key,
      image: item.image,
      // productCount: item.productsCount || 0,
    })) || [];

  return (
    <section
      id="categories"
      className="pt-8 md:pt-20"
      aria-label={t("ariaLabel")}
    >
      {/* <SectionTitle
        main={true}
        title={t("title")}
        text={t("description")}
        id="categories-section-title"
        lang={lang}
        className="hidden md:block"
      /> */}
      <CategoriesCarousel
        categoriesData={categoriesWithCounts}
        langPrefix={langPrefix}
        translate={translate()}
        lang={lang}
      />
    </section>
  );
}
