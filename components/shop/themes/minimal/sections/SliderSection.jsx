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
  const isAr = lang === "ar";
  const title = isAr ? data?.titleAr : data?.titleEn;
  const displayMode = data?.displayMode || "slider";
  const sourceType = data?.type || "manual";
  const userId = shop?.owner?._id || shop?.owner;
  const brandColor = shop?.brandColor || "#111111";

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
      if (shop?.slug) url += `&shopSlug=${shop.slug}`;
      else if (userId) url += `&userId=${userId}&showAll=true`;
      else if (previewMode) url += `&showAll=true`;
      else return;
      setLoading(true);
      if (sourceType === "newest") url += "&sortBy=newest";
      else if (sourceType === "random") url += "&random=true";
      fetch(url)
        .then((r) => r.json())
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
    direction: isAr ? "rtl" : "ltr",
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

  if (!displayProducts || displayProducts.length === 0) {
    if (loading)
      return (
        <section className="bg-white py-16 md:py-24 border-t border-neutral-100">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
            <div className="h-6 w-40 bg-neutral-100 rounded mb-8 animate-pulse" />
            <div className="h-56 bg-neutral-50 rounded-xl animate-pulse" />
          </div>
        </section>
      );
    if (!previewMode) return null;
  }

  return (
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        {/* Header row */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              {title}
            </h2>
          </div>

          {displayMode === "slider" && displayProducts.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:border-neutral-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:border-neutral-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isAr ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {displayProducts.length === 0 ? (
          <div className="h-40 border border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-neutral-300 text-sm">
            {t("addProducts")}
          </div>
        ) : displayMode === "slider" ? (
          <>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 lg:gap-5">
                {displayProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    className="flex-[0_0_215px] md:flex-[0_0_220px] lg:flex-[0_0_calc(20%-1rem)] min-w-0 flex flex-col"
                  >
                    <ProductCard
                      theme="minimal"
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
            {displayProducts.length > 1 && (
              <div className="flex gap-1.5">
                {(scrollSnaps.length > 0 ? scrollSnaps : displayProducts).map(
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => emblaApi?.scrollTo(i)}
                      className="h-px rounded-full transition-all duration-300"
                      style={{
                        width: i === selectedIndex ? "32px" : "16px",
                        backgroundColor:
                          i === selectedIndex ? brandColor : "#d4d4d4",
                      }}
                    />
                  ),
                )}
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
            {displayProducts.map((product, idx) => (
              <ProductCard
                theme="minimal"
                key={product._id}
                product={product}
                lang={lang}
                translate={translate}
                priority={idx < 5}
                shopSlug={shop?.slug}
                shop={shop}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
