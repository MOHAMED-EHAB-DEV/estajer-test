import ConfirmAccount from "@/components/form/ConfirmAccount";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "تأكيد الحساب | استأجر",
      description: "أكد رقم هاتفك عبر الواتساب لإكمال عملية التسجيل في استأجر.",
    },
    en: {
      title: "Confirm Account | Estajer",
      description:
        "Confirm your phone number via WhatsApp to complete the registration process on Estajer.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}confirm-account`,
      languages: {
        ar: `/confirm-account`,
        en: `/en/confirm-account`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}confirm-account`,
      type: "website",
    },
  };
}

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const { page } = await searchParams;

  return (
    <ConfirmAccount lang={lang} translate={translate()} queryPage={page} />
  );
}
