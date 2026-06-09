import localFont from "next/font/local";
import Providers from "./Providers";
import { Suspense } from "react";
import LocalSEO from "@/components/seo/LocalSEO";
import { GoogleTagManager } from "@next/third-parties/google";
import GTMPageView from "@/hooks/GTMPageView";
import Script from "next/script";

// Font files can be colocated inside of `pages`
const IBMPlexArabic = localFont({
  src: [
    {
      path: "../../fonts/subset-IBMPlexArabic.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/subset-IBMPlexArabic-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--IBM-Plex-Sans-Arabic",
  preload: true,
  display: "swap",
});

const NotoSansArabic = localFont({
  src: [
    {
      path: "../../fonts/subset-NotoSansArabic.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/subset-NotoSansArabic-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--noto-sans-arabic",
  preload: true,
  display: "swap",
});

export async function generateMetadata({ params }) {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const { lang } = await params;

  const meta = {
    ar: {
      title: "استأجر | كل احتياجاتك، بدون عناء الشراء",
      description:
        "اكتشف مجموعة واسعة من المنتجات والأدوات للإيجار على منصة استأجر. من الأجهزة الإلكترونية والأثاث إلى مستلزمات الفعاليات، كل ما تحتاجه للإيجار بضغطة زر.",
      ogLocale: "ar_SA",
    },
    en: {
      title: "Estajer | Rent Anything You Need, Without the Hassle of Buying",
      description:
        "Discover a wide range of products for rent on Estajer. From electronics and tools to furniture and event supplies, find what you need without the hassle of buying. Rent it today!",
      ogLocale: "en_US",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    // --- CORE METADATA ---
    title: currentMeta.title,
    description: currentMeta.description,
    metadataBase: new URL(siteURL),
    // Apple touch icons and favicon
    icons: {
      icon: [
        { url: "/icons/icon-48x48.webp", sizes: "48x48", type: "image/webp" },
        { url: "/icons/icon-72x72.webp", sizes: "72x72", type: "image/webp" },
        { url: "/icons/icon-96x96.webp", sizes: "96x96", type: "image/webp" },
        {
          url: "/icons/icon-128x128.webp",
          sizes: "128x128",
          type: "image/webp",
        },
        {
          url: "/icons/icon-144x144.webp",
          sizes: "144x144",
          type: "image/webp",
        },
        {
          url: "/icons/icon-152x152.webp",
          sizes: "152x152",
          type: "image/webp",
        },
        {
          url: "/icons/icon-192x192.webp",
          sizes: "192x192",
          type: "image/webp",
        },
        {
          url: "/icons/icon-256x256.webp",
          sizes: "256x256",
          type: "image/webp",
        },
        {
          url: "/icons/icon-384x384.webp",
          sizes: "384x384",
          type: "image/webp",
        },
        {
          url: "/icons/icon-512x512.webp",
          sizes: "512x512",
          type: "image/webp",
        },
      ],
      apple: [
        {
          url: "/icons/icon-152x152.webp",
          sizes: "152x152",
          type: "image/webp",
        },
        {
          url: "/icons/icon-192x192.webp",
          sizes: "192x192",
          type: "image/webp",
        },
      ],
    },
    // Tells Google about the other language versions of this page
    alternates: {
      canonical: lang === "ar" ? "/" : `/en`,
      languages: { ar: "/", en: "/en" },
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
      url: `${siteURL}${lang === "ar" ? "/" : `/en`}`,
      siteName: "Estajer",
      images: [
        {
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp",
          width: 1900,
          height: 1056,
          alt: "Estajer - Rent Anything",
          type: "image/webp",
        },
      ],
      locale: currentMeta.ogLocale,
      type: "website",
      emails: ["service@estajer.com"],
      phoneNumbers: ["+966530636879"],
      alternateLocale: lang === "ar" ? "en_US" : "ar_SA",
      section: "Rental Services",
      tags: [
        "rental",
        "products",
        "marketplace",
        "saudi arabia",
        "تأجير",
        "منتجات",
      ],
    },

    // --- TWITTER CARD TAGS ---
    twitter: {
      card: "summary_large_image",
      title: currentMeta.title,
      description: currentMeta.description,
      site: "@Estajercom",
      creator: "@Estajercom",
      images: [
        {
          url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp",
          alt: "Estajer - Rent Anything",
          width: 1900,
          height: 1056,
          type: "image/webp",
        },
      ],
    },
    other: {
      // Facebook App ID for Facebook Insights (you need to get actual App ID from Facebook Developers)
      // "fb:app_id": "YOUR_FACEBOOK_APP_ID",
      // LinkedIn verification (you need actual LinkedIn company ID)
      "linkedin:owner": "98212519",
      // WhatsApp Business
      "whatsapp:phone": "+966530636879",
      // Instagram
      "instagram:site": "@estajercom",
      // TikTok
      "tiktok:site": "@estajer.com",
      // Snapchat
      "snapchat:site": "@estajercom",
      // Theme colors for different platforms
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        {/* <Script
          id="gtm-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              function loadGTM() {
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-W7PNC244');
              }
              if ('requestIdleCallback' in window) {
                requestIdleCallback(function() { setTimeout(loadGTM, 3000); });
              } else {
                setTimeout(loadGTM, 5000);
              }
            `,
          }}
        /> */}
        <LocalSEO lang={lang} />
        <Script id="webmcp-registration" strategy="lazyOnload">
          {`
            if ('modelContext' in navigator && navigator.modelContext.registerTool) { 
              const controller = new AbortController(); 
              navigator.modelContext.registerTool({ 
                name: 'search_products', 
                description: 'Search for products available for rent on Estajer', 
                inputSchema: { 
                  type: 'object', 
                  properties: { 
                    query: { type: 'string', description: 'The search term or product name' } 
                  }, 
                  required: ['query'] 
                }, 
                execute: async ({ query }) => { 
                  const lang = document.documentElement.lang;
                  const prefix = lang === 'en' ? '/en' : ''; 
                  window.location.href = \`\${prefix}/search/products?name=\${encodeURIComponent(query)}\`; 
                  return { success: true }; 
                } 
              }, { signal: controller.signal }); 
            }
          `}
        </Script>
      </head>
      <body className={`${IBMPlexArabic.variable} ${NotoSansArabic.className}`}>
        {/* <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W7PNC244"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript> */}
        <Suspense fallback={null}>
          <GTMPageView />
        </Suspense>
        <Providers dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
          {children}
        </Providers>
        <GoogleTagManager gtmId="GTM-W7PNC244" />
      </body>
    </html>
  );
}
