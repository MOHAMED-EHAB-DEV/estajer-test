import { Location } from "../ui/svgs/icons/LocationSvg";

/**
 * DeliveryRow — unified delivery context row for product cards.
 * Replaces BOTH the location line and the old badge.
 *
 * receive   → 📍 {city}  •  استلام شخصي
 * free      → ✅ توصيل مجاني في {governorate}
 * perKm     → 🚚 يصل لكافة المناطق  ·  تكلفة بالمسافة
 * fixedCity → 🚚 يوصّل إلى:  [Riyadh] [Jeddah] +2
 * fallback  → 📍 {city}
 */
export default function DeliveryRow({ delivery, address, lang, xs, sm }) {
  const isAr = lang === "ar";
  const city = address?.city || "";
  const governorate = address?.governorate || city;
  const type = delivery?.type;

  const textCls = sm
    ? "text-[10px] md:text-[13px]"
    : "text-[12px] md:text-[13px]";
  const iconCls = sm
    ? "w-2.5 h-2.5 md:w-3.5 md:h-3.5 flex-shrink-0"
    : "w-3.5 h-3.5 flex-shrink-0";

  // ── Shared icons ─────────────────────────────────────────────────────────
  const TruckIcon = (
    <svg
      className={`${iconCls} text-primary`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );

  const CheckIcon = (
    <svg
      className={`${iconCls} text-green-600`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
  const Dot = () => (
    <span className="w-[3px] h-[3px] rounded-full bg-current opacity-25 flex-shrink-0 inline-block mx-0.5" />
  );

  // ── 1. Pickup ─────────────────────────────────────────────────────────────
  if (type === "receive") {
    return (
      <div
        className={`flex items-center gap-0.5 ${textCls} font-medium text-gray-600`}
      >
        {!xs && (
          <Location
            color="currentColor"
            aria-hidden="true"
            className={
              sm
                ? "w-[11px] h-[11px] md:w-[12px] md:h-[14px] text-primary shrink-0"
                : "md:w-[16px] md:h-[20px] shrink-0"
            }
          />
        )}
        {city && <span className="font-semibold">{city}</span>}
        {city && <Dot />}
        <span className="text-gray-400 font-normal">
          {isAr ? "استلام من المؤجر" : "Pickup"}
        </span>
      </div>
    );
  }

  // ── 2. Free delivery ──────────────────────────────────────────────────────
  if (type === "free") {
    const label = governorate || city;
    return (
      <div
        className={`inline-flex items-center md:gap-1.5 gap-1 ${textCls} text-green-700 ${
          xs
            ? ""
            : "bg-green-50 border border-green-200/60 rounded-md md:px-2.5 px-1.5 py-[2px]"
        }`}
      >
        {!xs && CheckIcon}
        <span>
          {isAr
            ? `توصيل مجاني${label ? ` في ${label}` : ""}`
            : `Free delivery${label ? ` in ${label}` : ""}`}
        </span>
      </div>
    );
  }

  // ── 3. Paid delivery ──────────────────────────────────────────────────────
  if (type === "delivery") {
    const pricingModel = delivery.pricingModel;

    // per-km
    if (pricingModel === "perKm" || !pricingModel) {
      const isFree = delivery.cost === 0;
      if (isFree) {
        return (
          <div
            className={`inline-flex items-center md:gap-1.5 gap-1 ${textCls} text-green-700 ${
              xs
                ? ""
                : "bg-green-50 border border-green-200/60 rounded-md md:px-2.5 px-1.5 py-[2px]"
            }`}
          >
            {!xs && CheckIcon}
            <span>
              {isAr ? "توصيل مجاني لكافة المناطق" : "Free nationwide delivery"}
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-primary text-[11px] font-semibold ${
              xs
                ? ""
                : "bg-orange-50 px-2 py-1 rounded-md border border-orange-100"
            }`}
          >
            {!xs && TruckIcon}
            <span>{isAr ? "يصل لكافة المناطق" : "Nationwide delivery"}</span>
          </span>
          <span
            className={`inline-flex items-center text-gray-600 text-[11px] font-semibold text-center ${
              xs ? "" : "bg-gray-100 px-2 py-1 rounded-md"
            }`}
          >
            {isAr ? "تكلفة بالمسافة" : "distance-based"}
          </span>
        </div>
      );
    }

    // fixed-city
    if (pricingModel === "fixedCity") {
      const cities = delivery.fixedCityPricing || [];

      const getName = (c) => {
        if (c.isGovernorate)
          return isAr
            ? c.governorateAr || c.displayName
            : c.governorateEn || c.displayName;
        return isAr
          ? c.cityAr || c.governorateAr || c.displayName
          : c.cityEn || c.governorateEn || c.displayName;
      };

      const chipCls = `inline-flex items-center gap-0.5 ${
        xs ? "" : "rounded-md border px-1.5 py-[2px]"
      } font-medium ${
        xs ? "text-[10px]" : sm ? "text-[9px] md:text-[10px]" : "text-[10px]"
      }`;

      if (cities.length === 0) {
        return (
          <div
            className={`flex items-center gap-1.5 ${textCls} font-semibold text-gray-600`}
          >
            {!xs && TruckIcon}
            <span className="text-gray-500 font-medium">
              {isAr ? "مناطق محددة" : "Selected areas"}
            </span>
          </div>
        );
      }

      // 1. Visible cities slicing:
      // Show up to 3 cities if length <= 3, otherwise show only 2.
      // If the first two cities have 2+ words, limit visible to 1 city on all screen sizes.
      const isMultiWord = (name) => {
        if (!name) return false;
        return name.trim().split(/\s+/).filter(Boolean).length >= 2;
      };

      const name0 = cities[0] ? getName(cities[0]) : "";
      const name1 = cities[1] ? getName(cities[1]) : "";
      const limitToOne =
        cities.length >= 2 && isMultiWord(name0) && isMultiWord(name1);

      const showAllD = cities.length <= 3;
      const visibleCount = limitToOne ? 1 : showAllD ? 3 : 2;
      const visible = cities.slice(0, visibleCount);

      return (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {/* Label — stays inline, chips wrap after if needed */}
          {!xs && (
            <div
              className={`flex items-center gap-1 ${
                sm ? "text-[10px] md:text-[11px]" : "text-[11px]"
              } font-medium text-gray-400 flex-shrink-0`}
            >
              {TruckIcon}
              <span>{isAr ? "يوصّل إلى:" : "Delivers to:"}</span>
            </div>
          )}

          {/* City chips */}
          {visible.map((c, i) => {
            const isFree = c.price === 0;
            const isDesktopOnly = (i === 1 && cities.length > 2) || i === 2;
            const visibilityClass = isDesktopOnly
              ? "hidden md:inline-flex"
              : "inline-flex";

            return (
              <span
                key={c.id || i}
                className={`${chipCls} ${visibilityClass} ${
                  isFree
                    ? xs
                      ? "text-green-700"
                      : "bg-green-50 text-green-700 border-green-200"
                    : xs
                      ? "text-orange-700"
                      : "bg-orange-50 text-orange-700 border-orange-100"
                }`}
              >
                {!xs && isFree && (
                  <svg
                    className="w-2 h-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {getName(c)}
              </span>
            );
          })}

          {/* Single Unified Tooltip Popover Badge */}
          {(limitToOne ? cities.length > 1 : cities.length > 2) && (
            <span
              className={`${chipCls} select-none ${
                xs
                  ? "text-gray-500"
                  : "bg-gray-100 text-gray-500 border-gray-200 cursor-pointer hover:bg-gray-200 relative group/tooltip"
              } transition-colors ${
                !limitToOne && cities.length === 3
                  ? "inline-flex md:hidden"
                  : "inline-flex"
              }`}
            >
              {/* Responsive counters */}
              <span className="hidden md:inline">
                +{limitToOne ? cities.length - 1 : cities.length - 2}
              </span>
              <span className="inline md:hidden">+{cities.length - 1}</span>{" "}
              {isAr ? "أخرى" : "more"}
              {/* Tooltip dropdown list */}
              {!xs && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50">
                  <span className="bg-white border border-gray-200 text-gray-800 text-[11px] font-semibold p-2 rounded-lg shadow-xl flex flex-col gap-1 min-w-[110px] text-center">
                    {cities.slice(1).map((city, idx) => {
                      // idx === 0 represents City 2 (cities[1]).
                      // City 2 is visible as a chip on desktop, so hide it in the desktop tooltip dropdown.
                      const isCity2 = idx === 0;
                      return (
                        <span
                          key={city.id || idx}
                          className={`${
                            isCity2 && !limitToOne ? "block md:hidden" : "block"
                          } text-gray-700 font-medium py-0.5 border-b border-gray-100 last:border-0`}
                        >
                          {getName(city)}
                        </span>
                      );
                    })}
                  </span>
                  <span className="w-2 h-2 bg-white rotate-45 -mt-[5px] border-r border-b border-gray-200" />
                </span>
              )}
            </span>
          )}
        </div>
      );
    }
  }

  // ── Fallback: plain location pin ──────────────────────────────────────────
  if (!city) return null;
  return (
    <div
      className={`flex items-center gap-1.5 ${textCls} font-semibold text-gray-700`}
    >
      {!xs && (
        <Location
          color="currentColor"
          aria-hidden="true"
          className={
            sm
              ? "w-[12px] h-[12px] md:w-[12px] md:h-[14px] text-primary"
              : "md:w-[16px] md:h-[20px]"
          }
        />
      )}
      <span>{city}</span>
    </div>
  );
}
