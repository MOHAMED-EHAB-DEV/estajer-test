"use client";

import React, { useState } from "react";

const CustomPlus = () => (
  <svg viewBox="0 0 8 8" fill="none" className="w-2.5 h-2.5">
    <path
      d="M2.704 7.776V4.832H0V2.944h2.704V0h2.048v2.944h2.704v1.888H4.752v2.944z"
      fill="currentColor"
    />
  </svg>
);

const CustomMinus = () => (
  <svg viewBox="0 0 8 2" fill="none" className="w-2.5 h-0.5">
    <path d="M0 0h8v2H0V0z" fill="currentColor" />
  </svg>
);

import { useTranslations } from "@/hooks/useTranslations";

export default function FaqSection({ data, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.faq.${key}`);
  const isAr = lang === "ar";
  const [openIndex, setOpenIndex] = useState(null);

  const title = isAr ? data?.titleAr : data?.titleEn;
  const faqs = data?.faqs || [];

  if (!faqs || faqs.length === 0) {
    return (
      <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
        <div className="h-40 bg-neutral-50 rounded-[24px] md:rounded-3xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <span className="text-2xl md:text-3xl">❓</span>
          <p className="text-xs md:text-sm font-medium">{t("addFaqs")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-xl w-full mx-auto px-4 md:px-8 my-6 md:my-12">
      {/* Header */}
      <div className="text-center mb-6 md:mb-20">
        <div className="inline-flex items-center gap-2 px-3 md:px-5 py-1 md:py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs md:text-sm font-bold tracking-wide mb-4 md:mb-6">
          <svg
            width="12"
            height="12"
            viewBox="0 0 13 13"
            fill="currentColor"
            className="md:w-3 md:h-3 w-2.5 h-2.5"
          >
            <path d="M12.3997 6.2C12.3997 9.625 9.59973 12.4 6.19973 12.4C2.77473 12.4 -0.000273511 9.625 -0.000273511 6.2C-0.000273511 2.8 2.77473 -1.63913e-07 6.19973 -1.63913e-07C9.59973 -1.63913e-07 12.3997 2.8 12.3997 6.2ZM6.34973 2.05C4.99973 2.05 4.12473 2.625 3.44973 3.65C3.34973 3.8 3.37473 3.975 3.49973 4.075L4.37473 4.725C4.49973 4.825 4.69973 4.8 4.79973 4.675C5.24973 4.1 5.54973 3.775 6.22473 3.775C6.72473 3.775 7.37473 4.1 7.37473 4.6C7.37473 4.975 7.04973 5.175 6.54973 5.45C5.97473 5.775 5.19973 6.175 5.19973 7.2V7.3C5.19973 7.475 5.32473 7.6 5.49973 7.6H6.89973C7.04973 7.6 7.19973 7.475 7.19973 7.3V7.275C7.19973 6.575 9.27473 6.55 9.27473 4.6C9.27473 3.15 7.77473 2.05 6.34973 2.05ZM6.19973 8.25C5.54973 8.25 5.04973 8.775 5.04973 9.4C5.04973 10.05 5.54973 10.55 6.19973 10.55C6.82473 10.55 7.34973 10.05 7.34973 9.4C7.34973 8.775 6.82473 8.25 6.19973 8.25Z" />
          </svg>
          {t("badge")}
        </div>
        {title && (
          <h2 className="text-lg md:text-4xl lg:text-5xl font-black text-darkNavy leading-tight max-w-2xl mx-auto">
            {title}
          </h2>
        )}
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-3 md:space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`group rounded-xl md:rounded-2xl border transition-all duration-300 overflow-hidden bg-white ${
                isOpen
                  ? "border-primary/50 shadow-xl shadow-primary/5"
                  : "border-primary/20 shadow-sm hover:border-primary/40"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 md:p-7 text-start gap-4 md:gap-6 transition-colors focus:outline-none"
              >
                <span
                  className={`text-sm md:text-base font-black transition-colors ${isOpen ? "text-primary" : "text-darkNavy group-hover:text-primary"}`}
                >
                  {isAr ? faq.questionAr : faq.questionEn}
                </span>

                <div
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? "bg-primary text-white rotate-180" : "bg-primary/5 text-primary"}`}
                >
                  {isOpen ? <CustomMinus /> : <CustomPlus />}
                </div>
              </button>

              <div
                className={`transition-all duration-500 ease-in-out px-4 md:px-7 overflow-hidden ${isOpen ? "max-h-[500px] pb-4 md:pb-8 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="pt-2 border-t border-primary/5">
                  <p className="text-[13px] md:text-sm text-neutral-500 leading-relaxed font-bold">
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
