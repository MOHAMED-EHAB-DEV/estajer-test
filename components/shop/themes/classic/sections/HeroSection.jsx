"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import HeroSearchBox from "@/components/home/HeroSearchBox";
import { useTranslations } from "@/hooks/useTranslations";

const BannerImage = ({
  banner,
  idx,
  lang,
  singleLangImage,
  positionX,
  positionY,
}) => {
  const src =
    lang === "ar" || singleLangImage === true
      ? banner.imageAr
      : banner.imageEn || banner.imageAr;
  const mobileSrc =
    lang === "ar" || singleLangImage === true
      ? banner.imageMobileAr || src
      : banner.imageMobileEn || banner.imageMobileAr || src;

  const finalSrc = src?.startsWith("data:")
    ? src
    : anyImgUrl({ src, size: 1600, quality: 80 });

  const finalMobileSrc = mobileSrc?.startsWith("data:")
    ? mobileSrc
    : anyImgUrl({ src: mobileSrc, size: 700, quality: 80 });

  const altText =
    lang === "ar" || singleLangImage === true
      ? banner.altAr || ""
      : banner.altEn || banner.altAr || "";

  const objPos = `${positionX || "center"} ${positionY || "center"}`;

  return (
    <>
      <div className="hidden md:block absolute inset-0">
        <Image
          unoptimized
          src={finalSrc}
          alt={altText}
          fill
          priority={idx === 0}
          style={{ objectPosition: objPos }}
          className="object-cover transition-transform duration-1000 ease-out"
        />
      </div>
      <div className="block md:hidden absolute inset-0">
        <Image
          unoptimized
          src={finalMobileSrc}
          alt={altText}
          fill
          priority={idx === 0}
          style={{ objectPosition: objPos }}
          className="object-cover transition-transform duration-1000 ease-out"
        />
      </div>
    </>
  );
};

export default function HeroSection({
  data,
  lang,
  shop,
  categoriesData,
  subCategoriesData,
  translate,
  previewMode = false,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.hero.${key}`);
  const banners = data?.heroBanners || [];
  const title =
    lang === "ar"
      ? data?.heroTitleAr || shop?.nameAr
      : data?.heroTitleEn || shop?.nameEn;
  const subtitle =
    lang === "ar"
      ? data?.heroDescriptionAr || shop?.descriptionAr
      : data?.heroDescriptionEn || shop?.descriptionEn;
  const userId = shop?.owner?._id || shop?.owner;

  const slides = banners.length > 0 ? banners : [];
  const total = slides.length;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
    direction: lang === "ar" ? "rtl" : "ltr",
  });

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
    emblaApi.on("pointerDown", resetTimer);
  }, [emblaApi, onSelect, resetTimer]);

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

  const ctaText = lang === "ar" ? data?.heroCtaTextAr : data?.heroCtaTextEn;
  const ctaLink = lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn;

  const progressPercent = total > 0 ? ((selectedIndex + 1) / total) * 100 : 0;
  const padIndex = (n) => String(n).padStart(2, "0");

  if (!banners || banners.length === 0) {
    return (
      <section className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-neutral-100 to-neutral-200 flex flex-col items-center justify-center text-center gap-2 md:gap-3 rounded-2xl">
        <span className="text-3xl md:text-4xl">🖼️</span>
        <p className="text-xs md:text-sm font-bold text-neutral-400">
          {t("addBanners")}
        </p>
        {(title || subtitle) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            {title && (
              <h1 className="text-2xl font-black text-neutral-600">{title}</h1>
            )}
            {subtitle && (
              <p className="text-neutral-500 text-sm max-w-md">{subtitle}</p>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="relative w-full mb-16 md:mb-24 z-20">
      <div
        ref={containerRef}
        className="select-none relative w-full min-h-[470px] md:aspect-[2.3/1] overflow-hidden bg-darkNavy flex flex-col justify-end"
      >
        {/* Top gradient shadow for header readability */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/30 to-transparent z-20 pointer-events-none" />

        {/* ── Background Images Layer (Embla Viewport) ── */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          ref={total > 1 ? emblaRef : null}
        >
          <div className="flex h-full w-full">
            {slides.map((banner, idx) => (
              <div
                key={idx}
                className="relative w-full h-full flex-[0_0_100%] min-w-0"
              >
                <BannerImage
                  banner={banner}
                  idx={idx}
                  lang={lang}
                  singleLangImage={data?.singleLangImage}
                  positionX={data?.heroBgPositionX}
                  positionY={data?.heroBgPositionY}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Configurable Dark Overlay & Bottom Gradient ── */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundColor: `rgba(0,0,0, ${typeof data?.heroBgOpacity === "number" ? data.heroBgOpacity / 100 : 0.4})`,
          }}
        />
        {!data?.heroBgOnly && (
          <div className="absolute bottom-0 left-0 right-0 top-auto h-[60%] lg:h-[55%] bg-gradient-to-t from-slate-950/70 md:from-slate-950/90 via-slate-950/40 lg:via-slate-950/60 to-transparent z-10 pointer-events-none" />
        )}

        {/* ── Bottom Content HUD ── */}
        {!data?.heroBgOnly && (
          <div className="pb-16 md:pb-24 lg:pb-28 pointer-events-none max-w-screen-2xl mx-auto relative z-20 px-4 md:px-6 text-white w-full">
            <div className="relative min-h-[120px] mb-2 md:mb-8 flex items-end">
              <div className="max-w-xl relative z-10 block">
                <h1 className="font-IBMPlex text-2xl md:text-[2.8rem] font-bold leading-tight md:mb-3 mb-2 hero-stagger-1 drop-shadow-lg">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm md:text-lg opacity-85 leading-relaxed hero-stagger-2 drop-shadow">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom control bar */}
            <div className="md:border-t border-white/10 md:pt-5 pt-1 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
              {/* CTA + Arrows */}
              <div className="flex items-center gap-3 flex-wrap">
                {ctaText && ctaLink && (
                  <Link
                    href={ctaLink.startsWith("/") ? ctaLink : `/${ctaLink}`}
                    className="hero-stagger-3 pointer-events-auto inline-block md:px-8 px-6 md:py-3 py-2 text-white rounded-full font-bold md:text-sm text-[12px] transition-all duration-300 shadow-lg hover:opacity-90"
                    style={{ backgroundColor: shop?.brandColor || "#111" }}
                  >
                    {ctaText}
                  </Link>
                )}
                {total > 1 && (
                  <div className="hero-stagger-3 hidden md:flex border border-white/10 rounded-full pointer-events-auto backdrop-blur-sm">
                    <button
                      onClick={() => {
                        emblaApi && emblaApi.scrollPrev();
                        resetTimer();
                      }}
                      className="w-14 h-11 border-e border-white/10 flex items-center justify-center rounded-s-full hover:bg-white/10 transition-colors cursor-pointer"
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
                      className="w-14 h-11 flex items-center justify-center hover:bg-white/10 rounded-e-full transition-colors cursor-pointer"
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
                      className="absolute start-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: shop?.brandColor || "#fff",
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
        )}
      </div>

      {/* Floating search container overlapping the bottom border */}
      <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 z-20 px-4 pointer-events-none">
        <div className="max-w-screen-2xl mx-auto flex justify-center w-full pointer-events-auto">
          <HeroSearchBox
            categoriesData={categoriesData}
            subCategoriesData={subCategoriesData}
            lang={lang}
            translate={translate}
            userId={userId}
            providerId={shop?.owner?._id || shop?.owner}
            shopSlug={shop?.slug}
          />
        </div>
      </div>
    </section>
  );
}
