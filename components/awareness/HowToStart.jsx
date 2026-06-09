"use client";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "../ui/Button";
import Link from "next/link";
import { Cloud } from "../ui/svgs/icons/CloudSvg";

const UserIcon = () => (
  <svg className="w-7 h-7 md:w-9 md:h-9" fill="none" viewBox="0 0 40 40">
    <path
      fill="#fff"
      d="M19.999 16.667a6.667 6.667 0 1 0 0-13.334 6.667 6.667 0 0 0 0 13.334M33.335 29.167c0 4.141 0 7.5-13.334 7.5s-13.333-3.359-13.333-7.5c0-4.142 5.97-7.5 13.333-7.5s13.334 3.358 13.334 7.5"
    />
  </svg>
);

const ShopIcon = () => (
  <svg
    className="w-[26px] h-5 md:w-[34px] md:h-[27px]"
    fill="none"
    viewBox="0 0 37 29"
  >
    <path
      fill="#fff"
      d="M34.987 6.694c1.856 3.037.169 7.2-3.319 7.65-.281.056-.506.056-.787.056a5.56 5.56 0 0 1-4.163-1.856 5.56 5.56 0 0 1-4.163 1.856 5.65 5.65 0 0 1-4.162-1.856c-1.012 1.125-2.475 1.856-4.106 1.856a5.56 5.56 0 0 1-4.163-1.856A5.56 5.56 0 0 1 5.962 14.4c-.282 0-.507 0-.788-.056C1.687 13.894 0 9.73 1.912 6.694l3.6-5.85A1.95 1.95 0 0 1 7.087 0h22.725c.618 0 1.181.337 1.518.844zM30.88 16.2c.338 0 .675 0 1.013-.056.337 0 .619-.113.956-.169V27c0 1.012-.843 1.8-1.8 1.8H5.85c-1.012 0-1.8-.788-1.8-1.8V15.975c.281.056.563.112.9.169.338.056.675.056 1.013.056q.843 0 1.687-.169V21.6h21.6v-5.569a7.6 7.6 0 0 0 1.632.169"
    />
  </svg>
);

const ChecklistIcon = () => (
  <svg
    className="w-7 h-7 md:w-[35px] md:h-[35px]"
    fill="none"
    viewBox="0 0 40 40"
  >
    <path
      fill="#fff"
      d="M6.25 1.25A1.25 1.25 0 0 0 5 2.5v35a1.25 1.25 0 0 0 1.25 1.25h27.5A1.25 1.25 0 0 0 35 37.5V12.502H24.998a1.25 1.25 0 0 1-1.246-1.254V1.25zm20.002.735v8.017h8.018zM13.628 15.002q.06-.003.12 0h12.504a1.252 1.252 0 0 1 0 2.503H13.748a1.253 1.253 0 0 1-.12-2.503m.068 7.493h12.556a1.251 1.251 0 1 1 0 2.503H13.748a1.251 1.251 0 1 1-.052-2.503m.052 7.503h12.504a1.25 1.25 0 1 1 0 2.5H13.748a1.252 1.252 0 0 1-1.18-1.735 1.25 1.25 0 0 1 1.18-.765"
    ></path>
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-7 h-7 md:w-9 md:h-9" fill="none" viewBox="0 0 40 40">
    <path
      fill="#fff"
      d="m38.333 20-4.067-4.65.567-6.15-6.017-1.367-3.15-5.333-5.667 2.433L14.333 2.5l-3.15 5.317-6.017 1.35.567 6.166L1.666 20l4.067 4.65-.567 6.167 6.017 1.366 3.15 5.317 5.666-2.45 5.667 2.433 3.15-5.316 6.017-1.367-.567-6.15zm-22.7 6.683-3.967-4a1.66 1.66 0 0 1 0-2.35l.117-.116a1.68 1.68 0 0 1 2.366 0l2.684 2.7 8.583-8.6a1.68 1.68 0 0 1 2.367 0l.116.116c.65.65.65 1.7 0 2.35l-9.866 9.9a1.72 1.72 0 0 1-2.4 0"
    />
  </svg>
);

const stepIcons = [UserIcon, ShopIcon, ChecklistIcon, SuccessIcon];

const HowToStart = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`awareness.howToStart.${text}`);
  const steps = trans("awareness.howToStart.steps");

  return (
    <section className="my-8 md:my-12 pt-0 pb-12 md:pb-24 bg-[#FFF9F0] relative overflow-hidden">
      {/* Cloud decoration matching home WhyEstajer section */}
      <div
        className={`absolute -top-15 ${lang === "ar" ? "left-2" : "right-8"} pointer-events-none opacity-80`}
        aria-hidden="true"
      >
        <div {...(lang === "ar" ? { className: "-scale-x-100 w-max" } : {})}>
          <Cloud className="w-[200px] md:w-[350px] h-auto" />
        </div>
      </div>

      <div className="pt-16 md:pt-24 max-w-screen-xl mx-auto px-4 md:px-8 relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-12 md:mb-24">
          <p className="text-primary font-IBMPlex font-bold text-lg md:text-2xl mb-4 tracking-normal">
            {t("label")}
          </p>
          <h2 className="font-IBMPlex font-bold lg:text-[2.2rem] md:text-[1.8rem] text-[1.3rem] text-darkNavy mb-4 leading-tight">
            {t("title")}
          </h2>
          <p className="text-[#5B5656] text-xs md:text-base font-IBMPlex">
            {t("description")}
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 md:flex md:flex-row justify-between items-start md:gap-y-10 gap-y-8 gap-x-4 md:gap-4 relative mb-10 md:mb-20 max-w-5xl mx-auto w-full">
          {/* Connecting line */}
          <div className="absolute top-[42px] start-[10%] end-[10%] h-[2px] bg-[#EBE0D4] hidden md:block" />

          {Array.isArray(steps) &&
            steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center flex-1 z-10 md:w-auto md:px-2"
                >
                  <div className="group relative mb-6">
                    {/* Icon circle */}
                    <div className="w-[64px] h-[64px] md:w-[84px] md:h-[84px] bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(244,138,66,0.35)] transition-transform duration-500 hover:-translate-y-1 relative overflow-hidden">
                      <Icon />
                    </div>
                  </div>
                  <div className="max-w-[180px] md:max-w-[200px]">
                    <h3 className="font-IBMPlex font-bold text-base md:text-[1.1rem] text-darkNavy mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-[#5B5656] text-[11px] md:text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-8 md:mt-10">
          <Button
            as={Link}
            href={`/${lang}/pricing`}
            className="md:text-lg text-sm py-4 md:py-7 px-8 md:px-14 flex items-center justify-center gap-3 font-IBMPlex font-bold shadow-[0_15px_30px_-8px_rgba(244,138,66,0.4)] active:scale-95 transition-all duration-300 rounded-full"
          >
            {t("action")}
            <span className="font-black text-xl leading-none -mt-1">
              {lang === "ar" ? "←" : "→"}
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowToStart;
