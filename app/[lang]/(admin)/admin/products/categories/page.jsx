import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import AdminCategoriesContainer from "@/components/admin/products/AdminCategoriesContainer";

// Fetch categories from server
async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/categories?mainOnly=true&includeSubcategories=true&includeProductCount=true&includeSubcategoryCount=true&seo=true`,
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function CategoriesPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  // Get token from cookies

  // Fetch initial categories data
  const initialCategories = await getCategories();

  // Transform data for the component
  const transformedCategories = initialCategories.map((cat) => ({
    ...cat,
    userCreated: cat.createdBy?.fullName || "غير معروف",
    productsCount: cat.productsCount || 0,
    visits: cat.visits || 0,
    hideFromHome: cat.hideFromHome || false,
    nana: cat.nana || false,
    subcategories:
      cat.subcategories?.map((sub) => ({
        _id: sub._id,
        nameAr: sub.nameAr,
        nameEn: sub.nameEn,
        key: sub.key,
        image: sub.image,
        count: sub.productsCount || 0,
        status: sub.status,
        hideFromHome: sub.hideFromHome || false,
        nana: sub.nana || false,
        richContentAr: sub.richContentAr || "",
        richContentEn: sub.richContentEn || "",
        seoTitleAr: sub.seoTitleAr || "",
        seoTitleEn: sub.seoTitleEn || "",
        seoDescriptionAr: sub.seoDescriptionAr || "",
        seoDescriptionEn: sub.seoDescriptionEn || "",
        seoKeywordsAr: sub.seoKeywordsAr || "",
        seoKeywordsEn: sub.seoKeywordsEn || "",
      })) || [],
  }));

  const mainCategories = initialCategories.map((cat) => ({
    ...cat,
    hideFromHome: cat.hideFromHome || false,
    nana: cat.nana || false,
  }));

  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        translate={translate()}
        title={translate("titles.categories")}
      />
      <AdminCategoriesContainer
        translate={translate()}
        initialCategories={transformedCategories}
        initialMainCategories={mainCategories}
      />
    </div>
  );
}
