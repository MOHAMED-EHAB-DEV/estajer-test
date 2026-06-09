import ShopForm from "@/components/admin/shops/ShopForm";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";

export default async function AddShopPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations(lang, ["all", "home"]);

  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);

  return (
    <ShopForm
      lang={lang}
      translate={t()}
      categories={categoriesData}
      subCategories={subCategoriesData}
      isAdmin={true}
    />
  );
}
