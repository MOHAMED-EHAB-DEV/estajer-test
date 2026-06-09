import ProductContainer from "@/components/category/ProductContainer";
import SearchFilters from "@/components/search/SearchFilters";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";

const addedValue = 0.3;
// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const queryParams = await searchParams;

  //  check if queryParams have any query
  const indexPage =
    !queryParams ||
    Object.keys(queryParams).length === 0 ||
    (Object.keys(queryParams).length === 1 && !!queryParams.category);

  const seoTitle = translate("search.seo.page.title");
  const seoDescription = translate("search.seo.page.description");
  const keywords = translate("search.seo.meta.keywords");

  // Dynamic title based on search parameters
  let dynamicTitle = seoTitle;
  if (queryParams.name) dynamicTitle = `${queryParams.name} - ${seoTitle}`;
  if (queryParams.category)
    dynamicTitle = `${queryParams.category} - ${seoTitle}`;

  return {
    title: dynamicTitle,
    description: seoDescription,
    keywords: keywords,
    openGraph: {
      title: dynamicTitle,
      description: seoDescription,
      type: "website",
      locale: lang === "ar" ? "ar_SA" : "en_US",
      siteName: lang === "ar" ? "استأجر" : "Estajer",
    },
    twitter: {
      card: "summary_large_image",
      title: dynamicTitle,
      description: seoDescription,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }search/products`,
      languages: {
        ar: `${process.env.NEXT_PUBLIC_APP_URL}/search/products`,
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/search/products`,
      },
    },
    robots: {
      index: indexPage,
      follow: true,
      googleBot: { index: indexPage, follow: true },
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
  userId,
  shopCategory,
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
    ...(userId && { userId }),
    ...(shopCategory && { shopCategory }),
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

export default async function Category({ params, searchParams }) {
  const { lang } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const queryParams = await searchParams;
  const queryString = new URLSearchParams(queryParams);
  const [translate, categoriesData, subCategoriesData, initialProducts] =
    await Promise.all([
      getTranslations(lang),
      categories({ lang }),
      subCategories({ lang }),
      getInitialProducts({ ...queryParams, lang }),
    ]);

  // Schema markup for search page
  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: translate("search.seo.page.title"),
    description: translate("search.seo.page.description"),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${
      lang === "ar" ? "" : "en/"
    }search/products`,
    mainEntity: {
      "@type": "SearchResultsPage",
      name: translate("search.seo.page.h1"),
    },
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
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }}
      />
      <div>
        {/* Search Filters */}
        <SearchFilters
          lang={lang}
          translate={translate()}
          initialProducts={initialProducts}
          queryParams={queryParams}
          queryString={queryString.toString()}
          categories={categoriesData}
          subCategories={subCategoriesData}
          langPrefix={langPrefix}
          currentPage="products"
          map={false}
        />
        {/* End of Search Filters */}

        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 lg:mb-32 mb-24 mt-6 md:mt-10">
          <ProductContainer
            sm={true}
            key={queryString}
            search={true}
            lang={lang}
            translate={translate()}
            initialProducts={initialProducts}
            addedValue={addedValue}
            {...queryParams}
          />
        </div>
      </div>
    </>
  );
}
