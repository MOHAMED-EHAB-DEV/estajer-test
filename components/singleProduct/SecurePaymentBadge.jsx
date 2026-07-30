import React from "react";
import Link from "next/link";

export default function SecurePaymentBadge({ title, desc, lang = "ar" }) {
  const langPrefix = lang === "ar" ? "" : "/en";

  const renderDesc = () => {
    if (typeof desc !== "string") return desc;
    if (!desc.includes("{support}")) return desc;

    const parts = desc.split("{support}");
    return (
      <>
        {parts[0]}
        <Link
          href={`${langPrefix}/contact`}
          className="underline font-semibold hover:text-emerald-700 transition-colors"
        >
          {lang === "ar" ? "الدعم" : "support"}
        </Link>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 flex items-start gap-2">
      <svg
        className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
          clipRule="evenodd"
        />
      </svg>
      <div className="text-sm leading-relaxed text-emerald-950">
        <span className="font-bold text-emerald-800 me-1.5">{title}</span>
        <span className="text-emerald-800/90">{renderDesc()}</span>
      </div>
    </div>
  );
}
