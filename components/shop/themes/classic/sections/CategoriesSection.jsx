"use client";

import React from "react";
import ShopCategoriesCarousel from "@/components/shop/ShopCategoriesCarousel";
import { useTranslations } from "@/hooks/useTranslations";

export default function CategoriesSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.categories.${key}`);
  const categories = data?.categories || [];

  if (!categories || categories.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
        <div className="h-48 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-3xl">📂</span>
          <p className="text-sm font-medium">{t("addCategories")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-6 md:my-12">
      <ShopCategoriesCarousel
        categories={categories}
        lang={lang}
        shopSlug={shop?.slug}
        translate={translate}
      />
    </section>
  );
}
