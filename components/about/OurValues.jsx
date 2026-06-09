"use client";
import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "./SectionHeader";
import { useTranslations } from "@/hooks/useTranslations";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";


const HeaderIcon = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="17"
    fill="none"
    viewBox="0 0 19 17"
    className={className}
    {...props}
  >
    <path
      fill="#FF8C42"
      d="M17.219.406c.593 1.344.937 2.969.937 4.532 0 5.375-3.468 9.78-8.375 10.125-2.531.28-4.437-1.032-5.469-2.407C2.72 14 2.126 15.375 2.063 15.5a1 1 0 0 1-1.312.531 1 1 0 0 1-.531-1.312c.75-1.781 4.062-6.625 11.937-6.625.25 0 .5-.219.5-.5 0-.25-.25-.5-.5-.5-4.094 0-6.969 1.218-8.968 2.656-.032-.219-.032-.437-.032-.656 0-3.313 2.688-6 6-6h2.5c1.969 0 3.688-1.031 4.656-2.719a.506.506 0 0 1 .907.031"
    ></path>
  </svg>
);

const CardIcon1 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="35"
    fill="none"
    viewBox="0 0 26 35"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M25.234 25.234c.399.465.465 1.063.2 1.594-.2.531-.797.863-1.395.863h-9.031v1.66L17 32.54c.332.73-.2 1.594-.996 1.594H9.695c-.797 0-1.328-.864-.996-1.594l2.059-3.187v-1.66H1.66c-.597 0-1.195-.333-1.394-.864a1.41 1.41 0 0 1 .199-1.594l5.312-6.043H3.72c-.598 0-1.13-.332-1.328-.863a1.41 1.41 0 0 1 .199-1.594l5.18-6.043H5.844a1.55 1.55 0 0 1-1.395-.863c-.199-.531-.133-1.195.332-1.594L12.086.398c.398-.398 1.129-.398 1.527 0l7.305 7.836c.465.399.531 1.063.332 1.594a1.55 1.55 0 0 1-1.395.863H17.93l5.18 6.043c.398.465.464 1.063.199 1.594-.2.531-.73.863-1.329.863h-2.058z"
    ></path>
  </svg>
);

const CardIcon2 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M20.156 1.71c-.039 0-.093 0-.14.01-.36.066-.79.398-1.07 1.156-.298.758-.36 1.839-.102 2.996.265 1.143.812 2.128 1.422 2.73.593.6 1.132.765 1.492.702.375-.054.789-.398 1.07-1.148.297-.753.375-1.848.11-2.996-.274-1.156-.813-2.132-1.422-2.73-.516-.531-.993-.72-1.36-.72m9.016 10.118c-.86.023-1.945.25-3 .695-1.219.532-2.156 1.242-2.672 1.914-.516.649-.562 1.14-.398 1.43.171.29.648.563 1.562.602.914.054 2.148-.172 3.36-.688 1.21-.523 2.163-1.242 2.68-1.898.515-.649.554-1.157.39-1.446-.164-.297-.649-.554-1.563-.586-.125-.023-.234-.023-.36-.023m-10.649 7.258q-.773.014-1.406.18c-.922.234-1.453.656-1.625 1.164-.195.507 0 1.117.61 1.773.64.64 1.695 1.258 3.007 1.602 1.305.343 2.563.335 3.5.085.946-.242 1.477-.671 1.649-1.171.18-.508 0-1.11-.633-1.774-.617-.64-1.672-1.258-2.984-1.594a8 8 0 0 0-2.118-.265m12.555 4.539-4.828 2.289a94 94 0 0 0 1.148.039l.516.68 4.273-2.227zm-4.258.008-4.484 2.125c.43.023 1.445.039 1.852.062l3.89-1.844zm7.235.843-5.508 2.922 1.133 1.461 5.82-3.484zm-21.782.711a3.2 3.2 0 0 0-.703.078c-5.586 1.29-8.882 1.399-9.86 1.399h-.304v8.398s.907-.133 2.414-.14c2.914 0 8.047.5 13.047 3.422.266.164.836.226 1.547.226 1.898 0 4.781-.453 5.445-.703 6.688-2.508 14.735-9.39 14.735-9.39l-2.54-2.22s-6.234 3.977-7.023 4.36c-7.117 3.492-12.883 1.313-12.883 1.313s9.368.234 12.375-2.133l-1.765-2.657s-6.469-.18-8.774-.484c-1.203-.156-3.804-1.469-5.71-1.469"
    />
  </svg>
);

const CardIcon3 = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="38"
    height="36"
    fill="none"
    viewBox="0 0 38 36"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      d="M13.945 18.395c.2.93-.797 1.66-1.593 1.195l-2.723-1.727-3.387 5.446c-.863 1.394.133 3.187 1.86 3.187h3.453c.398 0 .797.399.797.797v2.656a.81.81 0 0 1-.797.797H8.102c-5.047 0-8.102-5.512-5.446-9.695l3.387-5.445-2.723-1.66c-.797-.532-.597-1.727.332-1.926l7.305-1.727c.598-.133 1.195.266 1.328.797zM20.52 6.242c-.864-1.262-2.79-1.328-3.653.067l-1.195 1.859c-.2.398-.73.531-1.063.266l-2.257-1.395c-.399-.266-.465-.73-.266-1.129l1.195-1.86c2.524-4.05 8.301-3.984 10.824 0l2.723 4.384 2.723-1.727c.797-.465 1.793.266 1.594 1.129l-1.727 7.371c-.066.531-.664.93-1.262.797l-7.304-1.727c-.93-.199-1.13-1.394-.332-1.925l2.722-1.66zm14.21 14.809c2.657 4.25-.398 9.695-5.445 9.695h-6.308v3.188c0 .996-1.196 1.46-1.86.797l-5.312-5.313c-.399-.398-.399-1.129 0-1.527l5.312-5.313c.664-.664 1.86-.2 1.86.797v3.188h6.308c1.727 0 2.723-1.86 1.86-3.254l-1.86-2.989c-.2-.332-.133-.863.266-1.062l2.258-1.395c.332-.265.863-.133 1.062.266z"
    ></path>
  </svg>
);

const cardIcons = [CardIcon1, CardIcon2, CardIcon3];

const OurValues = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`about.ourValues.${text}`);
  const values = t("values");

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
    <section id="our-values" className="bg-white py-12 md:py-[100px] relative overflow-hidden">
      <div className="absolute -top-[100px] -end-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,140,66,0.08)_0%,transparent_70%)] rounded-full"></div>
      <div className="absolute -bottom-[100px] -start-[100px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(255,140,66,0.06)_0%,transparent_70%)] rounded-full"></div>
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          title={t("description1")}
          description1={t("title")}
          description2={t("description2")}
          icon={HeaderIcon}
        />
        
        {/* Embla Viewport */}
        <div
          className="overflow-hidden md:overflow-visible w-full mt-6 md:mt-[50px]"
          ref={emblaRef}
        >
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-[30px] pb-6 pt-4 md:pt-0 md:pb-0 cursor-grab active:cursor-grabbing md:cursor-auto md:active:cursor-auto w-full">
            {Array.isArray(values) && values.map((value, index) => {
              const Icon = cardIcons[index % cardIcons.length];
              return (
                <div key={index} className="relative overflow-hidden bg-white rounded-[24px] md:rounded-[32px] px-6 py-8 md:px-8 md:py-10 text-center border border-[#FCE6D6] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-400 group hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15),0_0_40px_rgba(255,140,66,0.15)] hover:border-[#FCE6D6] flex-[0_0_82%] sm:flex-[0_0_60%] md:flex-none min-w-0">
                  {/* Top gradient bar */}
                  <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] scale-x-0 transition-transform duration-400 origin-center group-hover:scale-x-100"></div>
                  
                  <div className="relative w-16 h-16 md:w-20 md:h-20 bg-[#FFF0E6] rounded-[20px] md:rounded-[24px] flex items-center justify-center mx-auto mb-5 md:mb-6 text-[#FF8C42] transition-all duration-400 group-hover:bg-gradient-to-r group-hover:from-[#FF8C42] group-hover:to-[#FF6B35] group-hover:text-white group-hover:scale-110 group-hover:-rotate-[5deg]">
                    <div className="absolute -inset-1.5 rounded-[26px] md:-inset-2 md:rounded-[32px] border-2 border-dashed border-[rgba(255,140,66,0.2)] animate-[spin_20s_linear_infinite] group-hover:border-[rgba(255,140,66,0.4)] group-hover:animate-[spin_10s_linear_infinite]"></div>
                    <Icon className="w-6 h-6 md:w-8 md:h-8 relative z-10" />
                  </div>
                  
                  <h3 className="text-lg md:text-[22px] font-[800] text-[#1A1A2E] mb-2 md:mb-[14px]">
                    {value.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] md:text-[15px] text-[#666] leading-[1.7] md:leading-[1.8]">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex md:hidden justify-center items-center gap-1.5 mt-4 h-3">
          {scrollSnaps.length > 1 ? (
            scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "bg-[#F97316] w-5" : "bg-[#F0E0CE]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))
          ) : (
            <>
              <div className="w-5 h-2 rounded-full bg-[#F97316]" />
              <div className="w-2 h-2 rounded-full bg-[#F0E0CE]" />
              <div className="w-2 h-2 rounded-full bg-[#F0E0CE]" />
            </>
          )}
        </div>

        <div className="flex justify-center mt-8 md:mt-12">
          <Link
            href={lang === "ar" ? "/register" : "/en/register"}
            className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-black text-sm sm:text-base shadow-xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/45 w-full sm:w-auto group relative overflow-hidden text-center"
          >
            <span className="relative z-10">
              {lang === "ar" ? "شاركنا الأثر" : "Share the impact with us"}
            </span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:rtl:-translate-x-1 relative z-10">
              {lang === "ar" ? "←" : "→"}
            </span>
            <div className="absolute top-0 -start-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:start-[100%]"></div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OurValues;
