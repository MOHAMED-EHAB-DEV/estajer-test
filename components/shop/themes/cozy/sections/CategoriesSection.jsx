"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function CategoriesSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.categories.${key}`);
  const isAr = lang === "ar";

  const title = isAr ? data?.titleAr : data?.titleEn;
  const categories = data?.categories || [];
  const brandColor = shop?.brandColor || "#F48A42";

  if (!categories || categories.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
        <div className="h-44 bg-[#FAF6F0] rounded-3xl border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">🌿</span>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {t("addCategories") || "Featured Categories"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 md:mb-16">
        <span className="bg-[#FAF6F0] text-neutral-600 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-neutral-200/50 mb-3">
          {t("badge") || "Boutique Departments"}
        </span>
        {title && (
          <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800">
            {title}
          </h2>
        )}
      </div>

      {/* Cozy Asymmetric Squircle Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {categories.map((cat) => {
          const catName = isAr ? cat.nameAr : cat.nameEn;
          const imageSrc = cat.image || cat.preview || "";
          const finalSrc = imageSrc?.startsWith("data:")
            ? imageSrc
            : anyImgUrl({ src: imageSrc, size: 300 });

          return (
            <Link
              key={cat._id}
              href={`/${lang === "ar" ? "" : "en/"}${shop?.slug ? `shops/${shop.slug}/` : ""}search/products?shopCategory=${cat._id}`}
              className="flex flex-col items-center gap-4 group"
            >
              {/* Cozy Leaf Squircle Container */}
              <div className="relative w-full aspect-square bg-[#FAF6F0] rounded-tl-[2.2rem] rounded-br-[2.2rem] rounded-tr-[0.7rem] rounded-bl-[0.7rem] overflow-hidden border border-neutral-200/40 p-3 shadow-sm group-hover:shadow-md group-hover:border-neutral-300 transition-all duration-500">
                {/* Background blobbing highlight */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle, ${brandColor}08 0%, transparent 70%)`,
                  }}
                />

                {/* Inner image container */}
                <div className="relative w-full h-full rounded-tl-[1.8rem] rounded-br-[1.8rem] rounded-tr-[0.5rem] rounded-bl-[0.5rem] overflow-hidden bg-white">
                  {imageSrc ? (
                    <Image
                      unoptimized
                      src={finalSrc}
                      alt={catName || ""}
                      fill
                      className="object-cover transition-transform duration-750 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">
                      🌿
                    </div>
                  )}
                </div>
              </div>

              {/* Tag Name Label */}
              <span className="text-xs md:text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors tracking-wide">
                {catName}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
