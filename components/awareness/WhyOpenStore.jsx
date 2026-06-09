"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import useEmblaCarousel from "embla-carousel-react";

const WhyOpenStore = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`awareness.whyOpenStore.${text}`);
  const cards = trans("awareness.whyOpenStore.cards");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    direction: lang === "ar" ? "rtl" : "ltr",
    align: "center",
    slidesToScroll: 1,
    dragFree: false,
    breakpoints: {
      "(min-width: 768px)": {
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
    <section className="py-12 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative z-10">
        {/* Header - Aligned meticulously with other sections */}
        <div className="text-center mb-8 md:mb-20">
          <h2 className="font-IBMPlex font-bold lg:text-[2.2rem] md:text-[1.8rem] text-[1.3rem] text-darkNavy mb-4 leading-tight">
            {t("title")}
          </h2>
          <p className="text-[#5B5656] text-xs md:text-base font-IBMPlex">
            {t("subtitle")}
          </p>
        </div>

        {/* Embla Viewport */}
        <div
          className="overflow-hidden md:overflow-visible w-full"
          ref={emblaRef}
        >
          {/* Cards Grid / Slider */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 pb-6 md:pb-0 cursor-grab active:cursor-grabbing md:cursor-auto md:active:cursor-auto w-full">
            {Array.isArray(cards) &&
              cards.map((card, index) => (
                <div
                  key={index}
                  className="group relative h-[360px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(244,138,66,0.3)] transition-all [transition-duration:800ms] flex flex-col md:translate-y-0 hover:-translate-y-2 bg-[#f8f9fa] flex-[0_0_85%] sm:flex-[0_0_60%] md:flex-none min-w-0"
                >
                  {/* Image */}
                  <Image
                    src={anyImgUrl({ src: card.image, size: 1000 })}
                    unoptimized
                    alt={card.title}
                    fill
                    className="object-cover transition-all [transition-duration:1.5s] ease-out group-hover:scale-110"
                    priority={index < 3}
                  />

                  {/* Advanced Clean Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-85 group-hover:opacity-100 transition-opacity [transition-duration:800ms]" />

                  {/* Elegant Number decoration */}
                  <div className="absolute top-6 start-6 md:start-8 pointer-events-none z-10 transition-transform [transition-duration:800ms] ease-out group-hover:translate-x-1">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-white/30 group-hover:bg-primary transition-colors duration-500 rounded-full" />
                      <span className="text-white/60 group-hover:text-white font-IBMPlex font-bold text-2xl md:text-3xl select-none leading-none transition-colors duration-500">
                        0{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Floating Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 translate-y-6 group-hover:translate-y-0 transition-transform [transition-duration:800ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] flex flex-col items-center text-center overflow-hidden z-10 w-full">
                    <h3 className="text-white font-IBMPlex font-bold text-lg md:text-2xl leading-snug drop-shadow-lg max-w-[90%] mx-auto">
                      {card.title}
                    </h3>

                    {/* Expanding description trick */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] w-full transition-[grid-template-rows] [transition-duration:800ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]">
                      <p className="text-white/80 font-IBMPlex text-xs md:text-base leading-relaxed overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity [transition-duration:800ms] delay-150 px-4">
                        <span className="block pt-4 drop-shadow-md">
                          {card.description}
                        </span>
                      </p>
                    </div>

                    {/* Morphing glow indicator (Dot to Line) */}
                    <div className="w-2 group-hover:w-16 h-2 group-hover:h-1 bg-primary rounded-full mt-6 transition-all [transition-duration:800ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_0_8px_rgba(244,138,66,0.5)]" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex md:hidden justify-center items-center gap-2 mt-6 h-3">
          {scrollSnaps.length > 1 ? (
            scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "bg-primary w-6" : "bg-[#E5E0DC]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))
          ) : (
            <>
              <div className="w-6 h-2.5 rounded-full bg-primary" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5E0DC]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5E0DC]" />
            </>
          )}
        </div>
        
        {/* CTA Button */}
        <div className="flex justify-center mt-8 md:mt-20">
          <Button
            as={Link}
            href={`/${lang}/pricing`}
            className="md:text-lg text-sm py-4 px-6 md:py-7 md:px-12 flex items-center gap-3 font-IBMPlex font-bold shadow-[0_15px_30px_-8px_rgba(244,138,66,0.35)] hover:-translate-y-1 transition-all duration-300 rounded-full group bg-primary text-white"
          >
            <span>ابدأ في تنفيذ متجرك الآن</span>
            <span className="font-black text-xl leading-none transition-transform duration-300 group-hover:-translate-x-1">
              {lang === "ar" ? "←" : "→"}
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyOpenStore;
