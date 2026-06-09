import { notFound } from "next/navigation";
import { getTranslations } from "@/hooks/getTranslations";
import PartnerHero from "@/components/partner/PartnerHero";
import PartnerAbout from "@/components/partner/PartnerAbout";
import PartnerHowItWorks from "@/components/partner/PartnerHowItWorks";
import PartnerProductSlider from "@/components/partner/PartnerProductSlider";
import PartnerOfferBanners from "@/components/partner/PartnerOfferBanners";
import { categories, subCategories } from "@/static/categoriesOptions";

const fetchPartner = async (slug, lang = "ar") => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/partners/${slug}?lang=${lang}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: [`partner-${slug}`, "everyPartner"],
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch partner data:", error);
    return null;
  }
};

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const partner = await fetchPartner(slug, lang);

  if (!partner) return {};

  const title =
    lang === "ar"
      ? partner.seoTitleAr || partner.nameAr
      : partner.seoTitleEn || partner.nameEn;
  const description =
    lang === "ar"
      ? partner.seoDescriptionAr || partner.descriptionAr
      : partner.seoDescriptionEn || partner.descriptionEn;

  return {
    title: `${title} | Estajer`,
    description,
    keywords: lang === "ar" ? partner.seoKeywordsAr : partner.seoKeywordsEn,
    openGraph: {
      title,
      description,
      images: partner.ogImage || partner.logo,
    },
  };
}

export default async function PartnerPage({ params }) {
  const { slug, lang } = await params;
  const partner = await fetchPartner(slug, lang);
  const t = await getTranslations(lang, ["all", "home"]);

  if (!partner) notFound();

  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);

  return (
    <main className="md:-mt-[7.7rem] -mt-[6.4rem] min-h-screen pb-20 bg-gradient-to-b from-white via-neutral-50/30 to-white">
      {/* Hero Section */}
      <PartnerHero
        banners={partner.heroBanners}
        providerId={partner._id}
        lang={lang}
        title={
          lang === "ar"
            ? partner.heroTitleAr || partner.nameAr
            : partner.heroTitleEn || partner.nameEn
        }
        subtitle={
          lang === "ar"
            ? partner.heroDescriptionAr || partner.descriptionAr
            : partner.heroDescriptionEn || partner.descriptionEn
        }
        categoriesData={categoriesData}
        subCategoriesData={subCategoriesData}
        translation={t()}
      />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 flex flex-col">
        {/* About Us Section */}
        <div style={{ order: partner.aboutUsOrder || 1 }}>
          <PartnerAbout partner={partner} lang={lang} translate={t()} />
        </div>

        {/* Offer Banners */}
        {partner.offerBanners &&
          partner.offerBanners.length > 0 &&
          partner.offerBanners.map((section, idx) => (
            <div
              key={idx}
              className="mt-16 lg:mt-24"
              style={{ order: section.order ?? 2 }}
            >
              <PartnerOfferBanners
                section={section}
                lang={lang}
                translate={t()}
              />
            </div>
          ))}

        {/* Product Sliders */}
        {partner.sliders &&
          partner.sliders.length > 0 &&
          partner.sliders.map((slider, idx) => (
            <div
              key={idx}
              className="mt-14 lg:mt-24"
              style={{ order: slider.order || 3 }}
            >
              <PartnerProductSlider
                title={lang === "ar" ? slider.titleAr : slider.titleEn}
                products={slider.products}
                lang={lang}
                providerId={partner._id}
                translate={t()}
              />
            </div>
          ))}

        {/* How It Works Section */}
        <div style={{ order: partner.howItWorksOrder || 4 }}>
          <PartnerHowItWorks partner={partner} lang={lang} translate={t()} />
        </div>
      </div>

      {/* Structured Data (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Brand",
            name: lang === "ar" ? partner.nameAr : partner.nameEn,
            description:
              lang === "ar" ? partner.descriptionAr : partner.descriptionEn,
            logo: partner.logo,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/partners/${partner.slug}`,
          }),
        }}
      />
    </main>
  );
}
