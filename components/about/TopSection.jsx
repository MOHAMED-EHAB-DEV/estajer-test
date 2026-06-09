import { Sparkles } from "@/components/ui/svgs/icons/SparklesSvg";
import Link from "next/link";

/* ── First Floating Label Icon (User Group) ── */
const FloatIcon1 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="16"
    fill="none"
    viewBox="0 0 25 16"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M16.953 0c.352 0 .664.156.899.39L19.96 2.5v7.578c-.078-.117-.195-.195-.273-.312l-5.704-4.61L15 4.22a.58.58 0 0 0 .04-.86c-.235-.273-.626-.273-.9-.039l-3.085 2.852h-.04c-.663.586-1.68.43-2.187-.117-.547-.586-.547-1.563.078-2.188L12.773.352q.352-.352.82-.352zm4.297 2.54H25v10h-2.5c-.703 0-1.25-.587-1.25-1.25zm1.875 8.75c.313 0 .625-.313.625-.626a.64.64 0 0 0-.625-.625.617.617 0 0 0-.625.625c0 .313.273.625.625.625M0 12.5V2.54h3.75v8.71c0 .703-.586 1.25-1.25 1.25zm1.875-2.46a.617.617 0 0 0-.625.624c0 .313.273.625.625.625.313 0 .625-.312.625-.625a.64.64 0 0 0-.625-.625m16.992.702c.547.43.625 1.211.195 1.758l-.351.469c-.469.547-1.25.625-1.758.195l-.234-.195-1.211 1.523c-.508.625-1.445.703-2.07.195l-.665-.585h-.039a2.484 2.484 0 0 1-3.515.351L5.703 11.25H5V2.5L7.11.39c.234-.234.546-.39.898-.39h3.281L8.086 2.93C6.953 3.984 6.875 5.78 7.89 6.914c1.054 1.133 2.812 1.25 3.984.156l1.172-1.054z"
    />
  </svg>
);

/* ── Second Floating Label Icon (Handshake) ── */
const FloatIcon2 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="18"
    fill="none"
    viewBox="0 0 25 18"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M3.75 7.5A2.47 2.47 0 0 1 1.25 5c0-1.367 1.094-2.5 2.5-2.5 1.367 0 2.5 1.133 2.5 2.5 0 1.406-1.133 2.5-2.5 2.5m17.5 0a2.47 2.47 0 0 1-2.5-2.5c0-1.367 1.094-2.5 2.5-2.5 1.367 0 2.5 1.133 2.5 2.5 0 1.406-1.133 2.5-2.5 2.5m1.25 1.25c1.367 0 2.5 1.133 2.5 2.5v1.25c0 .703-.586 1.25-1.25 1.25h-2.578c-.274-1.836-1.367-3.398-2.969-4.258.469-.43 1.094-.742 1.797-.742zm-10 0a4.37 4.37 0 0 1-4.375-4.375C8.125 1.992 10.078 0 12.5 0c2.383 0 4.375 1.992 4.375 4.375 0 2.422-1.992 4.375-4.375 4.375M15.469 10c2.5 0 4.531 2.031 4.531 4.531v1.094c0 1.055-.86 1.875-1.875 1.875H6.875A1.85 1.85 0 0 1 5 15.625v-1.094C5 12.031 6.992 10 9.492 10h.313c.82.39 1.718.625 2.695.625.938 0 1.836-.234 2.656-.625zm-8.711-.508c-1.602.86-2.695 2.422-2.969 4.258H1.25C.547 13.75 0 13.203 0 12.5v-1.25c0-1.367 1.094-2.5 2.5-2.5H5c.664 0 1.29.313 1.758.742"
    />
  </svg>
);

export function TopSection({ t, lang = "ar" }) {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10 w-full mt-4 lg:mt-10">
      <div className="animate-[fadeInRight_1s_ease-out]">
        <div className="inline-flex items-center gap-2 bg-[rgba(255,140,66,0.15)] border border-[rgba(255,140,66,0.3)] px-3.5 py-1.5 md:px-5 md:py-2 rounded-full text-[#FF8C42] text-[11px] md:text-sm font-semibold mb-4 md:mb-6 animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 animate-[pulse_2s_ease-in-out_infinite]" />
          منصة استأجر - الاقتصاد التشاركي
        </div>
        <h1 className="text-[22px] sm:text-[30px] md:text-[42px] lg:text-[52px] font-black text-[#1A1A2E] leading-[1.3] mb-3 md:mb-4 animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
          {t("description1").split("..")[0]}..<br />
          <span className="mt-2 md:mt-3 text-[#FF8C42] relative inline-block after:content-[''] after:absolute after:-bottom-[12px] after:end-0 after:w-full after:h-[4px] after:bg-[#FF8C42] after:-z-10 after:rounded-sm">
            {t("description1").split("..")[1]?.trim()}
          </span>
        </h1>
        <p className="text-[15px] md:text-lg text-[#666] mb-6 md:mb-9 max-w-[520px] leading-[1.8] md:leading-[1.9] animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
          {t("description2")}
        </p>
        <div className="flex flex-wrap gap-3 md:gap-4 animate-[fadeInUp_0.8s_ease-out_0.8s_both]">
          <Link
            href={lang === "ar" ? "/search/products" : "/en/search/products"}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 md:px-9 md:py-4 rounded-full font-bold text-sm md:text-base shadow-xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/45 relative overflow-hidden group w-full sm:w-auto"
          >
            {t("exploreProducts")}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:rtl:-translate-x-1 font-bold">
              {lang === "ar" ? "←" : "→"}
            </span>
            <div className="absolute top-0 -start-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:start-[100%]"></div>
          </Link>
        </div>
      </div>

      <div className="relative animate-[fadeInLeft_1s_ease-out_0.3s_both] lg:order-last order-first mt-6 lg:mt-0">
        <div className="grid grid-cols-3 grid-rows-4 gap-2 md:gap-3 h-[320px] md:h-[520px]">
          {/* Photo 1: Col 1, R1-2 (Tall) */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden relative shadow-lg transition-all hover:scale-105 hover:-translate-y-1 hover:z-10 group col-start-1 col-end-2 row-start-1 row-end-3">
            <img src="https://res.cloudinary.com/dhfzkadm2/image/upload/v1779275097/1748960928873_dyk6tu.webp" alt="Hero 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>

          {/* Photo 3: Col 2-3, R1 (Wide) */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden relative shadow-lg transition-all hover:scale-105 hover:-translate-y-1 hover:z-10 group col-start-2 col-end-4 row-start-1 row-end-2">
            <img src="https://res.cloudinary.com/dhfzkadm2/image/upload/v1779275097/1754489840503_zdyysy.webp" alt="Hero 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>

          {/* Logo: Col 2, R2-3 (Center) */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(255,140,66,0.12)] bg-white/95 backdrop-blur border border-[#FF8C42]/20 flex items-center justify-center p-3 md:p-5 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(255,140,66,0.22)] hover:border-[#FF8C42]/40 hover:-translate-y-1 hover:z-10 group col-start-2 col-end-3 row-start-2 row-end-4">
            <img src="https://res.cloudinary.com/dhfzkadm2/image/upload/v1779275096/logo_rfpe1x.webp" alt="Estajer Logo" className="w-full h-full object-contain max-h-[85%] transition-transform duration-500 group-hover:scale-110" />
          </div>

          {/* Photo 5: Col 3, R2-4 (Tall) */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden relative shadow-lg transition-all hover:scale-105 hover:-translate-y-1 hover:z-10 group col-start-3 col-end-4 row-start-2 row-end-5">
            <img src="https://res.cloudinary.com/dhfzkadm2/image/upload/v1779275098/1759657560894_tawvok.webp" alt="Hero 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>

          {/* Photo 2: Col 1, R3-4 (Tall) */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden relative shadow-lg transition-all hover:scale-105 hover:-translate-y-1 hover:z-10 group col-start-1 col-end-2 row-start-3 row-end-5">
            <img src="https://res.cloudinary.com/dhfzkadm2/image/upload/v1779275097/1758111785584_raaaah.webp" alt="Hero 4" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>

          {/* Photo 4: Col 2, R4 (Small) */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden relative shadow-lg transition-all hover:scale-105 hover:-translate-y-1 hover:z-10 group col-start-2 col-end-3 row-start-4 row-end-5">
            <img src="https://res.cloudinary.com/dhfzkadm2/image/upload/v1779275097/1739199601759_rtxblr.webp" alt="Hero 5" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>
        </div>

        {/* Floating Label 1 (50k+ Active Users) */}
        <div className="absolute bg-white px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-xl flex items-center gap-2 md:gap-3 animate-[float_5s_ease-in-out_infinite] top-[5%] md:top-[10%] -start-[10px] md:-start-[30px] z-20 scale-90 md:scale-100 origin-start">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFF0E6] rounded-xl flex items-center justify-center text-[#FF8C42]">
            <FloatIcon1 className="w-5 h-5 md:w-6 md:h-6 text-[#FF8C42]" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-black text-[#1A1A2E] text-start">50,000+</h4>
            <p className="text-[11px] md:text-[13px] text-[#999]">مستخدم نشط</p>
          </div>
        </div>

        {/* Floating Label 2 (25k+ Successful Transactions) */}
        <div className="absolute bg-white px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-xl flex items-center gap-2 md:gap-3 animate-[float_5s_ease-in-out_infinite] bottom-[10%] md:bottom-[15%] -end-[5px] md:-end-[20px] z-20 scale-90 md:scale-100 origin-end" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFF0E6] rounded-xl flex items-center justify-center text-[#FF8C42]">
            <FloatIcon2 className="w-5 h-5 md:w-6 md:h-6 text-[#FF8C42]" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-black text-[#1A1A2E] text-start">25,000+</h4>
            <p className="text-[11px] md:text-[13px] text-[#999]">صفقة ناجحة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
