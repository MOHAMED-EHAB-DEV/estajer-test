"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

const CheckIcon = ({ className }) => (
  <svg className={`fill-current ${className}`} viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const PricingPlans = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.pricingPlans.${key}`);
  const free = trans("marketing.pricingPlans.starterPlan");
  const premium = trans("marketing.pricingPlans.premiumPlan");
  const enterprise = trans("marketing.pricingPlans.enterprisePlan");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    direction: lang === "ar" ? "rtl" : "ltr",
    align: "center",
    slidesToScroll: 1,
    dragFree: false,
    breakpoints: {
      "(min-width: 1024px)": {
        active: false,
      },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("init", onInit);
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    onInit();
    onSelect();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  return (
    <section
      className="py-12 md:py-24 bg-white font-sans"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-[1000px] md:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4 md:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center justify-center px-6 py-2 bg-[#FFF5EC] border border-[#FDE5D0] rounded-full mb-6 font-bold text-xs md:text-sm text-[#F97316] shadow-sm">
            {t("badge")}
          </div>
          <h2 className="text-2xl md:text-[2.25rem] font-bold text-[#111827] mb-2 md:mb-5">
            {t("title")}
          </h2>
        </div>

        {/* Embla Viewport */}
        <div
          className="overflow-hidden lg:overflow-visible w-full"
          ref={emblaRef}
        >
          {/* Pricing Grid */}
          <div className="flex lg:grid lg:grid-cols-3 gap-6 xl:gap-10 items-stretch pt-8 cursor-grab active:cursor-grabbing lg:cursor-auto lg:active:cursor-auto w-full pb-8 lg:pb-0">
            {/* Free Plan */}
            <div className="border border-gray-200 bg-white rounded-[32px] p-6 xl:p-10 flex flex-col shadow-sm hover:scale-[1.02] transition-transform duration-300 flex-[0_0_85%] sm:flex-[0_0_60%] lg:flex-none min-w-0">
              <div className="min-h-[60px] md:min-h-[100px] text-start flex flex-col items-start justify-start">
                <p className="text-[#9CA3AF] text-[12px] md:text-xs font-medium mb-3">
                  {free?.currentLabel}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-[#111827] mb-2 leading-tight">
                  {free?.name}
                </h3>
                <p className="text-[#6B7280] text-xs md:text-sm">
                  {free?.desc}
                </p>
              </div>

              <div className="h-[60px] md:h-[90px] flex flex-col items-start justify-center mb-2 md:mb-4">
                <div className="flex items-end gap-1.5 justify-start">
                  <span className="text-4xl md:text-5xl leading-[1] font-extrabold text-[#111827]">
                    {free?.price}
                  </span>
                  <div className="flex flex-col ">
                    <span className="text-[#6B7280] text-sm font-medium">
                      {free?.currency}
                    </span>
                    <span className="text-[#6B7280] text-[10px]">
                      {free?.priceSub}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[44px] md:h-[60px] mb-2 md:mb-8 w-full">
                <div className="h-full bg-[#FFF9F2] border border-[#FDE5D0] rounded-xl flex items-center justify-start px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F97316] text-xs font-bold bg-[#FFE8D6] rounded px-1.5 py-0.5">
                      %
                    </span>
                    <span className="text-[#4B5563] text-[10px] md:text-xs font-medium">
                      {free?.commissionNote}{" "}
                      <strong className="font-bold text-[#111827]">
                        {free?.commissionRate}
                      </strong>{" "}
                      {free?.commissionSuffix}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/${lang}/pricing`}
                className="w-full mb-3 md:mb-8 bg-white border border-[#E5E7EB] text-[#6B7280] font-bold py-3 md:py-4 rounded-xl transition-colors hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <span>{free?.currentBtn}</span>
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

              <div className="border-t border-gray-100 pt-4 md:pt-8 flex-grow flex flex-col">
                <p className="text-[#9CA3AF] text-xs text-start mb-4 md:mb-8 font-medium">
                  {free?.featuresLabel}
                </p>
                <ul className="space-y-3 lg:space-y-6 flex-grow">
                  {Array.isArray(free?.features) &&
                    free.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FFF5EC] text-[#F97316] flex items-center justify-center">
                          <CheckIcon className="w-3 h-3" />
                        </div>
                        <span className="text-[#4B5563] text-[11px] md:text-sm font-medium">
                          {feature}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="relative border border-[#F97316] bg-white rounded-[32px] p-6 xl:p-10 flex flex-col shadow-[0_12px_45px_-10px_rgba(249,115,22,0.18)] hover:scale-[1.02] transition-transform duration-300 flex-[0_0_85%] sm:flex-[0_0_60%] lg:flex-none min-w-0">
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-[#F97316] text-white px-6 py-1 rounded-full text-[11px] md:text-sm font-bold shadow-md">
                {premium?.badge}
              </div>

              <div className="min-h-[60px] md:min-h-[100px] text-start flex flex-col items-start justify-start">
                <p className="text-[#9CA3AF] text-[12px] md:text-xs font-medium mb-3">
                  {premium?.tierLabel}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-[#111827] mb-2 leading-tight">
                  {premium?.name}
                </h3>
                <p className="text-[#6B7280] text-xs md:text-sm pe-2">
                  {premium?.desc}
                </p>
              </div>

              <div className="h-[60px] md:h-[90px] flex flex-col items-start justify-center mb-2 md:mb-4">
                <div className="flex items-end gap-1.5 justify-start">
                  <span className="text-4xl md:text-5xl leading-[1] font-extrabold text-[#F97316]">
                    {premium?.price}
                  </span>
                  <div className="flex flex-col ">
                    <span className="text-[#6B7280] text-sm font-medium">
                      {free?.currency}
                    </span>
                    <span className="text-[#6B7280] text-[10px]">
                      {free?.priceSub}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[44px] md:h-[60px] mb-2 md:mb-8 w-full">
                <div className="h-full bg-[#FFF5EC] border border-[#FDE5D0] rounded-xl flex items-center justify-start px-4">
                  <div className="flex items-center gap-1.5 xl:gap-2">
                    <span className="text-[#F97316] text-xs font-bold bg-white rounded px-1.5 py-0.5 shadow-sm">
                      %
                    </span>
                    <span className="text-[#F97316] text-[10px] md:text-xs font-medium whitespace-nowrap">
                      {premium?.commissionNote}{" "}
                      <strong className="font-bold">
                        {premium?.commissionRate}
                      </strong>{" "}
                      {premium?.commissionSuffix}{" "}
                      <span className="line-through mx-0.5 text-orange-300">
                        {premium?.commissionOld}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/${lang}/pricing`}
                className="w-full mb-3 md:mb-8 bg-[#F97316] text-white font-bold py-3 md:py-4 rounded-xl hover:bg-[#ea580c] transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-200 text-sm"
              >
                {premium?.subscribeBtn}
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

              <div className="border-t border-gray-100 pt-4 md:pt-8 flex-grow flex flex-col">
                <p className="text-[#9CA3AF] text-[11px] text-start font-medium mb-4 md:mb-8">
                  {premium?.everythingPlus}
                </p>
                <ul className="space-y-[13px] xl:space-y-[15px] flex-grow">
                  {Array.isArray(premium?.features) &&
                    premium.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-1.5 xl:gap-2"
                      >
                        <div className="flex items-center gap-2 xl:gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FFF5EC] text-[#F97316] flex items-center justify-center">
                            <CheckIcon className="w-3 h-3" />
                          </div>
                          <span className="text-[#111827] text-[11px] md:text-sm font-bold">
                            {feature.text}
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="relative border border-gray-200 bg-white rounded-[32px] p-6 xl:p-10 flex flex-col shadow-sm hover:scale-[1.02] transition-transform duration-300 flex-[0_0_85%] sm:flex-[0_0_60%] lg:flex-none min-w-0">
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-[#111827] text-white px-5 py-1 rounded-full text-[11px] md:text-sm font-bold shadow-md">
                {enterprise?.badge}
              </div>

              <div className="min-h-[40px] md:min-h-[100px] text-start flex flex-col items-start justify-start">
                <p className="text-[#9CA3AF] text-[12px] md:text-xs font-medium mb-3">
                  {enterprise?.tierLabel}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-[#111827] mb-2 leading-tight">
                  {enterprise?.name}
                </h3>
                <p className="text-[#6B7280] text-xs md:text-sm pe-2">
                  {enterprise?.desc}
                </p>
              </div>

              <div className="h-[60px] md:h-[90px] flex flex-col items-start justify-center mb-2 md:mb-4">
                <span className="text-xl md:text-2xl leading-tight font-extrabold text-[#111827] mb-1">
                  {enterprise?.pricingLabel}
                </span>
                <span className="text-[#6B7280] text-[11px]">
                  {enterprise?.pricingSub}
                </span>
              </div>

              <div className="h-[2px] md:h-[60px] mb-2 md:mb-8 w-full"></div>

              <Link
                href={`/${lang}/pricing`}
                className="w-full mb-3 md:mb-8 bg-[#0F172A] text-white font-bold py-3 md:py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                {enterprise?.contactBtn}
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

              <div className="border-t border-gray-100 pt-4 md:pt-8 flex-grow flex flex-col">
                <p className="text-[#9CA3AF] text-xs text-start font-medium mb-4 md:mb-8">
                  {enterprise?.everythingPlus}
                </p>

                <ul className="space-y-3 lg:space-y-6 flex-grow">
                  {Array.isArray(enterprise?.features) &&
                    enterprise.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
                          <CheckIcon className="w-3 h-3" />
                        </div>
                        <span className="text-[#374151] text-[11px] md:text-sm font-medium">
                          {feature}
                        </span>
                      </li>
                    ))}
                </ul>

                <div className="mt-auto pt-4 md:pt-8">
                  <div className="border-t border-gray-100 pt-2 md:pt-6 text-center">
                    <p className="text-[#9CA3AF] text-[9px] md:text-[11px] leading-relaxed max-w-[90%] mx-auto">
                      {enterprise?.footerNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex lg:hidden justify-center items-center gap-2 mt-2 h-3">
          {scrollSnaps.length > 1 ? (
            scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "bg-[#F97316] w-6" : "bg-[#FDE5D0]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))
          ) : (
            <>
              <div className="w-6 h-2.5 rounded-full bg-[#F97316]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FDE5D0]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FDE5D0]" />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
