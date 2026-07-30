import AddProductForm from "@/components/addProduct/AddProductForm";
import TopSection from "@/components/addProduct/TopSection";
import { categories, subCategories } from "@/static/categoriesOptions";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  return {
    robots: { index: false, follow: false },
    title: lang === "ar" ? "إضافة منتج | استأجر" : "Add Product | Estajer",
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : "en/"}add-product`,
      languages: {
        ar: `/add-product`,
        en: `/en/add-product`,
      },
    },
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["all", "footer"]);
  const categoriesData = await categories({ lang });
  const subCategoriesData = await subCategories({ lang });

  return (
    <div className="bg-lightBg py-1 md:py-2 px-2">
      <TopSection lang={lang} />
      <AddProductForm
        lang={lang}
        translate={translate()}
        categories={categoriesData}
        subCategories={subCategoriesData}
      />
    </div>
  );
}
