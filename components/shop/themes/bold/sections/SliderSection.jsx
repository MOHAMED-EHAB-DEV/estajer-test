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
  const brandColor = shop?.brandColor || "#F48A42";

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

  if (!displayProducts || displayProducts.length === 0) {
    if (loading) {
      return (
        <section className="bg-neutral-50 py-6 md:py-12 my-6 md:my-12">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div
                className="h-1 w-12 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <h2 className="text-xl md:text-2xl font-black text-darkNavy">
                {title}
              </h2>
            </div>
            <div className="h-60 bg-neutral-100 rounded-2xl animate-pulse" />
          </div>
        </section>
      );
    }
    if (previewMode) {
      return (
        <section className="bg-neutral-50 py-6 md:py-12 my-6 md:my-12">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div
                className="h-1 w-12 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <h2 className="text-xl md:text-2xl font-black text-darkNavy">
                {title || t("productSlider")}
              </h2>
            </div>
            <div className="h-40 bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-200 flex items-center justify-center gap-3 text-neutral-400">
              <span className="text-3xl">🛍️</span>
              <p className="text-sm font-medium">{t("addProducts")}</p>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="bg-neutral-50 py-6 md:py-12 my-6 md:my-12">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="h-8 w-1.5 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <h2 className="text-xl md:text-3xl font-black text-darkNavy">
              {title}
            </h2>
          </div>

          {displayMode === "slider" && displayProducts.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                  canScrollPrev
                    ? "border-neutral-300 text-darkNavy hover:text-white hover:border-transparent active:scale-95"
                    : "border-neutral-100 text-neutral-300 cursor-not-allowed"
                }`}
                style={canScrollPrev ? {} : {}}
                onMouseEnter={(e) => {
                  if (canScrollPrev)
                    e.currentTarget.style.backgroundColor = brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {lang === "ar" ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                  canScrollNext
                    ? "border-neutral-300 text-darkNavy hover:text-white hover:border-transparent active:scale-95"
                    : "border-neutral-100 text-neutral-300 cursor-not-allowed"
                }`}
                onMouseEnter={(e) => {
                  if (canScrollNext)
                    e.currentTarget.style.backgroundColor = brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {lang === "ar" ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>

        {displayMode === "slider" ? (
          <>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 lg:gap-5 py-2">
                {displayProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    className="flex-[0_0_215px] md:flex-[0_0_220px] lg:flex-[0_0_calc(20%-1rem)] min-w-0 flex flex-col"
                  >
                    <ProductCard
                      theme="bold"
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
              <div className="flex justify-center gap-2">
                {(scrollSnaps.length > 0 ? scrollSnaps : displayProducts).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: index === selectedIndex ? "24px" : "6px",
                        backgroundColor:
                          index === selectedIndex ? brandColor : "#e5e7eb",
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
              <div key={product._id} className="flex flex-col">
                <ProductCard
                  theme="bold"
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
      </div>
    </section>
  );
}
