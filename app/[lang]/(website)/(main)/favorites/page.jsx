import { getTranslations } from "@/hooks/getTranslations";
import PageTitle from "@/components/shared/PageTitle";
import FavoritesClient from "./FavoritesClient";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  return {
    robots: { index: false, follow: false },
    title: lang === "ar" ? "المفضلة | استأجر" : "Favorites | Estajer",
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : "en/"}favorites`,
      languages: {
        ar: `/favorites`,
        en: `/en/favorites`,
      },
    },
  };
}

export default async function FavoritesPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const t = (value) => translate(`favorites.${value}`);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <PageTitle
        title={t("title")}
        description={t("description")}
        lang={lang}
      />
      <FavoritesClient lang={lang} translate={translate()} />
    </div>
  );
}
