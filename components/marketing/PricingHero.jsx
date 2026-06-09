"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Cloud } from "@/components/ui/svgs/icons/CloudSvg";

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

const ScrollDownIcon = () => (
  <svg
    className="w-6 h-6 md:w-8 md:h-8"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="#F97316"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M19 14l-7 7m0 0l-7-7m7 7V3"
    />
  </svg>
);

const PricingHero = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`pricing.hero.${key}`);

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const title = t("title");
  const isAr = lang === "ar";

  let coloredTitle;
  if (isAr && title.includes("جميع احتياجاتك")) {
    const parts = title.split("جميع احتياجاتك");
    coloredTitle = (
      <>
        <span className="block mb-1 md:mb-0">{parts[0]}</span>
        <span className="text-[#F97316] block pb-1 md:pb-0">
          جميع احتياجاتك
        </span>
        {parts[1] && <span className="block">{parts[1]}</span>}
      </>
    );
  } else {
    coloredTitle = title;
  }

  return (
    <section
      className="relative overflow-hidden bg-[#FEF6EE] font-IBMPlex"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ──── Background Decoration ──── */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 md:opacity-30 opacity-40 blur-3xl w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-orange-200 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-40 -left-20 md:opacity-20 opacity-30 blur-3xl w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-orange-300 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        {/* Mobile floating accents - Enhanced */}
        <div className="absolute top-[18%] left-[12%] w-4 h-4 rounded-full bg-orange-400 opacity-20 md:hidden animate-float blur-[1px]"></div>
        <div className="absolute top-[35%] right-[10%] w-3 h-3 rounded-full bg-orange-500 opacity-15 md:hidden animate-float-delayed blur-[1px]"></div>

        {/* Top Right Decorative Arc */}
        <div className="absolute -top-16 -right-16 md:-right-[-2%] w-[100%] max-w-[738px] z-0 opacity-60 rotate-180">
          <LargeArcBg />
        </div>

        {/* Project Standard Clouds */}
        <div className="absolute top-10 right-[5%] md:right-[15%] animate-float opacity-30 md:opacity-40 z-10 scale-75 md:scale-90">
          <Cloud className="w-48 h-auto" />
        </div>

        {/* Subtle Dots Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] md:opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #C2410C 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* ── Floating shapes (Desktop) ── */}
      {/* top-left square */}
      <div className="absolute top-32 left-[6%] hidden lg:block animate-float-slow">
        <div
          className="w-14 h-14 rounded-2xl rotate-[18deg]"
          style={{
            background: "linear-gradient(135deg, #FED7AA44, #FB923C22)",
            border: "1.5px solid #FED7AA",
            boxShadow: "0 8px 32px 0 #F9731610",
            backdropFilter: "blur(8px)",
          }}
        />
      </div>
      {/* top-right circle */}
      <div className="absolute top-44 right-[7%] hidden lg:block animate-float-delayed">
        <div
          className="w-10 h-10 rounded-full"
          style={{
            border: "2px solid #FB923C55",
            boxShadow: "0 0 24px 4px #F9731614",
            backdropFilter: "blur(6px)",
          }}
        />
      </div>
      {/* mid-left tiny dot */}
      <div className="absolute top-[55%] left-[4%] hidden xl:block animate-float">
        <div
          className="w-4 h-4 rounded-full"
          style={{
            background: "#F97316",
            opacity: 0.15,
            boxShadow: "0 0 16px 4px #F97316",
          }}
        />
      </div>
      {/* mid-right diamond */}
      <div className="absolute top-[45%] right-[5%] hidden xl:block animate-float-slow">
        <div
          className="w-8 h-8 rotate-45 rounded-md"
          style={{
            background: "linear-gradient(135deg, #FDBA7444, #F9731622)",
            border: "1.5px solid #FED7AA88",
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 text-center pt-32 pb-8 md:pt-40 md:pb-12 lg:pt-48 lg:pb-16 flex flex-col items-center">
        {/* Badge - Glass Effect */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2 bg-white/70 backdrop-blur-md border border-white/50 rounded-full mb-6 md:mb-10 font-bold text-[11px] md:text-sm text-[#F97316] shadow-[0_4px_12px_rgba(249,115,22,0.08)] animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <span>
            {lang === "ar"
              ? "اكتشف باقاتنا الجديدة الآن"
              : "Discover our new plans now"}
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-black text-[#0F172A] mb-5 md:mb-6 mx-auto leading-[1.15] md:leading-[1.05] tracking-tight md:tracking-tighter text-[2rem] md:text-[2.6rem] lg:text-[3rem] animate-fade-in-up [animation-delay:200ms]">
          {coloredTitle}
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto text-[#6B7280] font-IBMPlex font-bold leading-relaxed mb-10 md:mb-12 text-sm md:text-[1.2rem] opacity-90 animate-fade-in-up [animation-delay:400ms]"
          style={{
            maxWidth: "42rem",
          }}
        >
          {t("description")}
        </p>

        {/* Floating Scroll Down Arrow */}
        <button
          onClick={scrollToNextSection}
          className="mt-6 md:mt-16 z-20 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-bounce opacity-70 hover:opacity-100 flex flex-col items-center gap-2 [animation-delay:600ms]"
          style={{ animationDuration: "2s" }}
          aria-label="Scroll down"
        >
          <ScrollDownIcon />
        </button>
      </div>
    </section>
  );
};

export default PricingHero;
