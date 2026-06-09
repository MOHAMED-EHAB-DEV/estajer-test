"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { FaChevronLeft, FaChevronRight } from "@/components/ui/svgs/AdminIcons";
import SearchBox from "@/components/home/SearchBox";

export default function PartnerHero({
  id,
  banners,
  lang,
  title,
  subtitle,
  categoriesData,
  subCategoriesData,
  translation,
  providerId,
  userId,
}) {
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

  if (!banners || banners.length === 0) return null;

  const BannerImage = ({ banner, idx }) => (
    <Image
      unoptimized
      src={anyImgUrl({
        src: lang === "ar" ? banner.imageAr : banner.imageEn,
        size: 1920,
        quality: 90,
      })}
      alt={lang === "ar" ? banner.altAr || "" : banner.altEn || ""}
      fill
      priority={idx === 0}
      className="object-cover transition-transform duration-1000 ease-out"
    />
  );

  return (
    <section
      id={id}
      className="relative w-full h-[600px] md:h-[700px] lg:h-[900px] z-20"
    >
      <div className="relative h-full w-full group">
        <div
          className="h-full w-full italic-none overflow-hidden"
          ref={emblaRef}
        >
          <div className="flex h-full italic-none">
            {banners.map((banner, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 relative h-full italic-none"
              >
                {banner.link ? (
                  <Link
                    href={`${lang === "ar" ? "" : "/en"}${banner.link}`}
                    className="block w-full h-full italic-none"
                  >
                    <BannerImage banner={banner} idx={idx} />
                  </Link>
                ) : (
                  <BannerImage banner={banner} idx={idx} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute top-1/2 start-4 md:start-8 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white hover:text-primary hover:border-white hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center italic-none"
            >
              {lang === "ar" ? (
                <FaChevronRight className="w-5 h-5" />
              ) : (
                <FaChevronLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="absolute top-1/2 end-4 md:end-8 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white hover:text-primary hover:border-white hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center italic-none"
            >
              {lang === "ar" ? (
                <FaChevronLeft className="w-5 h-5" />
              ) : (
                <FaChevronRight className="w-5 h-5" />
              )}
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 italic-none">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  selectedIndex === idx
                    ? "bg-white w-8 shadow-lg shadow-white/30"
                    : "bg-white/40 w-2 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/60 pointer-events-none italic-none" />

      {/* Centered Title & Subtitle Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center pointer-events-none italic-none">
        {title && (
          <h1 className="font-IBMPlex text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-8 font-semibold text-white drop-shadow-lg leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-base md:text-xl text-white/90 drop-shadow max-w-xl leading-snug">
            {subtitle}
          </p>
        )}
        <div
          className="w-full flex justify-center mt-6 pointer-events-auto"
          role="search"
        >
          <SearchBox
            categoriesData={categoriesData}
            subCategoriesData={subCategoriesData}
            lang={lang}
            translate={translation}
            providerId={providerId}
            userId={userId}
          />
        </div>
      </div>
    </section>
  );
}
