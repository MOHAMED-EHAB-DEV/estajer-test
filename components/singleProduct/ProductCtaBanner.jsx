"use client";
import { Cloud } from "@/components/ui/svgs/icons/CloudSvg";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "../ui/Button";

/* Calendar icon */
const CalendarIcon = () => (
  <svg
    viewBox="0 0 448 512"
    fill="currentColor"
    className="w-4 md:w-[18px] h-4 md:h-[18px]"
  >
    <path d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 48L0 160l0-48C0 85.5 21.5 64 48 64l48 0 0-32c0-17.7 14.3-32 32-32zM0 192l448 0 0 272c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 192zm64 80l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16zm128 0l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0z" />
  </svg>
);

const ArrowIcon = ({ lang }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${lang === "ar" ? "rotate-180 group-hover:translate-x-0" : ""}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

export default function ProductCtaBanner({ lang, product, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`product.ctaBanner.${key}`);

  const name = product?.name || "";
  const city = product?.address?.city || "";

  const handleScrollToOrder = () => {
    const el = document.getElementById("order-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // After scroll, focus the first interactive element
      setTimeout(() => {
        const firstInput = el.querySelector("button, input, select");
        if (firstInput) firstInput.focus({ preventScroll: true });
      }, 600);
    }
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#FFF9F0" }}
      aria-label={t("ariaLabel")}
    >
      <div className="max-w-screen-2xl mx-auto lg:px-6 px-4">
        {/* Decorative clouds */}
        <Cloud
          className="absolute -bottom-1 -start-6 opacity-60 pointer-events-none select-none"
          width={220}
          height={70}
          fill="#FCE7C5"
        />
        <Cloud
          className="absolute -bottom-1 end-0 opacity-40 pointer-events-none select-none scale-x-[-1]"
          width={180}
          height={58}
          fill="#FDDDB4"
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 px-6 py-8 md:px-14 md:py-24">
          {/* Text block */}
          <div className="text-center md:mb-4">
            <p className="inline-flex items-center gap-1 px-4 md:px-5 py-1 md:py-1.5 rounded-full border border-primary/20 bg-[#FFF9F5] text-primary text-xs md:text-sm font-IBMPlex font-bold text-primary/80 tracking-widest uppercase mb-4">
              {t("eyebrow")}
            </p>
            <h2 className="text-[1.3rem] md:text-[2rem] font-bold text-darkNavy mb-2 md:mb-4">
              {t("heading").replace("{name}", name).replace("{city}", city)}
            </h2>
            <p className="text-gray-500 text-xs md:text-base">
              {t("subheading").replace("{name}", name)}
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onPress={handleScrollToOrder}
            className="font-semibold md:py-7 py-4 px-10 transition-all duration-300"
          >
            <CalendarIcon />
            <span>{t("cta")}</span>
            <ArrowIcon lang={lang} />
          </Button>
        </div>
      </div>
    </section>
  );
}
