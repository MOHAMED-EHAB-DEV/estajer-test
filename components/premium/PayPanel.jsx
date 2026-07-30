"use client";
import React, { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { getPricingPlans } from "@/lib/pricingPlans";

export default function PayPanel({
  user,
  lang,
  langPrefix,
  selectedPlan,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`shopCheckout.${key}`);

  const PLANS = getPricingPlans(trans, { user, lang });

  const plan = PLANS[selectedPlan];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/premium/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error === "invalid_coupon"
            ? t("couponInvalid")
            : data.error === "expired_coupon"
              ? t("couponInvalid")
              : data.error === "usage_limit_exceeded"
                ? t("couponInvalid")
                : t("couponInvalid"),
        );
      }
      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (
          result.error === "already_growth" ||
          result.error === "already_starter"
        ) {
          window.location.href = `/${langPrefix}dashboard/my-shop`;
          return;
        }
        throw new Error(
          result.error === "invalid_coupon"
            ? t("couponInvalid")
            : result.error === "expired_coupon"
              ? t("couponInvalid")
              : result.error === "usage_limit_exceeded"
                ? t("couponInvalid")
                : result.error || t("failedToCreatePayment"),
        );
      }

      if (result.activated) {
        window.location.href = `/${langPrefix}premium-completed/${result.milestoneId}`;
        return;
      }

      if (window.WaffyPaymentDisplay) {
        const displayInstance = new window.WaffyPaymentDisplay({
          debug: false,
        });
        displayInstance.display({
          paymentUrl: result.paymentUrl,
          userToken: result.customerToken,
          mode: "redirect",
        });
      } else {
        window.location.href = `${result.paymentUrl}&userTokenUrl=${result.customerToken}`;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasCoupon = !!appliedCoupon;
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;

  const priceBase = hasCoupon
    ? Math.round((plan.priceBase * (100 - discountPercent)) / 100)
    : plan.priceBase;
  const priceTax = hasCoupon ? Math.round(priceBase * 0.15) : plan.priceTax;
  const priceTotal = hasCoupon ? priceBase + priceTax : plan.priceTotal;
  const discountAmount = plan.priceTotal - priceTotal;

  const durationLabel =
    appliedCoupon && appliedCoupon.trialMonths
      ? t("trialDuration").replace("{months}", appliedCoupon.trialMonths)
      : t("fullYear");

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#F97316]/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#FFF5EC] flex items-center justify-center text-[#F97316] font-bold text-base">
              {user.fullName?.[0]}
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-800 text-xs">
              {user.fullName}
            </h4>
            <p className="text-neutral-400 text-[10px]">{user.email}</p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          {t("verifiedAccount")}
        </span>
      </div>

      {/* Coupon Field */}
      <div className="space-y-2">
        <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
          {t("couponCode")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t("couponCode")}
            value={couponInput}
            onChange={(e) =>
              setCouponInput(e.target.value.toUpperCase().trim())
            }
            disabled={validatingCoupon || hasCoupon}
            className="flex-1 bg-slate-50 border border-slate-200/70 focus:border-orange-500 focus:bg-white transition-colors rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider disabled:opacity-65"
          />
          {!hasCoupon ? (
            <button
              onClick={handleApplyCoupon}
              disabled={validatingCoupon || !couponInput.trim()}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 text-xs"
            >
              {validatingCoupon ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t("applyCoupon")
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setAppliedCoupon(null);
                setCouponInput("");
                setCouponError("");
              }}
              className="bg-red-50 hover:bg-red-100/70 border border-red-200 text-red-600 font-extrabold px-5 py-3 rounded-xl transition-colors text-xs"
            >
              {t("remove")}
            </button>
          )}
        </div>
        {hasCoupon && (
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 text-green-700 text-xs font-bold leading-normal">
            {t("couponApplied")} ({appliedCoupon.code} -{" "}
            {appliedCoupon.discountPercent}%)
          </div>
        )}
        {couponError && (
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 text-red-600 text-xs font-bold leading-normal">
            {couponError}
          </div>
        )}
      </div>

      {/* Invoice Breakdown */}
      <div className="border border-neutral-100 rounded-2xl p-5 space-y-4 bg-white shadow-sm">
        <h4 className="text-xs font-black text-slate-800 pb-2 border-b border-neutral-100">
          {t("invoiceDetails")}
        </h4>
        {appliedCoupon && appliedCoupon.trialMonths && (
          <div className="bg-orange-50 border border-orange-200/50 rounded-xl p-3 text-[#EA580C] text-[11px] font-bold flex items-start gap-2.5 leading-normal">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {t("trialDurationNotice").replace(
                "{months}",
                appliedCoupon.trialMonths,
              )}
            </span>
          </div>
        )}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              {plan.name} ({durationLabel})
            </span>
            <span
              className={`font-semibold text-slate-700 ${hasCoupon ? "line-through text-neutral-400 text-[11px]" : ""}`}
            >
              {plan.priceBase} {t("currency")}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-100/50 pb-2.5">
            <span>{t("subscriptionDuration")}</span>
            <span
              className={`font-bold ${appliedCoupon && appliedCoupon.trialMonths ? "text-[#EA580C]" : "text-slate-700"}`}
            >
              {appliedCoupon && appliedCoupon.trialMonths
                ? t("trialMonthsCount").replace(
                    "{months}",
                    appliedCoupon.trialMonths,
                  )
                : t("oneYear")}
            </span>
          </div>

          {hasCoupon && (
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {plan.name} ({t("afterDiscount")})
              </span>
              <span className="font-bold text-slate-700">
                {priceBase} {t("currency")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{t("vat")}</span>
            <span
              className={`font-semibold text-slate-700 ${hasCoupon ? "line-through text-neutral-400 text-[11px]" : ""}`}
            >
              {plan.priceTax} {t("currency")}
            </span>
          </div>

          {hasCoupon && (
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{t("vatAfterDiscount")}</span>
              <span className="font-bold text-slate-700 font-NotoSansArabic">
                {priceTax} {t("currency")}
              </span>
            </div>
          )}

          {hasCoupon && discountAmount > 0 && (
            <div className="flex items-center justify-between text-xs text-green-600 bg-green-50/50 border border-green-100/50 rounded-xl px-3 py-2 font-bold">
              <span>
                {t("discount")} ({discountPercent}%)
              </span>
              <span>
                -{discountAmount} {t("currency")}
              </span>
            </div>
          )}

          <div className="border-t border-dashed border-neutral-200 pt-3 flex items-center justify-between font-bold text-slate-800 text-sm">
            <span>{t("totalAmount")}</span>
            <span className="text-[#F97316] text-lg font-black">
              {priceTotal} {t("currency")}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-2xl border border-red-200/50 leading-relaxed font-bold">
          {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-extrabold py-4 rounded-2xl hover:opacity-95 transition-opacity disabled:opacity-60 flex items-center justify-center gap-3 text-base shadow-lg shadow-orange-500/20"
      >
        {loading ? (
          <svg
            className="w-5 h-5 animate-spin text-white"
            viewBox="0 0 24 24"
            fill="none"
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
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        )}
        {loading
          ? priceTotal === 0
            ? t("activatingSubscription")
            : t("preparingPayment")
          : priceTotal === 0
            ? t("confirmAndActivate")
            : `${t("confirmAndPay")} ${priceTotal} ${t("currency")}`}
      </button>

      <p className="text-center text-[10px] text-neutral-400">
        {t("byPayingAgree")}{" "}
        <a
          href={`/${langPrefix}terms-of-use`}
          className="text-[#F97316] hover:underline font-bold"
        >
          {t("terms")}
        </a>
      </p>
    </div>
  );
}
