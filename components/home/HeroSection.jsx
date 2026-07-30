import dynamic from "next/dynamic";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import HeroSlider from "./HeroSlider";

const HeroSearchBox = dynamic(() => import("./HeroSearchBox"));

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

  return (
    <section className="relative w-full md:mt-0 mb-8 md:mb-10">
      {/* Hero Slider as the main background and banner showcase */}
      <HeroSlider
        banners={heroSlides}
        lang={lang}
        translate={{ heroSlider: translate("heroSlider") }}
      />

      {/* Floating search container overlapping the bottom border of the slider */}
      <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 z-20 px-4">
        <div className="max-w-screen-2xl mx-auto flex justify-center w-full">
          <HeroSearchBox
            categoriesData={categoriesData}
            subCategoriesData={subCategoriesData}
            lang={lang}
            translate={{
              home: { search: translate("home.search") },
              ui: { button: translate("ui.button") },
              productComponent: translate("productComponent"),
            }}
          />
        </div>
      </div>
    </section>
  );
}
