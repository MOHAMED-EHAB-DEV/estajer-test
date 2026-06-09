import AdminProductOverviewContainer from "@/components/admin/products/AdminProductOverviewContainer";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";

async function getProducts({ lang }) {
  try {
    const params = new URLSearchParams({
      limit: 4,
      lang,
      compressed: true,
      showAll: true,
      fields: `images,owner,${
        lang === "ar" ? "nameAr" : "nameEn"
      },rental,rating,pricingModel,location,${
        lang === "ar" ? "addressAr" : "addressEn"
      },rejected,approved,deleted,hidden,rejectMessage,category,createdAt,updatedAt`,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`
    );
    const data = await response.json();
    return data.success ? data : [];
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
    return [];
  }
}

const page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const { data, pagination } = await getProducts({ lang });
  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        title={translate("admin.products.title")}
        translate={translate()}
      />

      <AdminProductOverviewContainer
        translate={translate()}
        lang={lang}
        products={data}
        langPrefix={langPrefix}
        totalPages={pagination.pages}
        totalProducts={pagination.total}
        currentPage={pagination.page}
      />
    </div>
  );
};

export default page;
