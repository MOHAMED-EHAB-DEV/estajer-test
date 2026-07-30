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
  const brandColor = shop?.brandColor || "#F48A42";

  if (!faqs || faqs.length === 0) {
    return (
      <section
        className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
        
      >
        <div className="h-44 bg-[#FAF6F0] rounded-3xl border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-xl">🌿</span>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {t("addFaqs") || "Configure FAQs"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="max-w-screen-xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
      
    >
      {/* Header */}
      <div className="text-center mb-10 md:mb-16">
        <span className="bg-[#FAF6F0] text-neutral-600 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-neutral-200/50 mb-3">
          {t("badge") || "Boutique Answers"}
        </span>
        {title && (
          <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800 leading-tight max-w-2xl mx-auto">
            {title}
          </h2>
        )}
      </div>

      {/* Accordion List - Soft Squircle Pill Cards */}
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`group border transition-all duration-300 overflow-hidden bg-white hover:-translate-y-0.5 ${
                isOpen
                  ? "rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-md"
                  : "rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm shadow-sm"
              }`}
              style={{
                borderColor: isOpen ? brandColor : "rgba(229, 229, 229, 0.6)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-start gap-4 focus:outline-none"
              >
                <span
                  className={`text-sm md:text-base font-bold transition-colors duration-300 ${isOpen ? "text-[#E67E22]" : "text-neutral-700"}`}
                  style={{ color: isOpen ? brandColor : undefined }}
                >
                  {isAr ? faq.questionAr : faq.questionEn}
                </span>

                {/* Soft Rounded toggle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isOpen ? "text-white" : "bg-[#FAF6F0] text-neutral-600"
                  }`}
                  style={{ backgroundColor: isOpen ? brandColor : undefined }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`w-3.5 h-3.5 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              <div
                className={`transition-all duration-500 ease-in-out px-5 md:px-6 overflow-hidden ${isOpen ? "max-h-[500px] pb-5 md:pb-6 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="pt-3 border-t border-neutral-100">
                  <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-medium">
                    {isAr ? faq.answerAr : faq.answerEn}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
