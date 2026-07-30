"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import SearchBox from "../../shared/SearchBox";
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
    : anyImgUrl({ src, size: 1200, quality: 90 });

  const finalMobileSrc = mobileSrc?.startsWith("data:")
    ? mobileSrc
    : anyImgUrl({ src: mobileSrc, size: 700, quality: 90 });

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
  const brandColor = shop?.brandColor || "#8B5E3C";

  const headerSection = shop?.sections?.find((s) => s.sectionType === "header");
  const alwaysWhite = headerSection?.data?.alwaysWhite === true;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: lang === "ar" ? "rtl" : "ltr",
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const isAr = lang === "ar";

  // Placeholder for empty banner state
  if (!banners || banners.length === 0) {
    return (
      <section className="relative w-full h-[400px] md:h-[500px] bg-[#FCFAF7] border-b border-neutral-200 flex flex-col items-center justify-center text-center gap-3">
        <span className="text-3xl">🖼️</span>
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          {t("addBanners")}
        </p>
        {(title || subtitle) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 pointer-events-none">
            {title && <h1 className="text-3xl text-neutral-800">{title}</h1>}
            {subtitle && (
              <p className="text-neutral-500 italic text-sm max-w-md">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </section>
    );
  }

  if (data?.heroBgOnly) {
    return (
      <section className="relative w-full mb-16 md:mb-24 z-20">
        <div className="select-none relative w-full min-h-[470px] md:aspect-[2.3/1] overflow-hidden bg-neutral-900">
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            ref={banners.length > 1 ? emblaRef : null}
          >
            <div className="flex h-full w-full">
              {banners.map((banner, idx) => (
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
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-[#FAF7F2] border-b border-neutral-200">
      {/* Outer grid container */}
      <div className="max-w-screen-2xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[750px] items-stretch">
        {/* Left Side: Serif Typography & Minimal Search Overlay (7 cols on desktop) */}
        <div className={`lg:col-span-7 flex flex-col justify-center px-6 md:px-14 lg:px-20 pb-16 lg:py-24 z-10 text-start ${alwaysWhite ? "pt-16" : "pt-28 md:pt-16"}`}>
          <div className="max-w-xl flex flex-col gap-6">
            {title && (
              <h1 className="text-3xl md:text-5xl lg:text-6xl text-neutral-900 leading-[1.1] tracking-tight">
                {title}
              </h1>
            )}

            {/* Subtle thin gold divider line */}
            <div className="h-px bg-neutral-300 w-24 my-2" />

            {subtitle && (
              <p className="text-sm md:text-lg text-neutral-500 italic leading-relaxed max-w-md">
                {subtitle}
              </p>
            )}

            {/* CTA Button */}
            {(lang === "ar" ? data?.heroCtaTextAr : data?.heroCtaTextEn) &&
              (lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn) && (
                <a
                  href={
                    lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn
                  }
                  className="w-fit mt-4 px-8 py-3.5 text-sm uppercase tracking-widest font-bold transition-opacity duration-300 hover:opacity-90 shadow-sm"
                  style={{
                    backgroundColor: brandColor,
                    color: "#ffffff",
                  }}
                >
                  {lang === "ar" ? data.heroCtaTextAr : data.heroCtaTextEn}
                </a>
              )}

            <div className="w-full mt-6" role="search">
              <SearchBox
                categoriesData={categoriesData}
                subCategoriesData={subCategoriesData}
                lang={lang}
                translate={translate}
                userId={userId}
                shopSlug={shop?.slug}
                theme="minimal"
                shop={shop}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Portrait Image Carousel Slide (5 cols on desktop) */}
        <div className="lg:col-span-5 relative min-h-[350px] lg:h-auto overflow-hidden bg-neutral-100 group border-t lg:border-t-0 lg:border-s border-neutral-200">
          <div
            className="h-full w-full overflow-hidden"
            ref={banners.length > 1 ? emblaRef : null}
          >
            <div className="flex h-full min-h-[350px] lg:min-h-0">
              {banners.map((banner, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] min-w-0 relative h-full min-h-[350px] lg:min-h-0"
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

          {/* Luxury Minimal Slide Number Counter (e.g. 01 / 04) */}
          {banners.length > 1 && (
            <div
              className="absolute bottom-6 start-6 z-10 px-4 py-2 border bg-white/95 backdrop-blur-sm text-[11px] font-bold tracking-widest text-neutral-800"
              style={{ borderColor: `${brandColor}30` }}
            >
              <span>{String(selectedIndex + 1).padStart(2, "0")}</span>
              <span className="mx-2 opacity-40">/</span>
              <span className="opacity-60">
                {String(banners.length).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Elegant Fine Arrow Overlays */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 end-6 z-10 flex gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="w-9 h-9 border border-neutral-200/80 bg-white/95 text-neutral-800 flex items-center justify-center hover:border-neutral-800 transition-colors"
                aria-label="Previous slide"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`}
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className="w-9 h-9 border border-neutral-200/80 bg-white/95 text-neutral-800 flex items-center justify-center hover:border-neutral-800 transition-colors"
                aria-label="Next slide"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`}
                >
                  <polyline points="9 18 13 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
