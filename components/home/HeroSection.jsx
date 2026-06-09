import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import HeroSearchBox from "./HeroSearchBox";
import HeroSlider from "./HeroSlider";

const fetchHeroSlides = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/hero-slides`,
      { next: { revalidate: 60 * 60 * 24 * 2 } }, // Cache for 2 days
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch hero slides:", error);
    return [];
  }
};

export default async function HeroSection({ lang }) {
  const translate = await getTranslations(lang, ["home"]);

  const [categoriesData, subCategoriesData, heroSlides] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
    fetchHeroSlides(),
  ]);

  const fallbackData = {
    titleAr:
      lang === "ar"
        ? `${translate("home.heroSection.title") || "لا تشتري"} ${translate("home.heroSection.title2") || "استأجر"} ${translate("home.heroSection.subtitle") || "ووفر"}`
        : "",
    titleEn:
      lang === "en"
        ? `${translate("home.heroSection.title") || "Don't buy"} ${translate("home.heroSection.title2") || "Rent"} ${translate("home.heroSection.subtitle") || "And save"}`
        : "",
    subtitleAr: lang === "ar" ? translate("home.heroSection.seoTitle") : "",
    subtitleEn: lang === "en" ? translate("home.heroSection.seoTitle") : "",
  };

  return (
    <section className="relative w-full md:mt-0 mb-8 md:mb-10">
      {/* Hero Slider as the main background and banner showcase */}
      <HeroSlider
        banners={heroSlides}
        lang={lang}
        fallbackData={fallbackData}
        translate={translate()}
      />

      {/* Floating search container overlapping the bottom border of the slider */}
      <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 z-20 px-4">
        <div className="max-w-screen-2xl mx-auto flex justify-center w-full">
          <HeroSearchBox
            categoriesData={categoriesData}
            subCategoriesData={subCategoriesData}
            lang={lang}
            translate={translate()}
          />
        </div>
      </div>
    </section>
  );
}
