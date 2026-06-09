"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";
import ImprovedIcons from "../ui/svgs/ImprovedWhyIcons";
import { anyImgUrl } from "@/utils/ImageUrl";
import useEmblaCarousel from "embla-carousel-react";

export default function WhyEstajerContent({ translate, lang }) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`home.whyEstajerSection.${text}`);
  const tIcons = (text) => trans(`home.whyEstajerSection.icons.${text}`);

  const cards = [
    {
      id: "icon1",
      icon: <ImprovedIcons.Contract />,
      title: tIcons("icon1.title"),
      desc: tIcons("icon1.description"),
    },
    {
      id: "icon2",
      icon: <ImprovedIcons.Verified />,
      title: tIcons("icon2.title"),
      desc: tIcons("icon2.description"),
    },
    {
      id: "icon3",
      icon: <ImprovedIcons.Save />,
      title: tIcons("icon3.title"),
      desc: tIcons("icon3.description"),
    },
    {
      id: "icon4",
      icon: <ImprovedIcons.Local />,
      title: tIcons("icon4.title"),
      desc: tIcons("icon4.description"),
    },
    {
      id: "icon5",
      icon: <ImprovedIcons.Ease />,
      title: tIcons("icon5.title"),
      desc: tIcons("icon5.description"),
    },
    {
      id: "icon6",
      icon: <ImprovedIcons.Flex />,
      title: tIcons("icon6.title"),
      desc: tIcons("icon6.description"),
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: lang === "ar" ? "rtl" : "ltr",
    breakpoints: {
      "(min-width: 768px)": { active: false },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;
    const onInit = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
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
    <section className="relative overflow-hidden py-10 md:py-24 bg-gradient-to-br from-white via-[#fff8f3] to-[#fff5ed]">
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -start-0 w-[400px] h-[400px] rounded-full bg-primary/15 blur-3xl opacity-30"></div>
        <div className="absolute -bottom-0 -end-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-4 md:mb-12">
          <span className="inline-flex items-center gap-2 bg-primary/5 text-primary px-5 py-2 rounded-full text-[11px] md:text-sm font-bold border border-primary/10 mb-3 md:mb-4 tracking-wide before:content-[''] before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full before:animate-pulse">
            {t("label")}
          </span>
          <h2 className="text-2xl md:text-5xl font-black text-[#1a1a2e] leading-tight">
            {t("title")}
          </h2>
        </div>

        {/* ── MOBILE: Embla slider (hidden on md+) ── */}
        <div className="md:hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
          {/* Embla viewport */}
          <div
            className="overflow-hidden w-full cursor-grab active:cursor-grabbing"
            ref={emblaRef}
          >
            {/* Embla container — only the 6 card slides, nothing else */}
            <div className="flex gap-3 pb-4">
              {cards.map((card) => (
                <div key={card.id} className="flex-[0_0_65%] min-w-0">
                  <Card {...card} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-4 h-3">
            {cards?.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "bg-primary w-6"
                    : "bg-primary/20 w-2.5"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── DESKTOP: 3-column grid with center image (hidden below md) ── */}
        <div
          className="hidden md:block md:py-8"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-x-10 gap-y-5 items-center">
            {cards.map((card, index) => {
              const isFirstColumn = index < 3;
              const rowStartClass =
                index % 3 === 0
                  ? "row-start-1"
                  : index % 3 === 1
                    ? "row-start-2"
                    : "row-start-3";

              return (
                <div
                  key={card.id}
                  className={`w-full ${isFirstColumn ? "col-start-1" : "col-start-3"} ${rowStartClass}`}
                >
                  <Card {...card} />
                </div>
              );
            })}

            {/* Center Focus */}
            <div className="select-none flex items-center justify-center relative w-full col-start-2 row-start-1 row-span-3">
              <div className="relative w-full max-w-md aspect-square animate-[bounce-slow_7s_ease-in-out_infinite] flex items-center justify-center">
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[105%] aspect-square -z-10 flex items-center justify-center">
                  <svg
                    width="100%"
                    height="100%"
                    fill="none"
                    viewBox="0 0 950 950"
                    className="absolute inset-0 animate-[spin_60s_linear_infinite] text-primary"
                  >
                    <circle
                      cx="475"
                      cy="475"
                      r="473"
                      stroke="currentColor"
                      strokeOpacity="0.4"
                      strokeDasharray="12 12"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute top-1/2 -translate-y-1/2 w-[98%] aspect-square bg-gradient-to-t from-primary/10 to-transparent rounded-full border border-primary/20"></div>
                </div>
                <Image
                  src={anyImgUrl({ src: "why-estajer-bg_ndjn4c", size: 800 })}
                  alt="Estajer Platform"
                  fill
                  draggable={false}
                  unoptimized
                  className="object-contain relative z-10"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ icon, title, desc }) {
  return (
    <div
      className={`group relative bg-white/75 rounded-3xl p-3.5 md:p-6 lg:p-7 shadow-[0_4px_20px_-4px_rgba(244,138,66,0.08)] transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_20px_50px_-8px_rgba(244,138,66,0.15)] border border-white/80 hover:border-primary/20 flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-3 md:gap-5 overflow-hidden cursor-pointer h-full select-none
      before:content-[''] before:absolute before:top-0 before:start-0 before:w-1.5 before:h-full before:bg-gradient-to-b before:from-primary/80 before:to-primary before:scale-y-0 before:transition-transform before:duration-500 before:origin-top hover:before:scale-y-100`}
    >
      <div className="w-[50px] h-[50px] min-w-[50px] md:w-[60px] md:h-[60px] md:min-w-[60px] bg-primary/15 rounded-2xl flex items-center justify-center text-primary transition-all duration-700 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] group-hover:bg-primary group-hover:text-white">
        {icon}
      </div>

      <div className="flex-1 relative z-10 text-center sm:text-start">
        <h3 className="text-sm md:text-xl font-black text-[#1a1a2e] mb-1 transition-colors group-hover:text-primary leading-tight">
          {title}
        </h3>
        <p className="text-[12px] md:text-sm text-[#4a4a68] leading-[1.6] font-medium opacity-85 group-hover:opacity-100 transition-opacity">
          {desc}
        </p>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute -bottom-2 -end-2 w-12 h-12 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
