"use client";
import formatDuration from "@/utils/formatDuration";
import { useState, useEffect, memo } from "react";
import { Currency } from "../ui/svgs/icons/CurrencySvg";

const CheckCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);

function BookingPackages({
  packages,
  onSelect,
  initialSelectedId,
  translate,
  lang = "ar",
}) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const t = (key) => translate(`productComponent.bookingPackages.${key}`);

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const handleSelectPackage = (packageId) => {
    setSelectedId(packageId);
    if (onSelect) {
      const selectedPackage = packages.find((pkg) => pkg.id === packageId);
      onSelect(selectedPackage);
    }
  };

  const isRTL = lang === "ar";

  return (
    <div className="w-full" id="booking-packages">
      <h3 className="text-darkNavy font-semibold text-[1rem] md:text-[1.2rem] lg:text-[1.4rem] font-IBMPlex mb-4">
        {t("selectDuration")}
      </h3>
      <div className="flex flex-col gap-3">
        {packages.map((pkg) => {
          const isSelected = selectedId === pkg.id;
          const displayDuration = formatDuration({
            duration: pkg.duration,
            unit: pkg.unit,
            t: t,
            lang,
          });
          return (
            <button
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg.id)}
              className={`
                w-full p-4 rounded-xl border-2 transition-all duration-300 ease-in-out
                flex justify-between items-center
                ${isRTL ? "text-right" : "text-left"}
                ${
                  isSelected
                    ? "bg-orange-50 border-orange-500 shadow-md"
                    : "bg-white border-gray-200 hover:border-orange-400"
                }
              `}
            >
              {/* Info side: Duration and Checkmark */}
              <div className="flex items-center gap-3">
                <div className="relative md:w-6 md:h-6 w-5 h-5 ">
                  {/* Empty circle placeholder */}
                  <div
                    className={`
                      md:w-6 md:h-6 w-5 h-5  rounded-full border-2 transition-all duration-300
                      ${isSelected ? "border-orange-500" : "border-gray-300"}
                    `}
                  />
                  {/* Checkmark icon that scales in */}
                  <CheckCircleIcon
                    className={`
                      absolute top-0 left-0
                      md:w-6 md:h-6 w-5 h-5  text-orange-500 transition-all duration-300 ease-in-out
                      ${
                        isSelected
                          ? "scale-100 opacity-100"
                          : "scale-0 opacity-0"
                      }
                    `}
                  />
                </div>

                <div className="text-[0.9rem] md:text-[1.1rem] font-semibold text-gray-800">
                  {displayDuration}
                </div>
              </div>

              {/* Pricing side */}
              <div
                className={`flex flex-col ${
                  isRTL ? "items-end" : "items-start"
                }`}
              >
                <span className="flex items-center gap-1 text-[1rem] md:text-[1.1rem] font-bold text-primary">
                  {pkg.price.toFixed(0)}{" "}
                  <Currency color="#f48a42" className="w-4 h-4" />
                </span>
                {pkg.originalPrice && (
                  <span className="flex items-center gap-1 text-sm text-gray-500 line-through">
                    {pkg.originalPrice.toFixed(0)}{" "}
                    <Currency color="#FF6B00" className="w-4 h-4" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(BookingPackages);
