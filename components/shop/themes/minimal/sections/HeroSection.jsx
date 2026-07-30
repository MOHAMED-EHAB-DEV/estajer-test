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
 * Minimal Hero — full-height split: left text, right image.
 * When no banner: pure white with brand-color dot accent.
 * Typography: large, tight, tracked headings. Lots of space.
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
    <section className="w-full min-h-[560px] md:min-h-[680px] lg:min-h-[780px] flex flex-col md:flex-row relative overflow-hidden bg-white">
      {/* Left: text */}
      <div
        className={`flex flex-col justify-center px-6 md:px-10 lg:px-20 pb-16 md:py-0 flex-1 z-10 ${isAr ? "md:order-2" : ""} ${alwaysWhite ? "pt-16" : "pt-28 md:pt-0"}`}
      >
        {title && (
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight mb-5 md:mb-7 max-w-lg">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-sm mb-6 md:mb-8">
            {subtitle}
          </p>
        )}

        {/* CTA Button */}
        {(lang === "ar" ? data?.heroCtaTextAr : data?.heroCtaTextEn) &&
          (lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn) && (
            <div className="mb-8 md:mb-12">
              <a
                href={lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn}
                className="w-fit inline-block px-8 py-3.5 font-bold text-sm rounded-none hover:opacity-90 transition-opacity duration-300"
                style={{
                  backgroundColor: brandColor,
                  color: "#ffffff",
                }}
              >
                {lang === "ar" ? data.heroCtaTextAr : data.heroCtaTextEn}
              </a>
            </div>
          )}

        <div className="w-full max-w-md" role="search">
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

        {/* Dot nav */}
        {hasBanners && banners.length > 1 && (
          <div className="flex items-center gap-2 mt-8">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === selectedIndex ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: i === selectedIndex ? brandColor : "#d4d4d4",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: image */}
      <div
        className={`relative w-full md:w-[50%] lg:w-[55%] min-h-[300px] md:min-h-full shrink-0 ${isAr ? "md:order-1" : ""}`}
      >
        {hasBanners ? (
          <div
            className="h-full overflow-hidden"
            ref={banners.length > 1 ? emblaRef : null}
          >
            <div className="flex h-full">
              {banners.map((banner, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] min-w-0 relative h-full min-h-[300px]"
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
          /* No image: geometric brand-color fill */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${brandColor}08` }}
          >
            <div
              className="w-40 h-40 md:w-64 md:h-64 rounded-full opacity-20"
              style={{ backgroundColor: brandColor }}
            />
            <div
              className="absolute w-24 h-24 md:w-40 md:h-40 rounded-full opacity-15"
              style={{ backgroundColor: brandColor }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
