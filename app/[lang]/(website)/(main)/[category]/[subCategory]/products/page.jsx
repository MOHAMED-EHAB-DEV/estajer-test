import ProductContainer from "@/components/category/ProductContainer";
import SearchFilters from "@/components/search/SearchFilters";
import CategoryRichContent from "@/components/category/CategoryRichContent";
import CategoryBanners from "@/components/category/CategoryBanners";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import { notFound } from "next/navigation";

const addedValue = 0.3;

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang, category, subCategory: subCategoryKey } = await params;
  const translate = await getTranslations(lang);

  // Fetch category and subcategory data
  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang, seo: true }),
    subCategories({ lang, seo: true }),
  ]);

  const categoryData = categoriesData?.find((cat) => cat.key === category);
  const subCategoryData = subCategoriesData?.[category]?.find(
    (sub) => sub.key === subCategoryKey,
  );

  if (!categoryData || !subCategoryData) {
    return {
      title: translate("search.seo.page.title"),
      description: translate("search.seo.page.description"),
    };
  }

  // Get dynamic meta data
  const subCategoryName = subCategoryData.label;
  const langSuffix = lang === "ar" ? "Ar" : "En";

  const seoTitle =
    subCategoryData[`seoTitle${langSuffix}`] ||
    translate("search.seo.page.title").replace("{category}", subCategoryName);
  const seoDescription =
    subCategoryData[`seoDescription${langSuffix}`] ||
    translate("search.seo.page.description").replace(
      "{category}",
      subCategoryName,
    );
  const seoKeywords =
    subCategoryData[`seoKeywords${langSuffix}`] ||
    translate("search.seo.meta.keywords");

  return {
    title: {
      default: seoTitle,
      template: `%s | ${seoTitle}`,
    },
    description: seoDescription,
    keywords: seoKeywords,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: [subCategoryData.image || categoryData.image],
      type: "website",
      locale: lang === "ar" ? "ar_SA" : "en_US",
      siteName: lang === "ar" ? "استأجر" : "Estajer",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [subCategoryData.image || categoryData.image],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }${category}/${subCategoryKey}/products`,
      languages: {
        ar: `${process.env.NEXT_PUBLIC_APP_URL}/${category}/${subCategoryKey}/products`,
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/${category}/${subCategoryKey}/products`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

async function getInitialProducts({
  name,
  category,
  subCategory,
  lang,
  lat,
  lng,
  providerId,
}) {
  const defaultBounds = lat &&
    lng && {
      north: +lat + addedValue,
      south: +lat - addedValue,
      east: +lng + addedValue,
      west: +lng - addedValue,
    };
  const params = new URLSearchParams({
    ...(category && { category }),
    ...(subCategory && { subCategory }),
    ...(name && { name }),
    ...(providerId && { providerId }),
    ...(defaultBounds && { bounds: JSON.stringify(defaultBounds) }),
    lang,
    limit: 40,
    compressed: true,
    fields: `images,owner,${
      lang === "ar" ? "nameAr" : "nameEn"
    },rental,rating,pricingModel,location,${
      lang === "ar" ? "addressAr" : "addressEn"
    }`,
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`,
      { next: { revalidate: 60 * 5 } },
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
    return [];
  }
}

export default async function SubCategoryProductsPage({
  params,
  searchParams,
}) {
  const { lang, category, subCategory: subCategoryKey } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const queryParams = await searchParams;

  const [translate, categoriesData, subCategoriesData, initialProducts] =
    await Promise.all([
      getTranslations(lang),
      categories({ lang, seo: true }),
      subCategories({ lang, seo: true }),
      getInitialProducts({
        ...queryParams,
        category,
        subCategory: subCategoryKey,
        lang,
      }),
    ]);

  const queryString = new URLSearchParams({
    ...queryParams,
    category,
    subCategory: subCategoryKey,
  });

  const categoryData = categoriesData?.find((cat) => cat.key === category);
  const subCategoryData = subCategoriesData?.[category]?.find(
    (sub) => sub.key === subCategoryKey,
  );

  if (!categoryData || !subCategoryData) notFound();

  const langSuffix = lang === "ar" ? "Ar" : "En";
  const seoTitle =
    subCategoryData[`seoTitle${langSuffix}`] ||
    `${subCategoryData.label} - ${translate("search.seo.page.title")}`;
  const seoDescription =
    subCategoryData[`seoDescription${langSuffix}`] ||
    translate("search.seo.category.description").replace(
      "{category}",
      subCategoryData.label,
    );

  // Schema markup for subcategory page
  const subCategorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoTitle,
    description: seoDescription,
    image: subCategoryData.image || categoryData.image,
    keywords:
      subCategoryData[`seoKeywords${langSuffix}`] ||
      translate("search.seo.meta.keywords"),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${
      lang === "ar" ? "" : "en/"
    }${category}/${subCategoryKey}/products`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: translate("search.seo.schema.breadcrumb.home"),
          item: `${process.env.NEXT_PUBLIC_APP_URL}/${
            lang === "ar" ? "" : "en/"
          }`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: translate("search.seo.schema.breadcrumb.search"),
          item: `${process.env.NEXT_PUBLIC_APP_URL}/${
            lang === "ar" ? "" : "en/"
          }search/products`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: categoryData.label,
          item: `${process.env.NEXT_PUBLIC_APP_URL}/${
            lang === "ar" ? "" : "en/"
          }${category}/products`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: subCategoryData.label,
          item: `${process.env.NEXT_PUBLIC_APP_URL}/${
            lang === "ar" ? "" : "en/"
          }${category}/${subCategoryKey}/products`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(subCategorySchema) }}
      />
      <div>
        {/* Search Filters */}
        <SearchFilters
          lang={lang}
          translate={translate()}
          initialProducts={initialProducts}
          queryParams={{
            ...queryParams,
            category,
            subCategory: subCategoryKey,
          }}
          queryString={queryString.toString()}
          categories={categoriesData}
          subCategories={subCategoriesData}
          langPrefix={langPrefix}
          currentPage="products"
          showHeader={true}
          map={false}
          categoryPage={category}
          subCategoryPage={subCategoryKey}
          key={`${category}-${subCategoryKey}`}
        />
        {/* End of Search Filters */}
        <CategoryBanners lang={lang} categoryId={subCategoryData._id} />

        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 lg:mb-16 mb-12 mt-4 md:mt-10">
          <ProductContainer
            sm={true}
            key={queryString}
            search={true}
            lang={lang}
            translate={translate()}
            initialProducts={initialProducts}
            addedValue={addedValue}
            category={category}
            subCategory={subCategoryKey}
            {...queryParams}
          />
        </div>
        <CategoryRichContent
          categoryName={subCategoryData.label}
          richContent={subCategoryData[`richContent${langSuffix}`]}
          lang={lang}
          translate={translate()}
        />
      </div>
    </>
  );
}
