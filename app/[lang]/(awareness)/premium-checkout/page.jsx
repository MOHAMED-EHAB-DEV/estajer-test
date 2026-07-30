import PremiumCheckoutContainer from "@/components/premium/PremiumCheckoutContainer";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata() {
  return {
    title: "الاشتراك في الباقة البريميوم | استأجر",
    description: "اشترك في الباقة البريميوم واحصل على متجرك الإلكتروني مع مميزات حصرية.",
    robots: { index: false },
  };
}

export default async function PremiumCheckoutPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  return <PremiumCheckoutContainer lang={lang} translate={translate()} />;
}
