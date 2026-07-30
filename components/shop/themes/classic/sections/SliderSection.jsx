"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ProductCard from "@/components/shop/themes/shared/ProductCard";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRightSvg";
import { useTranslations } from "@/hooks/useTranslations";

export default function SliderSection({
  data,
  lang,
  shop,
  translate,
  previewMode = false,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.slider.${key}`);
  const title = lang === "ar" ? data?.titleAr : data?.titleEn;
  const displayMode = data?.displayMode || "slider";
  const sourceType = data?.type || "manual";
  const userId = shop?.owner?._id || shop?.owner;

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const staticProducts = data?.products || [];

  useEffect(() => {
    if (sourceType !== "manual") {
      let url = `/api/products?limit=16&lang=${lang}`;

      if (shop?.slug) {
        url += `&shopSlug=${shop.slug}`;
      } else if (userId) {
        // Fallback for preview mode when shop isn't created yet but owner is selected
        url += `&userId=${userId}&showAll=true`;
      } else if (previewMode) {
        // Fallback for preview mode when no owner is selected yet - fetch any products as placeholder
        url += `&showAll=true`;
      } else {
        return; // No owner and not in preview mode, don't fetch
      }

      setLoading(true);
      if (sourceType === "newest") url += "&sortBy=newest";
      else if (sourceType === "random") url += "&random=true";

      fetch(url)
        .then((res) => res.json())
        .then((d) => {
          if (d.success) setDynamicProducts(d.data);
        })
        .finally(() => setLoading(false));
    }
  }, [sourceType, userId, lang, shop?.slug, previewMode]);

  const finalProducts =
    sourceType === "manual" ? staticProducts : dynamicProducts;
  const displayProducts = finalProducts.slice(0, 16);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: displayProducts.length > 3,
    align: "start",
    direction: lang === "ar" ? "rtl" : "ltr",
    skipSnaps: false,
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const onInit = useCallback((api) => setScrollSnaps(api.scrollSnapList()), []);
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

  // Placeholder for empty state in preview
  if (!displayProducts || displayProducts.length === 0) {
    if (loading) {
      return (
        <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12 text-center">
          <div className="flex flex-col items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-black text-darkNavy">
              {title}
            </h2>
            <div className="w-10 md:w-14 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
          </div>
          <div className="h-60 bg-neutral-50 rounded-2xl animate-pulse" />
        </section>
      );
    }
    if (previewMode) {
      return (
        <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12 text-center">
          <div className="flex flex-col items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-black text-darkNavy">
              {title || t("productSlider")}
            </h2>
            <div className="w-10 md:w-14 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
          </div>
          <div className="h-40 md:h-48 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <span className="text-2xl md:text-3xl">🛍️</span>
            <p className="text-xs md:text-sm font-medium">{t("addProducts")}</p>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12 flex flex-col gap-5 md:gap-8 relative">
      <div className="flex flex-col items-center gap-2 md:gap-3">
        <h2 className="text-lg md:text-2xl font-black text-darkNavy">
          {title}
        </h2>
        <div className="w-10 md:w-14 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
      </div>
      {displayMode === "slider" && displayProducts.length > 1 && (
        <div className="flex items-center gap-1.5 absolute start-4 top-2 z-20">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
              canScrollPrev
                ? "border-neutral-200 text-darkNavy hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95 bg-white/80 backdrop-blur-sm"
                : "border-neutral-100 text-neutral-300 cursor-not-allowed bg-white/40"
            }`}
          >
            {lang === "ar" ? (
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
            ) : (
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
            )}
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
              canScrollNext
                ? "border-neutral-200 text-darkNavy hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95 bg-white/80 backdrop-blur-sm"
                : "border-neutral-100 text-neutral-300 cursor-not-allowed bg-white/40"
            }`}
          >
            {lang === "ar" ? (
              <ChevronLeft
                color="currentColor"
                className="w-5 h-5 lg:w-6 lg:h-6"
              />
            ) : (
              <ChevronRight
                color="currentColor"
                className="w-5 h-5 lg:w-6 lg:h-6"
              />
            )}
          </button>
        </div>
      )}

      {displayMode === "slider" ? (
        <>
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 lg:gap-6 py-4">
                {displayProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    className="flex-[0_0_215px] md:flex-[0_0_220px] lg:flex-[0_0_calc(20%-1.2rem)] min-w-0 flex flex-col"
                  >
                    <ProductCard
                      theme="classic"
                      product={product}
                      lang={lang}
                      translate={translate}
                      priority={idx < 3}
                      shopSlug={shop?.slug}
                      shop={shop}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-8 h-full bg-gradient-to-l from-transparent via-white/40 to-white z-10" />
            <div className="absolute bottom-0 right-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-white z-10" />
          </div>
          {displayProducts.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {(scrollSnaps.length > 0 ? scrollSnaps : displayProducts).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`h-[5px] rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "bg-primary w-6"
                        : "bg-neutral-200 hover:bg-neutral-300 w-[5px]"
                    }`}
                  />
                ),
              )}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {displayProducts.map((product, idx) => (
            <div key={product._id} className="flex flex-col">
              <ProductCard
                theme="classic"
                product={product}
                lang={lang}
                translate={translate}
                priority={idx < 5}
                shopSlug={shop?.slug}
                shop={shop}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
