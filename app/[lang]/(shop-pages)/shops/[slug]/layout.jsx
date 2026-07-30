import InteractionGTM from "@/components/seo/InteractionGTM";
import GTMPageView from "@/hooks/GTMPageView";
import { Suspense } from "react";

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
    console.error("Failed to fetch shop data in layout:", error);
    return null;
  }
};

export default async function ShopLayout({ children, params }) {
  const { slug, lang } = await params;
  const shop = await fetchShop(slug, lang);
  const gtmId = shop?.gtmId;

  return (
    <>
      {gtmId && (
        <>
          <Suspense fallback={null}>
            <GTMPageView />
          </Suspense>
          <InteractionGTM gtmId={gtmId} />
        </>
      )}
      {children}
    </>
  );
}
