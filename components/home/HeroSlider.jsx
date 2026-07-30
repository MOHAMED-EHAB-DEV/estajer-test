"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

const EmblaInit = lazy(() =>
  import("embla-carousel-react").then((mod) => {
    const useEmblaCarousel = mod.default;
    function Inner({ onReady, lang }) {
      const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        duration: 30,
        direction: lang === "ar" ? "rtl" : "ltr",
      });
      useEffect(() => {
        onReady(emblaRef, emblaApi);
      }, [emblaRef, emblaApi, onReady]);
      return null;
    }
    return { default: Inner };
  }),
);

export default function HeroSlider({
  banners = [],
  lang,
  isAdminMode = false,
  onEditField = () => {},
  onEditImages = () => {},
  onEditPosition = () => {},
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans("heroSlider." + key);

  const slides = banners.length > 0 ? banners : [];
  const total = slides.length;

  const [shouldLoadCarousel, setShouldLoadCarousel] = useState(false);
  useEffect(() => {
    const load = () => setShouldLoadCarousel(true);
    const t = setTimeout(load, 1000);
    window.addEventListener("scroll", load, { passive: true, once: true });
    window.addEventListener("touchstart", load, { passive: true, once: true });
    window.addEventListener("click", load, { passive: true, once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", load);
      window.removeEventListener("touchstart", load);
      window.removeEventListener("click", load);
    };
  }, []);

  const [emblaRef, setEmblaRef] = useState(null);
  const [emblaApi, setEmblaApi] = useState(null);

  const handleEmblaReady = useCallback((ref, api) => {
    setEmblaRef(() => ref);
    setEmblaApi(api);
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const isInViewRef = useRef(false);

  const intervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (
      typeof document !== "undefined" &&
      (document.hidden || !isInViewRef.current)
    )
      return;
    intervalRef.current = setInterval(() => {
      if (isInViewRef.current && emblaApi) emblaApi.scrollNext();
    }, 6000);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    // Reset autoplay timer whenever the user starts dragging/swiping
    emblaApi.on("pointerDown", resetTimer);
  }, [emblaApi, onSelect, resetTimer]);

  // Autoplay — only ticks while slider is visible in viewport and tab is active
  useEffect(() => {
    if (!emblaApi || total <= 1) return;

    resetTimer();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        resetTimer();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          resetTimer();
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      },
      { threshold: 0.3 },
    );
    if (containerRef.current) observer.observe(containerRef.current);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [emblaApi, resetTimer, total]);

  const getSlideImage = (src, width = 1600) => {
    if (!src) return "";
    if (src.startsWith("data:") || src.startsWith("blob:")) return src;
    return anyImgUrl({ src, size: width, quality: 85 });
  };

  const activeSlide = slides[selectedIndex] || {};
  const slideBtnText =
    lang === "en" ? activeSlide.buttonTextEn : activeSlide.buttonTextAr;
  const slideLink =
    lang === "en" && activeSlide.linkEn
      ? activeSlide.linkEn
      : activeSlide.link || "";

  const progressPercent = total > 0 ? ((selectedIndex + 1) / total) * 100 : 0;
  const padIndex = (n) => String(n).padStart(2, "0");

  return (
    <div
      ref={containerRef}
      className="select-none relative w-full min-h-[470px] md:aspect-[2.3/1] overflow-hidden bg-darkNavy flex flex-col justify-end"
    >
      {/* Top gradient shadow for header readability */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/30 to-transparent z-20 pointer-events-none" />

      {shouldLoadCarousel && (
        <Suspense fallback={null}>
          <EmblaInit onReady={handleEmblaReady} lang={lang} />
        </Suspense>
      )}

      {/* ── Background Images Layer (Embla Viewport) ── */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        ref={emblaRef ?? undefined}
      >
        <div className="flex h-full w-full">
          {/* hero items */}
          {slides.map((slide, idx) => {
            const slideImage =
              lang === "en" && slide.imageEn ? slide.imageEn : slide.image;
            const mobileImage =
              lang === "en" && slide.imageMobileEn
                ? slide.imageMobileEn
                : slide.imageMobile || slideImage;
            const posX = slide.imagePositionX || "center";
            const posY = slide.imagePositionY || "center";

            const imgSmallMobile = getSlideImage(mobileImage, 400);
            const imgMobile = getSlideImage(mobileImage, 500);
            const imgLargeMobile = getSlideImage(mobileImage, 768);
            const imgTablet = getSlideImage(slideImage, 1024);
            const imgDesktop = getSlideImage(slideImage, 1400);
            const altText = lang === "ar" ? slide.altAr : slide.altEn;

            return (
              <div
                key={slide._id || idx}
                className="relative w-full h-full flex-[0_0_100%] min-w-0"
              >
                {idx === 0 && (
                  <>
                    <link
                      rel="preload"
                      as="image"
                      href={imgSmallMobile}
                      media="(max-width: 400px)"
                      fetchPriority="high"
                    />
                    <link
                      rel="preload"
                      as="image"
                      href={imgMobile}
                      media="(min-width: 401px) and (max-width: 500px)"
                      fetchPriority="high"
                    />
                    <link
                      rel="preload"
                      as="image"
                      href={imgLargeMobile}
                      media="(min-width: 501px) and (max-width: 768px)"
                      fetchPriority="high"
                    />
                    <link
                      rel="preload"
                      as="image"
                      href={imgTablet}
                      media="(min-width: 769px) and (max-width: 1024px)"
                      fetchPriority="high"
                    />
                    <link
                      rel="preload"
                      as="image"
                      href={imgDesktop}
                      media="(min-width: 1025px)"
                      fetchPriority="high"
                    />
                  </>
                )}
                <picture className="absolute inset-0 w-full h-full">
                  <source media="(max-width: 400px)" srcSet={imgSmallMobile} />
                  <source
                    media="(min-width: 401px) and (max-width: 500px)"
                    srcSet={imgMobile}
                  />
                  <source
                    media="(min-width: 501px) and (max-width: 768px)"
                    srcSet={imgLargeMobile}
                  />
                  <source
                    media="(min-width: 769px) and (max-width: 1024px)"
                    srcSet={imgTablet}
                  />
                  <source media="(min-width: 1025px)" srcSet={imgDesktop} />
                  <img
                    src={imgDesktop}
                    alt={altText || ""}
                    fetchPriority={idx === 0 ? "high" : "low"}
                    loading={idx === 0 ? "eager" : "lazy"}
                    style={{ objectPosition: `${posX} ${posY}` }}
                    className="object-cover w-full h-full"
                  />
                </picture>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stationary Gradient Overlay — bottom only ── */}
      <div className="absolute bottom-0 left-0 right-0 top-auto h-[60%] lg:h-[55%] bg-gradient-to-t from-slate-950/70 md:from-slate-950/90 via-slate-950/40 lg:via-slate-950/60 to-transparent z-10 pointer-events-none" />

      {/* ── Admin Floating Toolbelt ── */}
      {isAdminMode && (
        <div className="absolute top-14 start-4 z-30 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onEditImages()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-darkNavy font-semibold text-xs shadow-lg backdrop-blur-sm transition-all duration-300 active:scale-95 cursor-pointer border border-white/20"
          >
            <svg
              className="w-3.5 h-3.5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t("admin.changeBackground")}
          </button>
          <button
            type="button"
            onClick={() => onEditPosition()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-darkNavy font-semibold text-xs shadow-lg backdrop-blur-sm transition-all duration-300 active:scale-95 cursor-pointer border border-white/20"
          >
            <svg
              className="w-3.5 h-3.5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            {t("admin.imagePosition")}
          </button>
          <button
            type="button"
            onClick={() => onEditField("cta")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-darkNavy font-semibold text-xs shadow-lg backdrop-blur-sm transition-all duration-300 active:scale-95 cursor-pointer border border-white/20"
          >
            <svg
              className="w-3.5 h-3.5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            {t("admin.ctaAndLink")}
          </button>
        </div>
      )}

      {/* ── Bottom Content HUD ── */}
      <div
        className={`${isAdminMode ? "pb-8" : "pb-12 md:pb-20 lg:pb-24"} pointer-events-none max-w-screen-2xl mx-auto relative z-20 px-4 md:px-6  text-white w-full`}
      >
        {/* Text blocks container — renders all slides for SEO but visually toggles visibility/animation */}
        <div className="relative min-h-[120px] mb-2 md:mb-8 flex items-end">
          {slides.map((slide, idx) => {
            const title = lang === "en" ? slide.titleEn : slide.titleAr;
            const subtitle =
              lang === "en" ? slide.subtitleEn : slide.subtitleAr;
            const isActive = idx === selectedIndex;

            return (
              <div
                key={slide._id || idx}
                className={`max-w-xl transition-all duration-300  ${
                  isActive
                    ? "relative z-10 block"
                    : "absolute inset-x-0 top-0 pointer-events-none opacity-0 invisible h-0 overflow-hidden"
                }`}
              >
                {idx === 0 ? (
                  <h1
                    className={`font-IBMPlex text-2xl md:text-[2.8rem] font-bold leading-tight md:mb-3 mb-2 ${
                      isActive ? "hero-stagger-1" : "opacity-0"
                    }`}
                    style={{ color: slide.textColor || "#ffffff" }}
                  >
                    {title || t("mainTitle")}
                    {isAdminMode && isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditField("texts");
                        }}
                        className="ms-2 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all duration-300 cursor-pointer"
                        title={t("admin.editTexts")}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    )}
                  </h1>
                ) : (
                  <h2
                    className={`font-IBMPlex text-2xl md:text-[2.8rem] font-bold leading-tight md:mb-3 mb-2 ${
                      isActive ? "hero-stagger-1" : "opacity-0"
                    }`}
                    style={{ color: slide.textColor || "#ffffff" }}
                  >
                    {title || t("mainTitle")}
                    {isAdminMode && isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditField("texts");
                        }}
                        className="ms-2 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all duration-300 cursor-pointer"
                        title={t("admin.editTexts")}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    )}
                  </h2>
                )}
                <p
                  className={`text-sm md:text-lg opacity-85 leading-relaxed ${
                    isActive ? "hero-stagger-2" : "opacity-0"
                  }`}
                  style={{ color: slide.textColor || "#ffffff" }}
                >
                  {subtitle || t("subtitle")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom control bar */}
        <div className="md:border-t border-white/10 md:pt-5 pt-1 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
          {/* CTA + Arrows */}
          <div className="flex items-center gap-3 flex-wrap">
            {slideBtnText && slideLink && (
              <Link
                href={slideLink.startsWith("/") ? slideLink : `/${slideLink}`}
                className="hero-stagger-3 pointer-events-auto inline-block md:px-8 px-6 md:py-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-bold md:text-sm text-[12px] transition-all duration-300 shadow-lg"
              >
                {slideBtnText}
              </Link>
            )}
            {total > 1 && (
              <div className="hero-stagger-3 hidden md:flex border border-white/10 rounded-full">
                <button
                  onClick={() => {
                    emblaApi && emblaApi.scrollPrev();
                    resetTimer();
                  }}
                  className="w-14 h-11 border-e border-white/10 flex items-center justify-center rounded-s-full hover:bg-white/10 transition-colors"
                  aria-label={t("prevSlide")}
                >
                  <svg
                    className="w-4 h-4 rtl:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    emblaApi && emblaApi.scrollNext();
                    resetTimer();
                  }}
                  className="w-14 h-11 flex items-center justify-center hover:bg-white/10 rounded-e-full transition-colors"
                  aria-label={t("nextSlide")}
                >
                  <svg
                    className="w-4 h-4 rtl:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {total > 1 && (
            <div className="hidden md:flex items-center gap-3 w-full md:w-60">
              <span className="font-mono text-xs text-white/50 tabular-nums">
                {padIndex(selectedIndex + 1)}
              </span>
              <div className="flex-1 bg-white/20 h-px relative rounded-full overflow-hidden">
                <div
                  className="absolute start-0 top-0 h-full bg-primary rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    transition: "width 500ms ease-out",
                  }}
                />
              </div>
              <span className="font-mono text-xs text-white/50 tabular-nums">
                {padIndex(total)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
