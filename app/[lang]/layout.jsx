import localFont from "next/font/local";
import Providers from "./Providers";
import { Suspense } from "react";
import LocalSEO from "@/components/seo/LocalSEO";
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
          url: lang === "ar" ? `${siteURL}/og/home_ar.webp` : `${siteURL}/og/home_en.webp`,
          width: 1200,
          height: 630,
          alt: lang === "ar" ? "استأجر - استأجر أي شيء" : "Estajer - Rent Anything",
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
          url: lang === "ar" ? `${siteURL}/og/home_ar.webp` : `${siteURL}/og/home_en.webp`,
          alt: lang === "ar" ? "استأجر - استأجر أي شيء" : "Estajer - Rent Anything",
          width: 1200,
          height: 630,
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
        {/* Auto-reload on stale chunk after deployment */}
        <Script id="chunk-error-reload" strategy="beforeInteractive">{`
          (function () {
            var RELOAD_KEY = '__chunk_reload__';
            function isChunkError(msg) {
              return (
                typeof msg === 'string' &&
                (msg.indexOf('ChunkLoadError') !== -1 ||
                  msg.indexOf('Loading chunk') !== -1 ||
                  msg.indexOf("Cannot read properties of undefined (reading 'call')") !== -1 ||
                  msg.indexOf('Unexpected token') !== -1)
              );
            }
            window.addEventListener('error', function (e) {
              if (isChunkError(e && e.message)) {
                if (!sessionStorage.getItem(RELOAD_KEY)) {
                  sessionStorage.setItem(RELOAD_KEY, '1');
                  window.location.reload();
                } else {
                  sessionStorage.removeItem(RELOAD_KEY);
                }
              }
            });
            window.addEventListener('unhandledrejection', function (e) {
              var reason = e && e.reason;
              var msg = reason && (reason.message || String(reason));
              if (isChunkError(msg)) {
                e.preventDefault();
                if (!sessionStorage.getItem(RELOAD_KEY)) {
                  sessionStorage.setItem(RELOAD_KEY, '1');
                  window.location.reload();
                } else {
                  sessionStorage.removeItem(RELOAD_KEY);
                }
              }
            });
          })();
        `}</Script>
      </head>
      <body className={`${IBMPlexArabic.variable} ${NotoSansArabic.className}`}>
        <Providers dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
