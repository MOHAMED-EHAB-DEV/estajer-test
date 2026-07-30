import PaymentStatus from "@/components/paymentCompleted/PaymentStatus";
import PushNotificationModal from "@/components/shared/PushNotificationModal";
import { getTranslations } from "@/hooks/getTranslations";
import Script from "next/script";

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  return {
    robots: { index: false, follow: false },
    title: lang === "ar" ? "اكتمل الدفع | استأجر" : "Payment Completed | Estajer",
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : "en/"}payment-completed/${id}`,
      languages: {
        ar: `/payment-completed/${id}`,
        en: `/en/payment-completed/${id}`,
      },
    },
  };
}

export default async function page({ params }) {
  const { lang, id } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang);

  return (
    <>
      <Script
        src="https://sdk.waffyapp.com/v2/waffy-payment-display.min.js"
        strategy="afterInteractive"
      />
      <PushNotificationModal
        customer={true}
        translate={translate()}
        open={true}
        lang={lang}
      />
      <PaymentStatus
        id={id}
        lang={lang}
        langPrefix={langPrefix}
        translate={translate()}
      />
    </>
  );
}
