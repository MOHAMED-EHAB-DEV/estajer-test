import VerifiedShop from "@/components/shared/VerifiedShop";
import { getTranslations } from "@/hooks/getTranslations";
import categories from "@/static/categories";
import { Camera } from "@/components/ui/svgs/CategoriesIcons";

// Generate static params for both languages
export async function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "المتاجر الموثوقة | استأجر",
      description:
        "تصفح قائمة المتاجر الموثوقة والمعتمدة على منصة استأجر. أفضل المتاجر لتأجير المنتجات في السعودية.",
    },
    en: {
      title: "Verified Shops | Estajer",
      description:
        "Browse our verified and trusted shops on Estajer platform. The best shops for product rental in Saudi Arabia.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}sponsors`,
      languages: {
        ar: `/sponsors`,
        en: `/en/sponsors`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}sponsors`,
      type: "website",
    },
  };
}

async function getSponsors({ lang }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/sponsors?isActive=true&limit=50&lang=${lang}`,
      { next: { revalidate: 60 } } // Revalidate every 60 seconds
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch sponsors:", error);
    return [];
  }
}

export default async function SponsorsPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["home"]);
  const t = (value) => translate(`home.sponsors.${value}`);
  const sponsors = await getSponsors({ lang });
  const categoriesData = await categories({ lang });
  const langPrefix = lang === "ar" ? "" : "en/";

  return (
    <div className="mb-20">
      <div className="px-4">
        <h1 className="text-[1.6rem] md:text-3xl font-bold text-center mt-12 mb-4">
          {t("title")}
        </h1>
        <p className="md:text-lg text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>
      <div className="max-w-screen-2xl mx-auto grid gap-x-6 gap-y-8 md:grid-cols-2 grid-cols-1 mt-16">
        {sponsors.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {t("noSponsors")}
          </div>
        ) : (
          sponsors.map((sponsor) => {
            // Get category icon and name based on category
            const categoryMatch =
              categoriesData.find(({ key }) => key === sponsor.category) ||
              categoriesData.find(({ key }) => key === "other");

            const categoryName = categoryMatch?.name || sponsor.category;
            const categoryIcon = categoryMatch?.Icon || Camera;

            return (
              <VerifiedShop
                key={sponsor._id}
                t={(value) => translate(`home.verifiedShops.${value}`)}
                Icon={categoryIcon}
                name={sponsor.user?.fullName || sponsor.user?.name}
                rating={sponsor.user?.rating?.average || 0}
                avatar={sponsor.user?.avatar}
                category={categoryName}
                isOnline={sponsor.user?.isOnline}
                lastSeen={sponsor.user?.lastSeen}
                pathName={sponsor.user?.pathName || sponsor.user?._id}
                translate={translate}
                langPrefix={langPrefix}
                description={sponsor.user?.bio || sponsor.user?.shopDescription}
                ordersCount={sponsor.ordersCount || 0}
                productsCount={sponsor.productsCount || 0}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
