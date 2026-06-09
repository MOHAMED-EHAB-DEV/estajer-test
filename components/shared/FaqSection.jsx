"use client";
import { useState } from "react";
import { Minus } from "@/components/ui/svgs/icons/MinusSvg";
import Button from "../ui/Button";
import Link from "next/link";

const CustomPlus = () => (
  <svg viewBox="0 0 8 8" fill="none" className="w-2 h-2">
    <path
      d="M2.704 7.776V4.832H0V2.944h2.704V0h2.048v2.944h2.704v1.888H4.752v2.944z"
      fill="#FB923C"
    />
  </svg>
);

const FaqSection = ({
  lang,
  badge,
  title,
  titleHighlight,
  faqs = [],
  action,
  actionHref,
  footerTitle,
  className = "pt-10 pb-12 md:pt-24 md:pb-28 bg-white",
  containerClassName = "max-w-screen-xl mx-auto px-4 md:px-8",
  accordionClassName = "max-w-4xl mx-auto",
}) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className={`relative z-10 w-full ${containerClassName}`}>
        {/* Header */}
        <div className="text-center mb-8 md:mb-20">
          <div className="inline-flex items-center gap-1 px-4 md:px-5 py-1 md:py-1.5 rounded-full border border-primary/20 bg-[#FFF9F5] text-primary text-xs md:text-sm font-IBMPlex font-bold tracking-wide mb-6">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="#F48A42">
              <path d="M12.3997 6.2C12.3997 9.625 9.59973 12.4 6.19973 12.4C2.77473 12.4 -0.000273511 9.625 -0.000273511 6.2C-0.000273511 2.8 2.77473 -1.63913e-07 6.19973 -1.63913e-07C9.59973 -1.63913e-07 12.3997 2.8 12.3997 6.2ZM6.34973 2.05C4.99973 2.05 4.12473 2.625 3.44973 3.65C3.34973 3.8 3.37473 3.975 3.49973 4.075L4.37473 4.725C4.49973 4.825 4.69973 4.8 4.79973 4.675C5.24973 4.1 5.54973 3.775 6.22473 3.775C6.72473 3.775 7.37473 4.1 7.37473 4.6C7.37473 4.975 7.04973 5.175 6.54973 5.45C5.97473 5.775 5.19973 6.175 5.19973 7.2V7.3C5.19973 7.475 5.32473 7.6 5.49973 7.6H6.89973C7.04973 7.6 7.19973 7.475 7.19973 7.3V7.275C7.19973 6.575 9.27473 6.55 9.27473 4.6C9.27473 3.15 7.77473 2.05 6.34973 2.05ZM6.19973 8.25C5.54973 8.25 5.04973 8.775 5.04973 9.4C5.04973 10.05 5.54973 10.55 6.19973 10.55C6.82473 10.55 7.34973 10.05 7.34973 9.4C7.34973 8.775 6.82473 8.25 6.19973 8.25Z" />
            </svg>
            {badge}
          </div>
          <h2 className="font-IBMPlex font-bold text-xl md:text-[2.2rem] text-darkNavy leading-tight flex justify-center items-center gap-2">
            {lang === "ar" ? (
              <>
                <span>{title}</span>{" "}
                {titleHighlight && (
                  <span className="text-primary">{titleHighlight}</span>
                )}
              </>
            ) : (
              <>
                {titleHighlight && (
                  <span className="text-primary">{titleHighlight}</span>
                )}{" "}
                <span>{title}</span>
              </>
            )}
          </h2>
        </div>

        {/* FAQ accordion */}
        <div
          className={`space-y-3 w-full ${accordionClassName} ${action ? "mb-14" : ""}`}
        >
          {Array.isArray(faqs) &&
            faqs.map((faq, index) => (
              <div
                key={index}
                className={`group transition-all duration-300 rounded-xl overflow-hidden bg-white border ${
                  openIndex === index
                    ? "border-primary/50 shadow-[0_8px_25px_-8px_rgba(244,138,66,0.15)]"
                    : "border-primary/20 hover:border-primary/40 shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 py-3 md:px-6 md:py-4 flex items-center justify-between text-start gap-6 transition-colors bg-white focus:outline-none"
                >
                  <span
                    className={`font-IBMPlex font-bold text-[0.75rem] md:text-base text-darkNavy flex-1 leading-snug transition-colors ${
                      openIndex === index
                        ? "text-primary"
                        : "group-hover:text-primary"
                    } ${lang === "en" ? "text-left" : ""}`}
                  >
                    {faq.question}
                  </span>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "bg-primary" : "bg-[#FFF9F5]"
                    }`}
                  >
                    {openIndex === index ? (
                      <Minus className="w-3 h-3 text-white" />
                    ) : (
                      <CustomPlus />
                    )}
                  </div>
                </button>

                <div
                  className={`transition-all duration-400 ease-in-out px-4 md:px-8 overflow-hidden bg-white ${
                    openIndex === index
                      ? "max-h-[800px] pb-5 md:pb-6 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-2">
                    <p className="text-[#5B5656] text-xs md:text-sm leading-relaxed font-IBMPlex font-semibold">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* CTA */}
        {(action && actionHref) || footerTitle ? (
          <div className="text-center mt-2 md:mt-20">
            {footerTitle && (
              <h3 className="text-[1.1rem] md:text-2xl font-bold text-[#1F2937] mb-4 md:mb-8 font-IBMPlex">
                {footerTitle}
              </h3>
            )}
            {action && actionHref && (
              <div className="flex justify-center">
                <Button
                  as={Link}
                  href={actionHref}
                  className="md:text-lg text-xs py-3 px-6 md:py-7 md:px-[4.5rem] flex items-center gap-3 font-IBMPlex font-bold shadow-[0_15px_30px_-8px_rgba(244,138,66,0.35)] active:scale-95 transition-all duration-300 rounded-full group"
                >
                  {action}
                  <span className="font-black text-xl leading-none transition-transform duration-300 group-hover:-translate-x-1">
                    {lang === "ar" ? "←" : "→"}
                  </span>
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default FaqSection;
