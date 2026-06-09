"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ProductItem } from "./ProductItem";
import ProductSkeleton from "../shared/ProductSkeleton";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";
export default function MobileProductCarousel({
  loading,
  lang,
  products,
  translate,
  user,
  favoriteProducts,
  toggleFavorite,
}) {
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
          skipSnaps: false,
          containScroll: "trimSnaps",
          dragFree: true,
          breakpoints: {
            "(min-width: 1200px)": {
              dragFree: false,
              slidesToScroll: 3,
            },
          },
        }
      : undefined,
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
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
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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
    <div className=" -mx-4" dir="ltr" ref={containerRef}>
      <div className="relative">
        <div
          className="overflow-hidden rounded-lg py-4 ps-2"
          ref={shouldLoadCarousel ? emblaRef : null}
        >
          <div className="flex">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_56%] min-w-0 px-2 md:px-3 md:flex-[0_0_38%] lg:flex-[0_0_24.3%]"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <ProductSkeleton />
                  </div>
                ))
              : products.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex-[0_0_200px]"
                  >
                    <ProductItem
                      product={product}
                      lang={lang}
                      translate={translate}
                      index={index}
                      sm={true}
                      user={user}
                      favoriteProducts={favoriteProducts}
                      toggleFavorite={toggleFavorite}
                    />
                  </div>
                ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-full bg-gradient-to-l from-transparent via-white/40 to-white flex items-end pb-24"></div>
        <div className="absolute bottom-0 right-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-white flex items-end pb-24"></div>

        {/* Carousel Navigation Buttons */}
        <div className="absolute -top-12 start-4 flex items-center gap-2 z-10">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
              canScrollPrev
                ? "border-neutral-200 text-darkNavy hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95 bg-white/80 backdrop-blur-sm"
                : "border-neutral-100 text-neutral-300 cursor-not-allowed bg-white/40"
            }`}
          >
            <ChevronLeft
              color="currentColor"
              className="w-5 h-5 lg:w-6 lg:h-6"
            />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
              canScrollNext
                ? "border-neutral-200 text-darkNavy hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95 bg-white/80 backdrop-blur-sm"
                : "border-neutral-100 text-neutral-300 cursor-not-allowed bg-white/40"
            }`}
          >
            <ChevronRight
              color="currentColor"
              className="w-5 h-5 lg:w-6 lg:h-6"
            />
          </button>
        </div>
      </div>

      {/* Carousel Dots Navigation */}
      <div className="flex justify-center gap-2 mt-6">
        {(scrollSnaps || products).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-[0.4rem] h-[0.4rem] rounded-full transition-all duration-200 ${
              index === selectedIndex
                ? "bg-primary w-[1.5rem]"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
