"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";

const EmblaInit = lazy(() =>
  import("embla-carousel-react").then((mod) => {
    const useEmblaCarousel = mod.default;
    function Inner({ onReady, options, lang }) {
      const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "start",
        direction: lang === "ar" ? "rtl" : "ltr",
        dragFree: true,
        containScroll: "trimSnaps",
        ...options,
      });
      useEffect(() => {
        onReady(emblaRef, emblaApi);
      }, [emblaRef, emblaApi, onReady]);
      return null;
    }
    return { default: Inner };
  }),
);

export default function CategoriesCarouselClient({
  children,
  options = {},
  isSubCategory,
  lang,
  sm,
  categoriesCount,
  ariaLabel,
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

  const [emblaRef, setEmblaRef] = useState(null);
  const [emblaApi, setEmblaApi] = useState(null);

  const handleEmblaReady = useCallback((ref, api) => {
    setEmblaRef(() => ref);
    setEmblaApi(api);
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
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
      {shouldLoadCarousel && (
        <Suspense fallback={null}>
          <EmblaInit onReady={handleEmblaReady} options={options} lang={lang} />
        </Suspense>
      )}

      {/* Carousel Container */}
      <nav
        className="overflow-hidden cursor-pointer"
        ref={emblaRef ?? undefined}
        aria-label={ariaLabel}
      >
        <ul className="flex items-start h-full">{children}</ul>
      </nav>

      <div
        role="tablist"
        className={`flex justify-center ${sm ? " mt-2 md:mt-4" : " mt-2 md:mt-6"}`}
        aria-label={
          lang === "ar" ? "التنقل في الأقسام" : "Categories navigation"
        }
      >
        {Array.from({ length: categoriesCount }).map((_, index) => (
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
        <div className="absolute bottom-0 left-0 w-8 h-full bg-gradient-to-l from-transparent via-white/40 to-white flex items-end pb-24"></div>
        <div className="absolute bottom-0 right-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-white flex items-end pb-24"></div>
      </div>
    </div>
  );
}
