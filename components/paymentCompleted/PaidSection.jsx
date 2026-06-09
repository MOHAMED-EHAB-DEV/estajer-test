import React from "react";
import PaymentSusses from "../ui/svgs/PaymentSussesSvg";
import Button from "../ui/Button";
import Link from "next/link";
import {useTranslations} from "@/hooks/useTranslations";
import { sendGTMEvent } from "@next/third-parties/google";

export default function PaidSection({ langPrefix, translate }) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`payment.paymentCompleted.${text}`);
  return (
    <>
      <PaymentSusses />
      <div className="flex-1">
        <h1 className="md:text-5xl text-3xl font-IBMPlex font-semibold text-primary md:mb-8 mb-4">
          {t("title")}
        </h1>
        <p className="md:text-3xl text-xl text-darkNavy md:leading-10">
          {t("description")}
        </p>
        <div className="md:mt-8 my-4">
          <Button
            as={Link}
            href={`/${langPrefix}dashboard/my-orders`}
            onClick={() => {
              try {
                sendGTMEvent({
                  event: "navigation_click",
                  link_text: t("button"),
                  location: "payment_completed",
                  section: "post_payment",
                  link_type: "internal",
                  href: `/${langPrefix}dashboard/my-orders`,
                });
              } catch {}
            }}
            className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
          >
            {t("button")}
          </Button>
        </div>
      </div>
    </>
  );
}
