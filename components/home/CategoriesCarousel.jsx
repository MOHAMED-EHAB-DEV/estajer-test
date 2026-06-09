"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function CategoriesCarousel({
  options = {},
  translate,
  isSubCategory,
  categoriesData,
  langPrefix,
  mainCategory,
  lang,
  sm,
}) {
  const trans = useTranslations(translate);
  const t = (value) => trans(`categories.categoriesSection.${value}`);

  const containerRef = useRef(null);
  const [shouldLoadCarousel, setShouldLoadCarousel] = useState(false);

  // Intersection Observer to lazy load carousel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadCarousel(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }, // Load 200px before it's visible
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    shouldLoadCarousel
      ? {
          loop: true,
          align: "start",
          direction: lang === "ar" ? "rtl" : "ltr",
          dragFree: true,
          containScroll: "trimSnaps",
          ...options,
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

  return (
    <div
      className={
        isSubCategory
          ? "relative mx-auto max-w-full"
          : "relative max-w-screen-2xl mx-auto ps-2"
      }
      dir={lang === "ar" ? "rtl" : "ltr"}
      ref={containerRef}
    >
      {/* Carousel Container */}
      <nav
        className="overflow-hidden cursor-pointer"
        ref={shouldLoadCarousel ? emblaRef : null}
        aria-label={t("ariaLabel")}
      >
        <ul className="flex items-start h-full">
          {/* productCount */}
          {categoriesData?.map(({ name, key }, idx) => (
            <li
              key={idx}
              className={`min-w-0 py-2 md:px-4 ${sm ? "flex-[0_0_90px] md:flex-[0_0_120px] lg:flex-[0_0_160px] xl:flex-[0_0_170px]" : "flex-[0_0_105px] md:flex-[0_0_160px] lg:flex-[0_0_200px] xl:flex-[0_0_215px]"} select-none`}
            >
              <Link
                scroll={!isSubCategory}
                href={
                  isSubCategory
                    ? `/${langPrefix}${mainCategory}/${key}/products`
                    : `/${langPrefix}${key}/products`
                }
                className="flex flex-col items-center group transition-all duration-300"
                aria-label={`${name} - ${trans(
                  "categories.browseRentalProducts",
                )}`}
                title={`${name} ${trans("categories.forRent")}`}
              >
                {/* Circular Image Container */}
                <div
                  className={`relative ${sm ? "w-[4.5rem] h-[4.5rem] md:w-24 md:h-24 lg:w-32 lg:h-32" : "w-[5.5rem] h-[5.5rem] md:w-32 md:h-32 lg:w-40 lg:h-40"} rounded-full overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-gray-100 group-hover:border-primary/30`}
                >
                  <Image
                    src={anyImgUrl({
                      src: categoriesData.find((c) => c.key === key)?.image,
                      size: 312,
                      quality: 90,
                      aspectRatio: "1:1",
                      crop: true,
                    })}
                    alt={name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Category Name */}
                <h3
                  className={`font-IBMPlex font-semibold ${sm ? " text-[13px] sm:text-sm md:text-base lg:text-lg" : " text-sm sm:text-base md:text-lg lg:text-xl"} text-darkNavy text-center group-hover:text-primary transition-colors duration-200`}
                >
                  {name}
                </h3>

                {/* Product Count */}
                {/* <span className="text-sm md:text-base text-gray-500 mt-1 text-center">
                  {productCount || 0} {t("productCount")}
                </span> */}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        role="tablist"
        className={`flex justify-center gap-2 ${sm ? " mt-2 md:mt-6" : " mt-4 md:mt-8"}`}
        aria-label={
          lang === "ar" ? "التنقل في الأقسام" : "Categories navigation"
        }
      >
        {categoriesData.map((_, index) => (
          <button
            key={index}
            role="tab"
            onClick={() => scrollTo(index)}
            className={`${sm ? "w-[0.4rem] h-[0.4rem]" : "md:w-2 md:h-2 w-[0.4rem] h-[0.4rem]"} rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              index === selectedIndex
                ? "bg-primary md:w-[1.8rem] w-[1.2rem]"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`${
              lang === "ar" ? "الانتقال إلى الشريحة" : "Go to slide"
            } ${index + 1}`}
            aria-selected={index === selectedIndex}
            tabIndex={index === selectedIndex ? 0 : -1}
          />
        ))}
        <div className="absolute bottom-0 left-0 w-8 h-full bg-gradient-to-l from-transparent via-white/40 to-white flex items-end pb-24"></div>
        <div className="absolute bottom-0 right-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-white flex items-end pb-24"></div>
      </div>
    </div>
  );
}
