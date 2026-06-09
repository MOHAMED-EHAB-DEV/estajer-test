import ShopForm from "@/components/admin/shops/ShopForm";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import { getUserFromServer } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

async function getShopByOwner(ownerId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/shops/${ownerId}`,
    {
      cache: "no-store",
    },
  );
  const data = await res.json();
  if (!data.success) return null;
  return data.data;
}

export default async function MyShopPage({ params }) {
  const { lang } = await params;
  const user = await getUserFromServer();

  if (!user) redirect(`/${lang}/login`);

  const t = await getTranslations(lang, ["all", "home"]);
  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);

  const shop = await getShopByOwner(user._id);

  if (!shop) notFound();

  return (
    <ShopForm
      shop={shop}
      isEditing={true}
      lang={lang}
      translate={t()}
      categories={categoriesData}
      subCategories={subCategoriesData}
      isAdmin={false} // User editing their own shop
    />
  );
}
