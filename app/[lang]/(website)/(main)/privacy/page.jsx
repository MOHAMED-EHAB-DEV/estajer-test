import MoreQuestions from "@/components/faqs/MoreQuestions";
import ContentSection from "@/components/privacy/ContentSection";
import ContentSectionEn from "@/components/privacy/ContentSectionEn";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "سياسة الخصوصية | استأجر",
      description:
        "اطلع على سياسة الخصوصية الخاصة بمنصة استأجر. نحن نحترم خصوصيتك ونحمي بياناتك الشخصية.",
    },
    en: {
      title: "Privacy Policy | Estajer",
      description:
        "Read Estajer's privacy policy. We respect your privacy and protect your personal data.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}privacy`,
      languages: {
        ar: `/privacy`,
        en: `/en/privacy`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}privacy`,
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
        <ContentSection translate={translate} lang={lang} />
      ) : (
        <ContentSectionEn translate={translate} lang={lang} />
      )}
      <MoreQuestions translate={translate()} lang={lang} />
    </>
  );
}
