import ProductContainer from "@/components/category/ProductContainer";
import SearchFilters from "@/components/search/SearchFilters";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import ClassicFooter from "@/components/shop/themes/classic/Footer";
import { notFound } from "next/navigation";
import { getSectionComponent } from "@/components/shop/themes/registry";
import ClassicHeader from "@/components/shop/themes/classic/Header";

const addedValue = 0.3;

const fetchShop = async (slug, lang = "ar") => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shops/${slug}?lang=${lang}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: [`shop-${slug}`, "everyShop"],
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch shop data:", error);
    return null;
  }
};

export async function generateMetadata({ params, searchParams }) {
  const { slug, lang } = await params;
  const shop = await fetchShop(slug, lang);
  if (!shop) return {};

  const translate = await getTranslations(lang);
  const queryParams = await searchParams;

  const indexPage =
    !queryParams ||
    Object.keys(queryParams).length === 0 ||
    (Object.keys(queryParams).length === 1 && !!queryParams.category);

  const seoTitle = translate("search.seo.page.title");
  const seoDescription = translate("search.seo.page.description");
  const keywords = translate("search.seo.meta.keywords");

  let dynamicTitle = seoTitle;
  if (queryParams.name) dynamicTitle = `${queryParams.name} - ${seoTitle}`;
  if (queryParams.category)
    dynamicTitle = `${queryParams.category} - ${seoTitle}`;

  const shopName = lang === "ar" ? shop.nameAr : shop.nameEn;
  dynamicTitle = `${dynamicTitle} | ${shopName}`;

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
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }search/products`,
      languages: {
        ar: `/search/products`,
        en: `/en/search/products`,
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
  const { slug, lang } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const queryParams = await searchParams;
  const queryString = new URLSearchParams(queryParams);

  const shop = await fetchShop(slug, lang);
  if (!shop) notFound();

  const shopUserId = shop?.owner?._id || shop?.owner;

  const [translate, categoriesData, subCategoriesData, initialProducts] =
    await Promise.all([
      getTranslations(lang, ["all", "shop"]),
      categories({ lang }),
      subCategories({ lang }),
      getInitialProducts({ ...queryParams, lang, userId: shopUserId }),
    ]);

  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: translate("search.seo.page.title"),
    description: translate("search.seo.page.description"),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${
      lang === "ar" ? "" : "en/"
    }shops/${slug}/search/products`,
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
          name: shop.nameEn || shop.nameAr,
          item: `${process.env.NEXT_PUBLIC_APP_URL}/${
            lang === "ar" ? "" : "en/"
          }shops/${slug}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: translate("search.seo.schema.breadcrumb.search"),
          item: `${process.env.NEXT_PUBLIC_APP_URL}/${
            lang === "ar" ? "" : "en/"
          }shops/${slug}/search/products`,
        },
      ],
    },
  };

  const brandColor = shop?.brandColor || "#E04B2A";
  const hexToRgbNumbers = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  };

  const headerSection = shop?.sections?.find((s) => s.sectionType === "header");
  const footerSection = shop?.sections?.find((s) => s.sectionType === "footer");

  let Header = ClassicHeader;
  if (headerSection) {
    try {
      const headerMod = await getSectionComponent(
        headerSection.themeId,
        "header",
      );
      Header = headerMod.default;
    } catch (e) {
      console.error(
        `Failed to load header ${headerSection.themeId}/header:`,
        e,
      );
    }
  }

  let Footer = ClassicFooter;
  if (footerSection) {
    try {
      const footerMod = await getSectionComponent(
        footerSection.themeId,
        "footer",
      );
      Footer = footerMod.default;
    } catch (e) {
      console.error(
        `Failed to load footer ${footerSection.themeId}/footer:`,
        e,
      );
    }
  }

  const headerColor = headerSection?.data?.brandColor;
  const footerColor = footerSection?.data?.brandColor;

  const headerContent = (
    <Header
      shop={{ ...shop, brandColor: headerColor || brandColor }}
      lang={lang}
      translate={translate()}
      data={{ ...headerSection?.data, alwaysWhite: true }}
    />
  );

  const footerContent = (
    <Footer
      shop={{ ...shop, brandColor: footerColor || brandColor }}
      lang={lang}
      translate={translate()}
      data={footerSection?.data || {}}
    />
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }}
      />
      <div
        style={{
          "--primary-color": brandColor,
          "--primary-rgb": hexToRgbNumbers(brandColor),
        }}
      >
        {headerColor ? (
          <div
            style={{
              "--primary-color": headerColor,
              "--primary-rgb": hexToRgbNumbers(headerColor),
              display: "contents",
            }}
          >
            {headerContent}
          </div>
        ) : (
          headerContent
        )}
        <main id="main-content">
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
            shopSlug={slug}
          />
          <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 lg:mb-32 mb-24 mt-6 md:mt-10">
            <ProductContainer
              sm={true}
              key={queryString}
              search={true}
              lang={lang}
              translate={translate()}
              initialProducts={initialProducts}
              addedValue={addedValue}
              userId={shopUserId}
              shopSlug={slug}
              {...queryParams}
            />
          </div>
        </main>
        {footerColor ? (
          <div
            style={{
              "--primary-color": footerColor,
              "--primary-rgb": hexToRgbNumbers(footerColor),
              display: "contents",
            }}
          >
            {footerContent}
          </div>
        ) : (
          footerContent
        )}
      </div>
    </>
  );
}
