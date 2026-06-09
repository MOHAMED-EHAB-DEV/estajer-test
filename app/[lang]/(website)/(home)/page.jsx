import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import Categories from "@/components/home/Categories";
import HomeBanners from "@/components/home/HomeBanners";
// import NewestProducts from "@/components/home/NewestProducts";
import { getTranslations } from "@/hooks/getTranslations";
import { serviceTypeKeys } from "@/static/serviceTypes";
import { areaServedKeys } from "@/static/areaServed";
// import VerifiedShops from "@/components/home/VerifiedShops";
import HowToRent from "@/components/home/HowToRent";
import WhyEstajer from "@/components/home/WhyEstajer";
import HomeShopsSection from "@/components/home/HomeShopsSection";
import PushNotificationTrigger from "@/components/home/PushNotificationTrigger";
// import CallToAction from "@/components/home/CallToAction";

// const RequestedProducts = dynamic(
//   () => import("@/components/home/RequestedProducts"),
//   {
//     loading: () => (
//       <div className="h-96 animate-pulse bg-gray-200 rounded-lg" />
//     ),
//     ssr: true,
//   }
// );

// const Blogs = dynamic(() => import("@/components/home/Blogs"), {
//   loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded-lg" />,
//   ssr: true
// });

const NewestProducts = dynamic(
  () => import("@/components/home/NewestProducts"),
);

export async function generateMetadata({ params }) {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const { lang } = await params;

  const meta = {
    ar: {
      title: "استأجر | منصة تأجير المنتجات الأولى في السعودية",
      description:
        "أفضل منصة لتأجير المنتجات في السعودية. استأجر أجهزة إلكترونية، أثاث، أدوات، مستلزمات فعاليات وآلاف المنتجات للإيجار في الرياض، جدة، الدمام وجميع مدن المملكة.",
      keywords: [
        "استاجار منتجات",
        "تأجير منتجات",
        "إيجار أجهزة",
        "تأجير أثاث",
        "استأجر السعودية",
        "منصة تأجير",
        "إيجار معدات",
        "تأجير أدوات",
        "استأجر أجهزة إلكترونية",
        "تأجير مستلزمات فعاليات",
        "الرياض",
        "جدة",
        "الدمام",
        "مكة",
        "المدينة المنورة",
      ],
      ogLocale: "ar_SA",
      author: "فريق استأجر",
      publisher: "استأجر - منصة تأجير المنتجات",
    },
    en: {
      title: "Estajer | #1 Product Rental Platform in Saudi Arabia",
      description:
        "Rent a wide variety of products at the best prices in Saudi Arabia. Electronics rental, furniture rental, tools, and event supplies. Don't buy.. rent and save with trusted Estajer platform.",
      keywords: [
        "product rental Saudi Arabia",
        "rent products",
        "electronics rental",
        "furniture rental",
        "equipment hire",
        "tool rental",
        "event supplies rental",
        "Estajer",
        "Riyadh rental",
        "Jeddah rental",
        "Dammam rental",
        "Mecca rental",
        "Medina rental",
        "Saudi rental platform",
      ],
      ogLocale: "en_US",
      author: "Estajer Team",
      publisher: "Estajer - Product Rental Platform",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    // --- CORE METADATA ---
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    authors: [{ name: currentMeta.author }],
    publisher: currentMeta.publisher,
    metadataBase: new URL(siteURL),
    // Language versions are handled by the main layout
    alternates: {
      languages: { ar: "/", en: "/en" },
      canonical: `${siteURL}${lang === "ar" ? "/" : `/${lang}`}`,
    },
    // Controls search engine crawling behavior
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}${lang === "ar" ? "/" : `/${lang}`}`,
      name: lang === "ar" ? "استأجر" : "Estajer",
      images: [
        {
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp",
          width: 1900,
          height: 1056,
          alt: "Estajer - Rent Anything",
        },
      ],
      locale: currentMeta.ogLocale,
      type: "website",
    },

    // --- TWITTER CARD TAGS ---
    twitter: {
      card: "summary_large_image",
      title: currentMeta.title,
      description: currentMeta.description,
      site: "@Estajercom",
      creator: "@Estajercom",
      images: [
        `https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp`,
      ],
    },
    // Provides a link to the manifest file for PWA capabilities
    manifest: "/manifest.json",

    // --- ADDITIONAL SEO ENHANCEMENTS ---
    category: lang === "ar" ? "تأجير منتجات" : "Product Rental",
    classification: "Business",
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": "Estajer",
      "application-name": "Estajer",
      // Geo Meta Tags
      "geo.region": "SA",
      "geo.placename": lang === "ar" ? "الرياض" : "Riyadh",
      "geo.position": "24.7136;46.6753",
      ICBM: "24.7136, 46.6753",
      // Local Business Meta Tags
      "business:contact_data:street_address":
        lang === "ar" ? "المملكة العربية السعودية" : "Kingdom of Saudi Arabia",
      "business:contact_data:locality": lang === "ar" ? "الرياض" : "Riyadh",
      "business:contact_data:region": lang === "ar" ? "الرياض" : "Riyadh",
      "business:contact_data:postal_code": "11564",
      "business:contact_data:country_name": "Saudi Arabia",
      "business:contact_data:phone_number": "+966530636879",
      "business:contact_data:email": "service@estajer.com",
      // Additional SEO Meta Tags
      rating: "4.8",
      price_range: "$$",
      currency: "SAR",
      availability: "24/7",
    },
  };
}
async function fetchShops(lang) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shops?limit=12&lang=${lang}`,
      { next: { revalidate: 60 * 60, tags: ["everyShop"] } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function Home({ params }) {
  const { lang } = await params;
  const t = await getTranslations(lang, ["home-seo"]);
  const shops = await fetchShops(lang);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL}/#organization`,
        name: lang === "ar" ? "استأجر" : "Estajer",
        alternateName: lang === "ar" ? "Estajer" : "استأجر",
        url: process.env.NEXT_PUBLIC_APP_URL,
        logo: {
          "@type": "ImageObject",
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768055959/logo_with_slogan_-estajer_y6tvqg_mujo45.webp",
          width: 1572,
          height: 748,
        },
        description:
          lang === "ar"
            ? "منصة تأجير المنتجات الأولى في السعودية - استأجر منتجات متنوعة بأفضل الأسعار"
            : "Saudi Arabia's #1 product rental platform - Rent various products at the best prices",
        address: {
          "@type": "PostalAddress",
          addressCountry: "SA",
          addressLocality: lang === "ar" ? "الرياض" : "Riyadh",
        },
        areaServed: {
          "@type": "Country",
          name: lang === "ar" ? "السعودية" : "Saudi Arabia",
        },
        serviceType: lang === "ar" ? "تأجير منتجات" : "Product Rental Services",
      },
      {
        "@type": "WebSite",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL}/#website`,
        url: process.env.NEXT_PUBLIC_APP_URL,
        name: lang === "ar" ? "استأجر" : "Estajer",
        description:
          lang === "ar"
            ? "استأجر منتجات متنوعة بأفضل الأسعار في السعودية"
            : "Rent various products at the best prices in Saudi Arabia",
        publisher: {
          "@id": `${process.env.NEXT_PUBLIC_APP_URL}/#organization`,
        },
        inLanguage: lang === "ar" ? "ar-SA" : "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/search/products?name={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL}/#localbusiness`,
        name: lang === "ar" ? "استأجر" : "Estajer",
        image:
          "https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp",
        description:
          lang === "ar"
            ? "منصة تأجير المنتجات الأولى في السعودية - تأجير أجهزة إلكترونية، أثاث، معدات، وأدوات"
            : "Saudi Arabia's #1 product rental platform - Electronics, furniture, equipment, and tools rental",
        url: process.env.NEXT_PUBLIC_APP_URL,
        address: {
          "@type": "PostalAddress",
          addressCountry: "SA",
          addressLocality: lang === "ar" ? "الرياض" : "Riyadh",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 24.7136,
          longitude: 46.6753,
        },
        areaServed: areaServedKeys.map((key) => ({
          "@type": "City",
          name: t(key),
        })),
        serviceType: serviceTypeKeys.map((key) => t(key)),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroSection lang={lang} />
      <Categories lang={lang} />
      <NewestProducts lang={lang} key={"main"} />
      <HomeBanners lang={lang} />
      <NewestProducts lang={lang} key={"offers"} offers={true} />
      <HomeShopsSection lang={lang} shops={shops} />
      <HowToRent lang={lang} />
      {/* <CallToAction lang={lang} /> */}
      <NewestProducts newest={true} lang={lang} key={"newest"} />
      <WhyEstajer lang={lang} />
      <NewestProducts category={true} lang={lang} key={"category"} />
      {/* <RequestProduct lang={lang} /> */}
      {/* <RequestedProducts lang={lang} /> */}
      <PushNotificationTrigger lang={lang} translate={t()} />
      {/* <Blogs lang={lang} /> */}
    </>
  );
}
