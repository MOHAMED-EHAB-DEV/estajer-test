import React from "react";
import { getTranslations } from "@/hooks/getTranslations";
import WhyEstajerContent from "./WhyEstajerContent";

export default async function WhyEstajer({ lang }) {
  const t = await getTranslations(lang, ["home"]);

  return <WhyEstajerContent translate={t()} lang={lang} />;
}
