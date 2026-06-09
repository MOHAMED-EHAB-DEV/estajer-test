"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Product from "@/components/shared/Product";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";
export default function PartnerProductSlider({
  title,
  products = [],
  lang,
  providerId,
  userId,
  translate,
  displayMode = "slider",
  sourceType = "manual",
}) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      sourceType &&
      sourceType !== "manual" &&
      userId &&
      products.length === 0
    ) {
      setLoading(true);
      let url = `/api/products?userId=${userId}&limit=16&lang=${lang}&approved=true`;
      if (sourceType === "newest") {
        url += "&sortBy=newest";
      } else if (sourceType === "random") {
        url += "&random=true";
      }

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDynamicProducts(data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [sourceType, userId, lang, products.length]);

  const finalProducts =
    sourceType === "manual" || products.length > 0 ? products : dynamicProducts;
  const displayProducts = finalProducts.slice(0, 16);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: displayProducts.length > 3,
    align: "start",
    direction: lang === "ar" ? "rtl" : "ltr",
    skipSnaps: false,
    containScroll: "trimSnaps",
    dragFree: true,
    breakpoints: {
      "(min-width: 1200px)": {
        dragFree: false,
        slidesToScroll: 3,
      },
    },
  });

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback(
    (idx) => {
      if (emblaApi) emblaApi.scrollTo(idx);
    },
    [emblaApi],
  );

  if (!displayProducts || displayProducts.length === 0) return null;

  return (
    <section className="flex flex-col gap-6 lg:gap-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl lg:text-3xl font-black text-darkNavy">
            {title}
          </h2>
        </div>

        {/* Nav Arrows (Only for slider) */}
        {displayMode === "slider" && displayProducts.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${
                canScrollPrev
                  ? "border-neutral-200 text-darkNavy hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                  : "border-neutral-100 text-neutral-300 cursor-not-allowed"
              }`}
            >
              {lang === "ar" ? (
                <ChevronRight className="w-5 h-5 lg:w-7 lg:h-7" />
              ) : (
                <ChevronLeft className="w-5 h-5 lg:w-7 lg:h-7" />
              )}
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${
                canScrollNext
                  ? "border-neutral-200 text-darkNavy hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                  : "border-neutral-100 text-neutral-300 cursor-not-allowed"
              }`}
            >
              {lang === "ar" ? (
                <ChevronLeft className="w-5 h-5 lg:w-7 lg:h-7" />
              ) : (
                <ChevronRight className="w-5 h-5 lg:w-7 lg:h-7" />
              )}
            </button>
          </div>
        )}
      </div>

      {displayMode === "slider" ? (
        <>
          {/* Products Carousel */}
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 lg:gap-6 py-4">
                {displayProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    className="flex-[0_0_260px] md:flex-[0_0_300px] lg:flex-[0_0_340px] min-w-0 flex flex-col"
                  >
                    <Product
                      product={product}
                      lang={lang}
                      translate={translate}
                      sm={true}
                      priority={idx < 3}
                      providerId={providerId}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-l from-transparent via-white/40 to-white pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-r from-transparent via-white/40 to-white pointer-events-none z-10" />
          </div>

          {/* Carousel Dots Navigation */}
          {displayProducts.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {(scrollSnaps.length > 0 ? scrollSnaps : displayProducts).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`h-[5px] rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "bg-primary w-6"
                        : "bg-neutral-200 hover:bg-neutral-300 w-[5px]"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ),
              )}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, idx) => (
            <div key={product._id} className="flex flex-col">
              <Product
                product={product}
                lang={lang}
                translate={translate}
                sm={true}
                priority={idx < 4}
                providerId={providerId}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
