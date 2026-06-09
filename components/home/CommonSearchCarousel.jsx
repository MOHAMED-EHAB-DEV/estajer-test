"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";

export default function CommonSearchCarousel({
  options = {},
  translate,
  lang,
}) {
  const trans = useTranslations(translate);
  const t = (value) => trans(`home.commonSearch.${value}`);
  const langPrefix = lang === "ar" ? "" : "en/";
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
          ...options,
        }
      : undefined,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  const commonSearch = [
    { nameAr: "نطيطة", nameEn: "Bounce house" },
    { nameAr: "كراسي للمناسبات", nameEn: "Event Chairs" },
    { nameAr: "طاولات بوفيه", nameEn: "Buffet Tables" },
    { nameAr: "ملعب صابوني", nameEn: "Soap Soccer Field" },
    { nameAr: "طاولات خدمه", nameEn: "Service Tables" },
    { nameAr: "الآت الأيسكريم", nameEn: "Ice Cream Machines" },
    { nameAr: "كاميرات", nameEn: "Cameras" },
    { nameAr: "خيام للتخييم", nameEn: "Camping Tent" },
    { nameAr: "إضاءات", nameEn: "Lights" },
    // { nameAr: "آلة الفشار , آلة البوب كورن", nameEn: "Popcorn Machine" },
    // { nameAr: "آلة غزل البنات", nameEn: "Cotton Candy Machine" },
    // { nameAr: "آلة الذرة", nameEn: "Corn Machine" },
    // { nameAr: "كاميرات سينمائية", nameEn: "Cinema Cameras" },
    // { nameAr: "ميكروفونات", nameEn: "Microphones" },
    // { nameAr: "جهاز المشي", nameEn: "Treadmill" },
    // { nameAr: "دراجات ثابته", nameEn: "Stationary Bikes" },
    // { nameAr: "قوارب كاياك", nameEn: "Kayak Boats" },
    // { nameAr: "سخانات بوفيه", nameEn: "Buffet Warmers" },
    // { nameAr: "سخان طعام كهربائي", nameEn: "Electric Food Warmer" },
    // { nameAr: "صواني تقديم", nameEn: "Serving Trays" },
  ];
  return (
    <section
      className="max-w-full mx-auto"
      aria-labelledby="popular-searches-heading"
      role="region"
      ref={containerRef}
    >
      <div className="relative flex flex-wrap md:flex-nowrap items-center md:gap-10 gap-5">
        <header>
          <h2
            id="popular-searches-heading"
            className="flex font-IBMPlex text-primary text-[1.2rem] font-semibold flex-wrap gap-1"
          >
            <span className="min-w-max">{t("title1")}</span>
            <span className="min-w-max">{t("title2")}</span>
          </h2>
        </header>

        <nav
          className="overflow-hidden rounded-lg md:py-8 py-0 cursor-pointer"
          ref={shouldLoadCarousel ? emblaRef : null}
          aria-label={
            lang === "ar" ? "البحث الشائع للمنتجات" : "Popular product searches"
          }
          role="navigation"
        >
          <ul className="flex items-center h-full" role="list">
            {commonSearch.map(({ nameAr, nameEn }, idx) => (
              <li
                key={idx}
                className="min-w-0 pl-4 flex-[0_0_auto] select-none"
                role="listitem"
              >
                <Link
                  rel="nofollow"
                  href={`/${langPrefix}search/products?name=${
                    lang === "ar"
                      ? encodeURIComponent(nameAr)
                      : encodeURIComponent(nameEn)
                  }`}
                  className="text-sm md:text-base min-w-max flex items-center rounded-full justify-center gap-2 text-white border-1 hover:bg-white hover:text-darkNavy !opacity-100 max-w-48 md:px-6 px-4 md:h-12 h-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`${lang === "ar" ? "البحث عن" : "Search for"} ${
                    lang === "ar" ? nameAr : nameEn
                  }`}
                  title={`${lang === "ar" ? "البحث عن" : "Search for"} ${
                    lang === "ar" ? nameAr : nameEn
                  }`}
                  itemProp="url"
                >
                  <div className="relative md:min-w-5 md:h-5 min-w-4 h-4">
                    <Image
                      src={anyImgUrl({
                        size: 100,
                        src: "activity-svgrepo-com_egqn3s",
                        quality: 100,
                      })}
                      alt={"search icon"}
                      fill
                      unoptimized
                      className=""
                    />
                  </div>
                  <span itemProp="name">{lang === "ar" ? nameAr : nameEn}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Dots Navigation */}
      <nav
        className="md:hidden flex justify-center gap-2 mt-6"
        aria-label={
          lang === "ar"
            ? "التنقل في البحث الشائع"
            : "Popular searches navigation"
        }
        role="tablist"
      >
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              index === selectedIndex
                ? "bg-primary w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`${
              lang === "ar" ? "الانتقال إلى الشريحة" : "Go to slide"
            } ${index + 1}`}
            aria-selected={index === selectedIndex}
            role="tab"
            tabIndex={index === selectedIndex ? 0 : -1}
          />
        ))}
      </nav>
    </section>
  );
}
