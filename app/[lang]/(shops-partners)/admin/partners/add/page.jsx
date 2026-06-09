import PartnerForm from "@/components/admin/partners/PartnerForm";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";

export default async function AddPartnerPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["all", "home"]);

  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);

  return (
    <PartnerForm
      lang={lang}
      translate={translate()}
      categories={categoriesData}
      subCategories={subCategoriesData}
    />
  );
}
