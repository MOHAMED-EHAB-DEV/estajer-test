"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { FaChevronLeft, FaChevronRight } from "@/components/ui/svgs/AdminIcons";
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
  const brandColor = shop?.brandColor || "#F48A42";

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

  // Bold theme hero — even without banners, shows a full brand-color gradient hero
  const hasBanners = banners && banners.length > 0;

  return (
    <section className="relative w-full min-h-[480px] md:min-h-[600px] lg:min-h-[720px] overflow-hidden">
      {/* Background: image carousel or brand gradient */}
      {hasBanners ? (
        <div
          className="absolute inset-0"
          ref={banners.length > 1 ? emblaRef : null}
        >
          <div className="flex h-full">
            {banners.map((banner, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 relative h-full min-h-[480px] md:min-h-[600px] lg:min-h-[720px]"
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
        // Bold brand-color gradient fallback — looks premium even without image
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 40%, ${brandColor}88 70%, #fff5ee 100%)`,
          }}
        />
      )}

      {/* Geometric decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -end-20 w-80 h-80 rounded-full opacity-20"
          style={{ backgroundColor: hasBanners ? "#fff" : "#fff" }}
        />
        <div
          className="absolute bottom-0 start-0 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: hasBanners ? "#fff" : "#fff" }}
        />
        {/* Diagonal stripe */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.8) 20px,
              rgba(255,255,255,0.8) 22px
            )`,
          }}
        />
      </div>

      {/* Dark overlay for images */}
      {!data?.heroBgOnly && hasBanners && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0,0,0, ${typeof data?.heroBgOpacity === "number" ? data.heroBgOpacity / 100 : 0.5})`,
          }}
        />
      )}

      {/* Content */}
      {!data?.heroBgOnly && (
        <div className="relative z-10 h-full min-h-[480px] md:min-h-[600px] lg:min-h-[720px] flex flex-col items-center justify-center px-4 text-center gap-5 md:gap-8">
          {title && (
            <h1
              className={`text-3xl md:text-5xl lg:text-6xl font-black leading-tight max-w-4xl ${
                hasBanners ? "text-white drop-shadow-lg" : "text-darkNavy"
              }`}
            >
              {title}
            </h1>
          )}

          {subtitle && (
            <p
              className={`text-sm md:text-xl max-w-2xl leading-relaxed font-medium ${
                hasBanners ? "text-white/90" : "text-darkNavy/70"
              }`}
            >
              {subtitle}
            </p>
          )}

          {/* CTA Button */}
          {(lang === "ar" ? data?.heroCtaTextAr : data?.heroCtaTextEn) &&
            (lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn) && (
              <a
                href={lang === "ar" ? data?.heroCtaLinkAr : data?.heroCtaLinkEn}
                className="mt-4 px-8 py-3.5 font-black uppercase tracking-widest text-sm rounded-none hover:opacity-90 transition-opacity duration-300"
                style={{
                  backgroundColor: brandColor,
                  color: "#ffffff",
                }}
              >
                {lang === "ar" ? data.heroCtaTextAr : data.heroCtaTextEn}
              </a>
            )}

          {/* Search */}
          <div
            className="w-full flex justify-center mt-2 pointer-events-auto"
            role="search"
          >
            <SearchBox
              categoriesData={categoriesData}
              subCategoriesData={subCategoriesData}
              lang={lang}
              translate={translate}
              userId={userId}
              shopSlug={shop?.slug}
              theme="bold"
              shop={shop}
            />
          </div>
        </div>
      )}

      {/* Carousel nav */}
      {!data?.heroBgOnly && hasBanners && banners.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute top-1/2 start-4 md:start-8 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-darkNavy shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            {lang === "ar" ? (
              <FaChevronRight className="w-4 h-4" />
            ) : (
              <FaChevronLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute top-1/2 end-4 md:end-8 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-darkNavy shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            {lang === "ar" ? (
              <FaChevronLeft className="w-4 h-4" />
            ) : (
              <FaChevronRight className="w-4 h-4" />
            )}
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  selectedIndex === idx ? "w-8 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
