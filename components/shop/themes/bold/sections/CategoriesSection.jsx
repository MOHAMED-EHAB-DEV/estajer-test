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
  const brandColor = shop?.brandColor || "#F48A42";
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
      { rootMargin: "200px" }
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
      : undefined
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollTo = useCallback((index) => { if (emblaApi) emblaApi.scrollTo(index); }, [emblaApi]);
  const onSelect = useCallback((api) => { setSelectedIndex(api.selectedScrollSnap()); }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-neutral-50 py-12 md:py-20" ref={containerRef}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
            <h2 className="text-xl md:text-3xl font-black text-darkNavy">{t("title")}</h2>
          </div>
          <p className="text-neutral-500 text-sm ps-6">{t("subtitle") || ""}</p>
        </div>

        {/* Carousel */}
        <nav
          className="overflow-hidden cursor-pointer"
          ref={shouldLoad ? emblaRef : null}
        >
          <ul className={`flex items-start h-full ${categories.length <= 6 ? "justify-center" : ""}`}>
            {categories.map((category, idx) => (
              <li
                key={idx}
                className="min-w-0 px-2 md:px-3 flex-[0_0_100px] md:flex-[0_0_160px] select-none"
              >
                <Link
                  href={`/${lang === "ar" ? "" : "en/"}${shop?.slug ? `shops/${shop.slug}/` : ""}search/products?shopCategory=${category._id}`}
                  className="flex flex-col items-center gap-2 md:gap-3 group"
                >
                  {/* Image in bold square frame */}
                  <div
                    className="relative w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-3xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2"
                    style={{ borderColor: `${brandColor}30` }}
                  >
                    <Image
                      src={
                        category.image?.startsWith("data:")
                          ? category.image
                          : anyImgUrl({ src: category.image, size: 200, quality: 90, aspectRatio: "1:1", crop: true })
                      }
                      alt={lang === "ar" ? category.nameAr : category.nameEn}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Brand color hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      style={{ backgroundColor: brandColor }}
                    />
                  </div>
                  <h3
                    className="font-bold text-[10px] md:text-sm text-darkNavy text-center transition-colors duration-200 truncate w-full px-1"
                    style={{ "--brand": brandColor }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = brandColor; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = ""; }}
                  >
                    {lang === "ar" ? category.nameAr : category.nameEn}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {categories.length > 5 && (
          <div className="flex justify-center gap-2">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: index === selectedIndex ? "24px" : "6px",
                  backgroundColor: index === selectedIndex ? brandColor : "#e5e7eb",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
