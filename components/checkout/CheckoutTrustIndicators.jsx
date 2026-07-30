import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#F48A42" />
      <path
        d="M9 11.5l2 2 4.5-4.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRefund() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10C22 6.477 17.523 2 12 2z"
        fill="#F48A42"
      />
      <path
        d="M16.5 12c0-2.485-2.015-4.5-4.5-4.5V5.5L8.5 9l3.5 3.5V10c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3H7.5c0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5z"
        fill="white"
      />
    </svg>
  );
}

function IconSupport() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338A9.955 9.955 0 0012 22z"
        fill="#F48A42"
      />
      <path
        d="M8 12h8m-8-4h5m-5 8h3"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CheckoutTrustIndicators({ lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans("checkout.trustIndicators." + key);

  const indicators = [
    {
      icon: <IconShield />,
      title: t("secureEscrowTitle"),
      desc: t("secureEscrowDesc"),
    },
    {
      icon: <IconRefund />,
      title: t("refundGuaranteeTitle"),
      desc: t("refundGuaranteeDesc"),
    },
    {
      icon: <IconSupport />,
      title: t("supportTitle"),
      desc: t("supportDesc"),
    },
  ];

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl shadow-sm p-5">
      <div className="flex flex-col divide-y divide-gray-100">
        {indicators.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 ${idx === 0 ? "pb-4" : idx === indicators.length - 1 ? "pt-4" : "py-4"}`}
          >
            <div className="w-11 h-11 rounded-xl bg-[#fff7ed] flex items-center justify-center shrink-0 text-primary">
              {item.icon}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1a1a2e] mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
