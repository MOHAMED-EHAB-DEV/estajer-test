import { getTranslations } from "@/hooks/getTranslations";

const ROWS = [
  {
    icon: (
      <img
        src="/svgs/product/money-bill-wave.svg"
        alt=""
        aria-hidden="true"
        className="w-4.5 h-[13px]"
        loading="lazy"
      />
    ),
    labelKey: "rentVsBuy.row1.label",
    rentKey: "rentVsBuy.row1.rent",
    buyKey: "rentVsBuy.row1.buy",
  },
  {
    icon: (
      <img
        src="/svgs/product/screwdriver-small.svg"
        alt=""
        aria-hidden="true"
        className="w-3.75 h-3.75"
        loading="lazy"
      />
    ),
    labelKey: "rentVsBuy.row2.label",
    rentKey: "rentVsBuy.row2.rent",
    buyKey: "rentVsBuy.row2.buy",
  },
  {
    icon: (
      <img
        src="/svgs/product/boxes-stacked.svg"
        alt=""
        aria-hidden="true"
        className="w-[16px] h-[14px]"
        loading="lazy"
      />
    ),
    labelKey: "rentVsBuy.row3.label",
    rentKey: "rentVsBuy.row3.rent",
    buyKey: "rentVsBuy.row3.buy",
  },
  {
    icon: (
      <img
        src="/svgs/product/shuffle.svg"
        alt=""
        aria-hidden="true"
        className="w-3.75 h-[13px]"
        loading="lazy"
      />
    ),
    labelKey: "rentVsBuy.row4.label",
    rentKey: "rentVsBuy.row4.rent",
    buyKey: "rentVsBuy.row4.buy",
  },
];

export default async function RentVsBuySection({ lang, product }) {
  const translate = await getTranslations(lang);
  const t = (key) => translate(`product.${key}`);

  const name = product?.name || "";
  const city = product?.address?.city || "";

  return (
    <section
      className="mb-16 md:mb-24 px-0"
      aria-label={t("rentVsBuy.ariaLabel")}
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* ── Left / Sticky text ── */}
        <div className="lg:sticky lg:top-24">
          <span className="inline-flex items-center justify-center gap-[6px] bg-[#fff7ed] text-primary border border-[#fed7aa] rounded-full px-4 py-1 text-sm font-semibold mb-2">
            <img
              src="/svgs/product/scale-balanced.svg"
              alt=""
              aria-hidden="true"
              className="w-[17px] h-[13px]"
              loading="lazy"
            />
            {t("rentVsBuy.badge")}
          </span>

          <h2 className="text-[1.3rem] md:text-[1.6rem] lg:text-[2rem] font-bold mb-4 leading-snug text-darkNavy">
            {t("rentVsBuy.heading").replace("{name}", name)}
          </h2>

          <p className="text-gray-500 text-0.95 md:text-1.1 leading-relaxed mb-6">
            {t("rentVsBuy.body")
              .replace("{name}", name)
              .replace("{city}", city)}
          </p>

          {/* Callout box */}
          <div className="bg-gray-50 border-s-4 border-primary rounded-e-2xl p-4 md:p-5">
            <div className="font-bold text-darkNavy mb-1">
              {t("rentVsBuy.callout.title").replace("{name}", name)}
            </div>
            <div className="text-gray-500 text-xs md:text-sm">
              {t("rentVsBuy.callout.desc")}
            </div>
          </div>
        </div>

        {/* ── Right / Comparison rows ── */}
        <div className="space-y-3">
          {/* Column headers */}
          <div className="flex justify-between px-4 md:px-6 text-xs md:text-sm font-bold text-gray-400 mb-2">
            <span className="w-1/3">{t("rentVsBuy.col.aspect")}</span>
            <span className="w-1/3 text-center text-primary">
              {t("rentVsBuy.col.rent")}
            </span>
            <span className="w-1/3 text-end">{t("rentVsBuy.col.buy")}</span>
          </div>

          {ROWS.map(({ icon, labelKey, rentKey, buyKey }, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-3 md:p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Aspect label */}
              <div className="w-1/3 font-bold text-darkNavy text-0.85 md:text-base flex items-center gap-2">
                <div className="md:w-8 w-7 md:h-8 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
                  {icon}
                </div>
                {t(labelKey)}
              </div>

              {/* Rent value — green pill */}
              <div className="w-1/3 text-center text-green-600 font-bold bg-green-50 py-1.5 md:py-2 rounded-xl text-0.8 md:text-sm">
                {t(rentKey)}
              </div>

              {/* Buy value — red text */}
              <div className="w-1/3 text-end text-red-400 font-semibold text-0.8 md:text-sm">
                {t(buyKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
