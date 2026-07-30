import { getTranslations } from "@/hooks/getTranslations";

/* ── Items config ── */
const WHY_US_ITEMS = [
  {
    icon: (
      <img
        src="/svgs/product/tag.svg"
        alt=""
        aria-hidden="true"
        className="w-[25px] h-[25px]"
        loading="lazy"
      />
    ),
    titleKey: "whyUs.item1.title",
    descKey: "whyUs.item1.desc",
  },
  {
    icon: (
      <img
        src="/svgs/product/calendar.svg"
        alt=""
        aria-hidden="true"
        className="w-[21px] h-[24px]"
        loading="lazy"
      />
    ),
    titleKey: "whyUs.item2.title",
    descKey: "whyUs.item2.desc",
  },
  {
    icon: (
      <img
        src="/svgs/product/screwdriver.svg"
        alt=""
        aria-hidden="true"
        className="w-[25px] h-[25px]"
        loading="lazy"
      />
    ),
    titleKey: "whyUs.item3.title",
    descKey: "whyUs.item3.desc",
  },
  {
    icon: (
      <img
        src="/svgs/product/headset.svg"
        alt=""
        aria-hidden="true"
        className="w-[24px] h-[24px]"
        loading="lazy"
      />
    ),
    titleKey: "whyUs.item5.title",
    descKey: "whyUs.item5.desc",
  },
];

export default async function WhyUsSection({
  lang,
  product,
  categoriesData,
  subCategoriesData,
}) {
  const translate = await getTranslations(lang);
  const t = (key) => translate(`product.${key}`);

  const categoryLabel =
    subCategoriesData?.[product.category]?.find(
      (sc) => sc.key === product.subCategory,
    )?.label ||
    categoriesData?.find((c) => c.key === product.category)?.label ||
    product.category;

  const city =
    product.address?.city || (lang === "ar" ? "مدينتك" : "your city");

  const format = (text) =>
    text?.replace(/{category}/g, categoryLabel).replace(/{city}/g, city);

  return (
    <section
      className="bg-gray-50 mb-24 py-4 lg:py-8 -mx-4 lg:-mx-6"
      aria-label={t("whyUs.ariaLabel")}
    >
      <div className="max-w-screen-2xl mx-auto p-6 md:p-8 lg:p-14 mb-6">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center justify-center gap-[6px] bg-[#fff7ed] text-primary border border-[#fed7aa] rounded-full px-4 py-1 text-sm font-semibold mb-2">
            <img
              src="/svgs/product/shield-small.svg"
              alt=""
              aria-hidden="true"
              className="w-[12px] h-[13px]"
              loading="lazy"
            />

            {t("whyUs.badge")}
          </span>
          <h2 className="text-[1.3rem] md:text-[1.6rem] lg:text-[2rem] font-bold mb-3 leading-snug text-darkNavy">
            {format(t("whyUs.heading"))}
          </h2>
          <p className="text-gray-500 text-0.95 md:text-1.1">
            {format(t("whyUs.subheading"))}
          </p>
        </div>

        {/* ── Items Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {WHY_US_ITEMS.map(({ icon, titleKey, descKey }, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="md:w-16 w-12 md:h-16 h-12 rounded-2xl bg-white border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                {icon}
              </div>
              <div>
                <div className="font-bold text-0.85 md:text-0.95 mb-1">
                  {t(titleKey)}
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">
                  {format(t(descKey))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
