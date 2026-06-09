import PaymentStatus from "@/components/paymentCompleted/PaymentStatus";
import PushNotificationModal from "@/components/shared/PushNotificationModal";
import { getTranslations } from "@/hooks/getTranslations";
import Script from "next/script";

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
