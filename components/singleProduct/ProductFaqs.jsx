"use client";
import FaqSection from "@/components/shared/FaqSection";
import { useTranslations } from "@/hooks/useTranslations";
import Script from "next/script";

const ProductFaqs = ({ translate, lang, product }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`product.faqs.${text}`);
  const faqsData = trans("product.faqs.faqs");

  const name = product?.name || "";
  const city = product?.address?.city || "";

  // Replace placeholders in faqs
  const processedFaqs = Array.isArray(faqsData)
    ? faqsData.map((faq) => ({
        ...faq,
        question: faq.question?.replace("{name}", name).replace("{city}", city),
        answer: faq.answer?.replace("{name}", name).replace("{city}", city),
      }))
    : [];

  // Generate Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: processedFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/\n/g, " ").replace(/[●•]/g, "").trim(),
      },
    })),
  };

  return (
    <>
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FaqSection
        lang={lang}
        badge={t("badge")}
        title={t("title").replace("{name}", name).replace("{city}", city)}
        faqs={processedFaqs}
        className="mb-16 md:mb-24 py-4 lg:py-8 bg-transparent"
        containerClassName="max-w-4xl mx-auto"
        accordionClassName=""
      />
    </>
  );
};

export default ProductFaqs;
