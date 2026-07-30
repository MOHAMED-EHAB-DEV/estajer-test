import { getTranslations } from "@/hooks/getTranslations";
import AddProductForm from "@/components/addProduct/AddProductForm";
import { categories, subCategories } from "@/static/categoriesOptions";

export const metadata = { robots: { index: false, follow: false } };

async function getProduct(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}?showAll=true&bothLangs=true`,
    );
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

export default async function EditProductPage({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang, ["all", "footer"]);
  const t = (value) => translate(`editProductPage.${value}`);

  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xl">Product not found</p>
      </div>
    );
  }
  const categoriesData = await categories({ lang });
  const subCategoriesData = await subCategories({ lang });

  return (
    <div className="bg-lightBg py-1 md:py-2 px-2">
      <h1 className="text-lg md:text-2xl font-bold text-center py-4 md:py-8">
        {t("title")}
      </h1>
      <AddProductForm
        lang={lang}
        categories={categoriesData}
        subCategories={subCategoriesData}
        product={product}
        isEditing={true}
        translate={translate()}
      />
    </div>
  );
}
