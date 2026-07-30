"use client";

import React, { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function FaqSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.faq.${key}`);
  const isAr = lang === "ar";
  const faqs = data?.faqs || [];
  const title = isAr ? data?.titleAr : data?.titleEn;
  const brandColor = shop?.brandColor || "#111111";
  const [openIdx, setOpenIdx] = useState(null);

  if (!faqs.length) return null;

  return (
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          {/* Left label */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              FAQ
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
              {title || t("title")}
            </h2>
          </div>

          {/* Right accordion */}
          <div className="md:col-span-8 flex flex-col">
            {faqs.map((faq, idx) => {
              const question = isAr ? faq.questionAr : faq.questionEn;
              const answer = isAr ? faq.answerAr : faq.answerEn;
              const isOpen = openIdx === idx;

              return (
                <div
                  key={idx}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-6 py-5 text-start group"
                  >
                    <span className="text-sm md:text-base font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
                      {question}
                    </span>
                    <span
                      className="shrink-0 w-5 h-5 flex items-center justify-center text-neutral-300 group-hover:text-neutral-600 transition-all duration-300"
                      style={{
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-64 pb-5" : "max-h-0"}`}
                  >
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
