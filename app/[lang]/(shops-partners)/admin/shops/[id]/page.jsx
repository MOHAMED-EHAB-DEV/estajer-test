import ShopForm from "@/components/admin/shops/ShopForm";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import { notFound } from "next/navigation";

async function getShop(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/shops/${id}`,
    { cache: "no-store" },
  );
  const data = await res.json();
  if (!data.success) return null;
  return data.data;
}

export default async function EditShopPage({ params }) {
  const { lang, id } = await params;
  const t = await getTranslations(lang, ["all", "home"]);
  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);

  const shop = await getShop(id);

  if (!shop) notFound();

  return (
    <ShopForm
      shop={shop}
      isEditing={true}
      lang={lang}
      translate={t()}
      categories={categoriesData}
      subCategories={subCategoriesData}
      isAdmin={true}
    />
  );
}
