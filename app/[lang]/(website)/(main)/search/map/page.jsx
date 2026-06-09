import dynamic from "next/dynamic";
import { getTranslations } from "@/hooks/getTranslations";
import SearchFilters from "@/components/search/SearchFilters";
import { categories, subCategories } from "@/static/categoriesOptions";

// Dynamic import for GoogleMapComponent to improve performance
const GoogleMapComponent = dynamic(
  () => import("@/components/shared/GoogleMapComponent"),
  {
    loading: () => (
      <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading map...</div>
      </div>
    ),
    ssr: true,
  },
);

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const queryParams = await searchParams;

  const seoTitle =
    translate("search.seo.page.title") + " - " + translate("search.showMap");
  const seoDescription =
    translate("search.seo.page.description") +
    " " +
    translate("search.mapDescription");
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
      }search/map`,
      languages: {
        ar: `${process.env.NEXT_PUBLIC_APP_URL}/search/map`,
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/search/map`,
      },
      robots: {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      },
    },
  };
}

export default async function CategoryMap({ params, searchParams }) {
  const { lang } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";

  const queryParams = await searchParams;
  const queryString = new URLSearchParams(queryParams);

  const translate = await getTranslations(lang);
  const t = (text) => translate(`search.${text}`);
  const categoriesData = await categories({ lang });
  const subCategoriesData = await subCategories({ lang });

  const { name, category, subCategory, lat, lng } = await searchParams;

  const center = { lat: +lat || 24.8, lng: +lng || 46.7 };

  // Schema markup for search map page
  const searchMapSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      translate("search.seo.page.title") + " - " + translate("search.showMap"),
    description:
      translate("search.seo.page.description") +
      " " +
      translate("search.mapDescription"),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${
      lang === "ar" ? "" : "en/"
    }search/map`,
    mainEntity: {
      "@type": "SearchResultsPage",
      name:
        translate("search.seo.page.h1") + " - " + translate("search.showMap"),
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
        {
          "@type": "ListItem",
          position: 3,
          name: translate("search.showMap"),
          item: `${process.env.NEXT_PUBLIC_APP_URL}/${
            lang === "ar" ? "" : "en/"
          }search/map`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchMapSchema) }}
      />
      <div>
        <SearchFilters
          lang={lang}
          translate={translate()}
          initialProducts={queryString.toString()}
          queryParams={queryParams}
          queryString={queryString.toString()}
          categories={categoriesData}
          subCategories={subCategoriesData}
          langPrefix={langPrefix}
          currentPage="map"
          map={true}
        />

        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 px-4 text-white lg:mb-32 mb-24">
          <GoogleMapComponent
            search={true}
            lang={lang}
            center={center}
            category={category}
            translate={translate()}
            name={name}
            subCategory={subCategory}
            refetch={queryString}
            {...queryParams}
          />
        </div>
      </div>
    </>
  );
}
