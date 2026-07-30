import { getTranslations } from "@/hooks/getTranslations";

const FACTORS = [
  {
    icon: (
      <img
        src="/svgs/product/clock.svg"
        alt=""
        aria-hidden="true"
        className="w-5 h-5"
        loading="lazy"
      />
    ),
    titleKey: "rentalCost.factor1.title",
    descKey: "rentalCost.factor1.desc",
  },
  {
    icon: (
      <img
        src="/svgs/product/layers.svg"
        alt=""
        aria-hidden="true"
        className="w-[21px] h-[20px]"
        loading="lazy"
      />
    ),
    titleKey: "rentalCost.factor2.title",
    descKey: "rentalCost.factor2.desc",
  },
  {
    icon: (
      <img
        src="/svgs/product/location.svg"
        alt=""
        aria-hidden="true"
        className="w-3.75 h-[21px]"
        loading="lazy"
      />
    ),
    titleKey: "rentalCost.factor3.title",
    descKey: "rentalCost.factor3.desc",
  },
  {
    icon: (
      <img
        src="/svgs/product/puzzle.svg"
        alt=""
        aria-hidden="true"
        className="w-[23px] h-[22px]"
        loading="lazy"
      />
    ),
    titleKey: "rentalCost.factor4.title",
    descKey: "rentalCost.factor4.desc",
  },
];

export default async function RentalCostSection({ lang, product }) {
  const translate = await getTranslations(lang);
  const t = (key) => translate(`product.${key}`);

  const name = product?.name || "";
  const city = product?.address?.city || "";

  return (
    <section
      className="mb-16 md:mb-24 px-0"
      aria-label={t("rentalCost.ariaLabel")}
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* ── Text ── */}
        <div>
          {/* Label pill */}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-[#fff7ed] px-3 py-1.5 rounded-full mb-4 border border-[#fed7aa]">
            <img
              src="/svgs/product/coins.svg"
              alt=""
              aria-hidden="true"
              className="w-3.75 h-3.75"
              loading="lazy"
            />
            {t("rentalCost.badge")}
          </span>

          <h2 className="text-[1.3rem] md:text-[1.6rem] lg:text-[2rem] font-bold mb-4 leading-snug text-darkNavy">
            {t("rentalCost.heading").replace("{name}", name)}
          </h2>

          <p className="text-gray-500 text-0.95 md:text-1.1 leading-relaxed mb-4">
            {t("rentalCost.body1").replace("{name}", name)}
          </p>

          <p className="text-gray-500 text-[0.9rem] md:text-[1rem] leading-relaxed">
            {t("rentalCost.body2")
              .replace("{name}", name)
              .replace("{city}", city)}
          </p>
        </div>

        {/* ── Factor Cards ── */}
        <div className="grid grid-cols-2 md:gap-4 gap-2">
          {FACTORS.map(({ icon, titleKey, descKey }, i) => (
            <div
              key={i}
              className="md:py-6 py-4 md:px-4 px-3 rounded-2xl border border-gray-100 bg-gray-50 flex items-start md:gap-4 gap-2"
            >
              <div className="md:w-12 w-10 md:h-12 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {icon}
              </div>
              <div>
                <div className="font-bold text-0.85 md:text-0.95 mb-1 text-darkNavy">
                  {t(titleKey).replace("{city}", city)}
                </div>
                <div className="text-gray-400 text-[0.65rem] md:text-xs leading-relaxed">
                  {t(descKey).replace("{city}", city)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
