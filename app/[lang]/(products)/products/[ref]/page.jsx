import { categories, subCategories } from "@/static/categoriesOptions";
import { getUrlName } from "@/lib/sitemap";
import { notFound, permanentRedirect } from "next/navigation";

import { getTranslations } from "@/hooks/getTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import ProductPageContent, {
  getDisplayPrice,
} from "@/components/singleProduct/ProductPageContent";

export async function generateMetadata({ params }) {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const { lang, ref } = await params;
  const id = ref.includes("_ref_")
    ? decodeURIComponent(ref.split("_ref_")[1])
    : ref;
  const product = await getProduct({ lang, id, bothLangs: true });
  const translate = await getTranslations(lang);
  const t = (key) =>
    typeof translate === "function" ? translate(key) : translate?.[key] || key;

  if (!product) return;

  // Enhanced keywords generation
  const generateKeywords = (productName, lang) => {
    const baseKeywords =
      productName?.split(" ").filter((word) => word.length > 2) || [];
    const rentalTerms =
      lang === "ar"
        ? ["تأجير", "إيجار", "استاجار", "استئجار", "للإيجار", "للتأجير"]
        : ["rental", "rent", "hire", "lease", "for rent"];
    const locationTerms =
      lang === "ar"
        ? ["الرياض", "جدة", "الدمام", "مكة", "المدينة المنورة", "السعودية"]
        : ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Saudi Arabia"];

    return [...baseKeywords, ...rentalTerms, ...locationTerms];
  };

  const productName = product?.name || t("product.page.defaultProduct");
  const description =
    product?.description || t("product.page.defaultDescription");
  const truncatedDescription =
    description.length > 116
      ? description.substring(0, lang === "ar" ? 120 : 113) + "..."
      : description;

  const title = product?.seoTitle
    ? t("product.page.rentTitle").replace("{productName}", product?.seoTitle)
    : t("product.page.rentTitle").replace(
        "{productName}",
        productName.length > 45
          ? productName.substring(0, 42) + "..."
          : productName,
      );

  const metaDescription = product?.seoDescription
    ? t("product.page.seoRentDescription").replace(
        "{description}",
        product?.seoDescription,
      )
    : t("product.page.rentDescription")
        .replace("{productName}", productName)
        .replace("{description}", truncatedDescription);
  const keywords = generateKeywords(product?.name, lang);

  // Generate proper canonical URL with language-specific product name slug
  const productSlugAr = getUrlName(product.nameAr);
  const productSlugEn = getUrlName(product.nameEn);
  const canonicalSlug = lang === "ar" ? productSlugAr : productSlugEn;
  const canonical = `${siteURL}/${
    lang === "ar" ? "" : "en/"
  }products/${canonicalSlug}_ref_${product._id}`;
  const ogLocale = lang === "ar" ? "ar_SA" : "en_US";
  const category = product?.category || t("product.page.defaultCategory");

  return {
    title,
    description: metaDescription,
    keywords,
    authors: [{ name: product?.owner?.fullName }],
    category,
    alternates: {
      canonical,
      languages: {
        ar: `${siteURL}/products/${productSlugAr}_ref_${product._id}`,
        en: `${siteURL}/en/products/${productSlugEn}_ref_${product._id}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonical,
      siteName: t("product.page.siteName"),
      images: product?.images?.map((img, idx) => ({
        url: anyImgUrl({ src: img.preview, size: 1200 }),
        alt: `${product?.name} - ${lang === "ar" ? "صورة" : "Image"} ${
          idx + 1
        }`,
        width: 1200,
        height: 630,
        type: "image/webp",
      })),
      locale: ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      site: "@Estajercom",
      creator: "@Estajercom",
      images: product?.images?.map((img, idx) => ({
        url: anyImgUrl({ src: img.preview, size: 1200 }),
        alt: `${product?.name} - ${lang === "ar" ? "صورة" : "Image"} ${
          idx + 1
        }`,
      })),
    },
    other: {
      "product:price:amount": getDisplayPrice(product),
      "product:price:currency": "SAR",
      "product:availability": "in stock",
      "product:condition": "used",
      "product:retailer_item_id": product?._id,
      "geo.region": "SA",
      "geo.placename": product?.address?.city || "Saudi Arabia",
    },
  };
}

async function getProduct({ lang, id, bothLangs }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}?lang=${lang}${
        bothLangs ? "&bothLangs=true" : ""
      }`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: [`product-${id}`, "everyProduct"],
        },
      },
    );
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

async function getReviews({ id }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/review/${id}?limit=3&skip=0`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: [`product-${id}`, "everyProduct"],
        },
      },
    );
    const data = await response.json();
    return data.success ? data : [];
  } catch (error) {
    return null;
  }
}

export default async function page({ params }) {
  const { lang, ref } = await params;
  const id = ref.includes("_ref_")
    ? decodeURIComponent(ref.split("_ref_")[1])
    : ref;

  const [translate, categoriesData, subCategoriesData, product, reviews] =
    await Promise.all([
      getTranslations(lang, ["all", "footer"]),
      categories({ lang }),
      subCategories({ lang }),
      getProduct({ lang, id }),
      getReviews({ id }),
    ]);

  if (product) {
    const productSlug = getUrlName(product.name);
    const canonicalRef = `${productSlug}_ref_${product._id}`;
    const decodedRef = decodeURIComponent(ref);
    if (decodedRef !== canonicalRef)
      permanentRedirect(
        `/${lang === "ar" ? "" : "en/"}products/${encodeURIComponent(
          canonicalRef,
        )}`,
      );
  }

  if (!product) notFound();

  return (
    <ProductPageContent
      product={product}
      reviews={reviews}
      translate={translate}
      categoriesData={categoriesData}
      subCategoriesData={subCategoriesData}
      lang={lang}
    />
  );
}
