"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";

const ListIcon1 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 12"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M15.5 10c.25 0 .5.25.5.5v1c0 .281-.25.5-.5.5H1c-.562 0-1-.437-1-1V.5C0 .25.219 0 .5 0h1c.25 0 .5.25.5.5V10zm-1-9c.25 0 .5.25.469.5v3.719c0 .656-.781 1-1.25.531l-1.031-1.031-3 3a.964.964 0 0 1-1.407 0L6 5.437 4.531 6.876a.49.49 0 0 1-.687 0l-.719-.719a.49.49 0 0 1 0-.687l2.156-2.157a.964.964 0 0 1 1.407 0L9 5.595l2.281-2.282-1.031-1.03C9.781 1.811 10.125 1 10.781 1z"
    ></path>
  </svg>
);

const ListIcon2 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 14"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="m19.063 9.656.812.469c.094.031.125.156.094.25a5 5 0 0 1-1.032 1.813c-.062.062-.187.093-.28.03l-.813-.468c-.344.281-.719.531-1.157.656v.938c0 .125-.062.219-.156.219a4.7 4.7 0 0 1-2.093 0c-.094 0-.157-.094-.157-.22v-.937c-.437-.125-.812-.375-1.156-.656l-.812.469c-.094.062-.22.031-.282-.031-.469-.532-.844-1.126-1.031-1.813-.031-.094 0-.219.094-.25l.812-.469a3.25 3.25 0 0 1 0-1.344l-.812-.468c-.094-.032-.125-.157-.094-.25.188-.688.563-1.282 1.031-1.813.063-.062.188-.093.281-.031l.813.469c.344-.282.719-.532 1.156-.657v-.937c0-.125.063-.219.156-.219a4.7 4.7 0 0 1 2.094 0c.094 0 .157.094.157.219v.938c.437.125.812.375 1.156.656l.812-.469c.094-.062.219-.031.282.031a5 5 0 0 1 1.03 1.813c.032.093 0 .218-.093.25l-.812.468c.093.438.093.907 0 1.344M15.5 10.5c.813 0 1.5-.687 1.5-1.531 0-.813-.687-1.5-1.5-1.5-.844 0-1.531.687-1.531 1.5 0 .844.687 1.531 1.531 1.531M3 5.969c-1.125 0-2-.875-2-2 0-1.094.875-2 2-2 1.094 0 2 .906 2 2 0 1.125-.906 2-2 2m7 1a3.494 3.494 0 0 1-3.5-3.5A3.48 3.48 0 0 1 9.969 0c1.937 0 3.5 1.563 3.5 3.5 0 .531-.125 1.031-.344 1.5-.031 0-.031 0-.062.031l-.25-.156a1.4 1.4 0 0 0-.626-.156c-.343 0-.656.156-.906.406-.469.531-.875 1.156-1.125 1.844zm3.281 6.094v.28c0 .25.063.438.188.626H5.5a1.48 1.48 0 0 1-1.5-1.5v-.875c0-2 1.594-3.625 3.594-3.625h.25a5 5 0 0 0 2.156.5h.281c.094.094.188.187.313.25l.25.156v.219c-.031.031-1.125.5-.813 1.594.25.78.688 1.53 1.281 2.156.22.25.563.406.876.406.406 0 .624-.156.874-.312.063.03.126.093.22.124m-7.875-5.5a4.6 4.6 0 0 0-2.375 3.406H1c-.562 0-1-.438-1-1v-1c0-1.094.875-2 2-2h2c.531 0 1.031.25 1.406.593"
    ></path>
  </svg>
);

const ListIcon3 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M15.781.625c.219 1 .219 1.781.188 2.563 0 3.218-1.719 5.156-4 6.593v3.281c0 .5-.344 1.094-.813 1.344l-3.094 1.531A1.1 1.1 0 0 1 7.75 16c-.437 0-.75-.312-.781-.75v-3.219l-.688.688c-.406.406-1.062.344-1.406 0l-1.594-1.594c-.406-.406-.375-1.062 0-1.406L3.97 9H.75A.72.72 0 0 1 0 8.25c0-.094.031-.219.063-.312l1.53-3.094c.25-.469.845-.813 1.345-.844h3.28c1.438-2.25 3.376-4 6.595-4 .78 0 1.562 0 2.562.219a.66.66 0 0 1 .406.406M12 5.25c.688 0 1.25-.531 1.25-1.25 0-.687-.562-1.25-1.25-1.25-.719 0-1.25.563-1.25 1.25 0 .719.531 1.25 1.25 1.25"
    ></path>
  </svg>
);

const listIcons = [ListIcon1, ListIcon2, ListIcon3];

const CheckCircleIcon = () => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
  >
    <circle cx="12" cy="12" r="12" fill="#FF8C42" />
    <path
      d="M7 12.5L10.5 16L17 8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SvgIcon = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
    {...props}
  >
    <path
      fill="#FF8C42"
      d="M0 12.688C1.281 13.594 3.625 14 6 14c2.344 0 4.688-.406 6-1.312V14c0 1.125-2.687 2-6 2-3.312 0-6-.875-6-2zM10 4c-3.312 0-6-.875-6-2 0-1.094 2.688-2 6-2 3.313 0 6 .906 6 2 0 1.125-2.687 2-6 2M0 9.406C1.281 10.47 3.625 11 6 11c2.344 0 4.688-.531 6-1.594V11c0 1.125-2.687 2-6 2-3.312 0-6-.875-6-2zm13 .344v-2c1.188-.219 2.25-.562 3-1.062V8c0 .75-1.219 1.406-3 1.75M6 5c3.313 0 6 1.125 6 2.5C12 8.906 9.313 10 6 10c-3.312 0-6-1.094-6-2.5C0 6.125 2.688 5 6 5m6.844 1.781c-.281-.75-.969-1.343-1.875-1.781 2-.125 3.906-.531 5.031-1.312V5c0 .781-1.281 1.438-3.156 1.781"
    ></path>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#FF8C42]">
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

const IncomeValue = ({ translate, lang = "ar" }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`about.incomeValue.${text}`);
  const reasons = t("reasons");

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const desc1 = typeof t("description1") === "string" ? t("description1") : "";
  const [titlePart1, titlePart2] = desc1.includes("..") ? desc1.split("..") : [desc1, ""];

  const reasonSubtitles = {
    ar: [
      "استغل كل ما تملك واجعله مصدر دخل مستمر",
      "دعم الاقتصاد الوطني وتوفير فرص عمل للشباب",
      "كن جزءاً من التحول الرقمي والاقتصادي في المملكة"
    ],
    en: [
      "Exploit everything you own and make it a continuous source of income",
      "Supporting the national economy and providing job opportunities for youth",
      "Be part of the digital and economic transformation in the Kingdom"
    ]
  };

  return (
    <section ref={containerRef} id="benefit" className="bg-[#FFFBF7] py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Graphical Mockup Column */}
          <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center p-4 py-8 sm:py-10 md:p-8">
            {/* Tilted Background Card */}
            <div className="absolute w-full h-full bg-[#FFFAF0] rounded-2xl transform rotate-3 z-0 border border-[#FF8C42]/5" />

            {/* Main Earnings Card */}
            <div
              className={`relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_32px_64px_-16px_rgba(255,140,66,0.15)] rounded-2xl p-5 sm:p-6 md:p-8 w-full z-20 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="flex justify-between items-center md:mb-8 mb-4">
                <div className="space-y-0.5 md:space-y-1">
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {lang === "ar" ? "إجمالي الأرباح" : "Total Earnings"}
                  </span>
                  <h4 className="text-xl md:text-3xl font-bold text-[#1A1A2E]">
                    12,450 {lang === "ar" ? "ريال" : "SAR"}
                  </h4>
                </div>
                <div className="bg-[#FF8C42]/10 p-2 md:p-3 rounded-xl md:rounded-2xl">
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
                      className={`flex-1 rounded-t-sm md:rounded-t-lg transition-all ${i === 5 ? "bg-[#FF8C42]" : "bg-[#FF8C42]/20"} ${i > 10 ? "hidden md:block" : ""}`}
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
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white bg-[#FF8C42] flex items-center justify-center text-[8px] md:text-[10px] text-white font-bold">
                    +12
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-4 -start-1 sm:-top-6 sm:-start-4 md:-top-8 md:-start-8 bg-white shadow-xl rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 border border-[#FF8C42]/10 z-30 flex items-center gap-1.5 sm:gap-2 md:gap-3 animate-float">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 25 18"
                  className="w-5 h-auto md:w-6 md:h-auto"
                >
                  <path
                    fill="#FF8C42"
                    d="M3.75 7.5A2.47 2.47 0 0 1 1.25 5c0-1.367 1.094-2.5 2.5-2.5 1.367 0 2.5 1.133 2.5 2.5 0 1.406-1.133 2.5-2.5 2.5m17.5 0a2.47 2.47 0 0 1-2.5-2.5c0-1.367 1.094-2.5 2.5-2.5 1.367 0 2.5 1.133 2.5 2.5 0 1.406-1.133 2.5-2.5 2.5m1.25 1.25c1.367 0 2.5 1.133 2.5 2.5v1.25c0 .703-.586 1.25-1.25 1.25h-2.578c-.274-1.836-1.367-3.398-2.969-4.258.469-.43 1.094-.742 1.797-.742zm-10 0a4.37 4.37 0 0 1-4.375-4.375C8.125 1.992 10.078 0 12.5 0c2.383 0 4.375 1.992 4.375 4.375 0 2.422-1.992 4.375-4.375 4.375M15.469 10c2.5 0 4.531 2.031 4.531 4.531v1.094c0 1.055-.86 1.875-1.875 1.875H6.875A1.85 1.85 0 0 1 5 15.625v-1.094C5 12.031 6.992 10 9.492 10h.313c.82.39 1.718.625 2.695.625.938 0 1.836-.234 2.656-.625zm-8.711-.508c-1.602.86-2.695 2.422-2.969 4.258H1.25C.547 13.75 0 13.203 0 12.5v-1.25c0-1.367 1.094-2.5 2.5-2.5H5c.664 0 1.29.313 1.758.742"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">
                  {lang === "ar" ? "الضمان" : "Guarantee"}
                </p>
                <p className="text-xs md:text-sm font-bold text-[#1A1A2E]">
                  {lang === "ar" ? "عملاء موثوقين" : "Trusted Customer"}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-3 -end-1 sm:-bottom-4 sm:-end-4 md:-bottom-6 md:-end-8 bg-white shadow-xl rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4 border border-[#FF8C42]/10 z-30 flex items-center gap-1.5 sm:gap-2 md:gap-3 animate-float-delayed">
              <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-bold text-[#1A1A2E]">
                {lang === "ar" ? "دفع آمن" : "Secure Payment"}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-4 md:mb-6 justify-start">
              <div className="w-10 h-10 rounded-xl bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42]">
                <SvgIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-[#FF8C42] tracking-wide uppercase">
                {lang === "ar" ? "العائد المادي" : "Financial Return"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[44px] font-black text-[#1A1A2E] mb-4 md:mb-5 leading-[1.2] md:leading-[1.25]">
              {titlePart1}..
              {titlePart2 && <span className="block text-[#FF8C42] mt-0">{titlePart2.trim()}</span>}
            </h2>

            <p className="text-sm sm:text-base text-gray-500 mb-6 md:mb-8 leading-[1.7] md:leading-[1.8] max-w-xl">
              {t("description2")}
            </p>

            <div className="flex flex-col gap-3 md:gap-4">
              {Array.isArray(reasons) && reasons.map((reason, index) => {
                const Icon = listIcons[index % listIcons.length];
                const cleanReason = reason.replace(/\.$/, "");
                const subtitle = reasonSubtitles[lang] ? reasonSubtitles[lang][index] : reasonSubtitles["en"][index];

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 border-s-4 border-s-transparent shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,140,66,0.08)] hover:border-s-[#FF8C42] hover:-translate-y-0.5 group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42] flex-shrink-0 transition-colors group-hover:bg-[#FF8C42] group-hover:text-white">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 text-start">
                      <h4 className="text-sm sm:text-base md:text-[17px] font-black text-[#1A1A2E] mb-0.5 md:mb-1 leading-snug">
                        {cleanReason}
                      </h4>
                      {subtitle && (
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-400 font-medium leading-normal">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 md:mt-10">
              <Link
                href={lang === "ar" ? "/register" : "/en/register"}
                className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-black text-sm sm:text-base shadow-xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/45 w-full sm:w-auto group relative overflow-hidden text-center"
              >
                <span className="relative z-10">
                  {lang === "ar"
                    ? "انضم لمئات المؤجرين الذين حققوا أرباحاً هذا الأسبوع"
                    : "Join hundreds of landlords who made profits this week"}
                </span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:rtl:-translate-x-1 relative z-10">
                  {lang === "ar" ? "←" : "→"}
                </span>
                <div className="absolute top-0 -start-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:start-[100%]"></div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default IncomeValue;