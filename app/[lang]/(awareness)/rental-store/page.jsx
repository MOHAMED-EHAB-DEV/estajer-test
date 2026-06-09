import Hero from "@/components/awareness/Hero";
import Statistics from "@/components/awareness/Statistics";
import Segments from "@/components/awareness/Segments";
import CreateStore from "@/components/awareness/CreateStore";
import Commissions from "@/components/awareness/Commissions";
import Support from "@/components/awareness/Support";
import WhyOpenStore from "@/components/awareness/WhyOpenStore";
import HowToStart from "@/components/awareness/HowToStart";
import AwarenessFaqs from "@/components/awareness/AwarenessFaqs";
import FinalCTA from "@/components/awareness/FinalCTA";
import { getTranslations } from "@/hooks/getTranslations";
import MoreQuestions from "@/components/faqs/MoreQuestions";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const title = translate("awareness.metadata.title");
  const description = translate("awareness.metadata.description");
  const keywords = translate("awareness.metadata.keywords");

  return {
    title: title,
    description: description,
    keywords: keywords,
    authors: [{ name: lang === "ar" ? "استأجر" : "Estajer" }],
    publisher:
      lang === "ar"
        ? "استأجر - منصة تأجير المنتجات"
        : "Estajer - Product Rental Platform",
    alternates: {
      canonical: `${siteURL}/${lang}/awareness`,
      languages: {
        ar: `${siteURL}/ar/awareness`,
        en: `${siteURL}/en/awareness`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `${siteURL}/${lang}/awareness`,
      name: lang === "ar" ? "استأجر" : "Estajer",
      images: [
        {
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1775731147/Screenshot_2026-04-09_123320_rfzmbl.webp",
          width: 1900,
          height: 1050,
          alt:
            lang === "ar"
              ? "استأجر - منصة تأجير المنتجات"
              : "Estajer - Product Rental Platform",
        },
      ],
      locale: lang === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      site: "@Estajercom",
      creator: "@Estajercom",
      images: [
        "https://res.cloudinary.com/dhfzkadm2/image/upload/v1775731147/Screenshot_2026-04-09_123320_rfzmbl.webp",
      ],
    },
  };
}

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/awareness#awareness`,
    name: translate("awareness.metadata.title"),
    description: translate("awareness.metadata.description"),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/awareness`,
    inLanguage: lang === "ar" ? "ar-SA" : "en-US",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}/#website`,
      name: lang === "ar" ? "استأجر" : "Estajer",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    about: {
      "@type": "Organization",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}/#organization`,
      name: lang === "ar" ? "استأجر" : "Estajer",
      alternateName: lang === "ar" ? "Estajer" : "استأجر",
      url: process.env.NEXT_PUBLIC_APP_URL,
      logo: {
        "@type": "ImageObject",
        url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768055959/logo_with_slogan_-estajer_y6tvqg_mujo45.webp",
        width: 1572,
        height: 748,
      },
      description: translate("awareness.metadata.description"),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main
        className="-mt-[7.5rem] mx-auto relative min-h-screen"
        role="main"
        aria-label={translate("awareness.metadata.title")}
      >
        <Hero translate={translate()} lang={lang} />
        <Statistics translate={translate()} lang={lang} />
        <Segments translate={translate()} lang={lang} />
        <CreateStore translate={translate()} lang={lang} />
        <Commissions translate={translate()} lang={lang} />
        <Support translate={translate()} lang={lang} />
        <WhyOpenStore translate={translate()} lang={lang} />
        <HowToStart translate={translate()} lang={lang} />
        <AwarenessFaqs translate={translate()} lang={lang} />
        <FinalCTA translate={translate()} lang={lang} />
      </main>
    </>
  );
};

export default Page;
