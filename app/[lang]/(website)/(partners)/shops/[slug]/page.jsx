import { notFound } from "next/navigation";
import { getTranslations } from "@/hooks/getTranslations";
import PartnerHero from "@/components/partner/PartnerHero";
import PartnerAbout from "@/components/partner/PartnerAbout";
import PartnerHowItWorks from "@/components/partner/PartnerHowItWorks";
import PartnerProductSlider from "@/components/partner/PartnerProductSlider";
import PartnerOfferBanners from "@/components/partner/PartnerOfferBanners";
import ShopCategoriesCarousel from "@/components/shop/ShopCategoriesCarousel";
import ShopReviews from "@/components/shop/ShopReviews";
import { categories, subCategories } from "@/static/categoriesOptions";

const fetchShop = async (slug, lang = "ar") => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shops/${slug}?lang=${lang}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: [`shop-${slug}`, "everyShop"],
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch shop data:", error);
    return null;
  }
};

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const shop = await fetchShop(slug, lang);

  if (!shop) return {};

  const title =
    lang === "ar"
      ? shop.seoTitleAr || shop.nameAr
      : shop.seoTitleEn || shop.nameEn;
  const description =
    lang === "ar"
      ? shop.seoDescriptionAr || shop.descriptionAr
      : shop.seoDescriptionEn || shop.descriptionEn;

  return {
    title: `${title} | Estajer`,
    description,
    keywords: lang === "ar" ? shop.seoKeywordsAr : shop.seoKeywordsEn,
    openGraph: {
      title,
      description,
      images: shop.ogImage || shop.logo,
    },
  };
}

export default async function ShopPage({ params }) {
  const { slug, lang } = await params;
  const shop = await fetchShop(slug, lang);
  const t = await getTranslations(lang, ["all", "home"]);

  if (!shop) notFound();

  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);

  return (
    <main className="md:-mt-[7.7rem] -mt-[6.4rem] min-h-screen pb-20 bg-gradient-to-b from-white via-neutral-50/30 to-white">
      {/* Hero Section */}
      <PartnerHero
        banners={shop.heroBanners}
        userId={shop.owner?._id || shop.owner}
        lang={lang}
        title={
          lang === "ar"
            ? shop.heroTitleAr || shop.nameAr
            : shop.heroTitleEn || shop.nameEn
        }
        subtitle={
          lang === "ar"
            ? shop.heroDescriptionAr || shop.descriptionAr
            : shop.heroDescriptionEn || shop.descriptionEn
        }
        categoriesData={categoriesData}
        subCategoriesData={subCategoriesData}
        translation={t()}
      />

      <div className="relative z-10 flex flex-col">
        {/* About Us Section */}
        <div
          className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8"
          style={{ order: shop.aboutUsOrder || 1 }}
        >
          <PartnerAbout partner={shop} lang={lang} translate={t()} />
        </div>

        {/* Offer Banners */}
        {shop.offerBanners &&
          shop.offerBanners.length > 0 &&
          shop.offerBanners.map((section, idx) => (
            <div
              key={idx}
              className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 mt-16 lg:mt-24"
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
        {shop.sliders &&
          shop.sliders.length > 0 &&
          (await Promise.all(
            shop.sliders.map(async (slider, idx) => {
              let sliderProducts = slider.products || [];

              // Dynamic fetching for newest or random
              if (slider.type && slider.type !== "manual") {
                const ownerId = shop.owner?._id || shop.owner;
                let url = `${process.env.NEXT_PUBLIC_APP_URL}/api/products?userId=${ownerId}&limit=16&lang=${lang}&approved=true`;
                if (slider.type === "newest") {
                  url += "&sortBy=newest";
                } else if (slider.type === "random") {
                  url += "&random=true";
                }

                try {
                  const res = await fetch(url, { cache: "no-store" });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                      sliderProducts = data.data;
                    }
                  }
                } catch (err) {
                  console.error("Dynamic slider fetch error:", err);
                }
              }
              return (
                slider?.products?.length > 0 && (
                  <div
                    key={idx}
                    className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 mt-14 lg:mt-24"
                    style={{ order: slider.order || 3 }}
                  >
                    <PartnerProductSlider
                      title={lang === "ar" ? slider.titleAr : slider.titleEn}
                      products={sliderProducts}
                      displayMode={slider.displayMode}
                      sourceType={slider.type}
                      lang={lang}
                      userId={shop.owner?._id || shop.owner}
                      translate={t()}
                    />
                  </div>
                )
              );
            }),
          ))}

        {/* Shop Categories Carousel */}
        {shop.categories && shop.categories.length > 0 && (
          <div
            className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 mt-14 lg:mt-24"
            style={{ order: shop.shopCategoriesOrder || 3.5 }}
          >
            <ShopCategoriesCarousel
              categories={shop.categories}
              lang={lang}
              shopSlug={shop.slug}
              translate={t()}
            />
          </div>
        )}

        {/* How It Works Section */}
        <div
          className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8"
          style={{ order: shop.howItWorksOrder || 4 }}
        >
          <PartnerHowItWorks partner={shop} lang={lang} translate={t()} />
        </div>

        {/* Reviews Section */}
        {shop.showReviews && shop.reviews && shop.reviews.length > 0 && (
          <div
            className="px-4 md:px-6 lg:px-8 mt-16 lg:mt-24"
            style={{ order: shop.reviewsOrder || 5 }}
          >
            <ShopReviews
              reviews={shop.reviews}
              lang={lang}
              translate={t()}
              reviewsOrder={shop.reviewsOrder}
            />
          </div>
        )}
      </div>

      {/* Structured Data (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Brand",
            name: lang === "ar" ? shop.nameAr : shop.nameEn,
            description:
              lang === "ar" ? shop.descriptionAr : shop.descriptionEn,
            logo: shop.logo,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/shops/${shop.slug}`,
          }),
        }}
      />
    </main>
  );
}
