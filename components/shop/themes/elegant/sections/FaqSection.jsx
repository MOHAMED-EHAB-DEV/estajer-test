"use client";

import React, { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function FaqSection({ data, lang, translate, shop }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.faq.${key}`);
  const isAr = lang === "ar";
  const [openIndex, setOpenIndex] = useState(null);

  const title = isAr ? data?.titleAr : data?.titleEn;
  const faqs = data?.faqs || [];
  const brandColor = shop?.brandColor || "#8B5E3C";

  if (!faqs || faqs.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
        <div className="h-44 bg-[#FCFAF7] border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">❓</span>
          <p className="text-xs tracking-widest uppercase">
            {t("addFaqs") || "Configure FAQs"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Left Side: Editorial Banner */}
        <div className="lg:col-span-5 flex flex-col gap-5 text-start lg:sticky lg:top-28">
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: brandColor }}
            >
              {t("badge") || "Bespoke Concierge"}
            </span>
            <div
              className="w-1.5 h-1.5 rotate-45"
              style={{ backgroundColor: brandColor }}
            />
          </div>

          {title && (
            <h2 className="text-2xl md:text-4xl text-neutral-900 leading-tight">
              {title}
            </h2>
          )}

          <div className="h-px bg-neutral-300 w-24 my-2" />
        </div>

        {/* Right Side: Underlined Questions Stack */}
        <div className="lg:col-span-7 flex flex-col">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="flex flex-col border-b border-neutral-200/80 transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between py-6 text-start gap-6 focus:outline-none group"
                >
                  <span
                    className={`text-sm md:text-base transition-colors duration-300 ${isOpen ? "text-neutral-900" : "text-neutral-600 group-hover:text-neutral-900"}`}
                  >
                    {isAr ? faq.questionAr : faq.questionEn}
                  </span>

                  {/* Chic luxury plus/minus marker */}
                  <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                    <div className="absolute w-3.5 h-[1px] bg-neutral-500 group-hover:bg-neutral-800 transition-colors" />
                    <div
                      className={`absolute w-[1px] h-3.5 bg-neutral-500 group-hover:bg-neutral-800 transition-all duration-300 ${isOpen ? "rotate-90 scale-0" : ""}`}
                    />
                  </div>
                </button>

                {/* Content block fading in without container borders */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-[600px] pb-6 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-xs md:text-sm text-neutral-500 italic leading-relaxed pl-2 rtl:pl-0 rtl:pr-2">
                    {isAr ? faq.answerAr : faq.answerEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
