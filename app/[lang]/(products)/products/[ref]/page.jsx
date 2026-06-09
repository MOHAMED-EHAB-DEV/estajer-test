import dynamic from "next/dynamic";
import CloudSection from "@/components/singleProduct/CloudSection";
import ImagesContainer from "@/components/singleProduct/ImagesContainer";
import OrderContainer from "@/components/singleProduct/OrderContainer";
import ProductDetails from "@/components/singleProduct/ProductDetails";
import SafetySection from "@/components/singleProduct/SafetySection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getTranslations } from "@/hooks/getTranslations";

import ReportButton from "@/components/singleProduct/report/ReportButton";
import { categories, subCategories } from "@/static/categoriesOptions";
import { anyImgUrl } from "@/utils/ImageUrl";
import Script from "next/script";
import GTMProductView from "@/hooks/GTMProductView";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import ProductTourContainer from "@/components/singleProduct/ProductTourContainer";

// Dynamic imports for below-the-fold components to improve initial load
const ReviewsContainer = dynamic(
  () => import("@/components/singleProduct/review/ReviewsContainer"),
  { ssr: true },
);

import SimilarProducts from "@/components/singleProduct/SimilarProducts";
import CloseProducts from "@/components/singleProduct/CloseProducts";
import RentalCostSection from "@/components/singleProduct/RentalCostSection";
import WhyUsSection from "@/components/singleProduct/WhyUsSection";
import RentVsBuySection from "@/components/singleProduct/RentVsBuySection";
const ProductFaqs = dynamic(
  () => import("@/components/singleProduct/ProductFaqs"),
);
const ProductCtaBanner = dynamic(
  () => import("@/components/singleProduct/ProductCtaBanner"),
);
const ProductBottomBar = dynamic(
  () => import("@/components/singleProduct/ProductBottomBar"),
);
import { getUrlName } from "@/lib/sitemap";
function getDisplayPrice(product) {
  const discountTier = product?.rental?.discountTiers?.find(
    (tier) => tier.minDays === 1,
  );
  const hasDiscount = !!discountTier && product.pricingModel !== "packages";
  const discountPriceVal = hasDiscount ? discountTier.discountPrice : null;
  const basePriceVal =
    product.pricingModel === "packages"
      ? product.rental?.packages?.[0]?.price || 0
      : product.rental?.value || 0;

  const displayPriceVal = hasDiscount ? discountPriceVal : basePriceVal;
  const tax = 0.15;
  const hasTaxCode = !!product.owner?.companyDetails?.taxCode;

  return hasTaxCode ? Math.round(displayPriceVal * (1 + tax)) : displayPriceVal;
}

export async function generateMetadata({ params }) {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const { lang, ref } = await params;
  const id = ref.includes("_ref_")
    ? decodeURIComponent(ref.split("_ref_")[1])
    : ref;
  const product = await getProduct({ lang, id, bothLangs: true });
  const t = await getTranslations(lang);

  if (!product) return;
  // {
  //       title: t("product.page.notFound"),
  //       description: t("product.page.notFoundDescription"),
  //       robots: { index: false, follow: false },
  // };
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
    // --- CORE METADATA ---
    title,
    description: metaDescription,
    keywords,
    authors: [{ name: product?.owner?.fullName }],
    category,

    // Tells Google about the other language versions of this page
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

    // --- TWITTER CARD TAGS ---
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

    // Additional SEO enhancements
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
      getTranslations(lang, ["all", "header", "footer"]),
      categories({ lang }),
      subCategories({ lang }),
      getProduct({ lang, id }),
      getReviews({ id }),
    ]);

  // SEO: Canonical URL enforcement - Redirect to proper URL format to prevent duplicate content
  if (product) {
    const productSlug = getUrlName(product.name);
    const canonicalRef = `${productSlug}_ref_${product._id}`;
    // Decode the ref parameter to handle URL-encoded characters (e.g., Arabic)
    const decodedRef = decodeURIComponent(ref);
    // If the current URL doesn't match the canonical format, permanent redirect
    if (decodedRef !== canonicalRef)
      permanentRedirect(
        `/${lang === "ar" ? "" : "en/"}products/${encodeURIComponent(
          canonicalRef,
        )}`,
      );
  }

  if (!product) notFound();

  // Generate comprehensive structured data for product rentals
  const removeEmojis = (text) => {
    if (!text) return "";
    return text
      .replace(/\p{Extended_Pictographic}/gu, "")
      .replace(/\uFE0F/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getCloudinaryUrl = (url, width, height) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill/`);
  };

  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const langPrefix = lang === "ar" ? "" : "en/";
  const productURL = `${siteURL}/${langPrefix}products/${ref}`;
  const productStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productURL}#product`,
        name: product.name,
        description: removeEmojis(product.description),
        url: productURL,
        // brand: {
        //   "@type":
        //     product.owner?.accountType === "company" ? "Organization" : "Brand",
        //   name: product.owner?.fullName || "Estajer",
        // },
        // Images with explicit dimensions for better Rich Results
        image:
          product.images?.map((img, idx) => ({
            "@type": "ImageObject",
            url: getCloudinaryUrl(img.preview, 1200, 1200),
            contentUrl: getCloudinaryUrl(img.preview, 1200, 1200),
            width: 1200,
            height: 1200,
            caption: `${product.name} - ${lang === "ar" ? "صورة" : "Image"} ${
              idx + 1
            }`,
          })) || [],
        category: product.category,
        sku: product._id,
        offers: {
          "@type": "Offer",
          "@id": `${productURL}#offer`,
          url: productURL,
          price: getDisplayPrice(product),
          priceCurrency: "SAR",
          availability: "https://schema.org/InStock",
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          seller: {
            "@type":
              product.owner?.accountType === "company"
                ? "Organization"
                : "Person",
            name: product.owner?.fullName,
            image: product.owner?.avatar,
          },
          areaServed: {
            "@type": "Country",
            name: "Saudi Arabia",
            addressCountry: "SA",
          },
          businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
          eligibleDuration: {
            "@type": "QuantitativeValue",
            minValue: 1,
            unitCode: "DAY",
            unitText: lang === "ar" ? "يوم" : "Day",
          },
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: getDisplayPrice(product),
            priceCurrency: "SAR",
            referenceQuantity: {
              "@type": "QuantitativeValue",
              value: 1,
              unitCode: "DAY",
              unitText: lang === "ar" ? "يوم" : "Day",
            },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "SA",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 1,
            returnMethod: "https://schema.org/ReturnInStore",
          },
        },
        aggregateRating:
          reviews.rating?.count > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: reviews.rating.average,
                ratingCount: reviews.rating.count,
                reviewCount: reviews.rating.count,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
        review:
          reviews.data?.length > 0
            ? reviews.data?.slice(0, 5).map((review) => ({
                "@type": "Review",
                author: {
                  "@type": "Person",
                  name: review.user?.fullName || "Anonymous",
                },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: review?.rating?.overall,
                  bestRating: 5,
                  worstRating: 1,
                },
                reviewBody: review.comment,
                datePublished: review.createdAt,
              }))
            : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${productURL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: translate("product.page.breadcrumb.home"),
            item: `${siteURL}/${lang === "ar" ? "" : "en/"}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: translate("product.page.breadcrumb.products"),
            item: `${siteURL}/${lang === "ar" ? "" : "en/"}search/products`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name:
              categoriesData?.find(({ key }) => key === product.category)
                ?.label || product.category,
            item: `${siteURL}/${langPrefix}${product.category}/products`,
          },
          ...(product.subCategory
            ? [
                {
                  "@type": "ListItem",
                  position: 4,
                  name:
                    subCategoriesData?.[product.category]?.find(
                      ({ key }) => key === product.subCategory,
                    )?.label || product.subCategory,
                  item: `${siteURL}/${langPrefix}${product.category}/${product.subCategory}/products`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: product.subCategory ? 5 : 4,
            name: product.name,
            item: productURL,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${siteURL}/#organization`,
        name: "Estajer",
        alternateName: "استأجر",
        url: siteURL,
        logo: {
          "@type": "ImageObject",
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768055959/logo_with_slogan_-estajer_y6tvqg_mujo45.webp",
        },
      },
    ],
  };

  return (
    <div>
      <Suspense fallback={null}>
        <GTMProductView product={product} lang={lang} />
      </Suspense>
      <Suspense fallback={null}>
        <ProductTourContainer
          lang={lang}
          translate={translate()}
          product={product}
        />
      </Suspense>
      <Script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <div className="relative mt-2 md:mt-10">
        <CloudSection sm={true} lang={lang} />
        <div className="max-w-screen-2xl mx-auto lg:px-6 px-4 relative">
          <Breadcrumbs
            lang={lang}
            product={product}
            categoriesData={categoriesData}
            subCategoriesData={subCategoriesData}
          />
          <ImagesContainer product={product} lang={lang} />
          <div className="flex flex-col lg:grid lg:grid-cols-12 md:gap-4 mt-4 md:mt-10 md:mb-32 mb-16 lg:items-start">
            <div className="contents lg:block lg:col-span-7 lg:pe-4">
              <ProductDetails
                lang={lang}
                product={product}
                rating={reviews.rating}
              />
              <div className="order-4 mt-8" id="reviews">
                <ReviewsContainer
                  productName={product.name}
                  initialReviews={reviews}
                  translate={translate()}
                  productId={id}
                  lang={lang}
                />
              </div>
            </div>
            <div className="contents lg:block lg:col-span-5 lg:ps-4">
              <div className="order-2">
                <OrderContainer product={product} lang={lang} />
              </div>
              <div className="order-5 mt-8">
                <SafetySection lang={lang} />
                <ReportButton
                  productId={product._id}
                  lang={lang}
                  translate={translate()}
                />
              </div>
            </div>
          </div>
          <Suspense fallback={null}>
            <SimilarProducts
              lang={lang}
              product={product}
              translate={translate}
            />
          </Suspense>
          <Suspense fallback={null}>
            <CloseProducts
              lang={lang}
              product={product}
              translate={translate}
            />
          </Suspense>
          <RentalCostSection lang={lang} product={product} />
          <WhyUsSection
            lang={lang}
            product={product}
            categoriesData={categoriesData}
            subCategoriesData={subCategoriesData}
          />
          <RentVsBuySection lang={lang} product={product} />
          <ProductFaqs lang={lang} translate={translate()} product={product} />
        </div>
        <ProductCtaBanner
          lang={lang}
          product={product}
          translate={translate()}
        />
      </div>
      <ProductBottomBar product={product} translate={translate()} lang={lang} />
    </div>
  );
}
