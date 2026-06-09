"use client";
import FaqSection from "../shared/FaqSection";
import { useTranslations } from "@/hooks/useTranslations";

const MarketingFaqs = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.faqs.${key}`);
  const items = trans("marketing.faqs.items");

  return (
    <FaqSection
      lang={lang}
      badge={t("badge")}
      title={t("title")}
      titleHighlight={t("titleHighlight")}
      faqs={items}
      action={t("footerBtn")}
      actionHref={`/${lang}/pricing`}
      footerTitle={t("footerTitle")}
    />
  );
};

export default MarketingFaqs;
