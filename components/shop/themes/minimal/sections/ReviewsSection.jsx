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
          loop: true,
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
    <section className="bg-neutral-50 py-16 md:py-24" ref={containerRef}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-8 md:gap-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Reviews
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              {t("titlePart1")}
              <span style={{ color: brandColor }}>{t("titleHighlight")}</span>
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-medium hidden md:block">
            {reviews.length} {lang === "ar" ? "تقييم" : "reviews"}
          </p>
        </div>

        {/* Cards */}
        <div className="overflow-hidden" ref={shouldLoad ? emblaRef : null}>
          <div className="flex -mx-2 md:-mx-3">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="flex-[0_0_88%] sm:flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-2 md:px-3"
              >
                <div className="flex flex-col gap-4 p-5 md:p-6 bg-white rounded-xl border border-neutral-100 h-full">
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
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1 line-clamp-4">
                    &ldquo;{review.comment || t("noComment")}&rdquo;
                  </p>

                  {/* User */}
                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                    <div
                      className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold shrink-0"
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
                      <p className="text-xs font-semibold text-neutral-700 truncate">
                        {review.userName || review.user?.fullName}
                      </p>
                    </div>
                  </div>

                  {review.product && (
                    <Link
                      href={review.product ? `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}products/${getUrlName(review.product.name)}_ref_${review.product._id}` : "#"}
                      className="text-[11px] text-neutral-300 hover:text-neutral-600 transition-colors truncate"
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
        <div className="flex gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="h-px rounded-full transition-all duration-300"
              style={{
                width: i === selectedIndex ? "32px" : "16px",
                backgroundColor: i === selectedIndex ? brandColor : "#d4d4d4",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
