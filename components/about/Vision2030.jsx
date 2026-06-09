import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";

/* ── Header icon ── */
const FlagIcon = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="17"
    fill="none"
    viewBox="0 0 16 17"
    className={className}
    {...props}
  >
    <path
      fill="#FF8C42"
      d="M10.656 3.125c1.281 0 2.594-.5 3.656-1 .657-.281 1.438.188 1.438.906v7.625c0 .313-.187.625-.437.813-1.126.75-2.344 1.281-3.844 1.281-2.094 0-3.469-1.094-5.156-1.094-1.594 0-2.688.313-3.563.688v2.937a.74.74 0 0 1-.75.75h-.5a.72.72 0 0 1-.75-.75V3.22C.281 2.906 0 2.406 0 1.78 0 .813.813 0 1.813.063c.875.03 1.625.75 1.656 1.625v.125c0 .218-.031.406-.094.625A5.9 5.9 0 0 1 5.5 2.031c2.094 0 3.469 1.094 5.156 1.094"
    />
  </svg>
);

/* ── CTA icon ── */
const ExternalIcon = ({ className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Card 1: Riyadh – location pin ── */
const CityIcon1 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="29"
    fill="none"
    viewBox="0 0 21 29"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M9.406 27.453C1.422 15.97 0 14.766 0 10.5 0 4.703 4.648 0 10.5 0 16.297 0 21 4.703 21 10.5c0 4.266-1.477 5.469-9.46 16.953-.493.766-1.642.766-2.134 0M10.5 14.875a4.353 4.353 0 0 0 4.375-4.375A4.39 4.39 0 0 0 10.5 6.125 4.353 4.353 0 0 0 6.125 10.5c0 2.46 1.914 4.375 4.375 4.375"
    />
  </svg>
);

/* ── Card 2: Jeddah – waves ── */
const CityIcon2 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="22"
    fill="none"
    viewBox="0 0 32 22"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M30.734 17.664c.438.055.766.492.711.93v1.695c0 .492-.383.93-.875.875-1.53-.11-3.062-.602-4.32-1.422-3.008 1.914-7.437 1.914-10.5 0-3.008 1.914-7.437 1.914-10.5 0a9.4 9.4 0 0 1-4.375 1.422C.383 21.22 0 20.781 0 20.29v-1.75c0-.437.273-.82.71-.875a6.2 6.2 0 0 0 3.173-1.203c.765-.602 1.805-.711 2.57-.11 2.078 1.75 5.852 1.75 7.93.11.765-.602 1.805-.711 2.57-.11 2.078 1.75 5.906 1.75 7.985.055a2.135 2.135 0 0 1 2.625 0c.875.711 1.968 1.149 3.171 1.258m0-7.875c.438.055.766.492.711.93v1.695c0 .492-.383.93-.875.875-1.53-.11-3.062-.601-4.32-1.422-3.008 1.914-7.437 1.914-10.5 0-3.008 1.914-7.437 1.914-10.5 0A9.4 9.4 0 0 1 .875 13.29c-.492.055-.875-.383-.875-.875v-1.75c0-.437.273-.82.71-.875a6.2 6.2 0 0 0 3.173-1.203c.765-.602 1.805-.711 2.57-.11 2.078 1.75 5.852 1.75 7.93.11.765-.602 1.805-.711 2.57-.11 2.078 1.75 5.906 1.75 7.985.055a2.135 2.135 0 0 1 2.625 0c.875.711 1.968 1.149 3.171 1.258m0-7.875c.438.055.766.492.711.93v1.695c0 .492-.383.93-.875.875-1.53-.11-3.062-.601-4.32-1.422-3.008 1.914-7.437 1.914-10.5 0-3.008 1.914-7.437 1.914-10.5 0A9.4 9.4 0 0 1 .875 5.414C.383 5.47 0 5.031 0 4.54V2.79c0-.437.273-.82.71-.875A6.2 6.2 0 0 0 3.884.711C4.648.109 5.688 0 6.453.6c2.078 1.75 5.852 1.75 7.93.11.765-.602 1.805-.711 2.57-.11 2.078 1.75 5.906 1.75 7.985.055a2.135 2.135 0 0 1 2.625 0c.875.711 1.968 1.149 3.171 1.258"
    />
  </svg>
);

/* ── Card 3: Dammam – oil derrick ── */
const CityIcon3 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M12 2 L5 20 L19 20 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="12" y1="2" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7.5" y1="10" x2="16.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9.5" y1="15" x2="14.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="10" y="20" width="4" height="2.5" rx="0.5" fill="currentColor" />
    <circle cx="12" cy="5.5" r="1" fill="currentColor" />
  </svg>
);

/* ── Card 4: All Regions – expand/cross ── */
const CityIcon4 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="29"
    height="29"
    fill="none"
    viewBox="0 0 29 29"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M28.063 19.5v7.063c0 .812-.688 1.5-1.5 1.5V28h-7c-1.375 0-2.063-1.562-1.063-2.562l2.25-2.25-6.687-6.688-6.75 6.688 2.312 2.25c.938 1 .25 2.562-1.062 2.562H1.5C.688 28 0 27.375 0 26.563c0 0 .063 0 .063-.063v-7c0-1.312 1.562-2 2.562-1.062l2.25 2.312L11.563 14 4.875 7.313l-2.25 2.25c-1 1-2.562.312-2.562-1.063v-7C.063.688.688 0 1.5 0h7.063c1.312 0 2 1.625 1.062 2.563L7.313 4.874l6.75 6.688 6.687-6.688-2.25-2.312C17.5 1.625 18.188 0 19.563 0h7c.812 0 1.5.688 1.5 1.5v7c0 1.375-1.625 2.063-2.563 1.063l-2.312-2.25L16.5 14l6.688 6.75L25.5 18.5c.938-1 2.563-.312 2.563 1"
    />
  </svg>
);

const cities = [
  { name: "الرياض", nameEn: "Riyadh", desc: "العاصمة وقلب الاقتصاد السعودي", descEn: "Capital & heart of Saudi economy", Icon: CityIcon1 },
  { name: "جدة", nameEn: "Jeddah", desc: "بوابة التجارة والابتكار", descEn: "Gateway of trade and innovation", Icon: CityIcon2 },
  { name: "الدمام", nameEn: "Dammam", desc: "عاصمة النفط والطاقة", descEn: "Capital of oil and energy", Icon: CityIcon3 },
  { name: "جميع المناطق", nameEn: "All Regions", desc: "التغطية الشاملة قريباً", descEn: "Full coverage coming soon", Icon: CityIcon4 },
];

const Vision2030 = ({ translate, lang = "ar" }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`about.vision2030.${text}`);

  const titleRaw = t("title") || "نغطي المملكة.. بروح رؤية 2030";
  const [titlePart1, titlePart2] = titleRaw.includes("..") ? titleRaw.split("..") : [titleRaw, ""];

  return (
    <section id="vision-2030" className="bg-[#F9FAFB] pt-12 pb-10 md:pt-32 md:pb-24 relative overflow-hidden">
      {/* Big ellipse curve at top */}
      <div className="absolute top-0 start-0 end-0 h-[30px] sm:h-[60px] md:h-[110px] bg-white" style={{ clipPath: 'ellipse(65% 100% at 50% 0%)' }} />
      {/* Decorative blobs */}
      <div className="absolute -top-24 -end-24 w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(255,140,66,0.04)_0%,transparent_70%)] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -start-24 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(255,140,66,0.03)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2.5 text-[#FF8C42] font-bold text-xs md:text-sm mb-3 md:mb-5 before:content-[''] before:w-[15px] md:before:w-[30px] before:h-[2px] before:bg-[#FF8C42] after:content-[''] after:w-[15px] md:after:w-[30px] after:h-[2px] after:bg-[#FF8C42]">
            <FlagIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {lang === "ar" ? "رؤيتنا المستقبلية" : "Our Future Vision"}
          </div>
          <h2 className="text-[28px] sm:text-3xl md:text-[46px] font-black text-[#1A1A2E] mb-3 md:mb-4 leading-[1.4] md:leading-[1.25]">
            {titlePart1}..{" "}
            {titlePart2 && <span className="text-[#FF8C42]">{titlePart2.trim()}</span>}
          </h2>
          <p className="text-sm md:text-lg text-gray-500 max-w-[560px] mx-auto leading-[1.8]">
            {lang === "ar"
              ? "نتوسع لنكون الأقرب إليكم في جميع مناطق المملكة"
              : "Expanding to be closest to you across all regions of the Kingdom"}
          </p>
        </div>

        {/* ── City Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10 md:mb-16">
          {cities.map(({ name, nameEn, desc, descEn, Icon }, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden bg-white rounded-[20px] md:rounded-[32px] px-4 py-6 md:px-6 md:py-9 text-center border border-[#FCE6D6]/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(255,140,66,0.12)] hover:border-[#FF8C42]/25"
            >
              {/* Top gradient bar on hover */}
              <div className="absolute top-0 start-0 end-0 h-[3px] bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100" />

              {/* Icon container */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 bg-[#FFF0E6] rounded-[16px] md:rounded-[22px] flex items-center justify-center mx-auto mb-4 md:mb-5 text-[#FF8C42] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#FF8C42] group-hover:to-[#FF6B35] group-hover:text-white group-hover:scale-110 group-hover:-rotate-[5deg]">
                <div className="absolute -inset-1.5 rounded-[20px] md:-inset-2 md:rounded-[28px] border-2 border-dashed border-[rgba(255,140,66,0.18)] animate-[spin_20s_linear_infinite] group-hover:border-[rgba(255,140,66,0.4)] group-hover:animate-[spin_10s_linear_infinite]" />
                <Icon className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
              </div>

              <h4 className="text-[#1A1A2E] text-base md:text-[18px] font-black mb-1.5 md:mb-1">
                {lang === "ar" ? name : nameEn}
              </h4>
              <p className="text-gray-400 text-[11px] sm:text-xs md:text-sm leading-snug">
                {lang === "ar" ? desc : descEn}
              </p>
            </div>
          ))}
        </div>

        {/* ── Quote Block ── */}
        <div className="max-w-[680px] mx-auto mb-10 md:mb-14">
          <div className="bg-[#FFF8F3] border border-[#FFE4CC] rounded-[24px] md:rounded-2xl px-6 py-8 md:px-10 md:py-9 relative overflow-hidden shadow-[0_4px_24px_rgba(255,140,66,0.04)]">
            {/* Decorative quote mark */}
            <span
              className="absolute top-0 end-3 text-[60px] md:text-[110px] font-black text-[#FF8C42]/10 leading-none select-none pointer-events-none"
              aria-hidden="true"
            >"</span>
            <p className="text-sm md:text-[17px] text-gray-600 leading-[1.8] md:leading-[1.9] relative z-10 text-start">
              {lang === "ar" ? (
                <>
                  نسعى لترسيخ مكانتنا كـ{" "}
                  <strong className="text-[#FF8C42] font-bold">أفضل منصة للإيجار في السعودية</strong>{" "}
                  تقود مستقبلاً اقتصادياً مشرقاً. فخورون بكوننا نموذجاً وطنياً يترجم &quot;رؤية السعودية 2030&quot; في التحول الرقمي.
                </>
              ) : (
                <>
                  We strive to establish ourselves as the{" "}
                  <strong className="text-[#FF8C42] font-bold">best rental platform in Saudi Arabia</strong>{" "}
                  leading a bright economic future. Proud to be a national model translating &quot;Saudi Vision 2030&quot; in digital transformation.
                </>
              )}
            </p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center">
          <Link
            href={lang === "ar" ? "/" : "/en"}
            className="inline-flex items-center justify-center gap-2.5 bg-primary text-white px-8 py-4 md:px-12 md:py-5 rounded-full font-bold text-sm md:text-[16px] shadow-xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/45 relative overflow-hidden group w-full sm:w-auto"
          >
            <span className="relative z-10">
              {lang === "ar" ? "تصفح منصة استاجر الآن" : "Browse Estajer Now"}
            </span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:rtl:-translate-x-1 font-bold relative z-10">
              {lang === "ar" ? "←" : "→"}
            </span>
            <div className="absolute top-0 -start-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:start-[100%]"></div>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Vision2030;
