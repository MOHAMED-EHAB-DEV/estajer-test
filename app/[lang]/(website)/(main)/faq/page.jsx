import FaqsContainer from "@/components/faqs/FaqsContainer";
import { getTranslations } from "@/hooks/getTranslations";
import Script from "next/script";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "الأسئلة الشائعة | استأجر",
      description:
        "احصل على إجابات لجميع الأسئلة الشائعة حول استأجر. نساعدك في فهم كيفية استخدام المنصة والاستفادة من خدماتنا.",
    },
    en: {
      title: "FAQ | Estajer",
      description:
        "Get answers to all frequently asked questions about Estajer. We help you understand how to use the platform and benefit from our services.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}faq`,
      languages: {
        ar: `/faq`,
        en: `/en/faq`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}faq`,
      type: "website",
    },
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["faqs"]);
  const translations = translate();

  // Get FAQ data from translations
  const rawFaqData = translate("faqs.faqs");
  const faqData = Array.isArray(rawFaqData) ? rawFaqData : [];
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const pageURL = `${siteURL}/${lang === "ar" ? "" : `${lang}/`}faq`;

  // Generate Comprehensive Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${pageURL}#faq`,
        mainEntity: faqData.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer.replace(/\n/g, " ").replace(/[●•]/g, "").trim(),
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageURL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: lang === "ar" ? "الرئيسية" : "Home",
            item: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: translate("faqs.mainTitle"),
            item: pageURL,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${siteURL}/#organization`,
        name: "Estajer",
        alternateName: "استأجر",
        url: siteURL,
        logo: {
          "@type": "ImageObject",
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768055959/logo_with_slogan_-estajer_y6tvqg_mujo45.webp",
        },
      },
    ],
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FaqsContainer translate={translations} lang={lang} />
    </>
  );
}
