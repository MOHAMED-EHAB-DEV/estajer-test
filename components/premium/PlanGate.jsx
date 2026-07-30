"use client";
import Link from "next/link";
import { PRICING_PLANS_CONFIG } from "@/lib/pricingPlans";

/**
 * PlanGate — wraps any shop editor field/control to show a Growth upgrade
 * teaser for Starter users instead of the actual editable field.
 *
 * Usage:
 *   <PlanGate userPlan={userPlan} lang={lang}>
 *     <input ... />
 *   </PlanGate>
 *
 * Props:
 *   userPlan  — "starter" | "growth" | null
 *   lang      — "ar" | "en"
 *   label     — short feature name shown in the lock badge (Arabic)
 *   children  — the actual field to render when unlocked
 */
export default function PlanGate({
  userPlan,
  withPadding,
  lang,
  label = "هذه الميزة",
  children,
  onUpgrade,
}) {
  const isLocked = !userPlan || userPlan === "starter";
  const langPrefix = lang === "ar" ? "" : "en/";

  if (!isLocked) return children;

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${
        withPadding ? "pb-4" : ""
      }`}
    >
      {/* Lock overlay */}
      <div className="flex px-4 py-6 items-center justify-center rounded-xl border bg-gradient-to-br from-[#fff8f3] to-[#fff5ec]  border-[#FDE5D0]">
        <div className="flex flex-col items-center gap-2 text-center ">
          <div className="w-7 h-7 rounded-full bg-[#FFF5EC] flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-[#F97316]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <p className="text-[11px] font-bold text-[#374151] leading-snug">
            {label} متاحة في باقة النمو
          </p>
          {onUpgrade ? (
            <button
              onClick={onUpgrade}
              type="button"
              className="text-[10px] font-bold text-white bg-[#F97316] px-3 py-1 rounded-full hover:bg-[#ea580c] transition-colors whitespace-nowrap"
            >
              {lang === "ar" ? "ترقية إلى باقة النمو" : "Upgrade to Growth"}
            </button>
          ) : (
            <Link
              href={`/${langPrefix}${PRICING_PLANS_CONFIG.growth.checkoutPath.replace(/^\//, "")}`}
              className="text-[10px] font-bold text-white bg-[#F97316] px-3 py-1 rounded-full hover:bg-[#ea580c] transition-colors whitespace-nowrap"
            >
              {lang === "ar" ? "ترقية إلى باقة النمو" : "Upgrade to Growth"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PlanUpgradeBanner — Sticky sidebar banner for Starter users.
 * Shows a compact prompt to upgrade to Growth.
 */
export function PlanUpgradeBanner({ lang, onUpgrade }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const content = (
    <>
      <div className="w-8 h-8 rounded-xl bg-[#F97316]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg
          className="w-4 h-4 text-[#F97316]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0 text-start">
        <p className="text-[11px] font-bold text-[#111827] leading-snug mb-0.5">
          {lang === "ar" ? "أنت على باقة البداية" : "You are on Starter"}
        </p>
        <p className="text-[10px] text-[#6B7280] leading-snug">
          {lang === "ar"
            ? "ترقّ إلى باقة النمو للحصول على domain مخصص وعمولة 5% وجميع الثيمات"
            : "Upgrade to Growth for custom domain, 5% commission, and all themes"}
        </p>
        <span className="text-[10px] font-bold text-[#F97316] group-hover:underline mt-1 inline-block">
          {lang === "ar" ? "ترقية الآن ←" : "Upgrade Now ←"}
        </span>
      </div>
    </>
  );

  if (onUpgrade) {
    return (
      <button
        onClick={onUpgrade}
        type="button"
        className="w-full text-start group flex items-start gap-3 bg-gradient-to-br from-[#fff8f3] to-[#fff5ec] border border-[#FDE5D0] rounded-2xl p-3.5 hover:border-[#F97316]/40 transition-all hover:shadow-md hover:shadow-orange-100"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={`/${langPrefix}premium-checkout?plan=growth`}
      className="group flex items-start gap-3 bg-gradient-to-br from-[#fff8f3] to-[#fff5ec] border border-[#FDE5D0] rounded-2xl p-3.5 hover:border-[#F97316]/40 transition-all hover:shadow-md hover:shadow-orange-100"
    >
      {content}
    </Link>
  );
}

export function PlanActiveGrowthBanner({ lang }) {
  return (
    <div className="w-full text-start flex items-start gap-3 bg-gradient-to-br from-[#FFFDF9] to-[#FFF9EC] border border-[#FBE8C5] rounded-2xl p-3.5 shadow-sm relative overflow-hidden">
      <div className="w-8 h-8 rounded-xl bg-[#FFF2D4] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#FBE8C5]">
        <svg
          className="w-4 h-4 text-[#D97706]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0 text-start">
        <p className="text-[11px] font-bold text-[#92400E] leading-snug mb-0.5 tracking-wide">
          {lang === "ar" ? "باقة النمو المتميزة نشطة" : "Active Growth Plan"}
        </p>
        <p className="text-[10px] text-[#78350F] leading-relaxed">
          {lang === "ar"
            ? "حسابك مجهز بكامل الميزات الحصرية: نطاق خاص، عمولة 5% مخفضة، وجميع الثيمات."
            : "Fully unlocked with all premium features: Custom domain, 5% low commission, and all themes."}
        </p>
      </div>
    </div>
  );
}
