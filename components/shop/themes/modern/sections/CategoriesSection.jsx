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
          loop: categories.length > 5,
          align: categories.length <= 5 ? "center" : "start",
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
    <section
      className="bg-[#F9FAFB] py-16 md:py-24 border-t border-neutral-100/60"
      ref={containerRef}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Browse
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {t("title")}
          </h2>
        </div>

        <nav className="overflow-hidden" ref={shouldLoad ? emblaRef : null}>
          <ul
            className={`flex ${categories.length <= 5 ? "justify-center" : ""}`}
          >
            {categories.map((category, idx) => {
              const name = lang === "ar" ? category.nameAr : category.nameEn;
              return (
                <li
                  key={idx}
                  className="min-w-0 px-2.5 flex-[0_0_160px] md:flex-[0_0_215px] select-none"
                >
                  <Link
                    href={`/${lang === "ar" ? "" : "en/"}${shop?.slug ? `shops/${shop.slug}/` : ""}search/products?shopCategory=${category._id}`}
                    className="flex items-center gap-3 p-3 bg-white border border-neutral-200/50 rounded-full hover:border-neutral-300 transition-all duration-300 group shadow-[0_2px_10px_rgb(0,0,0,0.01)] hover:shadow-sm"
                  >
                    {/* Circle image */}
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100">
                      {category.image ? (
                        <Image
                          src={
                            category.image.startsWith("data:")
                              ? category.image
                              : anyImgUrl({
                                  src: category.image,
                                  size: 120,
                                  quality: 90,
                                  aspectRatio: "1:1",
                                  crop: true,
                                })
                          }
                          alt={name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                          📁
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] md:text-xs font-semibold text-neutral-600 group-hover:text-neutral-900 truncate transition-colors">
                      {name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {categories.length > 5 && (
          <div className="flex gap-2">
            {categories.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === selectedIndex ? "24px" : "6px",
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
