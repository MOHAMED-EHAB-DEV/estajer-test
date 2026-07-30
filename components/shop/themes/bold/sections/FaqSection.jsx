"use client";

import React, { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function FaqSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.faq.${key}`);
  const isAr = lang === "ar";
  const faqs = data?.faqs || [];
  const title = isAr ? data?.titleAr : data?.titleEn;
  const brandColor = shop?.brandColor || "#F48A42";
  const [openIdx, setOpenIdx] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-darkNavy">{title || t("title")}</h2>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full" style={{ backgroundColor: brandColor }} />
            <div className="h-1 w-4 rounded-full opacity-40" style={{ backgroundColor: brandColor }} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const question = isAr ? faq.questionAr : faq.questionEn;
            const answer = isAr ? faq.answerAr : faq.answerEn;
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isOpen ? "shadow-lg" : "border-neutral-100 hover:border-neutral-200"
                }`}
                style={isOpen ? { borderColor: `${brandColor}40` } : {}}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 md:py-5 text-start"
                >
                  <span className="font-bold text-sm md:text-base text-darkNavy">{question}</span>
                  <div
                    className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: isOpen ? brandColor : `${brandColor}15`,
                      color: isOpen ? "#fff" : brandColor,
                    }}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div
                    className="px-5 pb-5 text-sm text-neutral-500 leading-relaxed border-t"
                    style={{ borderColor: `${brandColor}20` }}
                  >
                    <p className="pt-4">{answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
