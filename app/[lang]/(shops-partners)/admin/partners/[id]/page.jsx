import PartnerForm from "@/components/admin/partners/PartnerForm";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";

async function getPartner(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/partners/${id}`,
    );
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching partner:", error);
    return null;
  }
}

export default async function EditPartnerPage({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang, ["all", "home"]);

  const [partner, categoriesData, subCategoriesData] = await Promise.all([
    getPartner(id),
    categories({ lang }),
    subCategories({ lang }),
  ]);

  if (!partner) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-darkNavy mb-2">
          Partner not found
        </h2>
        <p className="text-neutral-500">
          The partner you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <PartnerForm
      partner={partner}
      lang={lang}
      translate={translate()}
      isEditing={true}
      categories={categoriesData}
      subCategories={subCategoriesData}
    />
  );
}
