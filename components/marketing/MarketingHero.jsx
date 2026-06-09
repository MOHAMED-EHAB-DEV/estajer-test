"use client";

import React from "react";
import { Cloud } from "@/components/ui/svgs/icons/CloudSvg";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";

// --- SVGs ---
const SquareBg = () => (
  <svg width="21" height="21" fill="none" viewBox="0 0 21 21">
    <path fill="#32241A" d="M0 20.8h20.8V0H0z"></path>
  </svg>
);

const CupIcon = () => (
  <svg width="13" height="16" fill="none" viewBox="0 0 13 16">
    <path
      fill="#F48A42"
      d="M12.92 12.09A11.7 11.7 0 0 0 9.2 5.82a1.5 1.5 0 0 0-.5-2.8L9.5.66A.5.5 0 0 0 9.24.05.5.5 0 0 0 9 0H4a.5.5 0 0 0-.494.427.5.5 0 0 0 .019.233L4.315 3a1.5 1.5 0 0 0-.5 2.8 11.7 11.7 0 0 0-3.74 6.3Q0 12.444 0 12.795A3.205 3.205 0 0 0 3.205 16h6.59a3.205 3.205 0 0 0 3.125-3.91M8.305 1 7.64 3H5.36l-.665-2zM4.5 4h4a.5.5 0 0 1 0 1h-4a.5.5 0 1 1 0-1m5.295 11h-6.59a2.21 2.21 0 0 1-2.15-2.705A10.73 10.73 0 0 1 5.16 6h2.68a10.75 10.75 0 0 1 4.11 6.32q.047.235.05.475A2.21 2.21 0 0 1 9.795 15"
    ></path>
    <path
      fill="#F48A42"
      d="M6.5 9h1a.5.5 0 1 0 0-1H7a.5.5 0 0 0-1 0v.09A1.5 1.5 0 0 0 6.5 11a.5.5 0 0 1 0 1h-1a.5.5 0 1 0 0 1H6a.5.5 0 0 0 1 0v-.09A1.5 1.5 0 0 0 6.5 10a.5.5 0 1 1 0-1"
    ></path>
  </svg>
);

const ShopIcon = () => (
  <svg width="21" height="16" fill="none" viewBox="0 0 21 16">
    <path
      fill="#FB923C"
      d="M19.438 3.719c1.03 1.687.093 4-1.844 4.25-.157.031-.282.031-.438.031-.937 0-1.75-.406-2.312-1.031A3.09 3.09 0 0 1 12.53 8c-.906 0-1.75-.406-2.312-1.031a3.07 3.07 0 0 1-4.594 0A3.09 3.09 0 0 1 3.313 8c-.157 0-.282 0-.438-.031C.938 7.719 0 5.406 1.063 3.719l2-3.25C3.25.188 3.593 0 3.937 0h12.626c.343 0 .656.188.843.469zM17.156 9c.188 0 .375 0 .563-.031.187 0 .343-.063.531-.094V15c0 .563-.469 1-1 1h-14c-.562 0-1-.437-1-1V8.875c.156.031.313.063.5.094.188.031.375.031.563.031q.468 0 .937-.094V12h12V8.906c.281.063.594.094.906.094"
    ></path>
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
    <g
      stroke="#F48A42"
      strokeMiterlimit="10"
      strokeWidth="1.5"
      clipPath="url(#clip0_4169_23498)"
    >
      <path d="M15.15 2.675A8.958 8.958 0 0 1 10 18.958M4.85 17.325A8.958 8.958 0 0 1 10 1.042"></path>
      <path d="m15.7 5.933-.817-3.258h3.258M4.3 14.075l.816 3.25H1.857M15.7 10a6.27 6.27 0 0 1-5.7 3.258A6.27 6.27 0 0 1 4.3 10 6.27 6.27 0 0 1 10 6.742 6.27 6.27 0 0 1 15.7 10Z"></path>
      <path d="M10 10.817a.817.817 0 1 0 0-1.633.817.817 0 0 0 0 1.633Z"></path>
    </g>
    <defs>
      <clipPath id="clip0_4169_23498">
        <path fill="#fff" d="M0 0h20v20H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

const PercentIcon = () => (
  <svg width="15" height="12" fill="none" viewBox="0 0 15 12">
    <path
      fill="#FB923C"
      d="M2.913 0q1.344 0 2.16.944.816.928.816 2.624 0 1.695-.768 2.656-.752.944-2.208.944-.864 0-1.52-.432T.369 5.504Q0 4.688 0 3.568 0 1.873.753.944 1.505 0 2.913 0m.032 1.904q-.336 0-.464.464-.128.449-.128 1.232 0 .768.128 1.232t.464.464.464-.448q.128-.464.128-1.248t-.128-1.232q-.128-.465-.464-.464M11.585.16 5.249 11.584h-2.32L9.265.16zm.016 4.384q.896 0 1.568.432.672.416 1.04 1.216.368.784.368 1.92 0 1.696-.768 2.656-.752.944-2.208.944-.864 0-1.52-.432t-1.024-1.232q-.368-.816-.368-1.936 0-1.695.752-2.624.752-.945 2.16-.944m.032 1.904q-.336 0-.464.464-.128.449-.128 1.232 0 .768.128 1.232.128.465.464.464.336 0 .464-.448.128-.464.128-1.248 0-.8-.128-1.248t-.464-.448"
    ></path>
  </svg>
);

const LockIcon = () => (
  <svg width="11" height="13" fill="none" viewBox="0 0 11 13">
    <path
      fill="#FB923C"
      d="M8.667 6H2V4a3.333 3.333 0 0 1 6.667 0zm.666 0V4a4 4 0 1 0-8 0v2H.667A.667.667 0 0 0 0 6.667V12a.667.667 0 0 0 .667.667H10a.667.667 0 0 0 .667-.667V6.667A.667.667 0 0 0 10 6zm-4 3.153V10a.667.667 0 1 0 1.334 0v-.847a1.333 1.333 0 1 0-1.334 0"
    ></path>
  </svg>
);

const BadgeIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
    <path
      fill="#F48A42"
      fillRule="evenodd"
      d="M4.745.75c-.152.13-.228.195-.31.25a1.7 1.7 0 0 1-.615.254 4 4 0 0 1-.395.043c-.5.04-.751.06-.96.134-.483.17-.864.55-1.034 1.034-.074.209-.094.46-.134.96-.016.2-.024.3-.043.395-.043.22-.13.43-.255.616-.054.08-.12.157-.249.31-.326.382-.489.573-.584.773-.221.462-.221 1 0 1.462.095.2.258.391.584.774.13.152.195.228.25.31.124.186.21.395.254.615.02.096.027.196.043.395.04.5.06.751.134.96.17.483.55.864 1.034 1.034.209.074.46.094.96.134.2.016.3.024.395.043.22.043.43.13.616.255.08.054.157.12.31.249.382.326.573.489.773.584.462.221 1 .221 1.462 0 .2-.095.391-.258.774-.584.152-.13.228-.195.31-.25.186-.124.395-.21.615-.254.096-.02.196-.027.395-.043.5-.04.751-.06.96-.134.483-.17.864-.55 1.034-1.034.074-.209.094-.46.134-.96.016-.2.024-.3.043-.395.043-.22.13-.43.255-.616.054-.08.12-.157.249-.31.326-.382.489-.573.584-.773.221-.462.221-1 0-1.462-.095-.2-.258-.391-.584-.774a4 4 0 0 1-.25-.31 1.7 1.7 0 0 1-.254-.615 4 4 0 0 1-.043-.395c-.04-.5-.06-.751-.134-.96a1.7 1.7 0 0 0-1.034-1.034c-.209-.074-.46-.094-.96-.134-.2-.016-.3-.024-.395-.043-.22-.043-.43-.13-.616-.255a4 4 0 0 1-.31-.249C7.373.424 7.182.261 6.982.166c-.462-.221-1-.221-1.462 0-.2.095-.391.258-.774.584m4.238 4.164a.509.509 0 0 0-.719-.719L5.233 7.226l-.997-.996a.509.509 0 0 0-.72.72l1.357 1.356c.199.198.52.198.72 0z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const OrangeCircleCheck = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
    <path
      fill="#F48A42"
      fillRule="evenodd"
      d="M4.745.75c-.152.13-.228.195-.31.25a1.7 1.7 0 0 1-.615.254 4 4 0 0 1-.395.043c-.5.04-.751.06-.96.134-.483.17-.864.55-1.034 1.034-.074.209-.094.46-.134.96-.016.2-.024.3-.043.395-.043.22-.13.43-.255.616-.054.08-.12.157-.249.31-.326.382-.489.573-.584.773-.221.462-.221 1 0 1.462.095.2.258.391.584.774.13.152.195.228.25.31.124.186.21.395.254.615.02.096.027.196.043.395.04.5.06.751.134.96.17.483.55.864 1.034 1.034.209.074.46.094.96.134.2.016.3.024.395.043.22.043.43.13.616.255.08.054.157.12.31.249.382.326.573.489.773.584.462.221 1 .221 1.462 0 .2-.095.391-.258.774-.584.152-.13.228-.195.31-.25.186-.124.395-.21.615-.254.096-.02.196-.027.395-.043.5-.04.751-.06.96-.134.483-.17.864-.55 1.034-1.034.074-.209.094-.46.134-.96.016-.2.024-.3.043-.395.043-.22.13-.43.255-.616.054-.08.12-.157.249-.31.326-.382.489-.573.584-.773.221-.462.221-1 0-1.462-.095-.2-.258-.391-.584-.774a4 4 0 0 1-.25-.31 1.7 1.7 0 0 1-.254-.615 4 4 0 0 1-.043-.395c-.04-.5-.06-.751-.134-.96a1.7 1.7 0 0 0-1.034-1.034c-.209-.074-.46-.094-.96-.134-.2-.016-.3-.024-.395-.043-.22-.043-.43-.13-.616-.255a4 4 0 0 1-.31-.249C7.373.424 7.182.261 6.982.166c-.462-.221-1-.221-1.462 0-.2.095-.391.258-.774.584m4.238 4.164a.509.509 0 0 0-.719-.719L5.233 7.226l-.997-.996a.509.509 0 0 0-.72.72l1.357 1.356c.199.198.52.198.72 0z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ContractIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const UserCheckIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const TruckIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h1m8-1a2 2 0 012 2 2 2 0 01-2 2H3a2 2 0 01-2-2 2 2 0 012-2m0 0V6a2 2 0 012-2h9l4 4v10a2 2 0 01-2 2h-1m-4-1a2 2 0 012 2 2 2 0 01-2 2H9a2 2 0 01-2-2 2 2 0 012-2m0 0h1"
    />
  </svg>
);

const SparklesIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"
    />
  </svg>
);

const MoneyBagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21C16.9706 21 21 17.4183 21 13C21 8.58172 17.5 7 12 7C6.5 7 3 8.58172 3 13C3 17.4183 7.02944 21 12 21Z"
      stroke="#F97316"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 7C9 4.23858 10.3431 3 12 3C13.6569 3 15 4.23858 15 7"
      stroke="#F97316"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11V17"
      stroke="#F97316"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 13H14M10 15H14"
      stroke="#F97316"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const EyeIcon = () => (
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

const LargeArcBg = () => (
  <svg
    width="100%"
    height="100%"
    fill="none"
    viewBox="0 0 738 190"
    className="w-full h-full object-contain"
  >
    <circle
      cx="369"
      cy="369"
      r="319"
      stroke="#F48A42"
      strokeWidth="100"
      opacity="0.2"
      style={{ mixBlendMode: "multiply" }}
    ></circle>
  </svg>
);

const MarketingHero = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.hero.${key}`);
  const features = trans("marketing.hero.features");

  return (
    <section
      className="relative overflow-hidden bg-[#FEF6EE] font-IBMPlex"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* ──── Background Decoration ──── */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 opacity-30 blur-3xl w-[600px] h-[600px] bg-orange-200 rounded-full"></div>
        <div className="absolute top-40 -left-20 opacity-20 blur-3xl w-[400px] h-[400px] bg-orange-300 rounded-full"></div>

        {/* Top Right Decorative Arc */}
        <div className="absolute -top-16 -right-16 md:-right-[-2%] w-[100%] max-w-[738px] z-0 opacity-60 rotate-180">
          <LargeArcBg />
        </div>

        {/* Project Standard Clouds */}
        <div className="absolute top-10 right-[15%] animate-float opacity-40 z-10 scale-90">
          <Cloud className="w-48 h-auto" />
        </div>
      </div>
      {/* Decorative Large Arc behind image */}
      <div className="absolute -bottom-0 right-1/2 w-[110%] max-w-[738px] z-10 pointer-events-none flex justify-center opacity-80 mix-blend-multiply">
        <LargeArcBg />
      </div>

      <div className="pt-24 pb-4 md:pt-32 md:pb-16 lg:pt-40 lg:pb-36">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-2 md:gap-12 lg:gap-24">
            {/* Text Content */}
            <div className={`w-full lg:w-1/2 mb-12 md:mb-0 md:mt-6 `}>
              {/* Top Badge */}
              <div className="inline-flex items-center justify-center px-6 py-2 bg-[#FFF5EC] border border-[#FDE5D0] rounded-full mb-4 md:mb-8 animate-fade-in shadow-sm">
                <span className="text-xs md:text-sm font-bold text-[#F97316]">
                  {t("badge")}
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-[1.5rem] md:text-5xl lg:text-6xl font-bold text-[#1F2937] !leading-[1.2] mb-4">
                {t("title")} <br />
                {t("titleLine2Part1")}
                <span className="text-orange-500">{t("titleHighlight")}</span>
              </h1>

              {/* Sub-heading */}
              <h2 className="text-xl md:text-3xl font-bold text-orange-500 mb-6 md:block hidden">
                {t("subtitle")}
              </h2>

              {/* Description */}
              <p className="text-sm md:text-lg text-gray-600 leading-relaxed mb-4 md:mb-8 max-w-[550px]">
                {t("description")} <br />
                {t("descriptionLine2")}
              </p>

              {/* Feature List as Trust Badges */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3  mb-4 md:mb-10">
                {Array.isArray(features) &&
                  features.slice(0, 4).map((item, index) => {
                    const icons = [
                      <ContractIcon key="contract" />,
                      <UserCheckIcon key="user" />,
                      <OrangeCircleCheck key="check" />,
                      <SparklesIcon key="spark" />,
                      <TruckIcon key="truck" />,
                    ];
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FEEFE2] rounded-xl border border-orange-50 transition-all hover:border-orange-200 hover:bg-orange-100/30 group"
                      >
                        <span className="text-orange-600 transition-transform group-hover:scale-110">
                          {icons[index] || <OrangeCircleCheck />}
                        </span>
                        <span className="text-xs md:text-sm font-bold text-gray-700">
                          {item}
                        </span>
                      </div>
                    );
                  })}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FEEFE2] rounded-xl border border-orange-50">
                  <span className="text-orange-600">
                    <LockIcon />
                  </span>
                  <span className="text-xs md:text-sm font-bold text-gray-700">
                    {t("trustBadge1")}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FEEFE2] rounded-xl border border-orange-50">
                  <span className="text-orange-500">
                    <OrangeCircleCheck />
                  </span>
                  <span className="text-xs md:text-sm font-bold text-gray-700">
                    {t("trustBadge2")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 md:gap-5">
                <Link
                  href={`/${lang}/pricing`}
                  className="flex items-center gap-1 md:gap-2 bg-orange-500 text-white font-bold py-3 px-5 md:py-4 md:px-10 rounded-full hover:bg-orange-600 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-orange-500/20 text-[0.9rem] md:text-lg"
                >
                  <span>{t("ctaPrimary")}</span>
                  <svg
                    className={`w-4 h-4 md:w-4 md:h-4 ${lang === "ar" ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
                <Link
                  href={`/${lang}/pricing`}
                  className="bg-[#ffffff] text-orange-500 font-bold py-3 px-4 md:py-4 md:px-10 rounded-full border-1 border-orange-400 hover:bg-orange-50 hover:border-orange-300 active:scale-95 transition-all text-[0.9rem] md:text-lg flex items-center justify-center gap-2"
                >
                  <span>{t("ctaSecondary")}</span>
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="w-full lg:w-1/2 relative mt-16 md:mt-16 lg:mt-0">
              <div className="relative w-full max-w-[500px] lg:max-w-[650px] mx-auto scale-90 sm:scale-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-orange-100/40 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Main Graphic */}
                <div className="relative z-20 animate-float-slow aspect-square w-full">
                  <Image
                    unoptimized
                    fill
                    src={anyImgUrl({
                      src: "Group_1000001249_ilgzem",
                      size: 1200,
                    })}
                    alt="Estajer Premium Growth"
                    className="w-full h-auto drop-shadow-[0_45px_60px_rgba(249,115,22,0.12)] object-contain"
                  />
                </div>

                {/* Label 1: Top Right - Premium Partner */}
                <div className="absolute top-[2%] -right-10 md:-right-16 z-30 animate-float">
                  <div className="bg-white p-2.5 pr-3 pl-4 rounded-[16px] shadow-[0_15px_30px_rgba(0,0,0,0.06)] flex items-center gap-3 border border-orange-50/60 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white shadow-inner">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 20 24"
                      >
                        <path
                          fill="#fff"
                          d="M16.25 11.368H3.75v-3.79a6.35 6.35 0 0 1 1.83-4.465A6.22 6.22 0 0 1 10 1.263c1.658 0 3.247.666 4.42 1.85a6.35 6.35 0 0 1 1.83 4.466zm1.25 0v-3.79a7.62 7.62 0 0 0-2.197-5.358A7.46 7.46 0 0 0 10 0a7.46 7.46 0 0 0-5.303 2.22A7.62 7.62 0 0 0 2.5 7.579v3.79H1.25c-.332 0-.65.133-.884.37a1.27 1.27 0 0 0-.366.893v10.105c0 .335.132.656.366.893.235.237.552.37.884.37h17.5c.331 0 .65-.133.884-.37a1.27 1.27 0 0 0 .366-.893V12.632a1.27 1.27 0 0 0-.366-.894 1.24 1.24 0 0 0-.884-.37zM10 17.343v1.604c0 .335.132.657.366.894a1.244 1.244 0 0 0 1.768 0 1.27 1.27 0 0 0 .366-.894v-1.604c.477-.278.85-.707 1.06-1.22.21-.515.247-1.084.105-1.622a2.53 2.53 0 0 0-.893-1.35 2.48 2.48 0 0 0-3.044 0c-.437.339-.75.813-.893 1.35a2.55 2.55 0 0 0 .105 1.621c.21.514.583.943 1.06 1.221"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 mb-[1px]">
                        {t("floatingPartner")}
                      </p>
                      <p className="text-[9px] text-orange-600 font-bold mb-1">
                        {t("floatingPartnerSub")}
                      </p>
                      <div
                        className={`flex gap-[1px] ${lang === "ar" ? "justify-end" : "justify-start"}`}
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <StarIcon key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stack: Left - Three Cards */}
                <div className="absolute top-[4%] md:top-[10%] -left-8 md:-left-12 z-30 flex flex-col gap-1 md:gap-3 animate-float-delayed">
                  <div className="bg-white p-2.5 pr-3 pl-4 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-3 border border-orange-50/60 relative lg:-right-4">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF5EC] flex items-center justify-center text-orange-500">
                      <ShopIcon />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-gray-900 mb-0.5">
                        {t("floatingStore")}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-gray-500 font-medium">
                        {t("floatingStoreSub")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 pr-3 pl-4 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-3 border border-orange-50/60 relative lg:left-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF5EC] flex items-center justify-center text-orange-500">
                      <EyeIcon />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-gray-900 mb-0.5">
                        {t("floatingPriority")}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-gray-500 font-medium">
                        {t("floatingPrioritySub")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 pr-3 pl-4 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-3 border border-orange-50/60 relative lg:-right-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF5EC] flex items-center justify-center text-orange-500">
                      <PercentIcon />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-gray-900 mb-0.5">
                        {t("floatingCommission")}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-gray-500 font-medium">
                        {t("floatingCommissionSub")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Label 3: Bottom Right - Saved Money */}
                <div className="absolute bottom-[20%] md:bottom-[30%] -right-8 md:-right-12 z-30 animate-bounce-slow">
                  <div className="bg-white p-3 pr-3 pl-4 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-3 border border-orange-50/60">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF5EC] flex items-center justify-center text-orange-500">
                      <MoneyBagIcon />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-gray-900 mb-0.5">
                        {t("floatingSaved")}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-gray-500 font-medium">
                        {t("floatingSavedSub")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/3 right-10 pointer-events-none animate-float opacity-10">
          <PercentIcon />
        </div>
      </div>
    </section>
  );
};

export default MarketingHero;
