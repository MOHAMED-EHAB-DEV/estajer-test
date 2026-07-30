import { Suspense } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import CloudSection from "@/components/singleProduct/CloudSection";
import ImagesContainer from "@/components/singleProduct/ImagesContainer";
import OrderContainer from "@/components/singleProduct/OrderContainer";
import ProductDetails from "@/components/singleProduct/ProductDetails";
import SafetySection from "@/components/singleProduct/SafetySection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ReportButton from "@/components/singleProduct/report/ReportButton";
import GTMProductView from "@/hooks/GTMProductView";
import ProductTourContainer from "@/components/singleProduct/ProductTourContainer";
import SimilarProducts from "@/components/singleProduct/SimilarProducts";
import CloseProducts from "@/components/singleProduct/CloseProducts";
import RentalCostSection from "@/components/singleProduct/RentalCostSection";
import WhyUsSection from "@/components/singleProduct/WhyUsSection";
import RentVsBuySection from "@/components/singleProduct/RentVsBuySection";
import { getUrlName } from "@/lib/sitemap";
import TrustSection from "./TrustSection";

// Dynamic imports for below-the-fold components
const ReviewsContainer = dynamic(
  () => import("@/components/singleProduct/review/ReviewsContainer"),
  { ssr: true },
);
const ProductFaqs = dynamic(
  () => import("@/components/singleProduct/ProductFaqs"),
);
const ProductCtaBanner = dynamic(
  () => import("@/components/singleProduct/ProductCtaBanner"),
);
const ProductBottomBar = dynamic(
  () => import("@/components/singleProduct/ProductBottomBar"),
);

export function getDisplayPrice(product) {
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

export default function ProductPageContent({
  product,
  reviews,
  translate,
  categoriesData,
  subCategoriesData,
  lang,
  shopSlug,
}) {
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
  const productSlug = getUrlName(product.name);
  const canonicalRef = `${productSlug}_ref_${product._id}`;
  const productURL = `${siteURL}/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}products/${canonicalRef}`;

  const productStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productURL}#product`,
        name: product.name,
        description: removeEmojis(product.description),
        url: productURL,
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
    <>
      <Suspense fallback={null}>
        <GTMProductView product={product} lang={lang} />
      </Suspense>
      <Suspense fallback={null}>
        <ProductTourContainer
          lang={lang}
          translate={translate("productTour")}
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
            shopSlug={shopSlug}
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
                  translate={{
                    profile: translate("profile"),
                    singleProduct: {
                      reviews: translate("singleProduct.reviews"),
                    },
                    addProductPage: {
                      imageUploader: translate("addProductPage.imageUploader"),
                    },
                  }}
                  productId={product._id}
                  lang={lang}
                />
              </div>
            </div>
            <div className="contents lg:block lg:col-span-5 lg:ps-4">
              <div className="order-2">
                <OrderContainer
                  product={product}
                  lang={lang}
                  shopSlug={shopSlug}
                />
              </div>
              <div className="order-5 mt-8">
                <SafetySection lang={lang} />
                <ReportButton
                  productId={product._id}
                  lang={lang}
                  translate={{
                    report: translate("singleProduct.report"),
                    singleProduct: { report: translate("singleProduct.report") },
                  }}
                />
              </div>
            </div>
          </div>
          {/* ── Trust Sections (pick one, delete the rest) ── */}
          <TrustSection translate={translate("singleProduct.trustSection")} />

          <Suspense fallback={null}>
            <SimilarProducts
              lang={lang}
              product={product}
              translate={translate}
              userId={shopSlug ? product.owner?._id || product.owner : null}
              shopSlug={shopSlug}
            />
          </Suspense>
          <Suspense fallback={null}>
            <CloseProducts
              lang={lang}
              product={product}
              translate={translate}
              userId={shopSlug ? product.owner?._id || product.owner : null}
              shopSlug={shopSlug}
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
          <ProductFaqs
            lang={lang}
            translate={{ product: { faqs: translate("product.faqs") } }}
            product={product}
          />
        </div>
        <ProductCtaBanner
          lang={lang}
          product={product}
          translate={{ product: { ctaBanner: translate("product.ctaBanner") } }}
        />
      </div>
      <ProductBottomBar
        product={product}
        translate={{
          chat: translate("chat"),
          mobileNav: translate("mobileNav"),
          singleProduct: { order: translate("singleProduct.order") },
          productComponent: translate("productComponent"),
          sidebar: translate("sidebar"),
          footer: translate("footer"),
          notifications: translate("notifications"),
        }}
        lang={lang}
        shopSlug={shopSlug}
      />
    </>
  );
}
