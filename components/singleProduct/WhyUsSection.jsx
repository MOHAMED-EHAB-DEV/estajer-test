import { getTranslations } from "@/hooks/getTranslations";

/* ── Inline SVG Icons (FA-solid filled style) ── */

function TagIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="#F48A42">
      <path d="M0 11.8594V2.25C0 1.03125 0.984375 0 2.25 0H11.8125C12.4219 0 12.9844 0.28125 13.4062 0.703125L23.2969 10.5938C24.1875 11.4844 24.1875 12.9375 23.2969 13.7812L13.7344 23.3438C12.8906 24.2344 11.4375 24.2344 10.5469 23.3438L0.65625 13.4531C0.234375 13.0312 0 12.4688 0 11.8594ZM5.25 3C3.98438 3 3 4.03125 3 5.25C3 6.51562 3.98438 7.5 5.25 7.5C6.46875 7.5 7.5 6.51562 7.5 5.25C7.5 4.03125 6.46875 3 5.25 3Z" />
    </svg>
  );
}

function CalendarDaysIcon() {
  return (
    <svg width="21" height="24" viewBox="0 0 21 24" fill="#F48A42">
      <path d="M0 21.75V9H21V21.75C21 23.0156 19.9688 24 18.75 24H2.25C0.984375 24 0 23.0156 0 21.75ZM15 12.5625V14.4375C15 14.7656 15.2344 15 15.5625 15H17.4375C17.7188 15 18 14.7656 18 14.4375V12.5625C18 12.2812 17.7188 12 17.4375 12H15.5625C15.2344 12 15 12.2812 15 12.5625ZM15 18.5625V20.4375C15 20.7656 15.2344 21 15.5625 21H17.4375C17.7188 21 18 20.7656 18 20.4375V18.5625C18 18.2812 17.7188 18 17.4375 18H15.5625C15.2344 18 15 18.2812 15 18.5625ZM9 12.5625V14.4375C9 14.7656 9.23438 15 9.5625 15H11.4375C11.7188 15 12 14.7656 12 14.4375V12.5625C12 12.2812 11.7188 12 11.4375 12H9.5625C9.23438 12 9 12.2812 9 12.5625ZM9 18.5625V20.4375C9 20.7656 9.23438 21 9.5625 21H11.4375C11.7188 21 12 20.7656 12 20.4375V18.5625C12 18.2812 11.7188 18 11.4375 18H9.5625C9.23438 18 9 18.2812 9 18.5625ZM3 12.5625V14.4375C3 14.7656 3.23438 15 3.5625 15H5.4375C5.71875 15 6 14.7656 6 14.4375V12.5625C6 12.2812 5.71875 12 5.4375 12H3.5625C3.23438 12 3 12.2812 3 12.5625ZM3 18.5625V20.4375C3 20.7656 3.23438 21 3.5625 21H5.4375C5.71875 21 6 20.7656 6 20.4375V18.5625C6 18.2812 5.71875 18 5.4375 18H3.5625C3.23438 18 3 18.2812 3 18.5625ZM18.75 3C19.9688 3 21 4.03125 21 5.25V7.5H0V5.25C0 4.03125 0.984375 3 2.25 3H4.5V0.75C4.5 0.375 4.82812 0 5.25 0H6.75C7.125 0 7.5 0.375 7.5 0.75V3H13.5V0.75C13.5 0.375 13.8281 0 14.25 0H15.75C16.125 0 16.5 0.375 16.5 0.75V3H18.75Z" />
    </svg>
  );
}

function ScrewdriverWrenchIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="#F48A42">
      <path d="M23.8125 18.8906C24.4688 19.5938 24.4688 20.6719 23.8125 21.375L21.3281 23.8594C20.625 24.5156 19.5469 24.5156 18.8438 23.8594L13.3594 18.3281C12.2812 17.25 12.0938 15.6562 12.7031 14.3438L7.73438 9.32812H4.82812L0.328125 3.32812L3.32812 0.328125L9.32812 4.82812V7.78125L14.2969 12.75C15.6094 12.0938 17.2031 12.3281 18.3281 13.4062L23.8125 18.8906ZM15.8438 10.875C15.4688 10.875 15.0938 10.9219 14.7188 11.0156L10.8281 7.17188C10.8281 5.4375 11.4375 3.65625 12.7969 2.34375C14.5312 0.609375 16.9688 0 19.1719 0.5625C19.5938 0.65625 19.7812 1.17188 19.4531 1.5L15.9844 4.96875L16.5 8.15625L19.6875 8.71875L23.1562 5.20312C23.4844 4.92188 24 5.0625 24.0938 5.48438C24.6562 7.6875 24.0469 10.125 22.3125 11.8594C21.7031 12.4688 21 12.9375 20.2969 13.2656L19.3594 12.3281C18.4219 11.3906 17.2031 10.875 15.8438 10.875ZM10.9688 14.7188C10.7344 15.75 10.875 16.7344 11.2031 17.6719L5.4375 23.4844C4.26562 24.6562 2.34375 24.6562 1.17188 23.4844C0 22.3125 0 20.3906 1.17188 19.2188L8.34375 12.0938L10.9688 14.7188ZM3.32812 22.4531C3.9375 22.4531 4.45312 21.9844 4.45312 21.3281C4.45312 20.7188 3.9375 20.2031 3.32812 20.2031C2.67188 20.2031 2.20312 20.7188 2.20312 21.3281C2.20312 21.9844 2.67188 22.4531 3.32812 22.4531Z" />
    </svg>
  );
}

function TruckFastIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="#F48A42">
      <path d="M0 11.8594V2.25C0 1.03125 0.984375 0 2.25 0H11.8125C12.4219 0 12.9844 0.28125 13.4062 0.703125L23.2969 10.5938C24.1875 11.4844 24.1875 12.9375 23.2969 13.7812L13.7344 23.3438C12.8906 24.2344 11.4375 24.2344 10.5469 23.3438L0.65625 13.4531C0.234375 13.0312 0 12.4688 0 11.8594ZM5.25 3C3.98438 3 3 4.03125 3 5.25C3 6.51562 3.98438 7.5 5.25 7.5C6.46875 7.5 7.5 6.51562 7.5 5.25C7.5 4.03125 6.46875 3 5.25 3Z" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#F48A42">
      <path d="M9 9.75V15C9 15.8438 8.29688 16.5 7.5 16.5H6.75C5.0625 16.5 3.75 15.1875 3.75 13.5V11.25C3.75 9.60938 5.0625 8.25 6.75 8.25H7.5C8.29688 8.25 9 8.95312 9 9.75ZM17.25 16.5H16.5C15.6562 16.5 15 15.8438 15 15V9.75C15 8.95312 15.6562 8.25 16.5 8.25H17.25C18.8906 8.25 20.25 9.60938 20.25 11.25V13.5C20.25 15.1875 18.8906 16.5 17.25 16.5ZM12 0C18.6562 0 23.7656 5.57812 24 12V19.7812C24 22.125 22.0781 24 19.7344 24H11.25C9.98438 24 9 23.0156 9 21.75C9 20.5312 9.98438 19.5 11.25 19.5H12.75C13.9688 19.5 15 20.5312 15 21.75H19.7344C20.8594 21.75 21.75 20.9062 21.75 19.7812C21.75 19.7812 21.7031 12.1406 21.7031 12H21.75C21.75 6.65625 17.3438 2.25 12 2.25C6.60938 2.25 2.25 6.65625 2.25 12V12.75C2.25 13.1719 1.875 13.5 1.5 13.5H0.75C0.328125 13.5 0 13.1719 0 12.75V12C0.1875 5.57812 5.29688 0 12 0Z" />
    </svg>
  );
}

/* ── Items config ── */
const WHY_US_ITEMS = [
  {
    icon: <TagIcon />,
    titleKey: "whyUs.item1.title",
    descKey: "whyUs.item1.desc",
  },
  {
    icon: <CalendarDaysIcon />,
    titleKey: "whyUs.item2.title",
    descKey: "whyUs.item2.desc",
  },
  {
    icon: <ScrewdriverWrenchIcon />,
    titleKey: "whyUs.item3.title",
    descKey: "whyUs.item3.desc",
  },
  // {
  //   icon: <TruckFastIcon />,
  //   titleKey: "whyUs.item4.title",
  //   descKey: "whyUs.item4.desc",
  // },
  {
    icon: <HeadsetIcon />,
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
            <svg width="12" height="13" viewBox="0 0 12 13" fill="#F48A42">
              <path d="M11.2495 2.0748C11.6995 2.2748 11.9995 2.6998 11.9995 3.1748C11.9995 8.7248 8.59953 11.7998 6.44953 12.6998C6.14953 12.8248 5.82453 12.8248 5.52453 12.6998C2.84953 11.5748 -0.00046882 8.1498 -0.00046882 3.1748C-0.00046882 2.6998 0.274531 2.2748 0.724531 2.0748L5.52453 0.0748045C5.67453 0.0248045 5.82453 -0.000195479 5.99953 -0.000195479C6.14953 -0.000195479 6.29953 0.0248045 6.44953 0.0748045L11.2495 2.0748ZM5.99953 11.1498C8.32453 9.9748 10.2995 7.2248 10.3745 3.4498L5.99953 1.6248V11.1498Z" />
            </svg>

            {t("whyUs.badge")}
          </span>
          <h2 className="text-[1.3rem] md:text-[1.6rem] lg:text-[2rem] font-bold mb-3 leading-snug text-darkNavy">
            {format(t("whyUs.heading"))}
          </h2>
          <p className="text-gray-500 text-[0.95rem] md:text-[1.1rem]">
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
                <div className="font-bold text-[0.85rem] md:text-[0.95rem] mb-1">
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
