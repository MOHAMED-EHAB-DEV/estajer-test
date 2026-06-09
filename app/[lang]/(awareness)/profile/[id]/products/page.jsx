import { getTranslations } from "@/hooks/getTranslations";
import { notFound } from "next/navigation";

import TopSection from "@/components/userProfile/TopSection";
import ProductContainer from "@/components/category/ProductContainer";
import ProfileBanners from "@/components/profile/ProfileBanners";

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  const t = (value) => translate(`profile.${value}`);
  const user = await getUser(id, lang);
  if (!user) return;

  const userName = user.fullName;
  const userBio = user.bio || "";

  const initialProducts = await getInitialProducts({ id: user._id, lang });

  const hasBio = user.bio && user.bio.length > 20;
  const hasEnoughProducts = initialProducts.length >= 3;
  const isIndexable = hasBio || hasEnoughProducts;

  return {
    title: `${userName} - ${t("products")} | ${t("siteName")}`,
    description: userBio || `${t("viewProductsBy")} ${userName}.`,
    robots: { index: isIndexable, follow: true },
    openGraph: {
      title: `${userName} - ${t("products")}`,
      description: userBio || `${t("viewProductsBy")} ${userName}`,
      type: "profile",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }profile/${id}/products`,
      images: user.avatar
        ? [
            {
              url: user.avatar,
              width: 400,
              height: 400,
              alt: `${userName} ${t("profilePicture")}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title: `${userName} - ${t("products")}`,
      description: userBio || `${t("viewProductsBy")} ${userName}`,
      images: user.avatar ? [user.avatar] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }profile/${id}/products`,
      languages: {
        ar: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${id}/products`,
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/profile/${id}/products`,
      },
    },
  };
}

async function getUser(id, lang) {
  try {
    const params = new URLSearchParams();
    if (lang) params.set("lang", lang);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/users/${id}?${params}`,
    );
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

async function getInitialProducts({ id, lang }) {
  const params = new URLSearchParams({
    userId: id,
    limit: 40,
    fields: `images,owner,${
      lang === "ar" ? "nameAr" : "nameEn"
    },rental,rating,pricingModel,location,${
      lang === "ar" ? "addressAr" : "addressEn"
    }`,
    compressed: true,
    lang,
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`,
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
    return [];
  }
}

export default async function page({ params, searchParams }) {
  const { lang, id } = await params;
  const queryParams = await searchParams;

  const translate = await getTranslations(lang);
  const t = (value) => translate(`profile.${value}`);
  const user = await getUser(id, lang);
  if (!user) notFound();

  const initialProducts = await getInitialProducts({ id: user._id, lang });
  // Generate JSON-LD schema markup
  const personSchema = {
    "@context": "https://schema.org",
    "@type": user.accountType === "company" ? "Organization" : "Person",
    name: user.fullName,
    description: user.bio || `${t("viewProductsBy")} ${user.fullName}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${
      lang === "ar" ? "" : "en/"
    }profile/${id}/products`,
    image: user.avatar,
    address: user.address
      ? { "@type": "PostalAddress", addressLocality: user.address }
      : undefined,
    aggregateRating:
      user.rating?.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: user.rating.average,
            reviewCount: user.rating.count || 0,
            reviewCount: user.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    offers: initialProducts.map((product) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: product.name,
        image: product.images?.[0].preview,
        offers: {
          "@type": "Offer",
          priceCurrency: "SAR",
          price: product.rental.value,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <div className="-mt-[7.5rem]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <TopSection
        lang={lang}
        user={user}
        page="products"
        translate={translate()}
        branch={queryParams.branch}
      />
      <ProfileBanners lang={lang} userId={user._id} />
      <ProductContainer
        sm={true}
        lang={lang}
        userId={id}
        translate={translate()}
        initialProducts={initialProducts}
        isProfile={true}
        branch={queryParams.branch}
      />
    </div>
  );
}
