import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import CategoriesCarouselClient from "./CategoriesCarouselClient";

export default function CategoriesCarousel({
  options = {},
  translate,
  isSubCategory,
  categoriesData = [],
  langPrefix,
  mainCategory,
  lang,
  sm,
}) {
  const trans = useTranslations(translate);
  const t = (value) => trans(`categories.categoriesSection.${value}`);

  return (
    <CategoriesCarouselClient
      options={options}
      isSubCategory={isSubCategory}
      lang={lang}
      sm={sm}
      categoriesCount={categoriesData.length}
      ariaLabel={t("ariaLabel")}
    >
      {categoriesData?.map(({ name, key }, idx) => (
        <li
          key={idx}
          className={`min-w-0 py-2 md:px-4 ${
            sm
              ? "flex-[0_0_90px] md:flex-[0_0_120px] lg:flex-[0_0_160px] xl:flex-[0_0_170px]"
              : "flex-[0_0_105px] md:flex-[0_0_160px] lg:flex-[0_0_200px] xl:flex-[0_0_215px]"
          } select-none`}
        >
          <Link
            scroll={!isSubCategory}
            href={
              isSubCategory
                ? `/${langPrefix}${mainCategory}/${key}/products`
                : `/${langPrefix}${key}/products`
            }
            className="flex flex-col items-center group transition-all duration-300"
            aria-label={`${name} - ${trans("categories.browseRentalProducts")}`}
            title={`${name} ${trans("categories.forRent")}`}
          >
            {/* Circular Image Container */}
            <div
              className={`relative ${
                sm
                  ? "w-[4.5rem] h-[4.5rem] md:w-24 md:h-24 lg:w-32 lg:h-32"
                  : "w-[5.5rem] h-[5.5rem] md:w-32 md:h-32 lg:w-40 lg:h-40"
              } rounded-full overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-gray-100 group-hover:border-primary/30`}
            >
              <img
                src={anyImgUrl({
                  src: categoriesData.find((c) => c.key === key)?.image,
                  size: 234,
                  quality: 90,
                  aspectRatio: "1:1",
                  crop: true,
                })}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Category Name */}
            <span className="font-IBMPlex font-semibold text-[13px] sm:text-sm md:text-base lg:text-lg text-darkNavy text-center group-hover:text-primary transition-colors duration-200">
              {name}
            </span>
          </Link>
        </li>
      ))}
    </CategoriesCarouselClient>
  );
}
