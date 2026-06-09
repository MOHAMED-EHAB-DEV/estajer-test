import OurValues from "@/components/about/OurValues";
import IncomeValue from "@/components/about/IncomeValue";
import Vision2030 from "@/components/about/Vision2030";
import AboutSection from "@/components/about/About";
import { Cloud } from "@/components/ui/svgs/icons/CloudSvg";
import { getTranslations } from "@/hooks/getTranslations";
import MoreQuestions from "@/components/faqs/MoreQuestions";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const title = translate("about.metadata.title");
  const description = translate("about.metadata.description");
  const keywords = translate("about.metadata.keywords");

  return {
    title: title,
    description: description,
    keywords: keywords,
    authors: [{ name: lang === "ar" ? "فريق استأجر" : "Estajer Team" }],
    publisher:
      lang === "ar"
        ? "استأجر - منصة تأجير المنتجات"
        : "Estajer - Product Rental Platform",
    alternates: {
      canonical: `${siteURL}/${lang}/about`,
      languages: {
        ar: `${siteURL}/ar/about`,
        en: `${siteURL}/en/about`,
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
      url: `${siteURL}/${lang}/about`,
      siteName: lang === "ar" ? "استأجر" : "Estajer",
      images: [
        {
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp",
          width: 1900,
          height: 1056,
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
        "https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp",
      ],
    },
  };
}

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/about#about`,
    name: translate("about.metadata.title"),
    description: translate("about.metadata.description"),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/about`,
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
      description: translate("about.metadata.description"),
      address: {
        "@type": "PostalAddress",
        addressCountry: "SA",
        addressLocality: lang === "ar" ? "الرياض" : "Riyadh",
      },
      areaServed: {
        "@type": "Country",
        name: lang === "ar" ? "السعودية" : "Saudi Arabia",
      },
    },
    mainEntity: {
      "@type": "Organization",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}/#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main
        className="relative min-h-screen -mt-[7.5rem]"
        role="main"
        aria-label={translate("about.metadata.title")}
      >
        <AboutSection translate={translate()} lang={lang} />
        <OurValues translate={translate()} lang={lang} />
        <IncomeValue translate={translate()} />
        <Vision2030 translate={translate()} />
        <MoreQuestions translate={translate()} lang={lang} />
      </main>
    </>
  );
};

export default Page;
