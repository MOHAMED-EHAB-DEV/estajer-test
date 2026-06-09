import AddProductForm from "@/components/addProduct/AddProductForm";
import TopSection from "@/components/addProduct/TopSection";
import { categories, subCategories } from "@/static/categoriesOptions";
import { getTranslations } from "@/hooks/getTranslations";

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const categoriesData = await categories({ lang });
  const subCategoriesData = await subCategories({ lang });

  return (
    <div className="bg-[#F6F6F6] py-2">
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
