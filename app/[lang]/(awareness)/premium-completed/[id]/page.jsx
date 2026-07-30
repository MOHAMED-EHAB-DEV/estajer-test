import PremiumPaidSection from "@/components/premium/PremiumPaidSection";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata() {
  return {
    title: "تم الاشتراك بنجاح | استأجر",
    description: "تم تفعيل باقتك البريميوم بنجاح على منصة استأجر.",
    robots: { index: false },
  };
}

export default async function PremiumCompletedPage({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  return <PremiumPaidSection milestoneId={id} lang={lang} translate={translate()} />;
}
