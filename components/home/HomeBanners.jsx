import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

const fetchBanners = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/home-banners?place=home`, //includeProductCount=true&
      { next: { revalidate: 60 * 60 * 24 * 2 } }
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return [];
  }
};
export default async function HomeBanners({ lang }) {
  const banners = await fetchBanners();
  const langPrefix = lang === "ar" ? "" : "en/";

  if (banners && banners?.length === 0) return null;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 md:mt-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <Link
            key={banner._id}
            href={`/${langPrefix}${
              banner.link.startsWith("/") ? banner.link.slice(1) : banner.link
            }`}
            className="block relative aspect-[2/.9] w-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Image
              src={anyImgUrl({
                src:
                  lang === "en" && banner.imageEn
                    ? banner.imageEn
                    : banner.image,
                size: 1000,
                quality: 90,
              })}
              unoptimized
              alt={lang === "ar" ? banner.altAr : banner.altEn}
              fill
              className="object-cover w-full h-full"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
