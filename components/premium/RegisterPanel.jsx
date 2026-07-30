"use client";
import React, { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function RegisterPanel({ lang, langPrefix, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`auth.${key}`);

  const [data, setData] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      return setError(t("passwordsDoNotMatch"));
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          accountType: "personal",
          isRenter: true,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || t("failedToRegister"));
      window.location.href = `/${langPrefix}confirm-account?page=premium-checkout`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-2xl border border-red-200/50 leading-relaxed font-bold">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 ps-1">{t("fullName")}</label>
        <input
          type="text"
          required
          value={data.fullName}
          onChange={(e) => setData((p) => ({ ...p, fullName: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#F97316]/10 focus:border-[#F97316] transition-all"
          placeholder={t("placeholderFullName")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 ps-1">{t("email")}</label>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#F97316]/10 focus:border-[#F97316] transition-all"
            placeholder="example@email.com"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 ps-1">{t("phone")}</label>
          <input
            type="tel"
            required
            value={data.phone}
            onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#F97316]/10 focus:border-[#F97316] transition-all"
            placeholder="05xxxxxxxx"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 ps-1">{t("password")}</label>
          <input
            type="password"
            required
            value={data.password}
            onChange={(e) => setData((p) => ({ ...p, password: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#F97316]/10 focus:border-[#F97316] transition-all"
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 ps-1">{t("confirmPassword")}</label>
          <input
            type="password"
            required
            value={data.confirmPassword}
            onChange={(e) => setData((p) => ({ ...p, confirmPassword: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#F97316]/10 focus:border-[#F97316] transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-800 text-white font-extrabold py-4 rounded-2xl hover:bg-slate-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2 shadow-sm text-sm"
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {t("registerAndContinue")}
      </button>
    </form>
  );
}
