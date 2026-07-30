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
  const brandColor = shop?.brandColor || "#8B5E3C";

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
        url += `&userId=${userId}&showAll=true`;
      } else if (previewMode) {
        url += `&showAll=true`;
      } else {
        return;
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

  const isAr = lang === "ar";

  if (!displayProducts || displayProducts.length === 0) {
    if (loading) {
      return (
        <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12 text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <h2 className="text-xl md:text-3xl text-neutral-800">{title}</h2>
            <div className="w-12 h-px bg-neutral-300 mx-auto" />
          </div>
          <div className="h-64 bg-[#FCFAF7] border border-neutral-200 animate-pulse" />
        </section>
      );
    }
    if (previewMode) {
      return (
        <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12 text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <h2 className="text-xl md:text-3xl text-neutral-800">
              {title || t("productSlider") || "Boutique Showcase"}
            </h2>
            <div className="w-12 h-px bg-neutral-300 mx-auto" />
          </div>
          <div className="h-44 bg-[#FCFAF7] border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <span className="text-xl">🛍️</span>
            <p className="text-xs tracking-widest uppercase">
              {t("addProducts") || "Select products to showcase"}
            </p>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12 flex flex-col gap-6 md:gap-10 relative">
      {/* Editorial Header */}
      <div className="flex flex-col items-center text-center">
        {title && (
          <h2 className="text-2xl md:text-4xl text-neutral-900 leading-tight">
            {title}
          </h2>
        )}
        <div className="w-12 h-px bg-neutral-300 mt-4" />
      </div>

      {/* Elegant Nav buttons overlayed next to header */}
      {displayMode === "slider" && displayProducts.length > 1 && (
        <div className="flex items-center gap-2 absolute start-6 top-4 z-20">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`w-9 h-9 border flex items-center justify-center transition-colors duration-300 bg-white/95 ${
              canScrollPrev
                ? "border-neutral-200 text-neutral-800 hover:border-neutral-800 active:scale-95"
                : "border-neutral-100 text-neutral-300 cursor-not-allowed opacity-50"
            }`}
          >
            {isAr ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={`w-9 h-9 border flex items-center justify-center transition-colors duration-300 bg-white/95 ${
              canScrollNext
                ? "border-neutral-200 text-neutral-800 hover:border-neutral-800 active:scale-95"
                : "border-neutral-100 text-neutral-300 cursor-not-allowed opacity-50"
            }`}
          >
            {isAr ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Slider vs Grid display */}
      {displayMode === "slider" ? (
        <>
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6 py-4">
                {displayProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    className="flex-[0_0_240px] md:flex-[0_0_280px] lg:flex-[0_0_calc(25%-1.2rem)] min-w-0 flex flex-col"
                  >
                    <ProductCard
                      theme="elegant"
                      product={product}
                      lang={lang}
                      translate={translate}
                      priority={idx < 4}
                      shopSlug={shop?.slug}
                      shop={shop}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {displayProducts.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {(scrollSnaps.length > 0 ? scrollSnaps : displayProducts).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`h-[4px] rounded-none transition-all duration-300 ${
                      index === selectedIndex
                        ? "w-8"
                        : "w-[4px] bg-neutral-200 hover:bg-neutral-300"
                    }`}
                    style={{
                      backgroundColor:
                        index === selectedIndex ? brandColor : undefined,
                    }}
                  />
                ),
              )}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {displayProducts.map((product, idx) => (
            <div key={product._id} className="flex flex-col">
              <ProductCard
                theme="elegant"
                product={product}
                lang={lang}
                translate={translate}
                priority={idx < 4}
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
