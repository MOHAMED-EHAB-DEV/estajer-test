import MarketingFaqs from "@/components/marketing/MarketingFaqs";
import PricingPlans from "@/components/marketing/PricingPlans";
import { getTranslations } from "@/hooks/getTranslations";
import ComparisonTable from "@/components/marketing/ComparisonTable";
import PricingHero from "@/components/marketing/PricingHero";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const title = "الباقات - استأجر"; // Fallback, could be localized
  const description =
    "تعرف على باقات استأجر للاشتراك وتوفير العمولة والمزيد من المميزات.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function PricingPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <main className="min-h-screen -mt-[7.5rem]">
      <PricingHero translate={translate()} lang={lang} />
      <PricingPlans translate={translate()} lang={lang} />
      <ComparisonTable translate={translate()} lang={lang} />
      <MarketingFaqs translate={translate()} lang={lang} />
    </main>
  );
}
