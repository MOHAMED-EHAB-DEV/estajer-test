"use client";
import FaqSection from "../shared/FaqSection";
import { useTranslations } from "@/hooks/useTranslations";

const AwarenessFaqs = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`awareness.awarenessFaqs.${text}`);
  const faqs = trans("awareness.awarenessFaqs.faqs");

  return (
    <FaqSection
      lang={lang}
      badge={t("badge")}
      title={t("title")}
      titleHighlight={t("titleHighlight")}
      faqs={faqs}
      action={t("action")}
      actionHref={`/${lang}/pricing`}
    />
  );
};

export default AwarenessFaqs;
