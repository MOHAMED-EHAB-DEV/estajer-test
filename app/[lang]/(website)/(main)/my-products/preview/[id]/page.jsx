import CloudSection from "@/components/singleProduct/CloudSection";
import ImagesContainer from "@/components/singleProduct/ImagesContainer";
import ProductDetails from "@/components/singleProduct/ProductDetails";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getTranslations } from "@/hooks/getTranslations";
import { notFound } from "next/navigation";
import { categories } from "@/static/categoriesOptions";
import { anyImgUrl } from "@/utils/ImageUrl";

export async function generateMetadata({ params }) {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const { lang, id } = await params;

  const product = await getProduct({ lang, id });
  const meta = {
    ar: {
      title: `${product?.name || "غير متاح"} | استأجر`,
      description: product?.description || "منتج غير متاح",
      ogLocale: "ar_SA",
      keywords: product?.name.split(" ").filter((word) => word.length > 2),
      canonical: `${siteURL}/products/${id}`,
    },
    en: {
      title: `${product?.name || "not available"} | Estajer`,
      description: product?.description || "Product not available",
      ogLocale: "en_US",
      keywords: product?.name.split(" ").filter((word) => word.length > 2),
      canonical: `${siteURL}/en/products/${id}`,
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    // --- CORE METADATA ---
    robots: "noindex, nofollow",
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    // Tells Google about the other language versions of this page
    alternates: {
      canonical: currentMeta.canonical,
      languages: {
        ar: `${siteURL}/products/${id}`,
        en: `${siteURL}/en/products/${id}`,
      },
    },

    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: currentMeta.canonical,
      siteName: "Estajer",
      images: product?.images.map((img, idx) => ({
        url: anyImgUrl({ src: img.preview, size: 800 }),
        alt: product?.name + (idx + 1),
        width: 800,
      })),
      locale: currentMeta.ogLocale,
      type: "website",
    },

    // --- TWITTER CARD TAGS ---
    twitter: {
      card: "summary_large_image",
      title: currentMeta.title,
      description: currentMeta.description,
      // You can add your site's Twitter handle here
      // site: '@EstajerApp',
      images: product?.images.map((img, idx) => ({
        url: anyImgUrl({ src: img.preview, size: 800 }),
        alt: product?.name + (idx + 1),
        width: 800,
      })),
    },
  };
}

async function getProduct({ lang, id }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}?lang=${lang}&showAll=true`,
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

export default async function page({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  const product = await getProduct({ lang, id });
  const categoriesData = await categories({ lang });
  if (!product) notFound();

  return (
    <div>
      <div className="relative mt-6 md:mt-12 mb-20">
        <CloudSection lang={lang} />
        <div className="max-w-screen-2xl mx-auto lg:px-6 px-4 relative">
          <Breadcrumbs
            lang={lang}
            product={product}
            categoriesData={categoriesData}
          />
          <ImagesContainer product={product} />
          <div className="flex flex-wrap mt-10 mb-32">
            <ProductDetails
              lang={lang}
              product={product}
              translate={translate()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
