"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function ShopCategoriesCarousel({
  categories,
  lang,
  shopSlug,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.categories.${key}`);
  const containerRef = useRef(null);
  const [shouldLoadCarousel, setShouldLoadCarousel] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadCarousel(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    shouldLoadCarousel
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
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative max-w-screen-2xl mx-auto px-4" ref={containerRef}>
      <div className="text-center mb-5 md:mb-12">
        <h2 className="text-xl md:text-3xl font-black text-darkNavy leading-tight">
          {t("title")}
        </h2>
        <div className="w-10 md:w-14 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3 md:mt-4 rounded-full" />
      </div>

      <nav
        className="overflow-hidden cursor-pointer"
        ref={shouldLoadCarousel ? emblaRef : null}
      >
        <ul
          className={`flex items-start h-full ${
            categories.length <= 6 ? "justify-center" : ""
          }`}
        >
          {categories.map((category, idx) => (
            <li
              key={idx}
              className="min-w-0 py-2 md:px-3 flex-[0_0_90px] md:flex-[0_0_180px] select-none"
            >
              <Link
                href={`/${lang === "ar" ? "" : "en/"}${shopSlug ? `shops/${shopSlug}/` : ""}search/products?shopCategory=${category._id}`}
                className="flex flex-col items-center group transition-all duration-300"
              >
                <div className="relative w-16 h-16 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 md:mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 border border-white md:border-2 group-hover:border-primary/20">
                  <Image
                    src={category.image?.startsWith("data:") ? category.image : anyImgUrl({
                      src: category.image,
                      size: 200,
                      quality: 90,
                      aspectRatio: "1:1",
                      crop: true,
                    })}
                    alt={lang === "ar" ? category.nameAr : category.nameEn}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <h3 className="font-semibold text-[10px] md:text-base text-darkNavy text-center group-hover:text-primary transition-colors duration-200 truncate w-full px-1">
                  {lang === "ar" ? category.nameAr : category.nameEn}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {categories.length > 5 && (
        <div className="flex justify-center gap-2 mt-6">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === selectedIndex
                  ? "bg-primary w-6"
                  : "bg-neutral-200 hover:bg-neutral-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
