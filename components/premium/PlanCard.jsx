"use client";
import { useTranslations } from "@/hooks/useTranslations";

export default function PlanCard({
  plan,
  selected,
  onSelect,
  lang,
  translate,
  disabled = false,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`shopCheckout.${key}`);
  const isGrowth = plan.id === "growth";

  const labelDiscount = plan.discountRate
    ? `${plan.discountNote || (lang === "ar" ? "خصم لفترة محدودة" : "Limited-time discount")} (${plan.discountRate})`
    : isGrowth
      ? (lang === "ar" ? "خصم 47% لفترة محدودة" : "47% limited-time discount")
      : (lang === "ar" ? "خصم 38% لفترة محدودة" : "38% limited-time discount");

  const oldPrice = plan.discountOld || (isGrowth
    ? (lang === "ar" ? "4500 ر.س" : "4,500 SAR")
    : (lang === "ar" ? "1600 ر.س" : "1,600 SAR"));

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(plan.id)}
      className={`relative w-full text-start rounded-[24px] p-6 md:p-8 border-2 transition-all duration-300 focus:outline-none flex flex-col justify-between ${
        disabled
          ? "border-neutral-200 bg-neutral-50/50 opacity-70 cursor-not-allowed"
          : selected
            ? isGrowth
              ? "border-[#F97316] bg-gradient-to-b from-[#FFFaf6] to-white shadow-[0_20px_50px_-12px_rgba(249,115,22,0.15)] transform hover:scale-[1.01]"
              : "border-slate-800 bg-gradient-to-b from-slate-50/50 to-white shadow-[0_20px_50px_-12px_rgba(30,41,59,0.1)] transform hover:scale-[1.01]"
            : "border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-md transform hover:scale-[1.01]"
      }`}
    >
      {/* Badge */}
      <div
        className={`absolute -top-3 start-6 px-4 py-1 rounded-full text-[10px] md:text-xs font-extrabold tracking-wide uppercase shadow-sm ${
          isGrowth
            ? "bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white"
            : "bg-slate-800 text-white"
        }`}
      >
        {plan.badge}
      </div>

      {/* Selector Checkbox */}
      <div className="w-full flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {t("planLabel")}
          </span>
          <h3
            className={`text-xl md:text-2xl font-black mt-0.5 ${isGrowth ? "text-[#F97316]" : "text-slate-800"}`}
          >
            {plan.name}
          </h3>
        </div>
        {disabled ? (
          <div className="bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
            {t("currentPlan")}
          </div>
        ) : (
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selected
                ? isGrowth
                  ? "border-[#F97316] bg-[#F97316] shadow-sm shadow-[#F97316]/50"
                  : "border-slate-800 bg-slate-800 shadow-sm"
                : "border-neutral-300"
            }`}
          >
            {selected && (
              <svg
                className="w-3.5 h-3.5 text-white fill-current"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      <p className="text-neutral-500 text-xs md:text-sm mb-6 leading-relaxed">
        {plan.desc}
      </p>

      {/* Price Section */}
      <div className="mb-6 flex flex-col justify-end">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${isGrowth ? "text-[#F97316]" : "text-slate-800"}`}
          >
            {plan.priceBase}
          </span>
          <div className="flex flex-col text-neutral-400">
            <span className="text-sm font-bold">{t("currency")}</span>
            <span className="text-[10px]">{t("perYear")}</span>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-1 font-medium">
          {t("inclVat")} {plan.priceTotal} {t("currency")}
        </p>
      </div>

      {/* Discount Highlight */}
      <div
        className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-6 transition-colors ${
          selected
            ? isGrowth
              ? "bg-[#FFF5EC] border border-[#FDE5D0]"
              : "bg-slate-50 border border-slate-200"
            : "bg-neutral-50 border border-neutral-100"
        }`}
      >
        <span
          className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center ${
            isGrowth ? "bg-[#F97316] text-white" : "bg-slate-800 text-white"
          }`}
        >
          %
        </span>
        <div className="flex-1">
          <p
            className={`text-xs font-bold ${isGrowth ? "text-[#F97316]" : "text-slate-800"}`}
          >
            {labelDiscount}
          </p>
        </div>
        <span className="text-[10px] text-neutral-400 line-through font-medium">
          {oldPrice}
        </span>
      </div>

      {/* Separator */}
      <div className="w-full border-t border-neutral-100 my-2" />

      {/* Features List */}
      <ul className="space-y-3.5 mt-4 w-full">
        {plan.features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-xs md:text-sm text-neutral-600 leading-snug"
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isGrowth
                  ? "bg-[#FFF5EC] text-[#F97316]"
                  : "bg-slate-50 text-slate-800"
              }`}
            >
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className={i === 0 ? "font-bold text-neutral-800" : ""}>
              {f}
            </span>
          </li>
        ))}
        {/* {plan.lockedFeatures.map((f, i) => (
          <li
            key={`locked-${i}`}
            className="flex items-start gap-3 text-xs md:text-sm text-neutral-400 leading-snug"
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 bg-neutral-50 text-neutral-400 mt-0.5 border border-neutral-200">
              <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zM9 7a3 3 0 016 0v3H9V7zm3 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span>{f}</span>
          </li>
        ))} */}
      </ul>
    </button>
  );
}
