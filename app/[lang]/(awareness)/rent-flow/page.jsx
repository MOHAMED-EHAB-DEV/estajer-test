import PremiumAdvantages from "@/components/marketing/PremiumAdvantages";
import CommissionBenefits from "@/components/marketing/CommissionBenefits";
import PricingPlans from "@/components/marketing/PricingPlans";
import PartnerShops from "@/components/marketing/PartnerShops";
import ComparisonTable from "@/components/marketing/ComparisonTable";
import MarketingHero from "@/components/marketing/MarketingHero";
import StoreControlPanel from "@/components/marketing/StoreControlPanel";
import { getTranslations } from "@/hooks/getTranslations";
import MarketingFaqs from "@/components/marketing/MarketingFaqs";

export async function generateMetadata({ params }) {
  const { lang } = await params;

  return {
    title:
      lang === "ar"
        ? "باقات استأجر - تحوّل تجارتك"
        : "Estajer Plans - Transform Your Business",
    description:
      lang === "ar"
        ? "تعرف على مزايا باقات استأجر الاستثنائية التي تزيد أرباحك وتقلل جهدك."
        : "Discover Estajer's premium plans that increase profits and reduce efforts.",
  };
}

const fetchShops = async (lang) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shops?logosOnly=true&lang=${lang}`,
      { next: { revalidate: 60 * 60, tags: ["everyShop"] } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error("Failed to fetch shops:", err);
    return [];
  }
};

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const shops = await fetchShops(lang);

  return (
    <main className="-mt-[7.5rem] mx-auto relative min-h-screen" role="main">
      {/* Hero Section */}
      <MarketingHero translate={translate()} lang={lang} />

      {/* The new "Why Premium" advantages section */}
      <PremiumAdvantages translate={translate()} lang={lang} />

      {/* Commission and ROI benefits section */}
      <CommissionBenefits translate={translate()} lang={lang} />

      {/* Partner Shops Section */}
      <PartnerShops shops={shops} translate={translate()} lang={lang} />

      {/* Comparison table section */}
      <ComparisonTable translate={translate()} lang={lang} />

      {/* Pricing plans section */}
      <PricingPlans translate={translate()} lang={lang} />

      {/* Control Panel Section */}
      <StoreControlPanel translate={translate()} lang={lang} />

      {/* Marketing FAQs section */}
      <MarketingFaqs translate={translate()} lang={lang} />
    </main>
  );
};

export default Page;
