import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import AdminProductContainer from "@/components/admin/products/AdminProductContainer";

async function getInitialData({ lang, queryParams }) {
  try {
    const params = new URLSearchParams({
      limit: queryParams.limit || 40,
      lang,
      compressed: true,
      showAll: true,
      owner: true,
      fields: `images,owner,${
        lang === "ar" ? "nameAr" : "nameEn"
      },rental,rating,pricingModel,location,${
        lang === "ar" ? "addressAr" : "addressEn"
      },rejected,approved,deleted,hidden,rejectMessage,category,subCategory,quantity,minQuantity,status,createdAt,updatedAt,isMain,nana`,
      ...queryParams,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`,
    );
    const data = await response.json();
    return data.success ? data : [];
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
    return [];
  }
}

export default async function AdminProducts({ params, searchParams }) {
  const { lang } = await params;
  const queryParams = await searchParams;
  const t = await getTranslations(lang);
  const [{ data, pagination }, categoriesData, subCategoriesData] =
    await Promise.all([
      getInitialData({ lang, queryParams }),
      categories({ lang }),
      subCategories({ lang }),
    ]);

  return (
    <div className="relative max-w-screen-2xl mx-auto md:px-4 md:pt-8">
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.1rem] font-IBMPlex font-bold">المنتجات</h1>
      </div>
      <div className="relative md:static pt-20 md:pt-0">
        <AdminProductContainer
          lang={lang}
          translate={t()}
          initialProducts={data}
          admin={true}
          hasMoreServer={pagination.total > pagination.limit * pagination.page}
          totalProducts={pagination.total}
          totalPages={pagination.pages}
          initialCurrentPage={pagination.page}
          userId={queryParams.userId}
          categories={categoriesData}
          subCategories={subCategoriesData}
          queryParams={queryParams}
          {...queryParams}
        />
      </div>
    </div>
  );
}
