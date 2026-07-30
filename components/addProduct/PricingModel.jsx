"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select, SelectItem } from "@/components/ui/Select";
import { Autocomplete, AutocompleteItem } from "@/components/ui/Autocomplete";
import Button from "../ui/Button";
import { Location } from "../ui/svgs/icons/LocationSvg";
import { Plus } from "../ui/svgs/icons/PlusSvg";
import { X } from "../ui/svgs/icons/XSvg";

// City Pricing Component
export const CityPricingItem = ({ city, onRemove, onUpdate, t, lang }) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(city.displayName || "");
  const [isOpen, setIsOpen] = useState(false);

  const fetchSuggestions = useCallback(
    async (input) => {
      if (!input) {
        setAddressSuggestions([]);
        return;
      }
      setAddressLoading(true);
      try {
        const response = await fetch(
          `/api/geocode/autocomplete?input=${encodeURIComponent(
            input,
          )}&lang=${lang}`,
        );
        const data = await response.json();
        if (data.predictions) {
          setAddressSuggestions(data.predictions);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setAddressLoading(false);
      }
    },
    [lang],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = setTimeout(() => {
      fetchSuggestions(searchInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, isOpen, fetchSuggestions]);

  const handlePlaceSelect = async (placeId, selectedAddress) => {
    const addressToUse =
      typeof placeId === "string" && placeId.startsWith("ChI") ? null : placeId;
    const actualPlaceId = addressToUse ? null : placeId;
    const actualAddress = addressToUse || selectedAddress;

    if (!actualPlaceId && !actualAddress) return;
    setAddressLoading(true);
    try {
      const queryParam = actualPlaceId
        ? `place_id=${encodeURIComponent(actualPlaceId)}`
        : `address=${encodeURIComponent(actualAddress)}`;

      // Fetch both Arabic and English geocoding data simultaneously
      const [responseAr, responseEn] = await Promise.all([
        fetch(`/api/geocode/search?${queryParam}&lang=ar`),
        fetch(`/api/geocode/search?${queryParam}&lang=en`),
      ]);

      const [dataAr, dataEn] = await Promise.all([
        responseAr.json(),
        responseEn.json(),
      ]);

      if (
        dataAr.status === "OK" &&
        dataAr.results.length > 0 &&
        dataEn.status === "OK" &&
        dataEn.results.length > 0
      ) {
        const resultAr = dataAr.results[0];
        const resultEn = dataEn.results[0];
        const addressComponentsAr = resultAr.address_components;
        const addressComponentsEn = resultEn.address_components;

        // Extract city and governorate information from Arabic response
        let cityAr = "",
          governorateAr = "";
        let isGovernorate = true;

        addressComponentsAr.forEach((component) => {
          const types = component.types;
          if (types.includes("administrative_area_level_1")) {
            governorateAr = component.long_name;
          } else if (
            types.includes("administrative_area_level_2") ||
            types.includes("locality")
          ) {
            cityAr = component.long_name;
            isGovernorate = false;
          }
        });

        // Extract city and governorate information from English response
        let cityEn = "",
          governorateEn = "";

        addressComponentsEn.forEach((component) => {
          const types = component.types;
          if (types.includes("administrative_area_level_1")) {
            governorateEn = component.long_name;
          } else if (
            types.includes("administrative_area_level_2") ||
            types.includes("locality")
          ) {
            cityEn = component.long_name;
          }
        });

        const displayName = actualAddress || resultAr.formatted_address;

        // Update the city data
        onUpdate(city.id, "displayName", displayName);
        onUpdate(city.id, "cityAr", cityAr);
        onUpdate(city.id, "cityEn", cityEn);
        onUpdate(city.id, "governorateAr", governorateAr);
        onUpdate(city.id, "governorateEn", governorateEn);
        onUpdate(city.id, "isGovernorate", isGovernorate);

        setSearchInput(displayName);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-5 border rounded-xl md:rounded-2xl bg-white relative shadow-md transition-all duration-300 hover:shadow-lg border-gray-100">
      <div className="absolute -top-2.5 -end-2.5 z-20">
        <Button
          className="bg-white hover:bg-red-50 text-red-500 rounded-full min-w-0 p-1 md:p-2 aspect-square shadow-md border border-gray-100 transition-all hover:scale-110"
          onPress={() => onRemove(city.id)}
          type="button"
          size="sm"
        >
          <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 pt-3">
        <div className="flex flex-col gap-1">
          <Autocomplete
            label={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <span>
                    {t("cityPricing.cityOrGovernorate")}
                    <span className="text-rose-500 ms-0.5">*</span>
                  </span>
                  {searchInput && (
                    <span
                      className={`px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                        city.isGovernorate
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {city.isGovernorate
                        ? lang === "ar"
                          ? "منطقة / إمارة"
                          : "Governorate"
                        : lang === "ar"
                          ? "مدينة"
                          : "City"}
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center gap-1.5 cursor-pointer group pointer-events-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onUpdate(city.id, "price", city.price === 0 ? "" : 0);
                  }}
                >
                  <div
                    className={`w-7 md:w-8 h-3.5 md:h-4 rounded-full transition-colors relative ${
                      city.price === 0 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${
                        city.price === 0 ? "start-4 md:start-5" : "start-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-gray-600 transition-colors group-hover:text-green-600 select-none">
                    {lang === "ar" ? "توصيل مجاني؟" : "Free Delivery?"}
                  </span>
                </div>
              </div>
            }
            aria-label={t("cityPricing.cityOrGovernorate")}
            placeholder={t("cityPricing.searchCityOrGovernorate")}
            inputValue={searchInput}
            value={searchInput}
            onOpenChange={setIsOpen}
            onInputChange={(value) => {
              setSearchInput(value);
              if (!value) {
                onUpdate(city.id, "displayName", "");
                onUpdate(city.id, "cityAr", "");
                onUpdate(city.id, "cityEn", "");
                onUpdate(city.id, "governorateAr", "");
                onUpdate(city.id, "governorateEn", "");
                onUpdate(city.id, "isGovernorate", false);
              }
            }}
            onSelectionChange={(key) => {
              if (key) {
                const suggestion = addressSuggestions.find(
                  (s) => s.place_id === key,
                );
                if (suggestion) {
                  handlePlaceSelect(
                    suggestion.place_id,
                    suggestion.description,
                  );
                }
              } else {
                onUpdate(city.id, "displayName", "");
                onUpdate(city.id, "cityAr", "");
                onUpdate(city.id, "cityEn", "");
                onUpdate(city.id, "governorateAr", "");
                onUpdate(city.id, "governorateEn", "");
                onUpdate(city.id, "isGovernorate", false);
                setSearchInput("");
              }
            }}
            isLoading={addressLoading}
            labelPlacement="outside"
            radius="lg"
            variant="bordered"
            defaultFilter={() => true}
            items={addressSuggestions}
            size="sm"
            classNames={{
              label: "text-xs md:text-sm font-semibold text-gray-700",
              inputWrapper:
                "!h-9 md:!h-11 bg-gray-50/50 hover:bg-white transition-colors border-gray-200",
              input:
                "text-xs md:text-sm text-slate-800 placeholder:text-slate-400",
              popoverContent: "z-modal",
            }}
          >
            {(suggestion) => {
              const isGov = suggestion.types?.includes(
                "administrative_area_level_1",
              );
              const isLoc = suggestion.types?.some(
                (t) => t === "locality" || t === "administrative_area_level_2",
              );
              return (
                <AutocompleteItem
                  key={suggestion.place_id}
                  value={suggestion.place_id}
                  textValue={suggestion.description}
                  className="py-1.5 text-xs md:text-sm"
                  endContent={
                    (isGov || isLoc) && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold ${
                          isGov
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {isGov
                          ? lang === "ar"
                            ? "منطقة / إمارة"
                            : "Region"
                          : lang === "ar"
                            ? "مدينة"
                            : "City"}
                      </span>
                    )
                  }
                >
                  {suggestion.description}
                </AutocompleteItem>
              );
            }}
          </Autocomplete>

          {searchInput && (
            <p className="text-[10px] md:text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {city.isGovernorate
                ? lang === "ar"
                  ? "سيتم تطبيق السعر على جميع مدن هذه المنطقة"
                  : "Price applies to all cities in this governorate"
                : lang === "ar"
                  ? "سيتم تطبيق السعر على هذه المدينة فقط"
                  : "Price applies to this specific city only"}
            </p>
          )}
        </div>

        <Input
          isDisabled={city.price === 0}
          isRequired={city.price !== 0}
          label={t("cityPricing.deliveryCost")}
          type="number"
          step={0.01}
          value={city.price}
          onChange={(e) =>
            onUpdate(
              city.id,
              "price",
              e.target.value === "" ? "" : +e.target.value,
            )
          }
          min={0}
          placeholder="50"
          labelPlacement="outside"
          radius="md"
          variant="bordered"
          classNames={{
            label: "text-xs md:text-sm font-semibold text-gray-700",
            input: "text-xs md:text-sm",
            inputWrapper:
              city.price === 0
                ? "bg-gray-100 h-9 md:h-11"
                : "bg-gray-50/50 hover:bg-white transition-colors border-gray-200 h-9 md:h-11",
          }}
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-xs md:text-sm font-bold">
                {t("sar")}
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

// City Pricing List Component
export const CityPricingList = ({ cities, setRentData, t, lang }) => {
  const addCity = () => {
    const newCity = {
      id: new Date().getTime(),
      cityAr: "",
      cityEn: "",
      governorateAr: "",
      governorateEn: "",
      displayName: "",
      isGovernorate: false,
      price: "",
    };
    setRentData((prev) => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        fixedCityPricing: [...(prev.delivery.fixedCityPricing || []), newCity],
      },
    }));
  };

  const removeCity = (id) => {
    setRentData((prev) => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        fixedCityPricing: prev.delivery.fixedCityPricing.filter(
          (city) => city.id !== id,
        ),
      },
    }));
  };

  const updateCity = (id, field, value) => {
    setRentData((prev) => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        fixedCityPricing: prev.delivery.fixedCityPricing.map((city) =>
          city.id === id ? { ...city, [field]: value } : city,
        ),
      },
    }));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 py-3 md:py-6 px-3 md:px-4 bg-gradient-to-r from-[#f48a42]/5 via-white to-[#f48a42]/5 rounded-xl md:rounded-2xl border border-[#f48a42]/10 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-9 h-9 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-[#f48a42]/20">
            <Location color="#fff" className="w-3 h-4 md:w-5 md:h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-xl font-bold text-gray-900">
              {t("cityPricing.fixedCityPricing")}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm">
              {t("cityPricing.setDeliveryPrices")}
            </p>
          </div>
        </div>
        <Button
          onPress={addCity}
          size="sm"
          className="bg-primary hover:bg-[#ff9c5a] text-white rounded-lg md:rounded-xl px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm shadow-sm hover:shadow-md transition-all duration-300 font-semibold !h-9 md:!h-10"
          startContent={
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" color="#fff" />
          }
        >
          {t("cityPricing.addCity")}
        </Button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {cities && cities.length > 0 ? (
          cities.map((city, index) => (
            <div key={city.id} className="relative">
              <div className="absolute -top-2.5 z-10 text-white -start-2.5 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-[#f48a42] to-[#e67e22] rounded-full flex items-center justify-center shadow-lg text-xs md:text-sm font-bold">
                {index + 1}
              </div>
              <CityPricingItem
                city={city}
                onRemove={removeCity}
                onUpdate={updateCity}
                t={t}
                lang={lang}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 md:py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Location color="#6b7280" className="w-4 h-5 md:w-6 md:h-7" />
            </div>
            <p className="text-base md:text-lg text-gray-900 mb-1 md:mb-2">
              {t("cityPricing.noCitiesAdded")}
            </p>
            <p className="text-gray-500 mb-2 text-xs md:text-sm">
              {t("cityPricing.addFirstCity")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PricingModelSwitcher = ({ value, onChange, lang, t }) => (
  <div className="mb-3 md:mb-6">
    <h3 className="text-xs md:text-base font-semibold text-gray-800 mb-1.5 md:mb-3">
      {t("pricingModel.label")}
    </h3>
    <div className="relative flex p-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg md:rounded-xl w-full max-w-xs md:max-w-sm mx-auto shadow-md border border-gray-200/60 backdrop-blur-sm">
      {/* Sliding background indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#f48a42] to-[#e67e22] rounded-md md:rounded-lg shadow-md transition-all duration-500 ease-out transform ${
          value === "perDay"
            ? "translate-x-0"
            : lang === "ar"
              ? "-translate-x-full"
              : "translate-x-full"
        }`}
      />
      <Button
        color="transparent"
        size="sm"
        className={`flex-1 relative z-10 transition-all duration-300 rounded-md md:rounded-lg font-medium py-1.5 md:py-2 px-2.5 md:px-3 text-xs md:text-sm !h-8 md:!h-10 !min-h-0 ${
          value === "perDay"
            ? "text-white"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onPress={() => onChange("perDay")}
      >
        <span className="relative z-10 flex items-center justify-center gap-1 md:gap-1.5">
          <svg
            className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-300 ${
              value === "perDay" ? "text-white" : "text-gray-500"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          {t("pricingModel.perDay")}
        </span>
      </Button>

      <Button
        color="transparent"
        size="sm"
        className={`flex-1 relative z-10 transition-all duration-300 rounded-md md:rounded-lg font-medium py-1.5 md:py-2 px-2.5 md:px-3 text-xs md:text-sm !h-8 md:!h-10 !min-h-0 ${
          value === "packages"
            ? "text-white"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onPress={() => onChange("packages")}
      >
        <span className="relative z-10 flex items-center justify-center gap-1 md:gap-1.5">
          <svg
            className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-300 ${
              value === "packages" ? "text-white" : "text-gray-500"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          {t("pricingModel.packages")}
        </span>
      </Button>
    </div>

    {/* Optional description text */}
    <p className="text-[10px] md:text-xs text-gray-500 text-center mt-1.5 md:mt-2 max-w-xs md:max-w-sm mx-auto">
      {value === "perDay"
        ? t("pricingModel.perDayDescription")
        : t("pricingModel.packagesDescription")}
    </p>
  </div>
);

export const PackageItem = ({ pkg, onRemove, onUpdate, t, commission }) => {
  const commissionRate = (commission || 15) / 100;
  const earnings = pkg.price
    ? +(pkg.price * (1 - commissionRate)).toFixed(2)
    : "0.00";
  const unitOptions = [
    { key: "hours", label: t("packages.hours"), value: 1 / 24 },
    { key: "days", label: t("packages.days"), value: 1 },
    { key: "weeks", label: t("packages.weeks"), value: 7 },
    { key: "months", label: t("packages.months"), value: 30 },
  ];

  return (
    <div className="p-3 md:p-6 border rounded-lg md:rounded-xl bg-white relative shadow-sm">
      <div className="absolute -top-2.5 -end-2.5">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white rounded-full min-w-0 p-1 md:p-2 aspect-square shadow-lg"
          onPress={() => onRemove(pkg.id)}
          type="button"
          size="sm"
        >
          <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </Button>
      </div>

      {/* Simplified Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* 1. Combined Duration & Unit Input */}
        <Input
          isRequired
          label={t("packages.durationAndUnit")}
          type="number"
          value={pkg.duration}
          onChange={(e) => {
            onUpdate(
              pkg.id,
              "duration",
              e.target.value === "" ? "" : +e.target.value,
            );
            onUpdate(
              pkg.id,
              "daysNumber",
              e.target.value *
                unitOptions.find((opt) => opt.key === pkg.unit).value,
            );
          }}
          min={1}
          placeholder={t("packages.durationPlaceholder")}
          labelPlacement="outside"
          radius="sm"
          classNames={{
            label: "text-xs md:text-sm font-semibold text-gray-700",
            inputWrapper: "h-10 md:h-12",
          }}
          endContent={
            <div
              className="flex items-center w-20"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Select
                selectedKeys={[pkg.unit]}
                onChange={(e) => {
                  onUpdate(pkg.id, "unit", e.target.value);
                  onUpdate(
                    pkg.id,
                    "daysNumber",
                    pkg.duration *
                      unitOptions.find((opt) => opt.key === e.target.value)
                        .value,
                  );
                }}
                aria-label="Select rental unit"
                disallowEmptySelection
                classNames={{
                  base: "w-28 -me-2",
                  trigger:
                    "h-full border-none bg-transparent shadow-none justify-center px-0 min-h-8 md:min-h-10 text-xs md:text-sm",
                  popoverContent: "md:w-36 w-28 translate-x-4 md:translate-x-0",
                }}
              >
                {unitOptions.map((opt) => (
                  <SelectItem key={opt.key}>{opt.label}</SelectItem>
                ))}
              </Select>
            </div>
          }
        />

        {/* 2. Total Price Input */}
        <Input
          isRequired
          label={t("packages.totalPrice")}
          type="number"
          step={0.01}
          value={pkg.price}
          onChange={(e) =>
            onUpdate(
              pkg.id,
              "price",
              e.target.value === "" ? "" : +e.target.value,
            )
          }
          min={0}
          placeholder={t("packages.pricePlaceholder")}
          labelPlacement="outside"
          radius="sm"
          classNames={{
            label: "text-xs md:text-sm font-semibold text-gray-700",
            inputWrapper: "h-10 md:h-12",
          }}
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-xs md:text-sm">
                {t("sar")}
              </span>
            </div>
          }
        />

        {/* 3. Your Earnings Display */}
        <Input
          disabled
          isRequired
          label={t("packages.yourEarnings").replace("{commission}", commission)}
          value={earnings}
          labelPlacement="outside"
          radius="sm"
          classNames={{
            label: "text-xs md:text-sm font-semibold text-gray-700",
            inputWrapper: "h-10 md:h-12 !bg-[rgba(253,220,166,0.5)]",
          }}
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-xs md:text-sm">
                {t("sar")}
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

// --- IMPROVED COMPONENT: List of Packages ---
export const PackagesList = ({ packages, setRentData, t, commission }) => {
  const addPackage = () => {
    const newPackage = {
      id: new Date().getTime(),
      duration: "",
      unit: "days",
      price: "",
      daysNumber: 0,
    };
    setRentData((prev) => ({
      ...prev,
      packages: [...(prev.packages || []), newPackage],
    }));
  };

  const removePackage = (id) => {
    setRentData((prev) => ({
      ...prev,
      packages: prev.packages.filter((pkg) => pkg.id !== id),
    }));
  };

  const updatePackage = (id, field, value) => {
    setRentData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, [field]: value } : pkg,
      ),
    }));
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 p-3 md:p-6 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-xl border border-blue-100">
        <div>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">
            {t("packages.title")}
          </h3>
          <p className="text-gray-600 text-xs md:text-base">
            {t(
              "packages.subtitle",
              "Set fixed-price packages for specific durations.",
            )}
          </p>
        </div>
        <Button
          onPress={addPackage}
          className="bg-gradient-to-r from-[#F48A42] to-[#FF6B35] text-white rounded-xl px-3 md:px-6 py-2 md:py-3 text-xs md:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          startContent={
            <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" color="#fff" />
          }
        >
          {t("packages.addButton")}
        </Button>
      </div>

      {/* Packages List */}
      <div className="space-y-4 md:space-y-6">
        {packages && packages.length > 0 ? (
          packages.map((pkg, index) => (
            <div key={pkg.id} className="relative">
              <div className="absolute -top-2.5 z-10 text-white -start-2.5 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg text-xs md:text-sm font-bold">
                {index + 1}
              </div>
              <PackageItem
                pkg={pkg}
                onRemove={removePackage}
                onUpdate={updatePackage}
                t={t}
                commission={commission}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 md:py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Plus color="#9ca3af" className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <p className="text-gray-500 text-base md:text-lg mb-1 md:mb-2">
              {t("packages.empty.title")}
            </p>
            <p className="text-gray-400 text-xs md:text-sm">
              {t(
                "packages.empty.subtitle",
                'Click "Add Package" to create your first rental package',
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
