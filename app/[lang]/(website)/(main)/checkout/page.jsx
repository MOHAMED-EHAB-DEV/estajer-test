import CheckoutContainer from "@/components/checkout/CheckoutContainer";
import { getTranslations } from "@/hooks/getTranslations";
import Script from "next/script";

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
