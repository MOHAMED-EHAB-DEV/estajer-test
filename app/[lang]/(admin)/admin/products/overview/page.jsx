import AdminProductOverviewContainer from "@/components/admin/products/AdminProductOverviewContainer";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

async function getProducts({ lang, searchParams = {} }) {
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
      },rejected,approved,deleted,hidden,rejectMessage,category,createdAt,updatedAt,pendingChanges`,
      ...searchParams,
    });

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/products?${params}`,
      { headers: { Authorization: token } },
    );
    const data = await response.json();
    return data.success
      ? data
      : {
          data: {
            products: [],
            stats: null,
            pagination: { pages: 1, total: 0, page: 1 },
          },
        };
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
    return [];
  }
}

const page = async ({ params, searchParams }) => {
  const { lang } = await params;
  const sParams = await searchParams;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const result = await getProducts({ lang, searchParams: sParams });
  const data = result?.data || {};
  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        title={translate("admin.products.title")}
        translate={translate()}
      />

      <AdminProductOverviewContainer
        translate={translate()}
        lang={lang}
        initialProducts={data?.products || []}
        initialStats={data?.stats || null}
        langPrefix={langPrefix}
        totalPages={data?.pagination?.pages || 1}
        totalProducts={data?.pagination?.total || 0}
        initialCurrentPage={data?.pagination?.page || 1}
      />
    </div>
  );
};

export default page;
