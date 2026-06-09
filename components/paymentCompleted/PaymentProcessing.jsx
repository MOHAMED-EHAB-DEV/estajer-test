import React from "react";
import PaymentProcessingSvg from "../ui/svgs/PaymentProcessingSvg";
import Button from "../ui/Button";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { sendGTMEvent } from "@next/third-parties/google";

export default function PaymentProcessing({ langPrefix, translate }) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`payment.paymentProcessing.${text}`);

  return (
    <>
      <PaymentProcessingSvg />
      <div className="flex-1">
        <h1 className="md:text-[2.5rem] text-3xl font-IBMPlex font-semibold text-primary md:mb-8 mb-4">
          {t("title")}
        </h1>
        <p className="md:text-2xl text-lg text-darkNavy md:leading-10 mb-4">
          {t("description")}
        </p>
        {/* Processing Time Info Box */}
        <div className="bg-blue-50 border-s-4 border-blue-400 p-4 rounded-e-lg mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-blue-800 font-medium md:text-lg text-base">
                {t("processingTimeTitle")}
              </p>
              <p className="text-blue-700 md:text-base text-sm mt-1">
                {t("processingTimeDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="md:mt-8 my-4 flex flex-col sm:flex-row gap-4">
          <Button
            as={Link}
            href={`/${langPrefix}dashboard/my-orders`}
            onClick={() => {
              try {
                sendGTMEvent({
                  event: "navigation_click",
                  link_text: t("button"),
                  location: "payment_processing",
                  section: "bank_transfer",
                  link_type: "internal",
                  href: `/${langPrefix}dashboard/my-orders`,
                });
              } catch {}
            }}
            className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
          >
            {t("button")}
          </Button>

          <Button
            as={Link}
            color="default"
            variant="bordered"
            href={`/${langPrefix}contact`}
            onClick={() => {
              try {
                sendGTMEvent({
                  event: "support_click",
                  location: "payment_processing",
                  link_text: t("contactSupport"),
                });
              } catch {}
            }}
            className="md:text-xl text-lg md:py-8 py-7 md:px-12 px-8 font-IBMPlex"
          >
            {t("contactSupport")}
          </Button>
        </div>
      </div>
    </>
  );
}
