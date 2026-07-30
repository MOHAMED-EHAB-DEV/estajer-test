"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function CategoriesSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.categories.${key}`);
  const categories = data?.categories || [];
  const brandColor = shop?.brandColor || "#111111";
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    shouldLoad
      ? {
          loop: categories.length > 6,
          align: categories.length <= 6 ? "center" : "start",
          direction: lang === "ar" ? "rtl" : "ltr",
          dragFree: true,
          containScroll: "trimSnaps",
        }
      : undefined,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollTo = useCallback(
    (idx) => {
      if (emblaApi) emblaApi.scrollTo(idx);
    },
    [emblaApi],
  );
  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-neutral-50 py-16 md:py-24" ref={containerRef}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Browse
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            {t("title")}
          </h2>
        </div>

        <nav className="overflow-hidden" ref={shouldLoad ? emblaRef : null}>
          <ul
            className={`flex ${categories.length <= 6 ? "justify-center" : ""}`}
          >
            {categories.map((category, idx) => (
              <li
                key={idx}
                className="min-w-0 px-2 md:px-3 flex-[0_0_100px] md:flex-[0_0_140px] select-none"
              >
                <Link
                  href={`/${lang === "ar" ? "" : "en/"}${shop?.slug ? `shops/${shop.slug}/` : ""}search/products?shopCategory=${category._id}`}
                  className="flex flex-col items-center gap-2.5 group"
                >
                  <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white border border-neutral-200 group-hover:border-neutral-400 transition-all duration-300">
                    <Image
                      src={
                        category.image?.startsWith("data:")
                          ? category.image
                          : anyImgUrl({
                              src: category.image,
                              size: 200,
                              quality: 90,
                              aspectRatio: "1:1",
                              crop: true,
                            })
                      }
                      alt={lang === "ar" ? category.nameAr : category.nameEn}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-neutral-500 group-hover:text-neutral-900 text-center transition-colors w-full truncate px-1">
                    {lang === "ar" ? category.nameAr : category.nameEn}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {categories.length > 5 && (
          <div className="flex gap-1.5">
            {categories.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className="h-px rounded-full transition-all duration-300"
                style={{
                  width: i === selectedIndex ? "32px" : "16px",
                  backgroundColor: i === selectedIndex ? brandColor : "#d4d4d4",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
