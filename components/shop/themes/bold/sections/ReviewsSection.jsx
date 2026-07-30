"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { getUrlName } from "@/lib/sitemap";

const StarIcon = ({ fill }) => (
  <svg className="w-4 h-4 text-primary" viewBox="0 0 22 22" fill={fill}>
    <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
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
  const brandColor = shop?.brandColor || "#F48A42";
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
    <section className="bg-white py-12 md:py-20" ref={containerRef}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: brandColor }}
          >
            <StarIcon fill="#fff" />
            {t("badge")}
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-darkNavy">
            {t("titlePart1")}
            <span style={{ color: brandColor }}>{t("titleHighlight")}</span>
          </h2>
          <p className="text-neutral-400 text-sm font-medium">
            {t("fromReviews").replace("{count}", reviews.length)}
          </p>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={shouldLoad ? emblaRef : null}>
          <div className="flex -mx-2 md:-mx-3">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="flex-[0_0_88%] sm:flex-[0_0_75%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-2 md:px-3"
              >
                <div className="group relative h-full flex flex-col gap-4 p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 border-neutral-100 bg-white hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Top accent */}
                  <div
                    className="absolute top-0 start-0 end-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: brandColor }}
                  />

                  {/* User + stars */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base overflow-hidden shrink-0"
                      style={{ backgroundColor: brandColor }}
                    >
                      {review.userImage || review.user?.avatar ? (
                        <img
                          src={review.userImage || review.user.avatar}
                          alt={review.userName || review.user?.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (review.userName ||
                          review.user?.fullName)?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-sm text-darkNavy truncate">
                        {review.userName || review.user?.fullName}
                      </h4>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            fill={
                              i < (review.rating?.overall || 5)
                                ? "currentColor"
                                : "#E5E7EB"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1 line-clamp-4">
                    &ldquo;{review.comment || t("noComment")}&rdquo;
                  </p>

                  {/* Product */}
                  {review.product && (
                    <Link
                      href={review.product ? `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}products/${getUrlName(review.product.name)}_ref_${review.product._id}` : "#"}
                      className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 bg-neutral-50 transition-all group/product"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={
                            review.product.image || "/placeholder-product.png"
                          }
                          alt={review.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-darkNavy truncate group-hover/product:text-primary transition-colors">
                        {review.product.name}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
