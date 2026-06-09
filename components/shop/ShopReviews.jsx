"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { getUrlName } from "@/lib/sitemap";

const Star = ({ fill }) => (
  <svg
    className="w-[16px] h-[16px] drop-shadow-sm"
    viewBox="0 0 22 22"
    fill={fill}
  >
    <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
  </svg>
);

const QuoteIcon = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 512 512"
    className="opacity-[0.1] scale-x-[-1]"
  >
    <g fill="#F48A42">
      <path d="M119.472,66.59C53.489,66.59,0,120.094,0,186.1c0,65.983,53.489,119.487,119.472,119.487   c0,0-0.578,44.392-36.642,108.284c-4.006,12.802,3.135,26.435,15.945,30.418c9.089,2.859,18.653,0.08,24.829-6.389   c82.925-90.7,115.385-197.448,115.385-251.8C238.989,120.094,185.501,66.59,119.472,66.59z" />
      <path d="M392.482,66.59c-65.983,0-119.472,53.505-119.472,119.51c0,65.983,53.489,119.487,119.472,119.487   c0,0-0.578,44.392-36.642,108.284c-4.006,12.802,3.136,26.435,15.945,30.418c9.089,2.859,18.653,0.08,24.828-6.389   C479.539,347.2,512,240.452,512,186.1C512,120.094,458.511,66.59,392.482,66.59z" />
    </g>
  </svg>
);

export default function ShopReviews({
  reviews,
  lang,
  reviewsOrder,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`shopReviews.${key}`);
  const containerRef = useRef(null);
  const [shouldLoadCarousel, setShouldLoadCarousel] = useState(false);

  // Intersection Observer to lazy load carousel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadCarousel(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    shouldLoadCarousel
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
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", (emblaApi) => {
      onSelect(emblaApi);
    });
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{ order: reviewsOrder || 5 }}
      ref={containerRef}
    >
      <div className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-3 md:mb-10">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary/10 to-amber-100/80 text-primary text-sm font-bold rounded-full mb-5 shadow-sm border border-primary/10">
            <svg
              width="16"
              height="16"
              viewBox="0 0 22 22"
              fill="#F48A42"
              className="flex-shrink-0"
            >
              <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
            </svg>
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-darkNavy mb-4">
            {t("titlePart1")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              {t("titleHighlight")}
            </span>
          </h2>
          <div className="mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-primary to-amber-400 mb-2 md:mb-4" />
          <p className="text-neutral-400 font-medium text-base">
            {t("fromReviews").replace("{count}", reviews.length)}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          <div
            className="overflow-hidden py-6 md:py-8"
            ref={shouldLoadCarousel ? emblaRef : null}
          >
            <div className="flex -mx-2 md:-mx-3">
              {reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_88%] sm:flex-[0_0_75%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-2 md:px-3"
                >
                  <div className="relative h-full group">
                    {/* Gradient border effect */}
                    <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-primary/20 via-transparent to-amber-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative bg-white/80 backdrop-blur-sm rounded-[28px] p-6 md:p-8 h-full shadow-[0_4px_32px_rgba(0,0,0,0.04)] border border-neutral-100/80 flex flex-col group-hover:shadow-[0_8px_40px_rgba(244,138,66,0.08)] group-hover:border-primary/10 transition-all duration-500 group-hover:-translate-y-1">
                      {/* Quote icon as background decorative element */}
                      <div className="absolute top-7 end-7 pointer-events-none">
                        <QuoteIcon />
                      </div>

                      {/* Top Section: User Info and Stars */}
                      <div className="flex items-center justify-between gap-2 mb-3 md:mb-5 relative z-10">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/40 to-amber-400/40 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/15 to-amber-100 flex items-center justify-center text-primary font-bold text-base overflow-hidden ring-2 ring-white shadow-sm">
                              {review.userImage || review.user?.avatar ? (
                                <img
                                  src={review.userImage || review.user.avatar}
                                  alt={review.userName || review.user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="bg-gradient-to-br from-primary to-amber-500 text-transparent bg-clip-text font-black">
                                  {(review.userName ||
                                    review.user
                                      ?.fullName)?.[0]?.toUpperCase() || "U"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="font-bold text-darkNavy text-sm truncate">
                              {review.userName || review.user?.fullName}
                            </h4>
                            <div className="flex items-center gap-2 bg-neutral-50/80 rounded-full">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    fill={
                                      i < (review.rating?.overall || 5)
                                        ? "#F48A42"
                                        : "#E5E7EB"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-darkNavy/60 font-bold text-xs translate-y-px">
                                {(review.rating?.overall || 5).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="flex-1 relative mb-6">
                        <p className="text-darkNavy/75 font-medium leading-[1.85] text-[15px] line-clamp-4">
                          &rdquo;
                          {review.comment || t("noComment")}
                          &ldquo;
                        </p>
                      </div>

                      {/* Bottom Section: Product Info (Link) */}
                      {review.product && (
                        <Link
                          href={`/products/${getUrlName(review.product.name)}_ref_${review.product._id}`}
                          className="flex items-center gap-3 p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100/50 hover:bg-neutral-100/80 transition-all duration-300 group/product mt-auto"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200/50">
                            <img
                              src={
                                review.product.image ||
                                "/placeholder-product.png"
                              }
                              alt={review.product.name}
                              className="w-full h-full object-cover group-hover/product:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h5 className="font-bold text-darkNavy text-xs truncate group-hover/product:text-primary transition-colors">
                              {review.product.name}
                            </h5>
                            {review.product.address && (
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-neutral-400">
                                <svg
                                  className="w-3 h-3 text-primary/60"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="truncate">
                                  {typeof review.product.address === "object"
                                    ? `${review.product.address.city || ""}, ${review.product.address.governorate || ""}`.replace(
                                        /^, |, $/g,
                                        "",
                                      )
                                    : review.product.address}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ms-auto">
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover/product:bg-primary group-hover/product:text-white transition-all">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                {lang === "ar" ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                )}
                              </svg>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-1.5 mt-6 md:mt-8">
          {reviews?.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`rounded-full transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                index === selectedIndex
                  ? "bg-gradient-to-r from-primary to-amber-500 w-8 h-2.5 shadow-sm shadow-primary/30"
                  : "bg-neutral-200/80 w-2.5 h-2.5 hover:bg-neutral-300 hover:scale-125"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
