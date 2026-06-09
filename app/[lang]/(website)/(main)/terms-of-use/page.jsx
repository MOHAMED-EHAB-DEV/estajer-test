import Content from "@/components/cancellation/Content";
import ContentEn from "@/components/cancellation/ContentEn";
import MoreQuestions from "@/components/faqs/MoreQuestions";
import { getTranslations } from "@/hooks/getTranslations";
import React from "react";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "سياسة الإلغاء والاسترجاع | استأجر",
      description:
        "تعرف على سياسة الإلغاء والاسترجاع في منصة استأجر. نحن نوفر لك إمكانية إلغاء الطلبات واسترجاع الأموال بسهولة.",
    },
    en: {
      title: "Terms of Use & Refund Policy | Estajer",
      description:
        "Learn about Estajer's terms of use and refund policy. We provide easy cancellation and refund options.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}terms-of-use`,
      languages: {
        ar: `/terms-of-use`,
        en: `/en/terms-of-use`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}terms-of-use`,
      type: "website",
    },
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <>
      {lang === "ar" ? (
        <Content translate={translate} lang={lang} />
      ) : (
        <ContentEn translate={translate} lang={lang} />
      )}
      <MoreQuestions translate={translate()} lang={lang} />
    </>
  );
}
