import { getTranslations } from "@/hooks/getTranslations";
import SectionTitle from "../shared/SectionTitle";
import Button from "../ui/Button";
import Link from "next/link";
import EmblaCarousel from "./EmblaCarousel";
import categories from "@/static/categories";

async function getProducts({ lang, type, categoryKey }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (type === "shops") {
      const res = await fetch(
        `${baseUrl}/api/products/sponsored-latest?lang=${lang}`,
        { next: { revalidate: 60 * 60 * 24 * 2 } },
      );
      const data = await res.json();
      return data.success ? data.data : [];
    }

    const commonFields = `images,owner,${
      lang === "ar" ? "nameAr" : "nameEn"
    },rental,rating,pricingModel,location,${
      lang === "ar" ? "addressAr" : "addressEn"
    }`;

    const params = new URLSearchParams({
      lang,
      limit: 16,
      compressed: true,
      fields: commonFields,
    });

    if (type === "newest") {
      params.append("sortBy", "newest");
    } else if (type === "offers") {
      params.append("sortBy", "discounts");
      params.append("random", "true");
    } else if (type === "category" && categoryKey) {
      params.append("category", categoryKey);
    } else {
      params.append("status", "main");
    }

    const res = await fetch(`${baseUrl}/api/products?${params}`, {
      next: { revalidate: 60 * 60 * 24 * 2 },
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error(`Failed to fetch ${type} products:`, error);
    return [];
  }
}

export default async function NewestProducts({
  lang,
  shops,
  newest,
  category,
  offers,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang, ["home"]);

  let type = "main";
  let sectionKey = "productsSection";
  let categoryName = "";
  let categoryKey = "";

  if (shops) {
    type = "shops";
    sectionKey = "shopsProductsSection";
  } else if (newest) {
    type = "newest";
    sectionKey = "newestProductsSection";
  } else if (offers) {
    type = "offers";
    sectionKey = "offersProductsSection";
  } else if (category) {
    type = "category";
    sectionKey = "categoryProductsSection";
    const cats = await categories({ lang });
    const firstCat = cats?.[0];
    categoryName = firstCat?.name || "";
    categoryKey = firstCat?.key || "";
  }

  const t = (value) => {
    let val = translate(`home.${sectionKey}.${value}`);
    if (typeof val === "string") return val.replace("{category}", categoryName);
    return val;
  };

  const products = await getProducts({ lang, type, categoryKey });
  const sectionId = `${type}-products-title`;

  return (
    <section
      id={type === "main" ? "products" : `products-${type}`}
      className={`max-w-screen-2xl mx-auto flex flex-col gap-4 px-4 text-white my-16 md:my-24 lg:my-28 ${type === "main" ? "mt-12 md:mt-16 lg:mt-20" : ""}`}
      aria-label={t("ariaLabel")}
      itemScope
      itemyype="https://schema.org/ItemList"
    >
      <meta itemProp="numberOfItems" content={products.length} />
      <meta
        itemProp="itemListOrder"
        content="https://schema.org/ItemListOrderDescending"
      />

      <SectionTitle
        main={true}
        title={t("title")}
        text={t("description")}
        id={sectionId}
        lang={lang}
      />

      <div role="region" aria-labelledby={sectionId} itemProp="mainEntity">
        <EmblaCarousel
          lang={lang}
          initialProducts={products}
          translate={translate()}
          shops={type !== "main"}
        />
      </div>

      {products.length > 0 &&
        type !== "shops" &&
        type !== "offers" &&
        type !== "main" && (
          <nav
            className="flex justify-center mt-8 md:mt-12"
            aria-label={t("navigation.ariaLabel")}
          >
            <Button
              className="shadow-[rgba(244,138,66,0.2)] font-semibold px-12 md:py-7 text-sm md:text-base"
              color="secondary"
              as={Link}
              href={`/${langPrefix}${type === "category" ? `${categoryKey}` : "search"}/products`}
              aria-label={t("navigation.buttonAriaLabel")}
            >
              {translate("ui.button.showAllProducts")}
            </Button>
          </nav>
        )}
    </section>
  );
}
