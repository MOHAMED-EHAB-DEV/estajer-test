"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Button from "../ui/Button";
import { Cloud } from "../ui/svgs/icons/CloudSvg";
import { useTranslations } from "@/hooks/useTranslations";

// Orange Circle Check Icon
const CheckCircleIcon = () => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
  >
    <circle cx="12" cy="12" r="12" fill="#F48A42" />
    <path
      d="M7 12.5L10.5 16L17 8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#F48A42]">
    <path
      d="M12 2L4 5V11C4 16.19 7.41 21.05 12 22C16.59 21.05 20 16.19 20 11V5L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Commissions({ translate, lang = "ar" }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`awareness.commissions.${key}`);
  const features = t("features");

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="my-6 md:my-12 pt-10 pb-14 md:pb-32 bg-[#FFFDF9] relative overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute top-0 start-0 select-none pointer-events-none z-0 opacity-60">
        <Cloud
          className="w-[200px] md:w-[450px] h-auto scale-x-[-1]"
          fill="#FEECDA"
        />
      </div>

      <div className="absolute bottom-0 end-0 select-none pointer-events-none z-0 opacity-40 translate-y-1/4 translate-x-1/4">
        <div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#F48A42]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative z-10 w-full mt-6 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Graphical Mockup Column */}
          <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center p-4">
            {/* Tilted Background Card */}
            <div className="absolute w-full h-full bg-[#FFFAF0] rounded-2xl transform rotate-3 z-0 border border-[#F48A42]/5" />

            {/* Main Earnings Card */}
            <div
              className={`relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_32px_64px_-16px_rgba(244,138,66,0.15)] rounded-2xl p-4 pt-7 md:p-8 w-full z-20 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="flex justify-between items-center md:mb-8 mb-4">
                <div className="space-y-0.5 md:space-y-1">
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {lang === "ar" ? "إجمالي الأرباح" : "Total Earnings"}
                  </span>
                  <h4 className="text-xl md:text-3xl font-bold text-darkNavy">
                    12,450 {lang === "ar" ? "ريال" : "SAR"}
                  </h4>
                </div>
                <div className="bg-[#F48A42]/10 p-2 md:p-3 rounded-xl md:rounded-2xl">
                  <ShieldIcon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>

              {/* Simplified Chart Visual */}
              <div className="h-20 md:h-36 flex items-end gap-1 md:gap-2 mb-4 md:mb-8 px-1 md:px-2">
                {[55, 30, 40, 65, 45, 80, 55, 90, 70, 85, 60, 65, 75, 80].map(
                  (h, i) => (
                    <div
                      key={i}
                      style={{
                        height: isVisible ? `${h}%` : "0%",
                        transition: `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s`,
                      }}
                      className={`flex-1 rounded-t-sm md:rounded-t-lg transition-all ${i === 5 ? "bg-[#F48A42]" : "bg-[#F48A42]/20"} ${i > 10 ? "hidden md:block" : ""}`}
                    />
                  ),
                )}
              </div>

              <div className="pt-3 md:pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs md:text-sm font-semibold text-gray-500">
                  {lang === "ar" ? "طلبات نشطة" : "Active Orders"}
                </span>
                <div className="flex -space-x-1.5 md:-space-x-2 rtl:space-x-reverse">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white bg-gray-200"
                    />
                  ))}
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white bg-[#F48A42] flex items-center justify-center text-[8px] md:text-[10px] text-white font-bold">
                    +12
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-6 -start-2 md:-top-8 md:-start-8 bg-white shadow-xl rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-[#F48A42]/10 z-30 flex items-center gap-2 md:gap-3 animate-float">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">
                  {lang === "ar" ? "العمولة" : "Commission"}
                </p>
                <p className="text-xs md:text-sm font-bold text-darkNavy">
                  10% {lang === "ar" ? "فقط" : "Only"}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-4 -end-2 md:-bottom-6 md:-end-8 bg-white shadow-xl rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-[#F48A42]/10 z-30 flex items-center gap-2 md:gap-3 animate-float-delayed">
              <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-bold text-darkNavy">
                {lang === "ar" ? "دفع آمن" : "Secure Payment"}
              </span>
            </div>
          </div>

          {/* Text Column */}
          <div
            className={`flex flex-col lg:ps-10 text-center lg:text-start transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 rtl:-translate-x-10"}`}
          >
            <h2 className="font-IBMPlex font-bold text-3xl lg:text-5xl text-darkNavy leading-tight mb-6">
              {t("title")}
            </h2>
            <p className="font-IBMPlex font-semibold text-lg lg:text-2xl text-[#F48A42] mb-8 leading-relaxed">
              {t("subtitle")}
            </p>

            <ul className="space-y-4 md:space-y-6 mb-10 md:mb-14 inline-block lg:block mx-auto lg:mx-0">
              {Array.isArray(features) &&
                features.map((text, idx) => (
                  <li
                    key={idx}
                    style={{
                      transitionDelay: `${idx * 100}ms`,
                    }}
                    className={`flex items-center gap-4 flex-row-reverse justify-end lg:flex-row-reverse transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                  >
                    <span className="font-IBMPlex font-medium text-[#5B5656] text-base md:text-xl">
                      {text}
                    </span>
                    <CheckCircleIcon />
                  </li>
                ))}
            </ul>

            <div className="flex justify-center lg:justify-start">
              <Button
                as={Link}
                href={`/${lang}/pricing`}
                className="w-full sm:w-auto text-base md:text-lg py-5 px-8 md:py-8 md:px-12 flex items-center justify-center gap-4 font-IBMPlex font-bold shadow-[0_20px_40px_-10px_rgba(244,138,66,0.4)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(244,138,66,0.5)] transition-all duration-300 group bg-[#F48A42] text-white"
              >
                <span>{t("action")}</span>
                <span
                  className={`text-2xl transition-transform duration-300 ${lang === "ar" ? "group-hover:-translate-x-2" : "group-hover:translate-x-2"}`}
                >
                  {lang === "ar" ? "←" : "→"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
