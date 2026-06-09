import { getTranslations } from "@/hooks/getTranslations";

/* ── Inline SVG icons (no external dependency) ── */
function CoinsIcon() {
  return (
    <svg
      viewBox="1270 418 254 250"
      fill="currentColor"
      className="w-[15px] h-[15px]"
    >
      <path d="M 1362.73 495.436 C 1388.23 494.887 1428.56 500.566 1449.51 517.294 C 1459.78 525.498 1462.64 540.465 1452.36 550.069 C 1432.01 569.084 1396.84 573.372 1370.35 574.177 C 1341.23 574.302 1306.7 571.518 1282.49 553.393 C 1271.83 545.404 1268.56 530.373 1278.53 520.615 C 1298.73 500.853 1336.3 497.051 1362.73 495.436 z" />
      <path d="M 1412.57 418.4 C 1436.51 414.302 1519.24 422.105 1520.81 457.003 C 1522.05 484.576 1463.97 495.03 1443.66 495.052 C 1400.9 482.499 1399.67 480.914 1353.63 480.971 C 1340.85 473.477 1325.69 460.049 1338.92 444.962 C 1356.1 425.386 1388.05 420.758 1412.57 418.4 z" />
      <path d="M 1271.74 611.503 C 1322.51 643.656 1409.52 646.086 1459.26 611.122 C 1459.46 621.549 1460.48 629.716 1455.86 639.107 C 1436.61 662.809 1397.95 666.95 1369.2 667.397 C 1340.46 667.844 1302.86 664.801 1280.28 644.651 C 1270.18 635.641 1271.66 623.762 1271.74 611.503 z" />
      <path d="M 1271.51 564.742 C 1288.93 575.278 1301.45 581.145 1321.86 585.105 C 1366.39 593.751 1420.48 590.687 1459.07 564.837 C 1459.25 575.898 1460.66 583.997 1455.02 593.416 C 1454.33 594.213 1453.62 594.995 1452.9 595.762 C 1421.21 629.345 1316.28 629.082 1280.73 598.534 C 1270.63 589.853 1271.67 576.772 1271.51 564.742 z" />
      <path d="M 1520.84 486.812 C 1521.85 491.323 1521.13 504.639 1520.95 509.898 C 1514.64 521.536 1487.67 539.692 1475.1 536.188 C 1473.21 534.141 1473.19 530.122 1472.8 527.088 C 1470.24 518.369 1468.89 516.157 1462.51 509.685 C 1487.86 502.008 1497.52 503.009 1520.84 486.812 z" />
      <path d="M 1520.57 533.873 C 1523.5 538.78 1521.38 556.436 1517.63 561.76 C 1508.39 574.884 1490.62 580.454 1475.8 583.823 L 1474.79 583.484 C 1473.21 580.133 1473.7 558.825 1473.67 553.73 C 1493.71 548.465 1503.65 545.697 1520.57 533.873 z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="#F48A42">
      <path d="M9.6875 0C15.0391 0 19.375 4.33594 19.375 9.6875C19.375 15.0391 15.0391 19.375 9.6875 19.375C4.33594 19.375 0 15.0391 0 9.6875C0 4.33594 4.33594 0 9.6875 0ZM13.2812 12.2266C13.3594 12.1484 13.4375 11.9922 13.4375 11.8359C13.4375 11.6406 13.3203 11.4844 13.2031 11.3672L10.9375 9.6875V4.0625C10.9375 3.75 10.625 3.4375 10.3125 3.4375H9.0625C8.71094 3.4375 8.4375 3.75 8.4375 4.0625V10.1562C8.4375 10.6641 8.63281 11.0938 9.02344 11.3672L11.6406 13.3203C11.7188 13.3984 11.875 13.4766 11.9922 13.4766C12.2266 13.4766 12.3828 13.3594 12.5 13.2031L13.2812 12.2266Z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="#F48A42">
      <path d="M0.664062 5.78125C0 5.46875 0 4.49219 0.664062 4.17969L9.76562 0.078125C9.88281 0 10.0391 0 10.1953 0C10.3125 0 10.4688 0 10.5859 0.078125L19.6875 4.17969C20.3516 4.49219 20.3516 5.46875 19.6875 5.78125L10.5859 9.88281C10.3125 10 10.0391 10 9.76562 9.88281L0.664062 5.78125ZM19.6875 9.21875C20.3516 9.49219 20.3516 10.4688 19.6875 10.7812L10.5859 14.8828C10.3125 15 10.0391 15 9.76562 14.8828L0.664062 10.7812C0 10.4688 0 9.49219 0.664062 9.21875L2.92969 8.16406L9.25781 11.0547C9.53125 11.1719 9.84375 11.25 10.1953 11.25C10.5078 11.25 10.8203 11.1719 11.0938 11.0547L17.4219 8.16406L19.6875 9.21875ZM19.6875 14.2188C20.3516 14.4922 20.3516 15.4688 19.6875 15.7812L10.5859 19.8828C10.3125 20 10.0391 20 9.76562 19.8828L0.664062 15.7812C0 15.4688 0 14.4922 0.664062 14.2188L2.92969 13.1641L9.25781 16.0547C9.53125 16.1719 9.84375 16.25 10.1953 16.25C10.5078 16.25 10.8203 16.1719 11.0938 16.0547L17.4219 13.1641L19.6875 14.2188Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="15" height="21" viewBox="0 0 15 21" fill="#F48A42">
      <path d="M6.71875 19.6094C1.01562 11.4062 0 10.5469 0 7.5C0 3.35938 3.32031 0 7.5 0C11.6406 0 15 3.35938 15 7.5C15 10.5469 13.9453 11.4062 8.24219 19.6094C7.89062 20.1562 7.07031 20.1562 6.71875 19.6094ZM7.5 10.625C9.21875 10.625 10.625 9.25781 10.625 7.5C10.625 5.78125 9.21875 4.375 7.5 4.375C5.74219 4.375 4.375 5.78125 4.375 7.5C4.375 9.25781 5.74219 10.625 7.5 10.625Z" />
    </svg>
  );
}

function PuzzleIcon() {
  return (
    <svg width="23" height="22" viewBox="0 0 23 22" fill="#F48A42">
      <path d="M20.2734 11.2891C21.7578 11.2891 22.5 12.5391 22.5 13.8672C22.5 15.1562 21.7188 16.25 20.3516 16.25C18.7891 16.25 18.3594 14.8438 16.9531 14.8438C14.6094 14.8438 15.9375 19.5312 15.9375 19.5312C13.9453 19.5312 8.86719 20.9375 8.86719 18.5547C8.86719 17.1484 10.3125 16.7188 10.3125 15.1953C10.3125 13.7891 9.17969 13.0469 7.89062 13.0469C6.52344 13.0469 5.39062 13.7891 5.39062 15.2344C5.39062 16.875 6.95312 17.5391 6.95312 18.4375C6.95312 21.1719 0 19.5312 0 19.5312V6.52344C0 6.52344 6.83594 8.125 6.83594 5.42969C6.83594 4.53125 5.625 3.82812 5.625 2.22656C5.625 0.742188 6.83594 0 8.20312 0C9.49219 0 10.625 0.78125 10.625 2.14844C10.625 3.71094 9.17969 4.10156 9.17969 5.50781C9.17969 8.75 16.875 5.625 16.875 5.625C16.875 5.625 14.7266 12.5391 17.0703 12.5391C17.9297 12.5391 18.6328 11.2891 20.2734 11.2891Z" />
    </svg>
  );
}

const FACTORS = [
  {
    icon: <ClockIcon />,
    titleKey: "rentalCost.factor1.title",
    descKey: "rentalCost.factor1.desc",
  },
  {
    icon: <LayersIcon />,
    titleKey: "rentalCost.factor2.title",
    descKey: "rentalCost.factor2.desc",
  },
  {
    icon: <LocationIcon />,
    titleKey: "rentalCost.factor3.title",
    descKey: "rentalCost.factor3.desc",
  },
  {
    icon: <PuzzleIcon />,
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
          {/* change the border to 1px solid #fed7aa */}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-[#fff7ed] px-3 py-1.5 rounded-full mb-4 border border-[#fed7aa]">
            <CoinsIcon />
            {t("rentalCost.badge")}
          </span>

          <h2 className="text-[1.3rem] md:text-[1.6rem] lg:text-[2rem] font-bold mb-4 leading-snug text-darkNavy">
            {t("rentalCost.heading").replace("{name}", name)}
          </h2>

          <p className="text-gray-500 text-[0.95rem] md:text-[1.1rem] leading-relaxed mb-4">
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
                <div className="font-bold text-[0.85rem] md:text-[0.95rem] mb-1 text-darkNavy">
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
