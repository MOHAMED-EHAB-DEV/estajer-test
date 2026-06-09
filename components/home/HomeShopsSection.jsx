import Image from "next/image";
import Link from "next/link";
import ShopsCarousel from "./ShopsCarousel";
import { Cloud } from "../ui/svgs/icons/CloudSvg";

// ── Main export — receives shops as prop (fetched server-side in page.jsx) ──
export default function HomeShopsSection({ shops = [], lang }) {
  if (!shops.length) return null;
  const isRtl = lang === "ar";
  const shopsHref = `/${lang === "ar" ? "" : "en/"}rent-flow`;

  return (
    <section
      className="relative overflow-hidden bg-[#FFF9F0] py-10 md:py-24"
      aria-labelledby="home-shops-heading"
    >
      <div className="max-w-screen-3xl w-full relative m-auto">
        <div
          className="absolute md:-top-20 -top-12 md:end-4 -end-6"
          aria-hidden="true"
        >
          <div {...(lang === "ar" ? { className: "-scale-x-100 w-max" } : {})}>
            <Cloud className="md:w-96 w-64" />
          </div>
        </div>
      </div>
      <div className="relative z-10 max-w-screen-2xl mx-auto md:px-8">
        {/* ── Two-column layout: headline | carousel ── */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-0">
          {/* LEFT — premium light editorial panel */}
          <div className="lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col justify-between rounded-3xl lg:rounded-e-none px-4 md:p-10 md:border-y border-s border-neutral-100 md:shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] md:bg-gradient-to-br from-white to-[#fffbf5]">
            {/* Top content */}
            <div>
              {/* Small label */}
              <p className="hidden md:flex text-orange-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 md:mb-6 items-center gap-1 md:gap-3">
                <span className="md:w-8 w-2 h-px bg-orange-200 inline-block" />
                {isRtl ? "متاجر موثقة" : "Verified Shops"}
              </p>

              {/* Headline */}
              <h2
                id="home-shops-heading"
                className="flex gap-[6px] md:block font-black leading-[1.15] tracking-tight text-darkNavy"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)" }}
              >
                {isRtl ? (
                  <>
                    اكتشف
                    <br />
                    <span
                      className="relative inline-block"
                      style={{
                        background:
                          "linear-gradient(135deg,#F97316 0%,#fb9f24 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      أفضل المتاجر
                    </span>
                  </>
                ) : (
                  <>
                    Rent from
                    <br />
                    <span
                      className="relative inline-block"
                      style={{
                        background:
                          "linear-gradient(135deg,#F97316 0%,#fb9f24 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      our best shops
                    </span>
                  </>
                )}
              </h2>

              <p className="hidden md:block mt-4 md:mt-6 text-neutral-500 text-sm md:text-[15px] leading-relaxed font-medium">
                {isRtl
                  ? "تصفح آلاف المنتجات من متاجرنا الموثقة التي تضمن لك الجودة والأمان في كل عملية تأجير."
                  : "Explore thousands of quality products from our verified shops, ensuring safety and trust in every rental."}
              </p>
            </div>

            {/* Bottom CTA — Desktop Only */}
            <div className="mt-8 md:mt-12 hidden lg:block">
              <Link
                href={shopsHref}
                className="group/cta inline-flex w-full items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white px-5 py-3.5 md:px-6 md:py-4 rounded-full text-sm font-black shadow-xl shadow-orange-500/25 transition-all duration-300"
              >
                {isRtl ? "ابدأ متجرك الان" : "Start your shop now"}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isRtl
                      ? "rotate-180 group-hover/cta:-translate-x-1"
                      : "group-hover/cta:translate-x-1"
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* RdivT — carousel */}
          <div className="flex-1 min-w-0 overflow-hidden rounded-3xl lg:rounded-s-none md:bg-white/60 md:backdrop-blur-sm md:border md:border-white/80">
            <ShopsCarousel shops={shops} lang={lang} />
          </div>

          {/* Bottom CTA — Mobile Only */}
          <div className="mt-4 px-4 lg:hidden">
            <Link
              href={shopsHref}
              className="group/cta inline-flex w-full items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white px-5 py-3.5 md:px-6 md:py-4 rounded-full text-sm font-black shadow-xl shadow-orange-500/25 transition-all duration-300"
            >
              {isRtl ? "ابدأ متجرك الان" : "Start your shop now"}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-4 h-4 transition-transform duration-300 ${
                  isRtl
                    ? "rotate-180 group-hover/cta:-translate-x-1"
                    : "group-hover/cta:translate-x-1"
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
