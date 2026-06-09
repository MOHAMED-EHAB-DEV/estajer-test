"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

const Cloud1 = () => (
  <svg
    width="391"
    height="125"
    fill="none"
    viewBox="0 0 391 125"
    className="w-[200px] md:w-[320px] lg:w-[391px]"
  >
    <path
      fill="#FDE2CC"
      d="M377.372 101.349c-16.934-9.21-24.626-1.543-30.818-9.21-6.145-7.667 16.933-27.63-29.271-47.593 0 0-3.096-42.964-66.233-44.507s-46.204 42.965-63.138 53.718-21.577-6.125-38.511 4.628-9.241 32.258-23.126 35.297c-13.884 3.086-32.366-13.838-49.3-3.085s-16.933 19.962-24.626 19.962-23.125-6.124-32.366 0c-9.241 6.125-20.03 13.839-20.03 13.839h389.662s4.597-13.839-12.337-23.049z"
    ></path>
  </svg>
);

const ChartIcon = () => (
  <svg width="25" height="26" fill="none" viewBox="0 0 25 26">
    <path
      fill="#FB923C"
      d="M21.875 19.5c.313 0 .625.313.625.625v1.25a.64.64 0 0 1-.625.625H3.75c-.703 0-1.25-.547-1.25-1.25V7.625c0-.312.273-.625.625-.625h1.25c.313 0 .625.313.625.625V19.5zm-1.25-11.25c.313 0 .625.313.586.625v4.648c0 .82-.977 1.25-1.563.665l-1.289-1.29-3.75 3.75a1.205 1.205 0 0 1-1.757 0L10 13.797l-1.836 1.797a.613.613 0 0 1-.86 0l-.898-.899a.613.613 0 0 1 0-.86l2.696-2.694a1.205 1.205 0 0 1 1.757 0l2.891 2.851 2.852-2.851-1.29-1.29c-.585-.585-.156-1.601.665-1.601z"
    ></path>
  </svg>
);

const RocketIcon = () => (
  <svg width="30" height="30" fill="none" viewBox="0 0 30 30">
    <g fill="#F48A42" clipPath="url(#rocketClip)">
      <path d="M29.145 1.138a.48.48 0 0 0-.283-.283c-6.92-2.55-11.737 1.246-13.487 2.996-1.143 1.143-2.87 3.506-4.52 5.97-1.091-.117-2.653-.167-4.306.169-1.966.399-3.608 1.245-4.879 2.516a.483.483 0 0 0 .126.767l5.66 2.81.52.52-1.43.476a.483.483 0 0 0-.187.792l5.77 5.77a.483.483 0 0 0 .792-.186l.476-1.43.52.519 2.81 5.66a.483.483 0 0 0 .767.126c2.883-2.883 2.922-6.98 2.685-9.185 2.464-1.65 4.827-3.376 5.97-4.52 1.75-1.75 5.545-6.567 2.996-13.487m-.822.54c1.302 3.712.633 6.758-.464 8.962l-1.133-1.133a5.07 5.07 0 0 0-1.298-4.935 5.07 5.07 0 0 0-4.936-1.298L19.36 2.14c2.204-1.097 5.25-1.766 8.963-.463m-3.571 9.386a4.1 4.1 0 0 1-2.908 1.202 4.1 4.1 0 0 1-2.908-1.202 4.117 4.117 0 0 1 0-5.816 4.117 4.117 0 0 1 5.816 0 4.117 4.117 0 0 1 0 5.816M7.55 15.063l-4.706-2.337c2.338-1.96 5.386-2.15 7.41-2a105 105 0 0 0-2.704 4.337m4.707 7.355-4.676-4.676 1.15-.383 3.91 3.91zm5.016 4.737-2.337-4.706c1.248-.73 2.784-1.686 4.336-2.704.144 1.966-.027 5.054-2 7.41m3.281-9.423-2.757-2.757a.478.478 0 0 0-.676.676l2.628 2.628a107 107 0 0 1-5.362 3.384l-6.05-6.05c.894-1.531 2.125-3.488 3.384-5.362l3.822 3.822a.478.478 0 0 0 .677-.676l-3.953-3.952q.316-.462.628-.905l8.564 8.564a94 94 0 0 1-.905.628m1.695-1.19L13.46 7.75c.996-1.38 1.917-2.547 2.592-3.223a13 13 0 0 1 2.437-1.906l1.031 1.032a5.074 5.074 0 0 0-1.26 8.088 5.05 5.05 0 0 0 3.585 1.481 5.05 5.05 0 0 0 4.503-2.741l1.032 1.031a13 13 0 0 1-1.906 2.437c-.676.675-1.843 1.596-3.223 2.592"></path>
      <path d="M24.345 5.654a.478.478 0 0 0-.676.676c.488.488.756 1.136.756 1.826s-.268 1.338-.756 1.826a2.57 2.57 0 0 1-1.826.756c-.69 0-1.338-.269-1.825-.756a2.585 2.585 0 0 1 0-3.652 2.6 2.6 0 0 1 1.94-.754.477.477 0 1 0 .043-.955 3.55 3.55 0 0 0-2.66 1.033 3.54 3.54 0 0 0 0 5.004 3.53 3.53 0 0 0 2.502 1.035c.906 0 1.813-.345 2.502-1.035a3.52 3.52 0 0 0 1.037-2.502c0-.945-.368-1.834-1.037-2.502"></path>
      <path d="M22.925 8.921a.765.765 0 1 0 0-1.53.765.765 0 0 0 0 1.53M7.669 22.331a4.053 4.053 0 0 0-5.726 0 .478.478 0 1 0 .676.677 3.096 3.096 0 0 1 4.373 0c.584.584.906 1.36.906 2.186s-.322 1.602-.906 2.186c-.926.927-4.235 1.436-5.984 1.614.098-.944.342-2.887.814-4.381a.478.478 0 0 0-.912-.288C.233 26.469.01 29.364 0 29.486a.483.483 0 0 0 .513.512c.577-.043 5.678-.464 7.155-1.941a4.02 4.02 0 0 0 1.185-2.863A4.02 4.02 0 0 0 7.67 22.33"></path>
      <path d="M6.948 23.053a2.01 2.01 0 0 0-2.84 0c-.653.652-1.418 3.292-1.565 3.815a.482.482 0 0 0 .59.59c.522-.147 3.162-.912 3.815-1.565.38-.38.588-.884.588-1.42 0-.537-.209-1.041-.588-1.42m-.373 1.521c-.023.242-.132.47-.303.642-.276.276-1.473.725-2.556 1.068.343-1.082.792-2.28 1.068-2.555a1.06 1.06 0 0 1 1.196-.206c.397.189.637.615.595 1.052"></path>
    </g>
    <defs>
      <clipPath id="rocketClip">
        <path fill="#fff" d="M0 0h30v30H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

const SecurityIcon = () => (
  <svg width="35" height="35" fill="none" viewBox="0 0 35 35">
    <g clipPath="url(#secClip)">
      <path
        fill="#F48A42"
        d="M33.542 7.58c-.185 4.246-.086 14.316-7.262 21.43.171-.663.26-1.345.262-2.03 0-.122-.013-.24-.017-.36 5.09-6.078 5.37-13.868 5.527-18.2l.032-.88q-.65.075-1.304.076c-4.757 0-9.215-2.913-11.092-4.32-1.877 1.407-6.336 4.318-11.093 4.32q-.654 0-1.303-.076l.032.88c.049 1.326.116 2.989.321 4.818a5.8 5.8 0 0 0-1.403.476c-.306-2.493-.344-4.666-.408-6.133V5.746c6.532 2.06 13.824-4.288 13.824-4.288l.03.025.03-.025s7.292 6.349 13.824 4.288zm-21.86 24.504H2.917v-2.188a3.65 3.65 0 0 1 3.646-3.646h3.39q.068-.741.266-1.458H6.563a5.11 5.11 0 0 0-5.104 5.104v3.646h11.687a8.4 8.4 0 0 1-1.464-1.459M4.376 18.958a4.375 4.375 0 0 1 8.75 0 4.3 4.3 0 0 1-.406 1.813 8.4 8.4 0 0 0-1.538 1.822 4.372 4.372 0 0 1-6.806-3.634m1.458 0a2.916 2.916 0 1 0 5.833 0 2.916 2.916 0 0 0-5.833 0M18.23 33.543a6.562 6.562 0 1 1 6.562-6.563 6.57 6.57 0 0 1-6.562 6.563m0-1.459a5.104 5.104 0 1 0-5.104-5.104 5.11 5.11 0 0 0 5.104 5.105m-2.122-5.637a2.194 2.194 0 0 1 2.327-1.645l.133-1.453a3.655 3.655 0 0 0-3.876 2.745zm.575 2.08-1.031 1.032a3.646 3.646 0 0 0 5.928-4.018l-1.34.576a2.188 2.188 0 0 1-3.557 2.41"
      ></path>
    </g>
    <defs>
      <clipPath id="secClip">
        <path fill="#fff" d="M0 0h35v35H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

const CheckMark = () => (
  <svg
    className="w-4 h-4 text-[#F97316] flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ICONS = [ChartIcon, RocketIcon, SecurityIcon];

const CommissionBenefits = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.commissionBenefits.${key}`);
  const bullets = trans("marketing.commissionBenefits.bullets");
  const cards = trans("marketing.commissionBenefits.cards");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    direction: lang === "ar" ? "rtl" : "ltr",
    align: "center",
    slidesToScroll: 1,
    dragFree: false,
    breakpoints: {
      "(min-width: 1024px)": {
        active: false,
      },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("init", onInit);
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    onInit();
    onSelect();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  return (
    <section
      className="bg-[#FFF9F0] font-sans overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="py-16 md:py-28 relative">
        {/* Cloud: top-right */}
        <div className="absolute top-0 md:top-10 right-0 pointer-events-none z-0 md:block hidden ">
          <Cloud1 />
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-[2.25rem] font-bold text-[#1F2937] leading-[1.2] mb-6 md:mb-10 text-center mx-auto max-w-4xl">
              {t("title")
                .split(/(\{titleHighlight\})/)
                .map((part, i) =>
                  part === "{titleHighlight}" ? (
                    <span key={i} className="text-[#F97316]">
                      {t("titleHighlight")}
                    </span>
                  ) : (
                    part
                  ),
                )}{" "}
            </h2>
            <p className="text-[#6B7280] text-base md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              {Array.isArray(bullets) ? bullets.join(" • ") : t("calcSubtitle")}
            </p>
          </div>

          {/* Embla Viewport */}
          <div
            className="overflow-hidden lg:overflow-visible w-full"
            ref={emblaRef}
          >
            <div className="flex lg:grid lg:grid-cols-3 gap-5 md:gap-8 pb-6 pt-4 md:pt-0 lg:pb-0 cursor-grab active:cursor-grabbing lg:cursor-auto lg:active:cursor-auto w-full">
              {Array.isArray(cards) &&
                cards.map((card, idx) => {
                  const Icon = ICONS[idx];
                  return (
                    <div
                      key={idx}
                      className="relative bg-white border border-[#F0E0CE] rounded-[24px] md:rounded-[28px] py-4 px-6 md:p-8 flex flex-col text-start shadow-sm hover:shadow-xl hover:scale-[1.03] hover:border-[#F97316]/50 transition-all duration-300 cursor-default flex-[0_0_85%] sm:flex-[0_0_60%] lg:flex-none min-w-0"
                    >
                      {card.badge && (
                        <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-[#F97316] text-white px-5 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                          {card.badge}
                        </div>
                      )}
                      <div className="w-10 md:w-12 h-10 md:h-12 bg-[#FFF5EC] rounded-2xl flex items-center justify-center mb-3 md:mb-5 flex-shrink-0">
                        {Icon && <Icon />}
                      </div>
                      <p className="text-[#F97316] text-sm font-bold mb-1 md:mb-1.5">
                        {card.label}
                      </p>
                      <h3 className="text-base md:text-xl font-black text-[#1F2937] mb-2 md:mb-3 leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] mb-2 md:mb-5 leading-relaxed">
                        {card.desc}
                      </p>
                      <ul className="space-y-2.5 mt-2 md:mt-auto">
                        {Array.isArray(card.features) &&
                          card.features.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-1 text-[13px] md:text-sm text-[#4B5563] font-medium"
                            >
                              <CheckMark /> {f}
                            </li>
                          ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex lg:hidden justify-center items-center gap-2 mt-6 h-3">
            {scrollSnaps.length > 1 ? (
              scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === selectedIndex ? "bg-[#F97316] w-6" : "bg-[#F0E0CE]"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))
            ) : (
              <>
                <div className="w-6 h-2.5 rounded-full bg-[#F97316]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F0E0CE]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F0E0CE]" />
              </>
            )}
          </div>
          <div className="flex justify-center mt-12 md:mt-16">
            <Link
              href={`/${lang}/pricing`}
              className="bg-[#F97316] text-white font-bold py-3 px-8 md:py-4 md:px-10 rounded-full hover:bg-[#ea580c] active:scale-95 transition-all inline-flex items-center gap-3 text-[0.9rem] md:text-base shadow-lg shadow-orange-200/60"
            >
              {t("ctaBtn")}
              <svg
                className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommissionBenefits;
