import { Cloud } from "../ui/svgs/icons/CloudSvg";
import HeroSvg from "../ui/svgs/HeroSvg";
import { getTranslations } from "@/hooks/getTranslations";
import { categories, subCategories } from "@/static/categoriesOptions";
import SearchBox from "./SearchBox";
import Link from "next/link";
export default async function HeroSection({ lang }) {
  const translate = await getTranslations(lang, ["home"]);
  const t = (key) => translate(`home.heroSection.${key}`);
  const [categoriesData, subCategoriesData] = await Promise.all([
    categories({ lang }),
    subCategories({ lang }),
  ]);
  const langPrefix = lang === "ar" ? "" : "en/";

  return (
    <section
      className={`relative md:pb-44 pb-20 pt-40 md:py-44 -mt-[118px] md:mt-0 shadow-lg md:bg-primary bg-center bg-[url("https://assets.estajer.com/estajer/images/cover_tl93ps?w=700&q=80")] md:bg-none`}
      aria-label={t("ariaLabel")}
    >
      <div className="block md:hidden absolute inset-0 bg-black/40"></div>
      <div className="hidden md:block max-w-screen-3xl w-full relative m-auto">
        <div
          className="absolute -top-48 md:-top-44 -start-12"
          aria-hidden="true"
        >
          <div {...(lang === "en" ? { className: "-scale-x-100 w-max" } : {})}>
            <Cloud className="md:max-w-60 max-w-48" />
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-4 px-4 md:mb-0 md:mt-0 text-white">
        <header className="relative z-10 text-center md:text-start">
          {/* SEO-optimized h1 for search engines */}
          {/* Visual heading for users */}
          <div
            className="font-IBMPlex text-[1.9rem] md:text-[3.4rem] font-semibold mb-6 max-w-[650px]"
            fetchPriority="high"
          >
            {t("title")}{" "}
            <span className="relative inline-block">
              <span>{t("title2")}</span>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none scribble-svg"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M10,20 Q20,8 30,20 Q40,32 50,20 Q60,8 70,20 Q80,32 90,20"
                  stroke="#ef4444"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  className={
                    lang === "en" ? "scribble-path-en" : "scribble-path"
                  }
                />
              </svg>
            </span>{" "}
            {t("subtitle")}
          </div>
          <h1 className="text-[1.1rem] px-4 md:px-0 md:text-[2.15rem] leading-snug md:w-8/12">
            {/* {t("description")} */}
            {t("seoTitle")}
          </h1>
          <div role="search" aria-label={t("searchAriaLabel")}>
            <SearchBox
              categoriesData={categoriesData}
              subCategoriesData={subCategoriesData}
              lang={lang}
              translate={translate()}
            />
          </div>

          {/* Strategic internal links for popular categories */}
          <div className="max-w-full md:max-w-[95vw] w-full md:w-[820px]">
            <div className="mt-6 flex flex-wrap justify-center md:justify-end gap-3 px-4">
              <Link
                href={`/${langPrefix}electronics/products`}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs md:text-sm hover:bg-white/20 transition-colors"
                aria-label={translate("categories.electronics.ariaLabel")}
                title={translate("categories.electronics.ariaLabel")}
              >
                {translate("categories.electronics.text")}
              </Link>
              <Link
                href={`/${langPrefix}furniture/products`}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs md:text-sm hover:bg-white/20 transition-colors"
                aria-label={translate("categories.furniture.ariaLabel")}
                title={translate("categories.furniture.ariaLabel")}
              >
                {translate("categories.furniture.text")}
              </Link>
              <Link
                href={`/${langPrefix}home-supplies/products`}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs md:text-sm hover:bg-white/20 transition-colors"
                aria-label={translate("categories.homeSupplies.ariaLabel")}
                title={translate("categories.homeSupplies.ariaLabel")}
              >
                {translate("categories.homeSupplies.text")}
              </Link>
              <Link
                href={`/${langPrefix}parties-and-events/products`}
                className="hidden md:block bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs md:text-sm hover:bg-white/20 transition-colors"
                aria-label={translate("categories.events.ariaLabel")}
                title={translate("categories.events.ariaLabel")}
              >
                {translate("categories.events.text")}
              </Link>
            </div>
          </div>
        </header>
      </div>
      <div className="hidden md:block max-w-screen-3xl w-full relative m-auto">
        <div
          className={`aspect-[1/.8]  max-w-[400px] md:max-w-[630px] md:w-5/12 w-[90%] absolute -bottom-52 md:-bottom-44 end-1/2 md:end-0 ${
            lang === "en" ? "translate-x-1/2" : "-translate-x-1/2"
          }  md:translate-x-0 `}
        >
          <div {...(lang === "en" ? { className: "-scale-x-100 " } : {})}>
            <HeroSvg flip={lang === "en"} />
          </div>
        </div>
      </div>
    </section>
  );
}
