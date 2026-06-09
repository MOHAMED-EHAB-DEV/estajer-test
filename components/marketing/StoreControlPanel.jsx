"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";

const CustomCloudBg = () => (
  <svg
    width="100%"
    height="100%"
    fill="none"
    viewBox="0 0 531 176"
    className="w-full h-full object-contain"
  >
    <path
      fill="#FDE2CC"
      d="M17.434 142.576c23.042-12.956 33.51-2.17 41.935-12.956 8.362-10.787-23.042-38.87 39.83-66.953 0 0 4.212-60.442 90.126-62.612 85.913-2.17 62.871 60.442 85.913 75.568 23.042 15.127 29.361-8.615 52.404 6.511 23.042 15.127 12.574 45.381 31.467 49.656 18.893 4.341 44.042-19.468 67.084-4.341s23.042 28.083 33.51 28.083 31.468-8.615 44.042 0S531 175 531 175H.775s-6.256-19.468 16.787-32.424z"
    ></path>
  </svg>
);

// Icons
const ChartUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 21H3V3M21 9L15 15L11 11L3 18"
      stroke="#F97316"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserAvatarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
      fill="#64748B"
    />
    <path
      d="M12.0002 14.5C6.99023 14.5 2.91023 17.86 2.91023 22C2.91023 22.28 3.13023 22.5 3.41023 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z"
      fill="#64748B"
    />
  </svg>
);

const EyeRefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 5C5 5 1 12 1 12C1 12 5 19 12 19C19 19 23 12 23 12C23 12 19 5 12 5Z"
      stroke="#F97316"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="#F97316"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17L4 12"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Reusable Mockup Component
const BrowserMockup = ({ className, children, floatingElement }) => (
  <div className={`absolute ${className}`}>
    <div className="w-full h-full bg-white rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#FCFCFC] py-2 px-4 flex items-center justify-between border-b border-gray-100 flex-row-reverse">
        {/* Address Bar */}
        <div className="bg-white rounded-md px-3 py-1 flex items-center gap-1 border border-gray-100 w-full max-w-[120px] md:max-w-[160px]">
          <span className="text-[8px] text-gray-300 font-sans">
            estajer.com/
          </span>
          <span className="text-[7px] text-gray-200">store-design</span>
          {/* Mockup dots inside address bar */}
          <div className="flex gap-0.5 mr-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
          </div>
        </div>
        {/* Mac OS Window Buttons */}
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></span>
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-1 w-full bg-[#FAFAFA] flex items-center justify-center relative overflow-hidden">
        <div className="w-full h-full">{children}</div>
      </div>
    </div>

    {/* Any floating labels attached to this mockup */}
    {floatingElement}
  </div>
);

const StoreControlPanel = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.storeControlPanel.${key}`);
  const features = trans("marketing.storeControlPanel.features");

  return (
    <section
      className="bg-[#FEF6EE] py-24 pb-0 relative overflow-hidden font-IBMPlex"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Background Graphic Decoration */}
      <div className="absolute -top-14 md:top-0 left-0 w-full h-[500px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-16 md:top-24 -left-6 md:-left-4 w-[250px] md:w-[380px] opacity-100 mix-blend-multiply">
          <CustomCloudBg />
        </div>
        {/* Scattered Soft Circles */}
        <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] bg-[#FFF0E0] rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-12 relative z-10">
        {/* ─── Header Section ─── */}
        <div className="text-center mb-20 relative max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-[2.25rem] font-bold text-[#1F2937] mb-2 md:mb-6 leading-[1.2]">
            {t("title")} <br />
            <span className="text-[#F97316]">{t("titleHighlight")}</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* ─── Layout: Mockups + List ─── */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-20 mb-12 md:mb-32">
          {/* Features List */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center px-2 md:px-0">
            <h3 className="text-xl md:text-4xl font-bold text-[#1F2937] mb-2 md:mb-4">
              {t("ctaTitle")}
            </h3>
            <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-8">
              {t("ctaSubtitle")}
            </p>
            <div className="space-y-3 md:space-y-5">
              {Array.isArray(features) &&
                features.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 justify-start group"
                  >
                    <span className="flex-shrink-0 w-2 h-2 md:w-3.5 md:h-3.5 rounded-full bg-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.4)] group-hover:scale-125 transition-all duration-300"></span>
                    <span className="text-[14px] md:text-xl font-semibold text-gray-800 transition-colors duration-300">
                      {item}
                    </span>
                  </div>
                ))}
            </div>

            {/* ─── Bottom CTA ─── */}
            <div className={`mt-6 md:mt-10`}>
              <Link
                href={`/${lang}/pricing`}
                className="bg-[#F97316] text-white font-bold text-[0.9rem] md:text-xl py-3 px-8 md:py-4 md:px-10 inline-flex items-center justify-center gap-3 rounded-full hover:bg-orange-600 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all w-full sm:w-auto"
              >
                <span>{t("ctaBtn")}</span>
                <svg
                  className={`w-4 h-4 md:w-5 md:h-5 ${lang === "ar" ? "rotate-180" : ""}`}
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

          {/* Left Side: Mockups Collage */}
          <div className="w-full lg:w-3/5 relative aspect-[1.6/1] md:aspect-[1.8/1] mx-auto mt-2 md:mt-20 lg:mt-0 lg:right-10 overflow-visible perspective-[2000px]">
            <div className="absolute w-full max-w-[700px] h-full top-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 transform scale-[0.88] sm:scale-95 lg:scale-100 origin-top flex items-center justify-center">
              {/* 1. Top Left Mockup */}
              <BrowserMockup
                className="top-[0%] left-[0%] w-[62%] md:w-[55%] aspect-[1.6/1] md:aspect-[1.7/1] z-10 animate-fade-in-up duration-700 hover:z-50 transform hover:scale-110 !rotate-y-[8deg] -rotate-x-[5deg] -rotate-z-[2deg] transition-all"
                floatingElement={
                  <div className="absolute -top-10 left-2 z-50 animate-bounce-slow">
                    <div className="bg-[#F97316] text-white rounded-full py-2 px-4 shadow-[0_10px_20px_rgba(249,115,22,0.3)] flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckIcon />
                      </span>
                      <span className="text-[9px] md:text-[11px] font-bold">
                        {t("floatingIdentity")}
                      </span>
                    </div>
                  </div>
                }
              >
                <Image
                  unoptimized
                  fill
                  src={anyImgUrl({ src: "div.flex-1_tlw9hk", size: 800 })}
                  alt="Store Identity"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </BrowserMockup>

              {/* 2. Top Right Mockup */}
              <BrowserMockup
                className="top-[10%] left-[38%] md:left-[45%] w-[62%] md:w-[55%] aspect-[1.6/1] md:aspect-[1.7/1] z-20 animate-fade-in-up [animation-delay:150ms] hover:z-50 transform hover:scale-110 -rotate-y-[12deg] rotate-x-[3deg] rotate-z-[3deg] transition-all"
                floatingElement={
                  <div className="absolute top-[30%] -left-6 z-50 animate-float">
                    <div className="bg-white rounded-[14px] p-2 pr-3 pl-4 shadow-[0_15px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 border border-orange-50/60">
                      <div className="w-9 h-9 rounded-[10px] bg-[#FFF5EC] flex items-center justify-center hover:scale-110 transition-transform">
                        <ChartUpIcon />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs font-black text-gray-900 mb-0.5">
                          {t("floatingVisits")}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-[#F97316] font-bold">
                          {t("floatingVisitsSub")}
                        </p>
                      </div>
                    </div>
                  </div>
                }
              >
                <Image
                  unoptimized
                  fill
                  src={anyImgUrl({ src: "div.absolute_jp6rt5", size: 800 })}
                  alt="Store Stats"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </BrowserMockup>

              {/* 3. Bottom Left Mockup */}
              <BrowserMockup
                className="top-[38%] sm:top-[45%] left-[2%] md:left-[5%] w-[62%] md:w-[55%] aspect-[1.6/1] md:aspect-[1.7/1] z-30 shadow-2xl animate-fade-in-up [animation-delay:300ms] hover:z-50 transform hover:scale-110 rotate-y-[15deg] rotate-x-[-2deg] transition-all"
                floatingElement={
                  <div className="absolute top-[20%] -left-12 object-contain z-50 animate-float-delayed">
                    <div className="bg-white rounded-[14px] p-2 pr-3 pl-4 shadow-[0_15px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 border border-orange-50/60">
                      <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center overflow-hidden border border-gray-200">
                        <UserAvatarIcon />
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[11px] font-black text-gray-900 mb-0.5">
                          {t("floatingManager")}
                        </p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                          <p className="text-[8px] md:text-[9px] text-[#10B981] font-bold">
                            {t("floatingManagerStatus")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <Image
                  unoptimized
                  fill
                  src={anyImgUrl({ src: "Sidebar_Content_znnf6a", size: 800 })}
                  alt="Control Panel Sidebar"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </BrowserMockup>

              {/* 4. Bottom Right Mockup */}
              <BrowserMockup
                className="top-[48%] sm:top-[55%] left-[38%] md:left-[50%] w-[62%] md:w-[55%] aspect-[1.6/1] md:aspect-[1.7/1] z-40 shadow-2xl animate-fade-in-up [animation-delay:450ms] hover:z-50 transform hover:scale-110 -rotate-y-[10deg] rotate-x-[8deg] rotate-z-[2deg] transition-all"
                floatingElement={
                  <div className="absolute -bottom-4 right-[20%] z-50 animate-bounce-slow-delayed">
                    <div className="bg-white rounded-[14px] p-2 pr-3 pl-4 shadow-[0_15px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 border border-orange-50/60">
                      <div className="w-9 h-9 rounded-[10px] bg-[#FFF5EC] flex items-center justify-center hover:scale-110 transition-transform">
                        <EyeRefreshIcon />
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[11px] font-black text-gray-900 mb-0.5">
                          {t("floatingPriority")}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-gray-500 font-bold">
                          {t("floatingPrioritySub")}
                        </p>
                      </div>
                    </div>
                  </div>
                }
              >
                <Image
                  unoptimized
                  fill
                  src={anyImgUrl({
                    src: "Screenshot_2026-04-12_135332_uqraxb",
                    size: 800,
                  })}
                  alt="Store Dashboard"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </BrowserMockup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreControlPanel;
