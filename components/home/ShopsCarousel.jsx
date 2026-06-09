"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";

// ── Verified badge ─────────────────────────────────────────────────────────
const VerifiedBadge = ({ label }) => (
  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-2.5 h-2.5 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
    {label}
  </span>
);

// ── Single shop card ───────────────────────────────────────────────────────
function ShopSlide({ shop, lang }) {
  const isRtl = lang === "ar";
  const href = `/${lang === "ar" ? "" : "en/"}shops/${shop.slug}`;
  const bannerSrc = isRtl
    ? shop.heroBanners?.[0]?.imageAr
    : shop.heroBanners?.[0]?.imageEn;

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white md:rounded-3xl rounded-xl overflow-hidden border border-neutral-100/80 md:shadow-md shadow hover:shadow-2xl hover:shadow-orange-500/15 md:hover:-translate-y-2 transition-all duration-500 h-full"
    >
      {/* Banner */}
      <div className="relative h-32 md:h-40 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden shrink-0">
        {bannerSrc ? (
          <Image
            unoptimized
            src={anyImgUrl({ src: bannerSrc, size: 500, quality: 80 })}
            alt={shop.name || ""}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 md:bg-gradient-to-br from-orange-100/70 via-amber-100/50 to-orange-200/30" />
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Logo overlapping */}
      <div className="relative px-4 md:px-5">
        <div className="absolute -top-6 md:-top-7 start-4 md:start-5 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center">
          {shop.logo ? (
            <Image
              unoptimized
              src={anyImgUrl({ src: shop.logo, size: 60 })}
              alt={shop.name || ""}
              width={56}
              height={56}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
              <span className="text-orange-500 font-black text-lg">
                {(shop.name || "?")[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 md:pt-10 pb-4 md:pb-5 px-4 md:px-5 flex flex-col gap-1.5 md:gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-black text-neutral-900 line-clamp-1 leading-tight flex-1">
            {shop.name}
          </h3>
          <VerifiedBadge label={isRtl ? "موثق" : "Verified"} />
        </div>

        {shop.description && (
          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed flex-1">
            {shop.description}
          </p>
        )}

        {/* Stats */}
        {(shop.sliders?.length > 0 || shop.categories?.length > 0) && (
          <div className="flex items-center gap-3 mt-1">
            {shop.sliders?.length > 0 && (
              <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 text-orange-400"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                {shop.sliders.reduce(
                  (a, s) => a + (s.products?.length || 0),
                  0,
                )}{" "}
                {isRtl ? "منتج" : "products"}
              </span>
            )}
            {shop.categories?.length > 0 && (
              <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 text-orange-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {shop.categories.length} {isRtl ? "تصنيف" : "categories"}
              </span>
            )}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs font-bold text-orange-500 group-hover:underline underline-offset-2">
            {isRtl ? "تصفح المتجر" : "Browse shop"}
          </span>
          <span className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ShopsCarousel({ shops, lang }) {
  const isRtl = lang === "ar";
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    direction: isRtl ? "rtl" : "ltr",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      {/* Embla viewport */}
      <div className="absolute z-10 bottom-0 right-0 w-6 md:w-10 h-full bg-gradient-to-r from-transparent via-white/40 to-white flex items-end pb-24"></div>
      <div className="absolute z-10 bottom-0 left-0 w-6 md:w-10 h-full bg-gradient-to-l from-transparent via-white/40 to-white flex items-end pb-24"></div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex py-5">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="flex-[0_0_220px] md:flex-[0_0_280px] lg:flex-[0_0_300px] xl:flex-[0_0_280px] min-w-0 px-2 py-2"
            >
              <ShopSlide shop={shop} lang={lang} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="md:hidden flex justify-center gap-1.5 mb-4">
        {shops.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? "bg-orange-500 w-6"
                : "bg-neutral-200 hover:bg-neutral-300 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
