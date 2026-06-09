import SectionTitle from "../shared/SectionTitle";
import { getTranslations } from "@/hooks/getTranslations";
import categories from "@/static/categories";
import VerifiedShopsCarousel from "./VerifiedShopsCarousel";

export default async function VerifiedShops({ lang }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang, ["home"]);
  const categoriesData = await categories({ lang });
  const t = (value) => translate(`home.verifiedShops.${value}`);

  // Fetch sponsors from API
  let verifiedShops = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/sponsors?isActive=true&limit=4&lang=${lang}`,
      { next: { revalidate: 60 * 60 * 24 * 2 } },
    );

    if (response.ok) {
      const result = await response.json();
      const sponsors = result.data || [];

      // Transform sponsors data for display
      verifiedShops = sponsors.map((sponsor) => {
        // Get category icon and color based on category

        const categoryMatch = categoriesData.find(
          ({ key }) => key === sponsor.category,
        );
        const name = categoryMatch?.name || sponsor.category;

        return {
          id: sponsor._id,
          name: sponsor.user.fullName,
          description: sponsor.user.bio,
          rating: sponsor.user?.rating?.average || 0,
          category: name,
          categoryKey: sponsor.category,
          productsCount: sponsor.productsCount || 0,
          ordersCount: sponsor.ordersCount || 0,
          avatar: sponsor.user.avatar,
          userId: sponsor.user._id,
          isOnline: sponsor.user.isOnline,
          lastSeen: sponsor.user.lastSeen,
          pathName: sponsor.user.pathName,
          premium: sponsor.user.premium || false,
        };
      });
    }
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    verifiedShops = [];
  }

  return (
    <section
      id="verified-shops"
      className="bg-[#FFF9F0] px-4 py-8 md:py-12"
      itemScope
      itemType="https://schema.org/ItemList"
      aria-labelledby="verified-shops-title"
    >
      <header>
        <SectionTitle title={t("title")} text={t("description")} />
      </header>

      <div className="mb-8 md:mb-14 max-w-screen-2xl mx-auto">
        <VerifiedShopsCarousel
          verifiedShops={verifiedShops}
          t_object={translate()}
          langPrefix={langPrefix}
          lang={lang}
        />
      </div>

      {/* <footer className="flex justify-center mb-4">
        <Button
          as={Link}
          title={t("showAllShopsLabel")}
          color={"secondary"}
          href={`/${langPrefix}sponsors`}
          className="shadow-[rgba(244,138,66,0.2)] font-semibold px-14 py-7"
          aria-label={t("showAllShopsLabel")}
          itemProp="url"
        >
          {t("showAllShops")}
        </Button>
      </footer> */}
    </section>
  );
}
