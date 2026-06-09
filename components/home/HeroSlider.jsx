"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

export default function HeroSlider({
  banners = [],
  lang,
  fallbackData,
  isAdminMode = false,
  onEditField = () => {},
  onEditImages = () => {},
  onEditPosition = () => {},
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans("heroSlider." + key);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Use admin banners or construct fallback banner
  const slides = banners.length > 0 ? banners : [];

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length,
    );
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [handleNext, slides.length, currentIndex]);

  // Map text alignment
  const positionClasses = {
    start:
      "text-center items-center justify-center md:text-start md:items-start md:ps-6",
    center: "text-center items-center justify-center",
    end: "text-center items-center justify-center md:text-end md:items-end md:justify-end md:pe-6",
  };

  const innerPosClasses = {
    start: "items-center md:items-start text-center md:text-start",
    center: "items-center text-center",
    end: "items-center md:items-end text-center md:text-end",
  };

  const getSlideImage = (src) => {
    if (!src) return "";
    if (src.startsWith("data:") || src.startsWith("blob:")) {
      return src;
    }
    return anyImgUrl({ src, size: 1600, quality: 85 });
  };

  return (
    <div className="relative w-full min-h-[430px] md:aspect-[2.6/1] overflow-hidden bg-darkNavy">
      {/* Top gradient shadow overlay for header readability */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none" />
      {/* Admin Floating Toolbelt at Top Left */}
      {isAdminMode && (
        <div className="absolute top-4 start-4 z-30 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onEditImages()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-darkNavy font-semibold text-xs shadow-lg backdrop-blur-sm transition-all duration-300 transform active:scale-95 cursor-pointer border border-white/20 hover:border-white/40"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-darkNavy font-semibold text-xs shadow-lg backdrop-blur-sm transition-all duration-300 transform active:scale-95 cursor-pointer border border-white/20 hover:border-white/40"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-darkNavy font-semibold text-xs shadow-lg backdrop-blur-sm transition-all duration-300 transform active:scale-95 cursor-pointer border border-white/20 hover:border-white/40"
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

      {/* Background slide wrapper */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const slideImage =
            lang === "en" && slide.imageEn ? slide.imageEn : slide.image;
          const slideTitle = lang === "en" ? slide.titleEn : slide.titleAr;
          const slideSubtitle =
            lang === "en" ? slide.subtitleEn : slide.subtitleAr;
          const slideBtnText =
            lang === "en" ? slide.buttonTextEn : slide.buttonTextAr;
          const currentPosClass =
            positionClasses[slide.textPosition || "start"];
          const currentInnerPosClass =
            innerPosClasses[slide.textPosition || "start"];
          const posX = slide.imagePositionX || "center";
          const posY = slide.imagePositionY || "center";
          const objectPositionStyle = `${posX} ${posY}`;

          return (
            <div
              key={slide._id || idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background image overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-darkNavy/85 via-black/40 to-black/20 z-10" />
              <Image
                src={getSlideImage(slideImage)}
                unoptimized
                alt={lang === "ar" ? slide.altAr : slide.altEn}
                fill
                priority={isActive || idx === 0}
                style={{ objectPosition: objectPositionStyle }}
                className="object-cover w-full h-full"
              />

              {/* Slide text contents */}
              <div className="absolute inset-0 z-10 flex items-center justify-center w-full max-w-screen-2xl mx-auto">
                <div
                  className={`flex flex-col w-full h-full justify-center ${currentPosClass}`}
                >
                  <div
                    className={`max-w-[750px] mt-[-30px] pt-14 md:pt-0 px-4 transition-all duration-1000 transform ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ color: slide.textColor || "#ffffff" }}
                  >
                    <h2 className="group relative font-IBMPlex text-2xl md:text-[3.8rem] font-bold mb-4 leading-tight">
                      {slideTitle || t("mainTitle")}
                      {isAdminMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditField("texts");
                          }}
                          className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer scale-90 pointer-events-auto"
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
                    <p className="group relative md:text-[1.8rem] opacity-90 max-w-[600px] flex items-center gap-3 w-fit">
                      {slideSubtitle || t("subtitle")}
                      {isAdminMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditField("texts");
                          }}
                          className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer scale-90 pointer-events-auto"
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
                    </p>
                    {slideBtnText && slide.link && (
                      <Link
                        href={
                          slide.link.startsWith("/")
                            ? slide.link
                            : `/${slide.link}`
                        }
                        className="inline-block px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-full font-IBMPlex font-bold text-base transition-all duration-300 shadow-lg pointer-events-auto"
                      >
                        {slideBtnText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute z-20 start-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all group duration-300 active:scale-95"
            aria-label={t("prevSlide")}
          >
            <svg
              className="w-6 h-6 transform transition-transform duration-300 group-hover:scale-110 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="hidden md:flex absolute z-20 end-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all group duration-300 active:scale-95"
            aria-label={t("nextSlide")}
          >
            <svg
              className="w-6 h-6 transform transition-transform duration-300 group-hover:scale-110 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
