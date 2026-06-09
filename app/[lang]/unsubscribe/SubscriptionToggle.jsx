"use client";
import { useState, useTransition } from "react";

export default function SubscriptionToggle({ initialUnsubscribed, lang }) {
  const isRtl = lang === "ar";
  const [unsubscribed, setUnsubscribed] = useState(initialUnsubscribed);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const translations = {
    ar: {
      unsubscribeBtn: "إلغاء الاشتراك في رسائل البريد الإلكتروني",
      subscribeBtn: "إعادة الاشتراك في رسائل البريد الإلكتروني",
      loadingUnsubscribe: "جارٍ إلغاء الاشتراك...",
      loadingSubscribe: "جارٍ إعادة الاشتراك...",
      successUnsubscribe: "تم إلغاء اشتراكك بنجاح ✓",
      successSubscribe: "تم تفعيل اشتراكك بنجاح ✓",
      alreadyUnsubscribed: "لقد قمت بإلغاء الاشتراك.",
      alreadySubscribed: "أنت مشترك حالياً في رسائل البريد الإلكتروني.",
      errorMsg: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      unsubscribedLabel: "غير مشترك",
      subscribedLabel: "مشترك",
    },
    en: {
      unsubscribeBtn: "Unsubscribe from emails",
      subscribeBtn: "Resubscribe to emails",
      loadingUnsubscribe: "Unsubscribing...",
      loadingSubscribe: "Resubscribing...",
      successUnsubscribe: "Successfully unsubscribed ✓",
      successSubscribe: "Successfully resubscribed ✓",
      alreadyUnsubscribed: "You are currently unsubscribed.",
      alreadySubscribed: "You are currently subscribed to emails.",
      errorMsg: "Something went wrong. Please try again.",
      unsubscribedLabel: "Unsubscribed",
      subscribedLabel: "Subscribed",
    },
  };

  const t = translations[lang] || translations["ar"];

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      try {
        const endpoint = unsubscribed
          ? "/api/auth/subscribe"
          : "/api/auth/unsubscribe";
        const res = await fetch(endpoint, { method: "GET" });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || t.errorMsg);
        }

        setUnsubscribed((prev) => !prev);
      } catch (err) {
        setError(err.message || t.errorMsg);
      }
    });
  };

  const isLoading = isPending;
  const buttonLabel = isLoading
    ? unsubscribed
      ? t.loadingUnsubscribe
      : t.loadingSubscribe
    : unsubscribed
      ? t.unsubscribeBtn
      : t.subscribeBtn;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Status badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500"
        style={{
          backgroundColor: unsubscribed
            ? "rgba(244, 138, 66, 0.15)"
            : "rgba(107, 114, 128, 0.15)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: unsubscribed
            ? "rgba(244, 138, 66, 0.4)"
            : "rgba(107, 114, 128, 0.3)",
          color: unsubscribed ? "#f48a42" : "#9ca3af",
        }}
        role="status"
        aria-live="polite"
      >
        {/* Dot indicator */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500"
          style={{
            backgroundColor: unsubscribed ? "#f48a42" : "#6b7280",
            boxShadow: unsubscribed ? "0 0 6px #f48a42" : "none",
          }}
        />
        <span>{unsubscribed ? t.subscribedLabel : t.unsubscribedLabel}</span>
      </div>

      {/* Status description */}
      <p className="text-gray-600 text-sm text-center leading-relaxed transition-all duration-300">
        {unsubscribed ? t.alreadyUnsubscribed : t.alreadySubscribed}
      </p>

      {/* Error message */}
      {error && (
        <p
          className="text-sm text-center px-4 py-2 rounded-xl"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "#f87171",
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Main toggle button */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
        style={
          unsubscribed
            ? {
                background: "linear-gradient(135deg, #f48a42 0%, #e67e22 100%)",
                color: "#ffffff",
                boxShadow: "0 10px 30px rgba(244, 138, 66, 0.35)",
              }
            : {
                backgroundColor: "transparent",
                color: "#f48a42",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: "rgba(244, 138, 66, 0.5)",
                boxShadow: "0 4px 15px rgba(244, 138, 66, 0.1)",
              }
        }
        aria-label={buttonLabel}
      >
        {/* Shimmer effect on hover */}
        {unsubscribed && (
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        {isLoading ? (
          /* Spinner */
          <svg
            className="w-5 h-5 animate-spin flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : unsubscribed ? (
          /* Unsubscribe icon — envelope with X */
          <svg
            className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18" />
          </svg>
        ) : (
          /* Resubscribe icon — envelope with check */
          <svg
            className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75"
            />
          </svg>
        )}

        <span className="relative">{buttonLabel}</span>
      </button>
    </div>
  );
}
