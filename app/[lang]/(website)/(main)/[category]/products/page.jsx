import ProductContainer from "@/components/category/ProductContainer";
import CategoriesCarousel from "@/components/home/CategoriesCarousel";
import SearchFilters from "@/components/search/SearchFilters";
import CategoryRichContent from "@/components/category/CategoryRichContent";
import CategoryBanners from "@/components/category/CategoryBanners";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import { notFound } from "next/navigation";

const addedValue = 0.3;

// Generate static params for all categories

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang, category } = await params;
  const translate = await getTranslations(lang);

  // Fetch category data
  const categoriesData = await categories({ lang, seo: true });
  const categoryData = categoriesData?.find((cat) => cat.key === category);

  if (!categoryData) {
    return {
      title: translate("search.seo.page.title"),
      description: translate("search.seo.page.description"),
    };
  }

  // Get dynamic meta data
  const categoryName = categoryData.label;
  const langSuffix = lang === "ar" ? "Ar" : "En";

  const seoTitle =
    categoryData[`seoTitle${langSuffix}`] ||
    translate("search.seo.page.title").replace("{category}", categoryName);
  const seoDescription =
    categoryData[`seoDescription${langSuffix}`] ||
    translate("search.seo.page.description").replace(
      "{category}",
      categoryName,
    );
  const seoKeywords =
    categoryData[`seoKeywords${langSuffix}`] ||
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
      images: [categoryData.image],
      type: "website",
      locale: lang === "ar" ? "ar_SA" : "en_US",
      siteName: lang === "ar" ? "استأجر" : "Estajer",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [categoryData.image],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }${category}/products`,
      languages: {
        ar: `${process.env.NEXT_PUBLIC_APP_URL}/${category}/products`,
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/${category}/products`,
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

export default async function CategoryProductsPage({ params, searchParams }) {
  const { lang, category } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const queryParams = await searchParams;
  const [translate, categoriesData, subCategoriesData, initialProducts] =
    await Promise.all([
      getTranslations(lang),
      categories({ lang, seo: true }),
      subCategories({ lang, seo: true }),
      getInitialProducts({ ...queryParams, category, lang }),
    ]);
  const queryString = new URLSearchParams({ ...queryParams, category });
  const categoryData = categoriesData?.find((cat) => cat.key === category);
  if (!categoryData) notFound();
  const subCategory =
    subCategoriesData?.[category].map((subCat) => ({
      ...subCat,
      name: subCat.label,
    })) || [];
  const langSuffix = lang === "ar" ? "Ar" : "En";
  const seoTitle =
    categoryData[`seoTitle${langSuffix}`] ||
    `${categoryData.label} - ${translate("search.seo.page.title")}`;
  const seoDescription =
    categoryData[`seoDescription${langSuffix}`] ||
    translate("search.seo.category.description").replace(
      "{category}",
      categoryData.label,
    );

  // Schema markup for category page
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoTitle,
    description: seoDescription,
    image: categoryData.image,
    keywords:
      categoryData[`seoKeywords${langSuffix}`] ||
      translate("search.seo.meta.keywords"),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${
      lang === "ar" ? "" : "en/"
    }${category}/products`,
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
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      <div>
        {/* Search Filters */}
        <SearchFilters
          lang={lang}
          translate={translate()}
          initialProducts={initialProducts}
          queryParams={{ ...queryParams, category }}
          queryString={queryString.toString()}
          categories={categoriesData}
          subCategories={subCategoriesData}
          langPrefix={langPrefix}
          currentPage="products"
          showHeader={true}
          map={false}
          categoryPage={category}
          key={category}
        />
        {/* End of Search Filters */}
        <CategoryBanners lang={lang} categoryId={categoryData._id} />
        <div className="flex max-w-screen-2xl mx-auto">
          <CategoriesCarousel
            categoriesData={subCategory}
            langPrefix={langPrefix}
            translate={translate()}
            isSubCategory={true}
            mainCategory={category}
            lang={lang}
            sm={true}
          />
        </div>

        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 lg:mb-16 mb-12 mt-6 md:mt-10">
          <ProductContainer
            sm={true}
            key={queryString}
            search={true}
            lang={lang}
            translate={translate()}
            initialProducts={initialProducts}
            addedValue={addedValue}
            category={category}
            {...queryParams}
          />
        </div>
        <CategoryRichContent
          categoryName={categoryData.label}
          richContent={categoryData[`richContent${langSuffix}`]}
          lang={lang}
          translate={translate()}
        />
      </div>
    </>
  );
}
