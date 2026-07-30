"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import dynamic from "next/dynamic";
import ProductSkeleton from "../shared/ProductSkeleton";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";
import { useTranslations } from "@/hooks/useTranslations";
import ProductLight from "../shared/ProductLight";

const ProductFilters = dynamic(() => import("./ProductFilters"));

const EmblaInit = lazy(() =>
  import("embla-carousel-react").then((mod) => {
    const useEmblaCarousel = mod.default;
    function Inner({ onReady }) {
      const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "start",
        skipSnaps: false,
        containScroll: "trimSnaps",
        dragFree: true,
      });
      useEffect(() => {
        onReady(emblaRef, emblaApi);
      }, [emblaRef, emblaApi, onReady]);
      return null;
    }
    return { default: Inner };
  }),
);

export default function MobileProductCarousel({
  children,
  initialProducts = [],
  lang,
  translate,
  shops,
  shopSlug,
  sm = false,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`heroSlider.${key}`);

  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const [shouldLoadCarousel, setShouldLoadCarousel] = useState(false);
  const [emblaRef, setEmblaRef] = useState(null);
  const [emblaApi, setEmblaApi] = useState(null);

  const fetchProducts = async (filter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        lang,
        limit: 16,
        compressed: true,
        fields: `images,owner,${
          lang === "ar" ? "nameAr" : "nameEn"
        },rental,rating,pricingModel,location,${
          lang === "ar" ? "addressAr" : "addressEn"
        },lovedCount`,
        ...filter,
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`,
        { next: { revalidate: 60 * 60 * 24 * 2 } },
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer — trigger embla import only when near viewport
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

  const handleEmblaReady = useCallback((ref, api) => {
    setEmblaRef(() => ref); // ref is a callback-ref from embla
    setEmblaApi(api);
  }, []);

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

  const onInit = useCallback((api) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
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
    <div className="-mx-4" dir="ltr" ref={containerRef}>
      {!shops && (
        <ProductFilters
          translate={translate}
          fetchProducts={fetchProducts}
          lang={lang}
        />
      )}

      {/* Mount EmblaInit lazily — imports embla JS only after IO fires */}
      {shouldLoadCarousel && (
        <Suspense fallback={null}>
          <EmblaInit onReady={handleEmblaReady} />
        </Suspense>
      )}

      <div className="relative">
        <div
          className="overflow-hidden rounded-lg py-4 ps-2"
          ref={emblaRef ?? undefined}
        >
          <div className="flex">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_215px] min-w-0 px-2 md:px-3 md:flex-[0_0_305px]"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <ProductSkeleton />
                  </div>
                ))
              : products === initialProducts
                ? children
                : products.map((product, index) => (
                    <div key={product._id} className="flex-[0_0_215px]">
                      <div
                        dir={lang === "ar" ? "rtl" : "ltr"}
                        className="min-w-0 px-2 md:px-w h-full transition-[opacity,transform] duration-500 ease-out transform md:w-[19rem] opacity-100 translate-y-0 "
                      >
                        <ProductLight
                          sm={true}
                          product={product}
                          lang={lang}
                          translate={trans}
                          priority={index < 4}
                          shopSlug={shopSlug}
                        />
                      </div>
                    </div>
                  ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-full bg-gradient-to-l from-transparent via-white/40 to-white flex items-end pb-24"></div>
        <div className="absolute bottom-0 right-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-white flex items-end pb-24"></div>

        {/* Carousel Navigation Buttons */}
        <div className={`absolute md:-top-12 -top-[4.5rem] ${lang === "ar" ? "start-4" : "right-4"} flex items-center gap-2 z-10`}>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label={t("prevSlide")}
            className={`w-9 h-9 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
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
            aria-label={t("nextSlide")}
            className={`w-9 h-9 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
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
      <div className="flex justify-center mt-6 mx-4">
        {(scrollSnaps.length > 0 ? scrollSnaps : products).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`${index === selectedIndex ? "w-10" : "w-6"} h-8 flex items-center justify-center focus:outline-none group relative`}
            aria-label={`Go to slide ${index + 1}`}
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
