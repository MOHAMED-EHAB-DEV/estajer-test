import MarketingFaqs from "@/components/marketing/MarketingFaqs";
import PricingPlans from "@/components/marketing/PricingPlans";
import { getTranslations } from "@/hooks/getTranslations";
import ComparisonTable from "@/components/marketing/ComparisonTable";
import PricingHero from "@/components/marketing/PricingHero";

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "https://estajer.com";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isAr = lang !== "en";

  const title = isAr ? "الباقات - استأجر" : "Pricing Plans - Estajer";
  const description = isAr
    ? "تعرف على باقات استأجر للاشتراك والمزيد من المميزات."
    : "Explore Estajer subscription plans and unlock premium features.";

  return {
    title,
    description,
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}pricing`,
      languages: {
        ar: `/pricing`,
        en: `/en/pricing`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: isAr ? `${siteURL}/og/pricing_ar.webp` : `${siteURL}/og/pricing_en.webp`,
          width: 1200,
          height: 630,
          alt: isAr ? "استأجر - الباقات والأسعار" : "Estajer - Pricing Plans",
        },
      ],
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
