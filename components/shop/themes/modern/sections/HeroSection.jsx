"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import SearchBox from "../../shared/SearchBox";
import { useTranslations } from "@/hooks/useTranslations";
import { IconArrow } from "../Icons";

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
    : anyImgUrl({ src, size: 1000, quality: 90 });

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
          className="object-cover"
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
          className="object-cover"
        />
      </div>
    </>
  );
};

/**
 * Modern HeroSection
 * Aesthetic: Centered modern look, large elegant heading, soft background gradient, integrated SearchBox,
 * rounded banner slider with subtle border outlines.
 */
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
  const isAr = lang === "ar";
  const title = isAr
    ? data?.heroTitleAr || shop?.nameAr
    : data?.heroTitleEn || shop?.nameEn;
  const subtitle = isAr
    ? data?.heroDescriptionAr || shop?.descriptionAr
    : data?.heroDescriptionEn || shop?.descriptionEn;
  const headerSection = shop?.sections?.find((s) => s.sectionType === "header");
  const alwaysWhite = headerSection?.data?.alwaysWhite === true;
  const userId = shop?.owner?._id || shop?.owner;
  const brandColor = shop?.brandColor || "#111111";

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: isAr ? "rtl" : "ltr",
  });

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const hasBanners = banners.length > 0;

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
    <section className={`relative overflow-hidden bg-gradient-to-b from-[#F9FAFB] via-white to-white pb-12 md:py-20 lg:py-28 ${alwaysWhite ? "pt-12" : "pt-28 md:pt-20"}`}>
      {/* Background shape */}
      <div className="absolute top-0 start-0 w-[40rem] h-[40rem] bg-gradient-to-br from-neutral-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Content side */}
          <div
            className={`lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-start ${isAr ? "lg:order-2" : ""}`}
          >
            {/* Title */}
            {title && (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 leading-[1.15] tracking-tight mb-6">
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-md mb-6">
                {subtitle}
              </p>
            )}

            {/* CTA Button */}
            {(lang === "ar" ? data?.heroCtaTextAr : data?.heroCtaTextEn) &&
              (lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn) && (
                <div className="mb-8">
                  <a
                    href={
                      lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn
                    }
                    className="w-fit inline-block px-8 py-3.5 font-bold text-sm rounded-full hover:opacity-90 transition-opacity duration-300 shadow-sm"
                    style={{
                      backgroundColor: brandColor,
                      color: "#ffffff",
                    }}
                  >
                    {lang === "ar" ? data.heroCtaTextAr : data.heroCtaTextEn}
                  </a>
                </div>
              )}

            {/* Search Box */}
            <SearchBox
              categoriesData={categoriesData}
              subCategoriesData={subCategoriesData}
              lang={lang}
              translate={translate}
              userId={userId}
              shopSlug={shop?.slug}
              theme="modern"
              shop={shop}
            />
          </div>

          {/* Banner/Slider side */}
          <div className={`lg:col-span-6 ${isAr ? "lg:order-1" : ""}`}>
            <div className="relative p-2 bg-neutral-100/50 rounded-[2.5rem] border border-neutral-200/40">
              {/* Inner wrapper */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-white shadow-sm">
                {hasBanners ? (
                  <div
                    className="h-full overflow-hidden"
                    ref={banners.length > 1 ? emblaRef : null}
                  >
                    <div className="flex h-full">
                      {banners.map((banner, idx) => (
                        <div
                          key={idx}
                          className="flex-[0_0_100%] min-w-0 relative h-full"
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
                ) : (
                  /* Clean modern geometric placeholder */
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-[2rem] opacity-[0.03] animate-pulse"
                        style={{ backgroundColor: brandColor }}
                      />
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="w-12 h-12 text-neutral-300"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="4" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        <circle cx="9" cy="9" r="2" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Slider dot navigation */}
              {hasBanners && banners.length > 1 && (
                <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-100 shadow-sm">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => emblaApi?.scrollTo(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === selectedIndex ? "12px" : "6px",
                        height: "6px",
                        backgroundColor:
                          i === selectedIndex ? brandColor : "#d4d4d4",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
