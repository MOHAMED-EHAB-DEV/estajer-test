"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../ui/Button";

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

import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function Support({ translate, lang = "ar" }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`awareness.support.${key}`);

  // Feature List items based on the new image
  const features = t("features");

  return (
    <section className="py-12 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative z-10 w-full">
        {/* Main Grid: Text on Right (rtl dom 1), Image on Left (rtl dom 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
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
                className="md:text-[1.05rem] text-sm py-4 px-6 md:py-7 md:px-10 flex items-center gap-3 font-IBMPlex font-bold shadow-[0_15px_30px_-8px_rgba(244,138,66,0.35)] hover:-translate-y-1 transition-all duration-300 rounded-full group bg-[#F48A42] text-white"
              >
                <span>{t("action")}</span>
                <span className="font-black text-xl leading-none transition-transform duration-300 group-hover:-translate-x-1">
                  {lang === "ar" ? "←" : "→"}
                </span>
              </Button>
            </div>
          </div>

          {/* Graphical Mockup Column (Take it as Image) */}
          <div className="md:order-1 relative w-full aspect-[1/0.64] max-w-2xl mx-auto mt-8 lg:mt-0 p-2 md:p-4">
            {/* Tilted background card placeholder to simulate the design framing */}
            <div className="absolute inset-0 bg-[#FFF9F0] rounded-[2rem] transform -rotate-3 scale-105 z-0"></div>

            {/* Base Image Container block where you drop the raw image asset */}
            <div className="relative w-full h-full bg-white rounded-3xl shadow-lg border border-[#FAEDE1] flex flex-col items-center justify-center overflow-hidden z-10 transform transition-transform duration-500 hover:rotate-2">
              <Image
                src={anyImgUrl({
                  src: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1775650803/Group_984_eocga1.png",
                  size: 1000,
                })}
                unoptimized
                alt="Support Feature Image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
