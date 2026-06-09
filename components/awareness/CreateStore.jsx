"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../ui/Button";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";

// Orange Circle Check Icon
const CheckCircleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
  >
    <circle cx="12" cy="12" r="12" fill="#F48A42" />
    <path
      d="M7 12.5L10.5 16L17 8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Star Icon
const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 md:w-[18px] md:h-[18px]"
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

export default function CreateStore({ translate, lang = "ar" }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`awareness.createStore.${key}`);

  // Feature List items
  const features = t("features");

  return (
    <section className="py-10 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-10 w-full">
        {/* Main Grid: text on Right (rtl dom 1), image on Left (rtl dom 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Text Content Column */}
          <div className="order-1 md:order-0 flex flex-col">
            <h2 className="font-IBMPlex font-bold text-2xl lg:text-[2.2rem] text-darkNavy leading-tight mb-4">
              {t("title")}
            </h2>
            <p className="font-IBMPlex font-bold md:text-lg lg:text-xl text-[#F48A42] md:mb-10 mb-6">
              {t("subtitle")}
            </p>

            <ul className="space-y-3 md:space-y-5 mb-6 md:mb-12">
              {Array.isArray(features) &&
                features.map((text, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <CheckCircleIcon />
                    <span className="font-IBMPlex font-semibold text-[#5B5656] text-sm md:text-lg">
                      {text}
                    </span>
                  </li>
                ))}
            </ul>

            <div className="flex">
              <Button
                as={Link}
                href={`/${lang}/pricing`}
                className="md:text-lg text-sm py-4 px-6 md:py-7 md:px-12 flex items-center gap-3 font-IBMPlex font-bold shadow-[0_15px_30px_-8px_rgba(244,138,66,0.35)] hover:-translate-y-1 transition-all duration-300 rounded-full group bg-primary text-white"
              >
                <span>{t("action")}</span>
                <span className="font-black text-xl leading-none transition-transform duration-300 group-hover:-translate-x-1">
                  {lang === "ar" ? "←" : "→"}
                </span>
              </Button>
            </div>
          </div>

          {/* Graphical Mockup Column */}
          <div className="md:order-1 relative w-full aspect-square md:aspect-[4/3] max-w-[800px] mx-auto md:scale-105 lg:scale-110">
            {/* Base Image Container */}
            <div className="relative w-full h-full rounded-[2.5rem] shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src={anyImgUrl({
                  src: "Group_1000001249_tiark0",
                  size: 1000,
                })}
                alt="Store Interface Mockup"
                unoptimized
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* FLOATING LABEL 1: Top Right (Reviews) */}
            <div className="absolute top-4 -right-2 md:-right-4 lg:-right-14 bg-white rounded-2xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.12)] p-2.5 md:p-4 flex items-center gap-3 md:gap-5 border border-gray-50/50 animate-[float_8s_ease-in-out_infinite] z-10 transition-transform hover:scale-105">
              {/* Star Box */}
              <div className="w-9 h-9 md:w-11 md:h-11 bg-[#FFF9F4] text-[#F48A42] flex items-center justify-center rounded-xl flex-shrink-0">
                <StarIcon />
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span className="font-IBMPlex font-bold text-darkNavy text-xs md:text-base">
                  {t("mockup.showReviews")}
                </span>
                <span className="font-IBMPlex text-[#A1A1A1] text-[10px] md:text-[11px] mt-0.5">
                  {t("mockup.showReviewsDesc")}
                </span>
              </div>

              {/* IOS styled Toggle Switch inside Orange format */}
              <div className="w-10 h-5 md:w-12 md:h-6 bg-[#F48A42] rounded-full relative shadow-inner cursor-default flex-shrink-0 md:mr-4">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
              </div>
            </div>

            {/* FLOATING LABEL 2: Bottom Left (Store Sections) */}
            <div className="absolute -bottom-6 md:-bottom-8 -left-2 md:-left-4 lg:-left-12 bg-white rounded-2xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.12)] p-3 md:p-4 w-[190px] md:w-[240px] border border-gray-50/50 animate-[float_10s_ease-in-out_infinite_reverse] z-10 transition-transform hover:scale-105">
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-3 md:mb-4 px-1">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#F48A42] animate-pulse" />
                <span className="font-IBMPlex font-bold text-[#F48A42] text-xs md:text-sm">
                  {t("mockup.storeSections")}
                </span>
              </div>

              {/* Store Section Items Mini Cards */}
              <div className="space-y-2 md:space-y-3">
                {/* Item 1 */}
                <div className="flex items-center justify-between border border-gray-100 rounded-xl p-2 md:p-2.5 bg-[#FAFAFA]">
                  <div className="flex flex-col">
                    <span className="font-IBMPlex font-bold text-darkNavy text-[11px] md:text-sm">
                      {t("mockup.section1")}
                    </span>
                    <span className="font-IBMPlex text-gray-400 text-[9px] md:text-[10px]">
                      Sculptures
                    </span>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-200 overflow-hidden flex flex-shrink-0 shadow-sm relative">
                    <div className="w-full h-full bg-[#E5E0DC]" />
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between border border-gray-100 rounded-xl p-2 md:p-2.5 bg-[#FAFAFA]">
                  <div className="flex flex-col">
                    <span className="font-IBMPlex font-bold text-darkNavy text-[11px] md:text-sm">
                      {t("mockup.section2")}
                    </span>
                    <span className="font-IBMPlex text-gray-400 text-[9px] md:text-[10px]">
                      Woodworks
                    </span>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#3A2D2A] overflow-hidden flex flex-shrink-0 shadow-sm relative" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
