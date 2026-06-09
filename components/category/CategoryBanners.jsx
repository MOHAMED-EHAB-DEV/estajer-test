import Link from "next/link";
import BannerImage from "@/components/shared/BannerImage";

const fetchBanners = async (categoryId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/home-banners?place=category&categoryId=${categoryId}`,
      { next: { revalidate: 60 * 30 } }, // 30 minutes cache
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch category banners:", error);
    return [];
  }
};

export default async function CategoryBanners({ lang, categoryId }) {
  const banners = await fetchBanners(categoryId);
  const langPrefix = lang === "ar" ? "" : "en/";

  if (!banners || banners.length === 0) return null;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 mt-8 mb-8">
      <div
        className={`grid grid-cols-1 ${banners.length > 1 ? "md:grid-cols-2" : ""} gap-6`}
      >
        {banners.map((banner) => (
          <Link
            key={banner._id}
            href={`/${langPrefix}${
              banner.link.startsWith("/") ? banner.link.slice(1) : banner.link
            }`}
            className="block relative aspect-[2.5/1] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <BannerImage
              banner={banner}
              lang={lang}
              isMultiple={banners.length > 1}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
