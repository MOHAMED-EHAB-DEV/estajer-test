import { getTranslations } from "@/hooks/getTranslations";
import HeroSliderContainer from "@/components/admin/hero-slider/HeroSliderContainer";

const fetchAllHeroSlides = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/hero-slides?all=true`,
      { cache: "no-store" }, // Admin needs fresh, un-cached data
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch all hero slides on server:", error);
    return [];
  }
};

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const slides = await fetchAllHeroSlides();

  return (
    <div className="flex flex-col gap-10 px-1 md:px-4 pt-8">
      <HeroSliderContainer
        translate={translate()}
        lang={lang}
        initialSlides={slides}
      />
    </div>
  );
};
export default Page;
