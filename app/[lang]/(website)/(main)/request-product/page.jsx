import TopSection from "@/components/addProduct/TopSection";
import AddRequestForm from "@/components/addRequest/AddRequestForm";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  return {
    robots: { index: false, follow: false },
    title: lang === "ar" ? "طلب منتج | استأجر" : "Request Product | Estajer",
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : "en/"}request-product`,
      languages: {
        ar: `/request-product`,
        en: `/en/request-product`,
      },
    },
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div className="bg-lightBg py-2">
      <TopSection
        lang={lang}
        title={translate("request.title")}
        description={translate("request.description")}
      />
      <AddRequestForm lang={lang} translate={translate()} />
    </div>
  );
}
