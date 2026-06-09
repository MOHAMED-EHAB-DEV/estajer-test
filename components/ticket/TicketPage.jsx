"use client";

import { useTranslations } from "@/hooks/useTranslations";
import TicketForm from "./TicketForm";
import PageTitle from "../shared/PageTitle";

export default function TicketPage({ lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`ticket.${key}`);

  return (
    <div className="py-10 bg-[#f9f9f9]">
      <PageTitle
        title={t("title")}
        description={t("description")}
        lang={lang}
      />
      <div className="flex max-w-screen-xl mx-auto px-4">
        <div className="grow md:p-10 px-4 py-8 bg-white rounded-xl shadow">
          <div className="md:mb-12 mb-8 text-center">
            <div className="lg:text-[1.9rem] md:text-[1.7rem] text-[1.5rem] font-semibold text-darkNavy font-IBMPlex mb-2">
              {t("formTitle")}
            </div>
          </div>
          <TicketForm t={t} lang={lang} translate={translate} />
        </div>
      </div>
    </div>
  );
}
