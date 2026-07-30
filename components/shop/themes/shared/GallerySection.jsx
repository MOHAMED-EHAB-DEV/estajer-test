"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { normalizeShopLink } from "@/utils/normalizeShopLink";

/**
 * Dynamic Magazine Layout planner
 * Alternate big images and map other small images to fit without gaps.
 * Dynamic placements based on total images.
 */
function getMagazinePlacements(total, theme) {
  const classes = [];
  let remaining = total;
  let cycle = 0;

  const isLeftFirst = theme === "bold" || theme === "minimal";

  while (remaining > 0) {
    const isEven = cycle % 2 === 0;
    const placeLeft = isLeftFirst ? isEven : !isEven;

    if (remaining >= 5) {
      if (!placeLeft) {
        classes.push(
          "col-span-2 row-span-2 md:col-start-3 md:col-span-2 md:row-span-2",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-1 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-2 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-1 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-2 md:col-span-1 md:row-span-1",
        );
      } else {
        classes.push(
          "col-span-2 row-span-2 md:col-start-1 md:col-span-2 md:row-span-2",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-3 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-4 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-3 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-4 md:col-span-1 md:row-span-1",
        );
      }
      remaining -= 5;
    } else if (remaining === 4) {
      if (!placeLeft) {
        classes.push(
          "col-span-2 row-span-2 md:col-start-3 md:col-span-2 md:row-span-2",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-1 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-2 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-2 row-span-1 md:col-start-1 md:col-span-2 md:row-span-1",
        );
      } else {
        classes.push(
          "col-span-2 row-span-2 md:col-start-1 md:col-span-2 md:row-span-2",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-3 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-4 md:col-span-1 md:row-span-1",
        );
        classes.push(
          "col-span-2 row-span-1 md:col-start-3 md:col-span-2 md:row-span-1",
        );
      }
      remaining -= 4;
    } else if (remaining === 3) {
      if (!placeLeft) {
        classes.push(
          "col-span-2 row-span-2 md:col-start-3 md:col-span-2 md:row-span-2",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-1 md:col-span-2 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-1 md:col-span-2 md:row-span-1",
        );
      } else {
        classes.push(
          "col-span-2 row-span-2 md:col-start-1 md:col-span-2 md:row-span-2",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-3 md:col-span-2 md:row-span-1",
        );
        classes.push(
          "col-span-1 row-span-1 md:col-start-3 md:col-span-2 md:row-span-1",
        );
      }
      remaining -= 3;
    } else if (remaining === 2) {
      classes.push("col-span-1 row-span-1 md:col-span-2 md:row-span-2");
      classes.push("col-span-1 row-span-1 md:col-span-2 md:row-span-2");
      remaining -= 2;
    } else {
      classes.push("col-span-2 row-span-1 md:col-span-4 md:row-span-2");
      remaining -= 1;
    }
    cycle++;
  }
  return classes;
}

export default function GallerySection({
  data,
  lang,
  shop,
  translate,
  theme = "modern",
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.gallery.${key}`);
  const isAr = lang === "ar";
  const langPrefix = isAr ? "" : "en/";
  const brandColor = shop?.brandColor || "#111111";
  const title = isAr ? data?.titleAr : data?.titleEn;
  const images = (data?.images || []).filter((img) => img?.src);
  const layout = data?.layout || "magazine";

  const [lightbox, setLightbox] = useState(null); // null | { src, alt }

  // Embla slider setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    direction: isAr ? "rtl" : "ltr",
  });

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

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  const magazinePlacements = useMemo(() => {
    return getMagazinePlacements(images.length, theme);
  }, [images.length, theme]);

  if (!images.length) return null;

  const sectionBg =
    theme === "minimal"
      ? "bg-white"
      : theme === "classic"
        ? "bg-white"
        : theme === "elegant"
          ? "bg-[#FCFAF7]"
          : theme === "bold"
            ? "bg-neutral-50 text-neutral-900"
            : theme === "cozy"
              ? "bg-[#FCFAF6]"
              : "bg-[#F9FAFB]";

  const borderT = "border-t border-neutral-100/60";

  const renderHeader = () => {
    if (!title) return null;

    if (theme === "cozy") {
      return (
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🌿</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {t("badge") || "Cozy Showcase"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-800 leading-tight">
            {title}
          </h2>
          <div className="w-12 h-[3px] rounded-full mt-2" style={{ backgroundColor: brandColor }} />
        </div>
      );
    }

    if (theme === "elegant") {
      return (
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rotate-45 shrink-0"
              style={{ backgroundColor: brandColor }}
            />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em]">
              {t("badge") || "Boutique Gallery"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl text-neutral-900 leading-tight">
            {title}
          </h2>
          <div className="w-12 h-px bg-neutral-300 mt-2" />
        </div>
      );
    }

    if (theme === "modern") {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: brandColor }}
            />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {t("badge")}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {title}
          </h2>
        </div>
      );
    }

    if (theme === "classic") {
      return (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight relative pb-3 inline-block self-start">
            {title}
            <span
              className="absolute bottom-0 start-0 w-12 h-1 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
          </h2>
        </div>
      );
    }

    if (theme === "bold") {
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-950 text-white font-black text-base shadow-sm">
            #
          </div>
          <div className="flex flex-col">
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: brandColor }}
            >
              {t("badge")}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-neutral-950 tracking-tight uppercase">
              {title}
            </h2>
          </div>
        </div>
      );
    }

    if (theme === "minimal") {
      return (
        <div className="text-center py-4 flex flex-col gap-1 items-center justify-center">
          <h2 className="text-xl md:text-2xl font-light text-neutral-900 uppercase tracking-widest">
            {title}
          </h2>
          <div className="w-16 h-[1px] bg-neutral-200 mt-2" />
        </div>
      );
    }

    return null;
  };

  const renderImageCard = (img, idx, currentLayout) => {
    const alt = isAr ? img.altAr : img.altEn;
    const src = img.src?.startsWith("data:")
      ? img.src
      : anyImgUrl({ src: img.src, size: 800, quality: 85 });
    const href = img.link ? normalizeShopLink(img.link, langPrefix) : null;
    const isExternal = href && href.startsWith("http");

    const isMasonry = currentLayout === "masonry";
    const isStrip = currentLayout === "strip";
    const isGrid = currentLayout === "grid";
    const isMagazine = currentLayout === "magazine";

    const isModern = theme === "modern";
    const isClassic = theme === "classic";
    const isBold = theme === "bold";
    const isMinimal = theme === "minimal";
    const isElegant = theme === "elegant";

    let itemLayoutCls = "";
    if (isMasonry) {
      const aspectCls =
        idx % 3 === 0
          ? "aspect-[3/4]"
          : idx % 3 === 1
            ? "aspect-[4/3]"
            : "aspect-square";
      itemLayoutCls = `relative w-full overflow-hidden block ${aspectCls}`;
    } else if (isStrip) {
      itemLayoutCls = "relative w-full aspect-square block";
    } else if (isGrid) {
      itemLayoutCls = "relative aspect-square block";
    } else if (isMagazine) {
      itemLayoutCls = magazinePlacements[idx] || "col-span-1 row-span-1";
    }

    const roundedCls = theme === "cozy"
      ? "rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[0.6rem] rounded-bl-[0.6rem]"
      : isModern
        ? "rounded-3xl"
        : isClassic
          ? "rounded-2xl md:rounded-3xl"
          : isElegant
            ? "rounded-none"
            : "rounded-none";

    const borderCls = isClassic
      ? "border border-neutral-100/80"
      : "border-none";
    const shadowCls = isModern
      ? "shadow-sm hover:shadow-md transition-shadow"
      : isClassic
        ? "shadow-sm hover:shadow-lg transition-all"
        : "";

    const cardCls = isClassic
      ? `group flex flex-col overflow-hidden h-full ${roundedCls} ${borderCls} ${shadowCls} bg-white cursor-pointer hover:border-[var(--brand-color)]/30`
      : isElegant
        ? `group flex flex-col overflow-hidden bg-white border border-neutral-200/60 cursor-pointer hover:border-neutral-800 transition-all duration-500 shadow-sm hover:shadow-md h-full`
        : isBold
          ? `group relative overflow-hidden h-full ${roundedCls} bg-neutral-100 cursor-pointer group-hover:ring-4 group-hover:ring-[var(--brand-color)] ring-offset-0 transition-all duration-300`
          : theme === "cozy"
            ? `group flex flex-col overflow-hidden bg-white border border-neutral-200/50 cursor-pointer hover:border-[var(--brand-color)] transition-all duration-500 shadow-sm hover:shadow-md h-full ${roundedCls}`
            : `group relative overflow-hidden h-full ${roundedCls} ${borderCls} ${shadowCls} bg-neutral-100 cursor-pointer`;

    const imgWrapperCls = "relative w-full h-full overflow-hidden flex-1";

    const hoverEffectCls =
      theme === "cozy"
        ? "transition-transform duration-500 group-hover:scale-105"
        : isModern || isElegant
          ? "transition-all duration-500 group-hover:scale-105 group-hover:blur-[0.5px]"
          : isClassic
            ? "transition-transform duration-300 group-hover:scale-102"
            : isBold
              ? "transition-transform duration-700 group-hover:scale-110"
              : "transition-opacity duration-300 group-hover:opacity-75";

    const imgCls = `absolute inset-0 w-full h-full object-cover ${hoverEffectCls}`;

    // Render center hover action icons and overlays per theme
    const actionIcon = href ? (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="w-4 h-4"
      >
        <path
          d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="w-4 h-4"
      >
        <path
          d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    let hoverOverlayEl = null;
    if (isModern) {
      hoverOverlayEl = (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-neutral-800 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 opacity-0 group-hover:opacity-100">
            {actionIcon}
          </div>
        </div>
      );
    } else if (isClassic) {
      hoverOverlayEl = (
        <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-xl bg-white text-neutral-800 flex items-center justify-center shadow-md border border-neutral-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 opacity-0 group-hover:opacity-100">
            {actionIcon}
          </div>
        </div>
      );
    } else if (isBold) {
      hoverOverlayEl = (
        <div
          className="absolute inset-0 bg-neutral-950/0 group-hover:bg-[var(--brand-color)]/95 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4 text-center pointer-events-none opacity-0 group-hover:opacity-100"
          style={{ "--brand-color": brandColor }}
        >
          <div className="w-11 h-11 bg-neutral-950 text-white flex items-center justify-center shadow-md font-black transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
            {actionIcon}
          </div>
          {alt && (
            <p className="text-white text-xs md:text-sm font-black uppercase tracking-widest leading-snug">
              {alt}
            </p>
          )}
        </div>
      );
    } else if (isElegant) {
      hoverOverlayEl = (
        <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/15 transition-all duration-500 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
          <div className="w-9 h-9 border border-neutral-200 bg-white/95 text-neutral-800 flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-all duration-500">
            {actionIcon}
          </div>
        </div>
      );
    } else if (isMinimal) {
      hoverOverlayEl = (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/90 transition-all duration-300 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
          <div className="w-9 h-9 bg-neutral-950 text-white flex items-center justify-center shadow-sm">
            {actionIcon}
          </div>
        </div>
      );
    } else if (theme === "cozy") {
      hoverOverlayEl = (
        <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/10 transition-all duration-500 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
          <div className="w-10 h-10 rounded-full bg-white text-neutral-800 flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-all duration-500">
            {actionIcon}
          </div>
        </div>
      );
    }

    let captionEl = null;
    if (alt) {
      if (isModern) {
        captionEl = (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent ps-4 pe-4 pt-10 pb-4 flex flex-col justify-end translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <p className="text-white text-xs md:text-sm font-semibold tracking-tight leading-snug">
              {alt}
            </p>
          </div>
        );
      } else if (isElegant) {
        captionEl = (
          <div className="p-3 bg-white text-center border-t border-neutral-100">
            <p className="text-xs italic text-neutral-600">{alt}</p>
          </div>
        );
      } else if (theme === "cozy") {
        captionEl = (
          <div className="p-3 bg-white text-center border-t border-neutral-100">
            <p className="text-xs font-bold text-neutral-700 line-clamp-1">{alt}</p>
          </div>
        );
      } else if (isClassic) {
        captionEl = (
          <div
            className="p-3 bg-white border-t border-neutral-50/80 text-center md:text-start transition-colors group-hover:bg-neutral-50/30"
            style={{ "--brand-color": brandColor }}
          >
            <p className="text-xs md:text-sm font-bold text-neutral-800 line-clamp-1">
              {alt}
            </p>
          </div>
        );
      }
    }

    const cardContent = (
      <div
        className={cardCls}
        style={theme === "cozy" ? { "--brand-color": brandColor } : undefined}
        onClick={() => !href && setLightbox({ src, alt })}
      >
        <div className={imgWrapperCls}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ""}
            className={imgCls}
            loading={idx < 4 ? "eager" : "lazy"}
          />
          {isModern && !alt && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          )}
          {hoverOverlayEl}
          {captionEl && !isClassic && !isElegant && theme !== "cozy" && captionEl}
        </div>
        {captionEl && (isClassic || isElegant || theme === "cozy") && captionEl}
      </div>
    );

    if (href) {
      return (
        <Link
          key={idx}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={`${itemLayoutCls}`}
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <div key={idx} className={itemLayoutCls}>
        {cardContent}
      </div>
    );
  };

  const renderLayout = () => {
    if (layout === "masonry") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, idx) => renderImageCard(img, idx, "masonry"))}
        </div>
      );
    }

    if (layout === "grid") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => renderImageCard(img, idx, "grid"))}
        </div>
      );
    }

    if (layout === "magazine") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px] md:auto-rows-[220px] grid-flow-row-dense">
          {images.map((img, idx) => renderImageCard(img, idx, "magazine"))}
        </div>
      );
    }

    if (layout === "strip") {
      const isBold = theme === "bold";
      const isMinimal = theme === "minimal";
      const isClassic = theme === "classic";
      const isModern = theme === "modern";

      const navBtnCls = isBold
        ? "w-10 h-10 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center pointer-events-auto hover:bg-[var(--brand-color)] hover:border-transparent active:scale-95 transition-all"
        : isClassic
          ? "w-10 h-10 bg-white border border-neutral-200 text-neutral-800 rounded-xl flex items-center justify-center pointer-events-auto shadow-sm hover:border-neutral-300 hover:shadow active:scale-95 transition-all"
          : isModern
            ? "w-10 h-10 bg-white/90 border border-neutral-100 text-neutral-800 rounded-full flex items-center justify-center pointer-events-auto shadow-sm hover:scale-105 active:scale-95 transition-all"
            : theme === "cozy"
              ? "w-10 h-10 bg-white border border-neutral-200 text-neutral-800 rounded-full flex items-center justify-center pointer-events-auto shadow-sm hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] active:scale-95 transition-all"
              : "w-10 h-10 bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center pointer-events-auto hover:bg-neutral-50 active:scale-95 transition-all";

      const navBtnStyle = isBold || theme === "cozy" ? { "--brand-color": brandColor } : {};

      return (
        <div className="relative group/slider">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_80%] min-w-0 md:flex-[0_0_33.33%] lg:flex-[0_0_25%] snap-start"
                >
                  {renderImageCard(img, idx, "strip")}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {scrollSnaps.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 start-4 end-4 flex justify-between pointer-events-none z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={`${navBtnCls} ${!canScrollPrev ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
                style={navBtnStyle}
                aria-label="Previous slide"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-5 h-5"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={`${navBtnCls} ${!canScrollNext ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
                style={navBtnStyle}
                aria-label="Next slide"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-5 h-5"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {scrollSnaps.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-6">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === selectedIndex
                      ? "w-6 bg-[var(--brand-color)]"
                      : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  style={{ "--brand-color": brandColor }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const lightboxRounded =
    theme === "modern"
      ? "rounded-3xl"
      : theme === "classic"
        ? "rounded-2xl"
        : theme === "cozy"
          ? "rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-[0.6rem] rounded-bl-[0.6rem]"
          : "rounded-none";

  return (
    <section className={`${sectionBg} ${borderT} py-16 md:py-24`} id="gallery">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        {renderHeader()}
        {renderLayout()}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.src}
              alt={lightbox.alt || ""}
              className={`max-w-full max-h-[85vh] object-contain shadow-2xl ${lightboxRounded}`}
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -end-3 w-9 h-9 rounded-full bg-white text-neutral-800 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4"
              >
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
            {lightbox.alt && (
              <p className="absolute -bottom-8 start-0 text-white/70 text-sm">
                {lightbox.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
