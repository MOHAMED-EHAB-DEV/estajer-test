"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function ReviewsSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.reviews.${key}`);
  const isAr = lang === "ar";
  const reviews = shop?.reviews || [];
  const brandColor = shop?.brandColor || "#8B5E3C";

  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
      },
      { rootMargin: "0px" },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    shouldLoad
      ? {
          loop: true,
          align: "center",
          direction: isAr ? "rtl" : "ltr",
        }
      : undefined,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
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

  if (!reviews || reviews.length === 0) {
    return (
      <section
        className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
        
      >
        <div className="h-44 bg-[#FCFAF7] border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">⭐</span>
          <p className="text-xs tracking-widest uppercase">
            {t("noReviews") || "Testimonials Directory"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-[#FCFAF7] border-t border-b border-neutral-200/40 py-20 md:py-28 relative overflow-hidden"
      id="reviews"
      
      ref={containerRef}
    >
      <div className="max-w-screen-xl w-full mx-auto px-6 md:px-10 flex flex-col items-center">
        {/* Carousel Viewport */}
        <div
          className="overflow-hidden w-full max-w-3xl"
          ref={shouldLoad ? emblaRef : null}
        >
          <div className="flex">
            {reviews.map((review, idx) => {
              const reviewerName =
                review.name ||
                review.userName ||
                (lang === "ar" ? "عميل راقٍ" : "Vogue Client");
              const reviewComment = review.comment || review.content || "";
              const rating = review.rating?.overall || review.rating || 5;

              return (
                <div
                  key={idx}
                  className="flex-[0_0_100%] min-w-0 px-6 text-center flex flex-col items-center"
                >
                  {/* Luxury Quote Icon */}
                  <span
                    className="text-4xl md:text-5xl italic opacity-35 leading-none select-none mb-6"
                    style={{ color: brandColor }}
                  >
                    “
                  </span>

                  {/* Minimal Stars */}
                  <div className="flex items-center gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5"
                        viewBox="0 0 20 20"
                        fill={i < rating ? brandColor : "#E5E7EB"}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* The Quote comment */}
                  {reviewComment && (
                    <blockquote className="text-lg md:text-2xl italic text-neutral-800 leading-relaxed max-w-3xl mb-8">
                      {reviewComment}
                    </blockquote>
                  )}

                  {/* Signature Line */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-px bg-neutral-300 mb-3" />
                    <cite className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-800 not-italic">
                      {reviewerName}
                    </cite>
                    <span className="text-[10px] text-neutral-400 tracking-wider uppercase italic">
                      {lang === "ar" ? "عميل معتمد" : "Verified Client"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: index === selectedIndex ? "24px" : "6px",
                backgroundColor:
                  index === selectedIndex ? brandColor : "#e5e7eb",
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
