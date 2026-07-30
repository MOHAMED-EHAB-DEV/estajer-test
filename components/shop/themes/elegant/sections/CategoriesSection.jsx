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
  const brandColor = shop?.brandColor || "#8B5E3C";

  if (!categories || categories.length === 0) {
    return (
      <section
        className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
        
      >
        <div className="h-44 bg-[#FCFAF7] border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">📂</span>
          <p className="text-xs tracking-widest uppercase">
            {t("addCategories") || "Select featured categories"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
      
    >
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center mb-10 md:mb-16">
        <span
          className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-2"
          style={{ color: brandColor }}
        >
          {t("badge") || "Boutique Collections"}
        </span>
        {title && (
          <h2 className="text-2xl md:text-4xl text-neutral-900">{title}</h2>
        )}
        <div className="w-12 h-px bg-neutral-300 mt-4" />
      </div>

      {/* Unique Ringed/Circular Categories Layout */}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
        {categories.map((cat) => {
          const catName = isAr ? cat.nameAr : cat.nameEn;
          const imageSrc = cat.image || cat.preview || "";
          const finalSrc = imageSrc?.startsWith("data:")
            ? imageSrc
            : anyImgUrl({ src: imageSrc, size: 200 });

          return (
            <Link
              key={cat._id}
              href={`/${lang === "ar" ? "" : "en/"}${shop?.slug ? `shops/${shop.slug}/` : ""}search/products?shopCategory=${cat._id}`}
              className="flex flex-col items-center gap-4 group"
            >
              {/* Ring container */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                {/* Thin framing circle */}
                <div
                  className="absolute inset-0 rounded-full border transition-all duration-700 group-hover:scale-105 group-hover:rotate-45"
                  style={{ borderColor: `${brandColor}40` }}
                />

                {/* Double circle accent */}
                <div
                  className="absolute inset-1.5 rounded-full border border-dashed transition-all duration-700 opacity-60"
                  style={{ borderColor: `${brandColor}20` }}
                />

                {/* Inner circular image */}
                <div className="relative w-[82%] h-[82%] rounded-full overflow-hidden bg-neutral-50 shadow-inner">
                  {imageSrc ? (
                    <Image
                      unoptimized
                      src={finalSrc}
                      alt={catName || ""}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300 uppercase tracking-widest">
                      EST
                    </div>
                  )}
                </div>
              </div>

              {/* Serif Label */}
              <span className="text-xs md:text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors tracking-wide">
                {catName}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
