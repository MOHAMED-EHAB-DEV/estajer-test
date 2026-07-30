"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { getUrlName } from "@/lib/sitemap";

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "#D1D5DB"}
    strokeWidth="1"
    className="w-3.5 h-3.5 text-primary"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function ReviewsSection({
  data,
  reviews: propReviews,
  lang,
  translate,
  shop,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`shopReviews.${key}`);
  const langPrefix = lang === "ar" ? "" : "en/";
  const shopSlug = shop?.slug;
  const reviews = propReviews || shop?.reviews || [];
  const brandColor = shop?.brandColor || "#111111";
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (e) => {
        const entry = e[0];
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
      },
      { rootMargin: "0px" },
    );
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    shouldLoad
      ? {
          loop: reviews.length > 3,
          align: "start",
          direction: lang === "ar" ? "rtl" : "ltr",
          dragFree: true,
          containScroll: "trimSnaps",
        }
      : undefined,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollTo = useCallback(
    (i) => {
      if (emblaApi) emblaApi.scrollTo(i);
    },
    [emblaApi],
  );
  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Autoplay when in viewport
  useEffect(() => {
    if (!emblaApi || !isIntersecting) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [emblaApi, isIntersecting]);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      className="bg-white py-16 md:py-24 border-t border-neutral-100/60"
      ref={containerRef}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Reviews
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t("titlePart1")}
              <span style={{ color: brandColor }}>{t("titleHighlight")}</span>
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-semibold bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200/50">
            {reviews.length} {lang === "ar" ? "تقييم" : "reviews"}
          </p>
        </div>

        {/* Cards */}
        <div className="overflow-hidden" ref={shouldLoad ? emblaRef : null}>
          <div className="flex -mx-3">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="flex-[0_0_88%] sm:flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-3"
              >
                <div className="flex flex-col gap-5 p-6 md:p-8 bg-[#F9FAFB] rounded-[2rem] border border-neutral-200/55 h-full hover:bg-white hover:shadow-md transition-all duration-300 group relative">
                  {/* Decorative quote icon */}
                  <span className="absolute top-4 end-6 text-5xl text-neutral-200 select-none pointer-events-none opacity-40">
                    ”
                  </span>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        filled={i < (review.rating?.overall || 5)}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs md:text-sm text-neutral-500 leading-relaxed flex-1 line-clamp-4 italic">
                    &ldquo;{review.comment || t("noComment")}&rdquo;
                  </p>

                  {/* User */}
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/60">
                    <div
                      className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0 border border-neutral-100 shadow-sm"
                      style={{ backgroundColor: brandColor }}
                    >
                      {review.userImage || review.user?.avatar ? (
                        <img
                          src={review.userImage || review.user.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (review.userName ||
                          review.user?.fullName)?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-neutral-800 truncate">
                        {review.userName || review.user?.fullName}
                      </p>
                    </div>
                  </div>

                  {review.product && (
                    <Link
                      href={review.product ? `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}products/${getUrlName(review.product.name)}_ref_${review.product._id}` : "#"}
                      className="text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors truncate"
                    >
                      ↳ {review.product.name}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === selectedIndex ? "24px" : "6px",
                backgroundColor: i === selectedIndex ? brandColor : "#d4d4d4",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
