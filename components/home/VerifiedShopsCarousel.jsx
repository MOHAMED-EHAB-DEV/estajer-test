"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import VerifiedShop from "../shared/VerifiedShop";
import { Button } from "../ui/CnButton";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";
import { categoryIcons } from "@/static/categories";
import { Camera } from "../ui/svgs/CategoriesIcons";

import { useTranslations } from "@/hooks/useTranslations";

export default function VerifiedShopsCarousel({
  verifiedShops,
  t_object,
  langPrefix,
  lang,
  sm = false,
}) {
  const trans = useTranslations(t_object);

  const translate_func = (path) => {
    if (!path) return t_object;
    return trans(path);
  };

  const t = (val) => translate_func(`home.verifiedShops.${val}`);

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
          skipSnaps: false,
          containScroll: "trimSnaps",
        }
      : undefined,
  );

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (idx) => {
      if (emblaApi) emblaApi.scrollTo(idx);
    },
    [emblaApi],
  );

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="relative max-w-screen-2xl mx-auto" ref={containerRef}>
      <div className="relative">
        <div
          className="overflow-hidden pb-4"
          ref={shouldLoadCarousel ? emblaRef : null}
        >
          <div className="flex">
            {verifiedShops.map((shop, idx) => (
              <div
                key={shop.id}
                className="flex-[0_0_100%] md:flex-[0_0_calc(50%)] min-w-0 md:px-6 px-4"
                role="listitem"
                itemProp="itemListElement"
              >
                <VerifiedShop
                  t={t}
                  idx={idx}
                  {...shop}
                  Icon={categoryIcons[shop.categoryKey] || Camera}
                  translate={translate_func}
                  langPrefix={langPrefix}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md rounded-full -ms-4 hidden md:flex"
          onClick={lang === "ar" ? scrollNext : scrollPrev}
          disabled={prevBtnDisabled}
          aria-label="Previous shops"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md rounded-full -me-4 hidden md:flex"
          onClick={lang === "ar" ? scrollPrev : scrollNext}
          disabled={nextBtnDisabled}
          aria-label="Next shops"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Carousel Dots Navigation */}
      <div
        role="tablist"
        aria-label={
          lang === "ar"
            ? "التنقل في المتاجر الموثقة"
            : "Verified shops navigation"
        }
        className="flex justify-center mt-6 md:mt-8"
      >
        {(verifiedShops || scrollSnaps).map((_, index) => (
          <button
            key={index}
            role="tab"
            onClick={() => scrollTo(index)}
            className={`${index === selectedIndex ? "w-10" : "w-6"} h-8 flex items-center justify-center focus:outline-none group relative`}
            aria-label={`${
              lang === "ar" ? "الانتقال إلى الشريحة" : "Go to slide"
            } ${index + 1}`}
            aria-selected={index === selectedIndex}
            tabIndex={index === selectedIndex ? 0 : -1}
          >
            <span className="absolute inset-y-0 -inset-x-1" />
            <span
              className={`rounded-full transition-all duration-200 group-focus:ring-2 group-focus:ring-primary group-focus:ring-offset-2 ${
                sm
                  ? index === selectedIndex
                    ? "bg-primary w-[1.2rem] h-[0.4rem]"
                    : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50 w-[0.4rem] h-[0.4rem]"
                  : index === selectedIndex
                    ? "bg-primary md:w-[1.8rem] w-[1.2rem] md:h-2 h-[0.4rem]"
                    : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50 md:w-2 md:h-2 w-[0.4rem] h-[0.4rem]"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
