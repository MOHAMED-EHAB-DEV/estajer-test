import { notFound } from "next/navigation";
import { getTranslations } from "@/hooks/getTranslations";
import { getSectionComponent } from "@/components/shop/themes/registry";
import { categories, subCategories } from "@/static/categoriesOptions";
// Theme Layout Components
import ClassicHeader from "@/components/shop/themes/classic/Header";
import ClassicFooter from "@/components/shop/themes/classic/Footer";

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

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const shop = await fetchShop(slug, lang);

  if (!shop) return {};

  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const title =
    lang === "ar"
      ? shop.seoTitleAr || shop.nameAr
      : shop.seoTitleEn || shop.nameEn;
  const description =
    lang === "ar"
      ? shop.seoDescriptionAr || shop.descriptionAr
      : shop.seoDescriptionEn || shop.descriptionEn;

  return {
    title: `${title} | Estajer`,
    description,
    keywords: lang === "ar" ? shop.seoKeywordsAr : shop.seoKeywordsEn,
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : "en/"}shops/${slug}`,
      languages: {
        ar: `/shops/${slug}`,
        en: `/en/shops/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      images: shop.ogImage || shop.logo,
    },
  };
}

export default async function ShopPage({ params }) {
  const { slug, lang } = await params;
  const shop = await fetchShop(slug, lang);
  const t = await getTranslations(lang, ["home", "shop"]);

  if (!shop) notFound();

  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);

  // Sort sections by order
  const sortedSections = [...(shop.sections || [])].sort(
    (a, b) => a.order - b.order,
  );

  // Extract Header/Footer data if present as sections
  const headerSection = sortedSections.find((s) => s.sectionType === "header");
  const footerSection = sortedSections.find((s) => s.sectionType === "footer");

  // Filter them out from the main content loop to avoid double rendering
  const contentSections = sortedSections.filter(
    (s) => s.sectionType !== "header" && s.sectionType !== "footer",
  );

  // Resolve section components
  const resolvedSections = await Promise.all(
    contentSections.map(async (section) => {
      try {
        const mod = await getSectionComponent(
          section.themeId,
          section.sectionType,
        );
        return { section, Component: mod.default };
      } catch (e) {
        console.error(
          `Failed to load section ${section.themeId}/${section.sectionType}:`,
          e,
        );
        return null;
      }
    }),
  );

  const brandColor = shop.brandColor || "#E04B2A";

  const hexToRgbNumbers = (hex) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#"))
      return "224 75 42";
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `${r} ${g} ${b}`;
  };

  // Determine theme-specific layout (Header/Footer)
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

  const alwaysWhite = headerSection?.data?.alwaysWhite === true;
  const headerColor = headerSection?.data?.brandColor;
  const footerColor = footerSection?.data?.brandColor;

  const headerContent = (
    <Header
      shop={{ ...shop, brandColor: headerColor || brandColor }}
      lang={lang}
      translate={t()}
      data={headerSection?.data || {}}
    />
  );

  const footerContent = (
    <Footer
      shop={{ ...shop, brandColor: footerColor || brandColor }}
      lang={lang}
      translate={t()}
      data={footerSection?.data || {}}
    />
  );

  return (
    <>
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
      <main
        className={alwaysWhite ? "" : "-mt-[5.5rem]"}
        id="main-content"
        role="main"
        aria-label={t("home.mainContent")}
      >
        <div
          className="min-h-screen flex flex-col bg-white"
          style={{
            "--primary-color": brandColor,
            "--primary-rgb": hexToRgbNumbers(brandColor),
          }}
        >
          <main className="flex-1 bg-gradient-to-b from-white via-neutral-50/30 to-white">
            {resolvedSections.map((item, idx) => {
              if (!item) return null;
              const { section, Component } = item;
              const sectionColor = section.data?.brandColor;
              const customShop = {
                ...shop,
                brandColor: sectionColor || brandColor,
              };
              const sectionStyle = sectionColor
                ? {
                    "--primary-color": sectionColor,
                    "--primary-rgb": hexToRgbNumbers(sectionColor),
                  }
                : undefined;
              return (
                <div
                  key={section.instanceId || idx}
                  id={section.sectionType}
                  style={{ ...sectionStyle, display: "flow-root" }}
                >
                  <Component
                    data={section.data}
                    lang={lang}
                    shop={customShop}
                    categoriesData={categoriesData}
                    subCategoriesData={subCategoriesData}
                    translation={t()}
                    translate={t()}
                  />
                </div>
              );
            })}
          </main>
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
      {/* Structured Data (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Brand",
            name: lang === "ar" ? shop.nameAr : shop.nameEn,
            description:
              lang === "ar" ? shop.descriptionAr : shop.descriptionEn,
            logo: shop.logo,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/shops/${shop.slug}`,
          }),
        }}
      />
    </>
  );
}
