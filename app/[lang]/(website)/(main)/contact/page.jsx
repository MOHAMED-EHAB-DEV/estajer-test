import ContactPage from "@/components/ticket/TicketPage";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "تواصل معنا | استأجر",
      description:
        "تواصل مع فريق استأجر للحصول على الدعم والمساعدة. نحن هنا للإجابة على جميع استفساراتك.",
    },
    en: {
      title: "Contact Us | Estajer",
      description:
        "Contact Estajer team for support and assistance. We're here to answer all your questions.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}contact`,
      languages: {
        ar: `/contact`,
        en: `/en/contact`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}contact`,
      type: "website",
    },
  };
}

export default async function Contact({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <main>
      <ContactPage lang={lang} translate={translate()} />
    </main>
  );
}
