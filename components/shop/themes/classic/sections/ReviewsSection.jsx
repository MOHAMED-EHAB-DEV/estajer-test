"use client";

import React from "react";
import ShopReviews from "@/components/shop/ShopReviews";
import { useTranslations } from "@/hooks/useTranslations";

export default function ReviewsSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.reviews.${key}`);
  const reviews = shop?.reviews || [];

  if (!reviews || reviews.length === 0) {
    return (
      <section className="px-4 md:px-6 lg:px-8 my-6 md:my-12">
        <div className="max-w-screen-2xl mx-auto h-40 md:h-48 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-2xl md:text-3xl">⭐</span>
          <p className="text-xs md:text-sm font-medium">{t("noReviews")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 my-6 md:my-12">
      <ShopReviews reviews={reviews} lang={lang} translate={translate} shop={shop} />
    </section>
  );
}
