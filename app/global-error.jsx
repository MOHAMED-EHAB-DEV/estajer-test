"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import "./globals.css";

// Helper to detect language from URL
function detectLanguage() {
  if (typeof window === "undefined") return { lang: "ar", isRtl: true };
  const path = window.location.pathname;
  const isEnglish = path.startsWith("/en");
  return { lang: isEnglish ? "en" : "ar", isRtl: !isEnglish };
}

export default function GlobalError({ error }) {
  const [{ lang, isRtl }] = useState(detectLanguage);

  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  const translations = {
    ar: {
      unexpectedError: "خطأ غير متوقع",
      title: "حدث خطأ في المنصة",
      subtitle:
        "نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو العودة للصفحة الرئيسية.",
      tryAgain: "حاول مرة أخرى",
      goHome: "الصفحة الرئيسية",
      errorDetails: "تفاصيل الخطأ",
    },
    en: {
      unexpectedError: "Unexpected Error",
      title: "Something went wrong",
      subtitle:
        "We apologize for this error. Please refresh the page or go back to the homepage.",
      tryAgain: "Try Again",
      goHome: "Go Home",
      errorDetails: "Error details",
    },
  };

  const t = translations[lang];

  return (
    <html lang={lang} dir={isRtl ? "rtl" : "ltr"}>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(15 23 42)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
              }}
            />
          </div>

          <div className="relative max-w-2xl w-full">
            {/* Main card with glassmorphism */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/50 p-8 md:p-12 text-center">
              {/* Animated error icon */}
              <div className="relative mb-8 inline-block">
                <div className="w-32 h-32 mx-auto relative">
                  {/* Outer ring animation */}
                  <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-20" />
                  <div
                    className="absolute inset-2 rounded-full border-4 border-red-300 animate-ping opacity-30"
                    style={{ animationDelay: "0.5s" }}
                  />

                  {/* Main icon container */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30"
                      style={{
                        animation: "bounce-slow 2s infinite",
                      }}
                    >
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <p className="text-red-600 font-semibold md:text-lg text-base mb-2 tracking-wide">
                {t.unexpectedError}
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {t.title}
              </h1>

              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                {t.subtitle}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => window.location.reload()}
                  className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  <svg
                    className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  <span>{t.tryAgain}</span>
                </button>

                <Link
                  href={lang === "en" ? "/en" : "/"}
                  className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                >
                  <svg
                    className="w-5 h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                  <span>{t.goHome}</span>
                </Link>
              </div>

              {/* Error details in collapsible section */}
              {error?.message && (
                <details className="group text-start">
                  <summary className="flex items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-gray-500 transition-colors text-sm select-none">
                    <svg
                      className="w-4 h-4 group-open:rotate-90 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                    <span>{t.errorDetails}</span>
                  </summary>

                  <div className="mt-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50">
                    <code className="text-xs text-gray-400 font-mono break-all leading-relaxed block max-h-32 overflow-auto">
                      {error.message}
                    </code>
                  </div>
                </details>
              )}
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl rotate-12 opacity-20 blur-sm" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-rose-400 to-red-500 rounded-full opacity-20 blur-sm" />
            <div className="absolute top-1/2 -right-12 w-16 h-16 bg-gradient-to-br from-red-300 to-red-500 rounded-xl rotate-45 opacity-25 blur-sm" />
          </div>

          {/* Custom bounce animation style */}
          <style jsx>{`
            @keyframes bounce-slow {
              0%,
              100% {
                transform: translateY(0);
                animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
              }
              50% {
                transform: translateY(-10px);
                animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
              }
            }
          `}</style>
        </div>
      </body>
    </html>
  );
}
