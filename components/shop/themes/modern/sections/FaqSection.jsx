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
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100/60">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left info label */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                FAQ
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              {title || t("title")}
            </h2>
          </div>

          {/* Right accordion */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {faqs.map((faq, idx) => {
              const question = isAr ? faq.questionAr : faq.questionEn;
              const answer = isAr ? faq.answerAr : faq.answerEn;
              const isOpen = openIdx === idx;

              return (
                <div
                  key={idx}
                  className="bg-[#F9FAFB] rounded-[1.5rem] border border-neutral-200/50 overflow-hidden hover:bg-white hover:border-neutral-300 transition-all duration-300 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-6 px-6 py-5 text-start group"
                  >
                    <span className="text-xs md:text-sm font-bold text-neutral-800 transition-colors">
                      {question}
                    </span>
                    <span
                      className="shrink-0 w-6 h-6 rounded-full bg-white border border-neutral-200/60 flex items-center justify-center text-neutral-500 transition-all duration-300 shadow-sm"
                      style={{
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "max-h-64 opacity-100 px-6 pb-5"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-xs md:text-sm text-neutral-500 leading-relaxed pt-2 border-t border-neutral-200/50">
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
