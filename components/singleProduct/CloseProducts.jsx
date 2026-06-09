import Button from "../ui/Button";
import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const EmblaCarousel = dynamic(() => import("../home/EmblaCarousel"));

async function getNearbyProducts({ lang, product }) {
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
    };

    if (product.owner?.premium) query.userId = product.owner._id;

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

export default async function CloseProducts({ lang, product, translate }) {
  const nearbyProducts = await getNearbyProducts({ lang, product });
  const t = (value) => translate(`singleProduct.nearbyProducts.${value}`);
  if (!nearbyProducts?.length > 0) return null;

  return (
    <div className="mb-16 md:mb-24">
      <div className="flex flex-wrap justify-between items-center w-full p-2 gap-4">
        <div>
          <div className="text-darkNavy font-IBMPlex font-semibold text-[1.1rem] md:text-[1.7rem] lg:text-[1.9rem] mb-2">
            {t("title")}
          </div>
          <div className="text-[1rem] md:text-[1.2rem] lg:text-[1.5rem] text-[#5B5656]">
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
              translate={translate()}
              shops={true}
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button
              as={Link}
              href={`/${lang === "ar" ? "" : "en/"}search/products?location=${
                product?.address?.city
              }&lat=${product?.location?.coordinates[1]}&lng=${
                product?.location?.coordinates[0]
              }`}
              color="secondary"
              className="shadow-[rgba(244,138,66,0.2)] shadow-xl px-8 py-4 lg:px-12 lg:py-7 text-[0.8rem] md:text-[1rem] lg:text-[1.2rem] font-IBMPlex"
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
