import { notFound } from "next/navigation";
import CheckoutContainer from "@/components/checkout/CheckoutContainer";
import { getTranslations } from "@/hooks/getTranslations";
import { getSectionComponent } from "@/components/shop/themes/registry";
import ClassicHeader from "@/components/shop/themes/classic/Header";
import ClassicFooter from "@/components/shop/themes/classic/Footer";
import Script from "next/script";

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

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const shop = await getShop(slug, lang);
  const shopName = lang === "ar" ? shop?.nameAr : shop?.nameEn;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  return {
    robots: { index: false, follow: false },
    title:
      lang === "ar"
        ? `الدفع | ${shopName || "المتجر"}`
        : `Checkout | ${shopName || "Shop"}`,
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : "en/"}checkout`,
      languages: {
        ar: `/checkout`,
        en: `/en/checkout`,
      },
    },
  };
}

export default async function page({ params }) {
  const { slug, lang } = await params;
  const [translate, shop] = await Promise.all([
    getTranslations(lang, ["all", "shop"]),
    getShop(slug, lang),
  ]);

  if (!shop) notFound();

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
      <Script
        src="https://sdk.waffyapp.com/v2/waffy-payment-display.min.js"
        strategy="afterInteractive"
      />
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
        <CheckoutContainer translate={translate()} lang={lang} />
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
