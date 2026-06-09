"use client";
import React from "react";
import Link from "next/link";
import Button from "../ui/Button";

// Cleanly generated repeating pattern instead of an enormous raw path!
const DottedPattern = () => (
  <svg
    className="absolute inset-0 z-0"
    width="100%"
    height="100%"
    pointerEvents="none"
  >
    <defs>
      <pattern
        id="heroDotPattern"
        x="0"
        y="0"
        width="46.5"
        height="46.5"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="5" cy="5" r="5" fill="#F48A42" fillOpacity="0.15" />
      </pattern>
      {/* Mask applied to fade out dots near the edges similar to design */}
      <radialGradient id="fadeMask" cx="50%" cy="50%" r="50%">
        <stop offset="20%" stopColor="white" stopOpacity="1" />
        <stop offset="90%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="url(#heroDotPattern)"
      mask="url(#fadeMask)"
    />
  </svg>
);

// High-fidelity background glow blobs provided from design
const LeftGlowBlob = () => (
  <div
    className="absolute left-0 top-1/4 -translate-x-1/2 w-[350px] h-[350px] rounded-full pointer-events-none opacity-60 z-0 blur-[100px]"
    style={{
      background: "radial-gradient(circle, #F6A56E 0%, transparent 70%)",
    }}
  />
);

const TopRightGlowBlob = () => (
  <div
    className="absolute top-0 right-12 translate-x-1/4 -translate-y-1/4 w-[450px] h-[450px] rounded-full pointer-events-none opacity-30 z-0 blur-[120px]"
    style={{
      background: "radial-gradient(circle, #F48A42 0%, transparent 70%)",
    }}
  />
);

const ScrollDownIcon = () => (
  <svg className="w-10 h-10 md:w-[50px] md:h-[50px]" fill="none" viewBox="0 0 56 56">
    <rect width="55" height="55" x="0.5" y="0.5" stroke="#F48A42" rx="27.5" />
    <path
      stroke="#F48A42"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m35 30-7 7m0 0-7-7m7 7V19"
    />
  </svg>
);

// Feature Icons based on the image provided
const BankIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21h18"></path>
    <path d="M3 10h18"></path>
    <path d="M5 6l7-3 7 3"></path>
    <path d="M4 10v11"></path>
    <path d="M20 10v11"></path>
    <path d="M8 14v3"></path>
    <path d="M12 14v3"></path>
    <path d="M16 14v3"></path>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M9 12l2 2 4-4"></path>
  </svg>
);

const LockIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const UsersIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CenterGlowCircle = () => (
  <div className="mt-8 md:mt-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] lg:w-[1100px] lg:h-[1100px] pointer-events-none z-0">
    {/* Static Inner Glow */}
    <svg
      width="100%"
      height="100%"
      fill="none"
      viewBox="0 0 950 950"
      className="absolute inset-0"
    >
      <g clipPath="url(#clip0_4234_19347)">
        <circle
          cx="473"
          cy="490"
          r="455"
          fill="url(#paint0_linear_4234_19347)"
        ></circle>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_4234_19347"
          x1="483"
          x2="483"
          y1="67.5"
          y2="967.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFEDE2"></stop>
          <stop offset="1" stopColor="#FFEDD7" stopOpacity="0.08"></stop>
        </linearGradient>
        <clipPath id="clip0_4234_19347">
          <rect width="950" height="950" fill="#fff" rx="475"></rect>
        </clipPath>
      </defs>
    </svg>

    {/* Spinning Dashed Ring - visible only on the upper half via CSS masking */}
    <div
      className="absolute inset-0"
      style={{
        maskImage:
          "linear-gradient(to bottom, black 0%, black 25%, transparent 55%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 25%, transparent 55%)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 950 950"
        className="absolute inset-0 animate-[spin_60s_linear_infinite]"
      >
        <rect
          width="948"
          height="948"
          x="1"
          y="1"
          stroke="#F48A42"
          strokeOpacity="0.75"
          strokeDasharray="8 8"
          strokeWidth="2"
          rx="474"
        ></rect>
      </svg>
    </div>
  </div>
);

import { useTranslations } from "@/hooks/useTranslations";

export default function Hero({ translate, lang = "ar" }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`awareness.hero.${key}`);

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative  md:min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fffdfb] via-[#FFF0E6] to-[#FFF3E4] pt-36 pb-28 md:pt-32 md:pb-20">
      {/* Corner ambient accent lighting */}
      <LeftGlowBlob />
      <TopRightGlowBlob />

      {/* Smart, performant dotted background pattern */}
      <DottedPattern />

      {/* Main glowing center & animated rotating dashed circle provided by user */}
      <CenterGlowCircle />

      {/* Central content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center mt-6">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 border-2 border-[#F48A42]/40 bg-white/90 px-5 md:px-6 py-2 rounded-full mb-8 shadow-sm">
          <div className="w-1.5 h-1.5 bg-[#F48A42] rounded-full"></div>
          <span className="font-IBMPlex font-bold text-xs md:text-sm text-[#F48A42]">
            {t("badge")}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-IBMPlex font-bold text-[1.6rem] md:text-[2.6rem] lg:text-[3rem] text-darkNavy mb-5 max-w-3xl">
          {t("titlePart1")}
          <span className="text-[#F48A42]">{t("titleHighlight")}</span>
          {t("titlePart2")}
          <br className="hidden md:block" />
          {t("titleSuffix")}
        </h1>

        {/* Hero Subtitle */}
        <p className="font-IBMPlex text-[#F48A42] text-sm md:text-[1.2rem] font-bold mb-10 max-w-2xl opacity-90">
          {t("subtitle")}
        </p>

        {/* CTA Button */}
        <Button
          as={Link}
          href={`/${lang}/pricing`}
          className="md:text-[1.1rem] text-sm py-4 px-8 md:py-7 md:px-12 flex items-center gap-3 font-IBMPlex font-bold shadow-[0_15px_30px_-8px_rgba(244,138,66,0.35)] hover:-translate-y-1 transition-all duration-300 rounded-full mb-8 md:mb-20 group"
        >
          <span>{t("action")}</span>
          <span className="font-black text-xl leading-none transition-transform duration-300 group-hover:-translate-x-1">
            {lang === "ar" ? "←" : "→"}
          </span>
        </Button>

        {/* Features Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-4 text-[#F48A42] opacity-85">
          <div className="flex items-center gap-2.5">
            <BankIcon />
            <span className="font-IBMPlex font-bold text-xs md:text-base">
              {t("features.nationalAccess")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon />
            <span className="font-IBMPlex font-bold text-xs md:text-base">
              {t("features.documentedContracts")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <LockIcon />
            <span className="font-IBMPlex font-bold text-xs md:text-base">
              {t("features.securePayment")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <UsersIcon />
            <span className="font-IBMPlex font-bold text-xs md:text-base">
              {t("features.partners")}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Scroll Down Arrow */}
      <button
        onClick={scrollToNextSection}
        className="absolute bottom-8 z-20 hover:scale-110 active:scale-95 transition-transform duration-300 bg-white/50 backdrop-blur-sm rounded-full cursor-pointer hover:shadow-lg hover:shadow-[#F48A42]/20"
        aria-label="Scroll down"
      >
        <ScrollDownIcon />
      </button>
    </section>
  );
}
