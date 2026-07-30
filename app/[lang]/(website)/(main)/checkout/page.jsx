import CheckoutContainer from "@/components/checkout/CheckoutContainer";
import { getTranslations } from "@/hooks/getTranslations";
import Script from "next/script";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  return {
    robots: { index: false, follow: false },
    title: lang === "ar" ? "الدفع | استأجر" : "Checkout | Estajer",
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
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <>
      <Script
        src="https://sdk.waffyapp.com/v2/waffy-payment-display.min.js"
        strategy="afterInteractive"
      />
      <CheckoutContainer translate={translate()} lang={lang} />
    </>
  );
}
