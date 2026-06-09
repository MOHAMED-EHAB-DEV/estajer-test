import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { categories, subCategories } from "@/static/categoriesOptions";
import ProductFilters from "@/components/dashboard/ProductFilters";
import ProductContainer from "@/components/category/ProductContainer";
import PushNotificationModal from "@/components/shared/PushNotificationModal";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Send } from "@/components/ui/svgs/icons/SendSvg";

async function getInitialData({ lang, userId, queryParams }) {
  try {
    const params = new URLSearchParams({
      ...(userId && { userId }),
      limit: queryParams.limit || 40,
      showAll: true,
      lang,
      compressed: true,
      fields: `images,owner,${
        lang === "ar" ? "nameAr" : "nameEn"
      },rental,rating,lovedCount,rejected,approved,rejectMessage,pricingModel,location,hidden,deleted,${
        lang === "ar" ? "addressAr" : "addressEn"
      }`,
      ...queryParams,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`,
    );
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
    return [];
  }
}

export default async function MyProductsPage({ params, searchParams }) {
  const { lang } = await params;

  const queryParams = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) return null;
  const { userId } = jwt.verify(token.value, process.env.JWT_SECRET);
  const t = await getTranslations(lang);
  const [initialProducts, categoriesData, subCategoriesData] =
    await Promise.all([
      getInitialData({ lang, userId, queryParams }),
      categories({ lang }),
      subCategories({ lang }),
    ]);

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center md:mb-8 mb-2">
        <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.2rem] font-IBMPlex font-bold">
          {t("myProducts.title")}
          <PushNotificationModal translate={t()} open={true} lang={lang} />
        </h1>
        {initialProducts.length > 0 && (
          <Button
            as={Link}
            className="font-IBMPlex md:text-lg text-sm font-semibold text-[#F9FAFC] md:px-12 px-6 md:py-4 py-2.5 bg-primary [filter:drop-shadow(0_17px_20px_rgba(244,138,66,0.2))] rounded-full flex items-center gap-[10px]"
            href={`/${lang === "ar" ? "" : "en/"}add-product`}
          >
            {t("productComponent.addProduct")}
            <span
              className={`${lang === "ar" ? "-rotate-45" : "rotate-[135deg]"} flex items-center`}
            >
              <Send className="md:w-5 md:h-5 w-4 h-4" />
            </span>
          </Button>
        )}
      </div>

      <ProductFilters
        lang={lang}
        categories={categoriesData}
        subCategories={subCategoriesData}
        translate={t()}
        initialProducts={initialProducts}
        queryName={queryParams.name}
        queryStatus={queryParams.status}
        queryCategory={queryParams.category}
        querySubCategory={queryParams.subCategory}
        querySortBy={queryParams.sortBy}
        queryParams={queryParams}
      />
      <ProductContainer
        sm={true}
        lang={lang}
        translate={t()}
        initialProducts={initialProducts}
        userId={userId}
        owner={true}
        showAll={true}
        {...queryParams}
      />
    </div>
  );
}
