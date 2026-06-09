"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function McpAuthClient({ code, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`mcpAuth.${key}`);

  const [status, setStatus] = useState("loading"); // loading | success | error | expired
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage(t("missingCode"));
      return;
    }

    async function authorize() {
      try {
        const res = await fetch("/api/mcp/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();

        if (res.status === 410) {
          setStatus("expired");
          setMessage(t("expired"));
        } else if (res.status === 409) {
          setStatus("success");
          setMessage(t("alreadyAuthorized"));
        } else if (!res.ok) {
          setStatus("error");
          setMessage(data.error || t("somethingWrong"));
        } else {
          setStatus("success");
          setUserName(data.user?.name || "");
          setMessage(t("success"));
        }
      } catch {
        setStatus("error");
        setMessage(t("serverError"));
      }
    }

    authorize();
  }, [code]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#fff7f0] via-[#fff] to-[#fff3ea] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[24px] shadow-[0_8px_48px_rgba(244,138,66,0.12),_0_2px_12px_rgba(0,0,0,0.06)] px-10 py-12 max-w-[480px] w-full text-center">
        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-primary to-[#ff6b35] flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(244,138,66,0.35)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-[#1a1a2e] mb-1.5">
            {t("title")}
          </h1>
          <p className="text-sm text-[#888] m-0">
            {t("subtitle")}
          </p>
        </div>

        {/* Status Card */}
        <div
          className={`rounded-2xl py-7 px-6 border ${
            status === "success"
              ? "bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-[#86efac]"
              : status === "expired"
                ? "bg-gradient-to-br from-[#fefce8] to-[#fef9c3] border-[#fde68a]"
                : status === "error"
                  ? "bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] border-[#fca5a5]"
                  : "bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border-[#e2e8f0]"
          }`}
        >
          {status === "loading" && (
            <>
              <Spinner />
              <p className="text-[#64748b] text-[15px] mt-4">
                {t("verifying")}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <svg className="w-12 h-12 text-[#16a34a] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {userName && (
                <p className="text-xs text-[#16a34a] font-semibold mb-1.5">
                  {t("welcome").replace("{name}", userName)}
                </p>
              )}
              <p className="text-[15px] text-[#15803d] font-medium m-0">
                {message}
              </p>
            </>
          )}

          {status === "expired" && (
            <>
              <svg className="w-12 h-12 text-[#a16207] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[15px] text-[#a16207] font-medium m-0">
                {message}
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <svg className="w-12 h-12 text-[#dc2626] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[15px] text-[#dc2626] font-medium m-0">
                {message}
              </p>
            </>
          )}
        </div>

        {/* Footer note */}
        {status === "success" && (
          <p className="mt-6 text-[13px] text-[#94a3b8] leading-relaxed">
            {t("footerNote")}
          </p>
        )}

        <p className="mt-5 text-xs text-[#cbd5e1]">
          {t("platformName")}
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 border-[3px] border-[#f1f5f9] border-t-primary rounded-full animate-spin mx-auto" />
  );
}
