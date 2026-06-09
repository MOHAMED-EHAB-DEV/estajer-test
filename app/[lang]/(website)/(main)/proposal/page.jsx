import ProposalPage from "@/components/proposal/ProposalPage";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "طلب منتج | استأجر",
      description:
        "طلب منتجاً تريد تأجيره على منصة استأجر. نحن نستمع لاقتراحاتك ونعمل على توفير المنتجات التي تحتاجها.",
    },
    en: {
      title: "Request a Product | Estajer",
      description:
        "Request a product you'd like to rent on Estajer platform. We listen to your suggestions and work to provide the products you need.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}proposal`,
      languages: {
        ar: `/proposal`,
        en: `/en/proposal`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}proposal`,
      type: "website",
    },
  };
}

export default async function Contact({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <main>
      <ProposalPage lang={lang} translate={translate()} />
    </main>
  );
}
