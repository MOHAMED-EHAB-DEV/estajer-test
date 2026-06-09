"use client";

import { useState } from "react";
import ProductMapWrapper from "./ProductMapWrapper";
import { useTranslations } from "@/hooks/useTranslations";

export default function DeliveryInfo({
  product,
  lang,
  translate,
  displayLocation,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const deliveryType = product.rental?.delivery?.type;
  const pricingModel = product.rental?.delivery?.pricingModel;
  const fixedCityPricing = product.rental?.delivery?.fixedCityPricing || [];

  // Group fixed city pricing by governorate
  const groupedByGovernorate = fixedCityPricing.reduce((acc, city) => {
    const governorateKey =
      lang === "ar" ? city.governorateAr : city.governorateEn;
    if (!acc[governorateKey]) {
      acc[governorateKey] = [];
    }
    acc[governorateKey].push(city);
    return acc;
  }, {});

  const hasSpecificCities = Object.values(groupedByGovernorate).some((cities) =>
    cities.some((city) => !city.isGovernorate)
  );

  const trans = useTranslations(translate);
  const t = (key) => trans(`singleProduct.deliveryInfo.${key}`);

  // Receive type - show map
  if (deliveryType === "receive") {
    return (
      <div id="delivery-info">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f48a42] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#f48a42]/25">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div className="text-darkNavy font-semibold text-lg md:text-2xl">
            {t("pickupLocation")}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <ProductMapWrapper
            translate={translate}
            lang={lang}
            initialProducts={[{ ...product, location: displayLocation }]}
            className="md:h-[30.9rem] h-[26rem]"
            zoom={12}
            center={{
              lat: displayLocation.coordinates[1],
              lng: displayLocation.coordinates[0],
            }}
            showProducts={false}
          />
        </div>
      </div>
    );
  }

  // Free delivery type
  if (deliveryType === "free") {
    return (
      <div id="delivery-info">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f48a42]/10 via-[#f48a42]/5 to-transparent border border-[#f48a42]/20 p-6">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f48a42]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#f48a42]/5 rounded-full blur-2xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f48a42] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#f48a42]/30">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 7h-3V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1.5a2.5 2.5 0 0 0 5 0h3a2.5 2.5 0 0 0 5 0H21a1 1 0 0 0 1-1v-5a1 1 0 0 0-.293-.707L19 7zM6 8h8v2H6V8zm2.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              {(() => {
                const gov =
                  lang === "ar"
                    ? product.address?.governorate
                    : product.address?.governorateEn ||
                      product.address?.governorate;

                const badge = t("freeDeliveryBadge").replace(
                  "{governorate}",
                  gov || ""
                );
                const description = t("freeDeliveryDescription").replace(
                  "{governorate}",
                  gov || ""
                );

                return (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-darkNavy font-bold text-xl md:text-2xl">
                        {t("freeDeliveryTitle")}
                      </h3>
                      {gov && (
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#f48a42] to-[#ff6b35] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-base md:text-lg">
                      {gov
                        ? description
                        : t("freeDeliveryDescription")
                            .replace(" داخل {governorate}", "")
                            .replace(" within {governorate}", "")}
                    </p>
                  </>
                );
              })()}
            </div>
            {/* Saudi Arabia Icon */}
            <div className="hidden md:block flex-shrink-0">
              <svg
                className="w-20 h-20 text-[#f48a42]/20"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <path d="M50 5C30 5 15 20 10 35C5 50 10 70 25 80C35 88 50 95 65 90C80 85 90 70 95 55C100 40 95 20 80 12C70 5 60 5 50 5Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Delivery type with pricing models
  if (deliveryType === "delivery") {
    // Per KM pricing model
    if (pricingModel === "perKm") {
      return (
        <div id="delivery-info">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent border border-blue-100 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f48a42] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#f48a42]/30">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center md:text-start">
                <h3 className="text-darkNavy font-bold text-xl md:text-2xl mb-2">
                  {t("deliveryAvailableTitle")}
                </h3>
                <p className="text-gray-600 text-base md:text-lg mb-2">
                  {t("perKmDescription")}
                </p>
                <div className="flex items-center gap-2 text-sm text-[#f48a42] justify-center md:justify-start">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("perKmNote")}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fixed city pricing model
    if (pricingModel === "fixedCity") {
      const hasAnyPricing = fixedCityPricing.length > 0;

      return (
        <div id="delivery-info">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 via-gray-50/50 to-transparent border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#f48a42] to-[#ff6b35] p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 7h-3V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1.5a2.5 2.5 0 0 0 5 0h3a2.5 2.5 0 0 0 5 0H21a1 1 0 0 0 1-1v-5a1 1 0 0 0-.293-.707L19 7zM6 8h8v2H6V8zm2.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    {t("fixedCityTitle")}
                  </h3>
                  {!hasAnyPricing && (
                    <p className="text-white/80 text-sm mt-1">
                      {t("allGovernoratesAvailable")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            {hasAnyPricing && (
              <div className="p-5">
                <div
                  className={`space-y-4 ${
                    !isExpanded && Object.keys(groupedByGovernorate).length > 3
                      ? "max-h-[280px] overflow-hidden relative"
                      : ""
                  }`}
                >
                  {Object.entries(groupedByGovernorate).map(
                    ([governorate, cities], index) => (
                      <div
                        key={governorate}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                      >
                        {/* Governorate Header */}
                        <div className="bg-gradient-to-r from-[#f48a42]/10 to-transparent px-4 py-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#f48a42]/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-[#f48a42]"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8-3.58-8-8-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </div>
                          <span className="font-semibold text-darkNavy">
                            {governorate}
                          </span>
                        </div>

                        {/* Cities */}
                        <div className="px-4 py-3">
                          {hasSpecificCities ? (
                            <div className="flex flex-wrap gap-2">
                              {cities.map((city) => {
                                const isFreeDelivery = city.price === 0;
                                return (
                                  <div
                                    key={city.id || city.cityAr || city.cityEn}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                      isFreeDelivery
                                        ? "bg-green-50 border border-green-100"
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    <span
                                      className={
                                        isFreeDelivery
                                          ? "text-green-700"
                                          : "text-gray-700"
                                      }
                                    >
                                      {city.isGovernorate
                                        ? t("allCities")
                                        : lang === "ar"
                                        ? city.cityAr
                                        : city.cityEn}
                                    </span>
                                    {isFreeDelivery ? (
                                      <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                                        <svg
                                          className="w-3.5 h-3.5"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {t("free")}
                                      </span>
                                    ) : (
                                      <span className="font-semibold text-[#f48a42]">
                                        {city.price} {t("sar")}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {t("allGovernoratesAvailable")}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}

                  {/* Gradient overlay when collapsed */}
                  {!isExpanded &&
                    Object.keys(groupedByGovernorate).length > 3 && (
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                    )}
                </div>

                {/* Show more/less button */}
                {Object.keys(groupedByGovernorate).length > 3 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#f48a42]/10 hover:bg-[#f48a42]/20 text-[#f48a42] font-semibold transition-all duration-200"
                  >
                    {isExpanded ? t("showLess") : t("showMore")}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* No specific pricing - all governorates available */}
            {!hasAnyPricing && (
              <div className="p-5">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-green-700 font-medium">
                    {t("allGovernoratesAvailable")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Delivery Company type
  if (deliveryType === "deliveryCompany") {
    return (
      <div id="delivery-info">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-purple-50/50 to-transparent border border-purple-100 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f48a42] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#f48a42]/30">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-darkNavy font-bold text-xl md:text-2xl mb-2">
                {t("deliveryCompanyTitle")}
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                {t("deliveryCompanyDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
