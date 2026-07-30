import { notFound } from "next/navigation";
import { categories, subCategories } from "@/static/categoriesOptions";
import Link from "next/link";
import { getTranslations } from "@/hooks/getTranslations";
import { getSectionComponent } from "@/components/shop/themes/registry";
import ClassicHeader from "@/components/shop/themes/classic/Header";
import ClassicFooter from "@/components/shop/themes/classic/Footer";
import ProductPageContent from "@/components/singleProduct/ProductPageContent";
import { getUrlName } from "@/lib/sitemap";

async function getShop(slug, lang) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shops/${slug}?lang=${lang}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function getProduct({ lang, id }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}?lang=${lang}&showAll=true`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function getReviews({ id }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/review/${id}?limit=3&skip=0`,
      { next: { revalidate: 3600 } },
    );
    const data = await res.json();
    return data.success ? data : [];
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug, ref, lang } = await params;
  const id = ref.includes("_ref_")
    ? decodeURIComponent(ref.split("_ref_")[1])
    : ref;
  const [shop, product] = await Promise.all([
    getShop(slug, lang),
    getProduct({ lang, id }),
  ]);

  if (!product) return {};

  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const productSlugAr = getUrlName(product.nameAr);
  const productSlugEn = getUrlName(product.nameEn);
  const canonicalSlug = lang === "ar" ? productSlugAr : productSlugEn;
  const canonical = `${siteURL}/${
    lang === "ar" ? "" : "en/"
  }products/${canonicalSlug}_ref_${product._id}`;

  const name =
    lang === "ar"
      ? product.nameAr || product.name
      : product.nameEn || product.name;
  const shopName = lang === "ar" ? shop?.nameAr : shop?.nameEn;

  return {
    robots: { index: false, follow: false },
    title: `${name}${shopName ? ` | ${shopName}` : ""}`,
    description: product.description,
    metadataBase: new URL(siteURL),
    alternates: {
      canonical,
      languages: {
        ar: `/products/${productSlugAr}_ref_${product._id}`,
        en: `/en/products/${productSlugEn}_ref_${product._id}`,
      },
    },
    openGraph: {
      title: name,
      images: product.images?.[0]?.preview || product.images?.[0],
    },
  };
}

export default async function ShopProductPage({ params }) {
  const { slug, ref, lang } = await params;
  const id = ref.includes("_ref_")
    ? decodeURIComponent(ref.split("_ref_")[1])
    : ref;

  const [translate, categoriesData, subCategoriesData, shop, product, reviews] =
    await Promise.all([
      getTranslations(lang, ["all", "shop"]),
      categories({ lang }),
      subCategories({ lang }),
      getShop(slug, lang),
      getProduct({ lang, id }),
      getReviews({ id }),
    ]);

  if (!product) notFound();

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
        <ProductPageContent
          product={product}
          reviews={reviews}
          translate={translate}
          categoriesData={categoriesData}
          subCategoriesData={subCategoriesData}
          lang={lang}
          shopSlug={slug}
        />
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
  );
}
