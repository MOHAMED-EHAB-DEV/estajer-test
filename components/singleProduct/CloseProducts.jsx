import Button from "../ui/Button";
import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const EmblaCarousel = dynamic(() => import("../home/EmblaCarousel"));

async function getNearbyProducts({ lang, product, userId }) {
  try {
    const query = {
      limit: 12,
      fields: `images,owner,${
        lang === "ar" ? "nameAr" : "nameEn"
      },rental,rating,location,pricingModel,${
        lang === "ar" ? "addressAr" : "addressEn"
      }`,
      compressed: true,
      lang,
      bounds: JSON.stringify({
        north: product.location.coordinates[1] + 0.1,
        south: product.location.coordinates[1] - 0.1,
        east: product.location.coordinates[0] + 0.1,
        west: product.location.coordinates[0] - 0.1,
      }),
      excludeProducts: product._id,
      random: true,
      ...(userId && { userId }),
    };

    if (!userId && product.owner?.premium) query.userId = product.owner._id;

    const params = new URLSearchParams(query);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: [`product-${product._id}`, "everyProduct"],
        },
      },
    );
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

export default async function CloseProducts({
  lang,
  product,
  translate,
  userId,
  shopSlug,
}) {
  const nearbyProducts = await getNearbyProducts({ lang, product, userId });
  const t = (value) => translate(`singleProduct.nearbyProducts.${value}`);
  if (!nearbyProducts?.length > 0) return null;

  return (
    <div className="mb-16 md:mb-24">
      <div className="flex flex-wrap justify-between items-center w-full p-2 gap-4">
        <div>
          <h2 className="text-darkNavy font-IBMPlex font-semibold text-1.1 md:text-[1.5rem] lg:text-[1.7rem] mb-2">
            {t("title")}
          </h2>
          <div className="text-[1rem] md:text-1.1 lg:text-1.2 text-mutedGray">
            {t("description")}
          </div>
        </div>
      </div>

      {nearbyProducts?.length > 0 ? (
        <>
          <div className="mb-10">
            <EmblaCarousel
              lang={lang}
              initialProducts={nearbyProducts}
              translate={{
                productComponent: translate("productComponent"),
                ui: translate("ui"),
                heroSlider: translate("heroSlider"),
              }}
              shops={true}
              shopSlug={shopSlug}
              userId={userId}
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button
              as={Link}
              href={`/${lang === "ar" ? "" : "en/"}${shopSlug ? `shops/${shopSlug}/` : ""}search/products?location=${
                product?.address?.city
              }&lat=${product?.location?.coordinates[1]}&lng=${
                product?.location?.coordinates[0]
              }`}
              color="secondary"
              className="shadow-[rgba(244,138,66,0.2)] shadow-xl px-8 py-4 lg:px-12 lg:py-7 text-0.8 md:text-[1rem] lg:text-1.2 font-IBMPlex"
              aria-label={t("showMoreAriaLabel")}
            >
              {t("showMore")}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-[0.9rem] md:text[1.5rem] lg:text-[2rem] text-center text-gray-500 mt-8 py-12">
          {t("noProducts")}
        </div>
      )}
    </div>
  );
}
