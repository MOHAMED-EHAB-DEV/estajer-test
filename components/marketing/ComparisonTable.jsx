"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

const CrownIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </svg>
);

const CheckIcon = ({ color = "#10B981" }) => (
  <svg
    className="mx-auto"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#EF4444"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Indices matching rows where regular=null (X) or premium=null (check)
const ICON_ROW_INDICES = {
  regularX: [4, 8, 9, 12, 13, 14, 15, 16],
  regularGrayCheck: [10, 11, 17],
  premiumCheck: [4, 8, 10, 11, 12, 13, 14, 15, 16, 17],
};

const ComparisonTable = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.comparisonTable.${key}`);
  const rows = trans("marketing.comparisonTable.rows") || [];

  //make embla carousel auto play and infinite
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: lang === "ar" ? "rtl" : "ltr",
    align: "start",
    loop: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const sectionRef = useRef(null);
  const timersRef = useRef([]);

  // Visibility-triggered Peek Animation
  useEffect(() => {
    if (!emblaApi) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Clear any active animations when visibility changes
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        if (entry.isIntersecting) {
          // Step 1: Wait 2s then scroll to Premium (index 1)
          const t1 = setTimeout(() => {
            emblaApi.scrollTo(1);

            // Step 2: After 5s more, scroll back to Regular (index 0)
            const t2 = setTimeout(() => {
              emblaApi.scrollTo(0);
            }, 3500);

            timersRef.current.push(t2);
          }, 1000);

          timersRef.current.push(t1);
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onInit = () => setScrollSnaps(emblaApi.scrollSnapList());

    emblaApi.on("select", onSelect);
    emblaApi.on("init", onInit);
    emblaApi.on("reInit", onInit);

    onInit();
    onSelect();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (idx) => emblaApi && emblaApi.scrollTo(idx),
    [emblaApi],
  );

  const renderRegular = (row, idx) => {
    if (ICON_ROW_INDICES.regularGrayCheck.includes(idx)) {
      return <CheckIcon color="#94A3B8" />;
    }
    if (ICON_ROW_INDICES.regularX.includes(idx)) {
      return (
        <span className="flex items-center justify-center gap-1.5 text-[#6B7280]">
          <XIcon /> {row.regular}
        </span>
      );
    }
    return row.regular;
  };

  const renderPremium = (row, idx) => {
    if (ICON_ROW_INDICES.premiumCheck.includes(idx)) {
      return <CheckIcon color="#10B981" />;
    }
    return row.premium;
  };

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-24 bg-[#FAFAFA] font-sans"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center px-6 py-2 bg-[#FFF5EC] border border-[#FDE5D0] rounded-full mb-6 font-bold text-xs md:text-sm text-[#F97316] shadow-sm">
            {t("badge")}
          </div>
          <h2 className="text-2xl md:text-[2.25rem] font-bold text-[#111827] mb-3">
            {t("title")}
          </h2>
          {t("subtitle") && (
            <p className="text-[#6B7280] text-xs md:text-base">
              {t("subtitle")}
            </p>
          )}
        </div>

        {/* Comparison Table Viewport */}
        <div className="relative max-w-4xl mx-auto">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-center border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#FAF9F8]">
                  <th className="py-6 px-6 text-[#111827] font-bold text-[15px] border-b border-gray-200 w-[40%]">
                    {t("colFeature")}
                  </th>
                  <th className="py-6 px-4 text-[#111827] font-bold text-[15px] border-b border-gray-200 w-[30%]">
                    {t("colRegular")}
                  </th>
                  <th className="relative py-6 px-4 text-[#F97316] font-bold text-[15px] border-2 border-orange-400 w-[30%] bg-[#FFF9F3] rounded-t-xl">
                    <div className="flex items-center justify-center gap-2">
                      <CrownIcon /> {t("colPremium")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-4 px-6 text-[#4B5563] text-sm font-semibold border-b border-gray-100 text-start">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-[#6B7280] text-sm border-b border-gray-100">
                      {renderRegular(row, idx)}
                    </td>
                    <td
                      className={`relative py-4 px-4 text-[#F97316] text-sm font-bold border-x-2 border-orange-400 bg-[#FFF9F3] ${idx === rows.length - 1 ? "rounded-b-xl border-b-2 border-b-orange-400" : "border-b border-b-orange-200"}`}
                    >
                      {renderPremium(row, idx)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Embla View (Column as Slides) */}
          <div className="md:hidden flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Sticky Feature Column */}
            <div className="w-1/2 flex-none border-e border-gray-100 bg-[#FAF9F8] z-10">
              <div className="py-4 px-3 text-[#111827] font-bold text-[11px] border-b border-gray-200 h-14 flex items-center">
                {t("colFeature")}
              </div>
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="py-3 px-3 text-[#4B5563] text-[11px] font-semibold border-b border-gray-100 h-14 flex items-center leading-tight"
                >
                  {row.feature}
                </div>
              ))}
            </div>

            {/* Scrollable Plans */}
            <div className="w-1/2 overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {/* Regular Plan Slide */}
                <div className="flex-[0_0_100%] min-w-0">
                  <div className="py-4 px-2 text-[#111827] font-bold text-[11px] border-b border-gray-200 h-14 flex items-center justify-center bg-[#FAF9F8]">
                    {t("colRegular")}
                  </div>
                  {rows.map((row, idx) => (
                    <div
                      key={idx}
                      className="py-3 px-2 text-[#6B7280] text-[11px] border-b border-gray-100 h-14 flex items-center justify-center text-center"
                    >
                      {renderRegular(row, idx)}
                    </div>
                  ))}
                </div>

                {/* Premium Plan Slide */}
                <div className="flex-[0_0_100%] min-w-0 bg-[#FFF9F3] ">
                  <div className="py-4 px-2 text-[#F97316] font-bold text-[11px] border-y rounded-tl-xl border-x-2 border-orange-400 h-14 flex items-center justify-center gap-1">
                    <CrownIcon /> {t("colPremium")}
                  </div>
                  {rows.map((row, idx) => (
                    <div
                      key={idx}
                      className={`py-3 px-2 text-[#F97316] text-[11px] font-bold border-x-2 border-orange-400 h-14 flex items-center justify-center text-center ${idx === rows.length - 1 ? "border-b-2 border-orange-400" : "border-b border-orange-200"}`}
                    >
                      {renderPremium(row, idx)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex md:hidden justify-center items-center gap-2 mt-6">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "bg-[#F97316] w-5" : "bg-[#E5E7EB]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12 md:mt-16">
          <Link
            href={`/${lang}/pricing`}
            className="bg-[#F97316] text-white font-bold py-3 px-8 md:py-4 md:px-10 rounded-full hover:bg-[#ea580c] active:scale-95 transition-all inline-flex items-center gap-3 text-[0.9rem] md:text-base shadow-lg shadow-orange-200/60"
          >
            {t("ctaBtn")}
            <svg
              className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
export default ComparisonTable;
