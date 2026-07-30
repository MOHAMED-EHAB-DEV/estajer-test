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
  const brandColor = shop?.brandColor || "#F48A42";

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

  if (!banners || banners.length === 0) {
    return (
      <section className="relative w-full h-[400px] bg-[#FAF6F0] border-b border-neutral-200/50 flex flex-col items-center justify-center text-center gap-3 rounded-none">
        <span className="text-3xl">🌿</span>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          {t("addBanners") || "Add Boutique Banners"}
        </p>
        {(title || subtitle) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 pointer-events-none">
            {title && (
              <h1 className="text-3xl font-extrabold text-neutral-800">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-neutral-500 font-medium text-sm max-w-md">
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
    <section className="relative w-full bg-[#FAF6F0] pb-12 lg:pb-0">
      <div className="max-w-screen-2xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[700px] items-stretch gap-6 lg:gap-0">
        {/* Left Side: Soft Text Content & Search (7 cols) */}
        <div className={`lg:col-span-7 flex flex-col justify-center px-6 md:px-14 lg:px-20 pb-16 lg:py-24 z-10 text-start ${alwaysWhite ? "pt-16" : "pt-28 md:pt-16"}`}>
          <div className="max-w-xl flex flex-col gap-5">
            {title && (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-neutral-800 leading-tight">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="text-sm md:text-lg text-neutral-500 font-medium leading-relaxed max-w-md">
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
                  className="w-fit mt-2 px-8 py-3.5 font-bold text-sm rounded-2xl hover:opacity-90 transition-opacity duration-300 shadow-sm"
                  style={{
                    backgroundColor: brandColor,
                    color: "#ffffff",
                  }}
                >
                  {lang === "ar" ? data.heroCtaTextAr : data.heroCtaTextEn}
                </a>
              )}

            <div className="w-full mt-4" role="search">
              <SearchBox
                categoriesData={categoriesData}
                subCategoriesData={subCategoriesData}
                lang={lang}
                translate={translate}
                userId={userId}
                shopSlug={shop?.slug}
                theme="classic" // cozy will consume modern row inline style nicely via classic pill
                shop={shop}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Leaf Curved Portrait Carousel (5 cols) */}
        <div className="lg:col-span-5 flex items-center px-6 lg:px-12 py-6 lg:py-16">
          <div className="relative w-full aspect-[4/5] min-h-[350px] lg:h-full lg:min-h-0 bg-white p-3 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.2rem] rounded-bl-[1.2rem] border border-neutral-200/50 shadow-md overflow-hidden group">
            <div
              className="h-full w-full rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1rem] rounded-bl-[1rem] overflow-hidden bg-neutral-50 relative"
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

            {/* Cozy Slide Counter */}
            {banners.length > 1 && (
              <div
                className="absolute bottom-6 start-6 z-10 px-3.5 py-1.5 rounded-full border bg-white/95 backdrop-blur-sm text-[10px] font-bold tracking-wider text-neutral-700 shadow-sm"
                style={{ borderColor: `${brandColor}20` }}
              >
                <span>{selectedIndex + 1}</span>
                <span className="mx-1.5 opacity-30">/</span>
                <span className="opacity-50">{banners.length}</span>
              </div>
            )}

            {/* Cozy Arrow Controls */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 end-6 z-10 flex gap-2">
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="w-8.5 h-8.5 rounded-full border border-neutral-200/60 bg-white/95 text-neutral-700 flex items-center justify-center hover:border-neutral-800 transition-colors shadow-sm"
                  aria-label="Previous slide"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`}
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="w-8.5 h-8.5 rounded-full border border-neutral-200/60 bg-white/95 text-neutral-700 flex items-center justify-center hover:border-neutral-800 transition-colors shadow-sm"
                  aria-label="Next slide"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`}
                  >
                    <polyline points="9 18 13 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
