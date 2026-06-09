"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchResultsDropdown from "../shared/SearchResultsDropdown";
import { Search } from "../ui/svgs/icons/SearchSvg";
import CustomDrawer from "../ui/CustomDrawer";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";

export default function HeroSearchBox({
  categoriesData = [],
  subCategoriesData = {},
  lang,
  translate,
  providerId,
  userId,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const t = (key) => trans(`home.search.${key}`);

  const {
    searchValue,
    setSearchValue,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    selectedLocation,
    setSelectedLocation,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    searchRef,
    queryParams,
    trackFinalSearch,
  } = useProductSearch({ lang, providerId, userId, source: "hero" });

  const router = useRouter();

  // Unified active dropdown manager: "category" | "subcategory" | "location" | null
  const [activeDropdown, setActiveDropdown] = useState(null);

  const {
    isOpen: isMobileSheetOpen,
    onOpen: onMobileSheetOpen,
    onOpenChange: onMobileSheetOpenChange,
  } = useDrawerWithHistory();

  // Geocode location input suggestions
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Sync geocode location input state when a location is selected programmatically
  useEffect(() => {
    if (selectedLocation?.name) {
      setLocationInput(selectedLocation.name);
    }
  }, [selectedLocation]);

  // Fetch location suggestions
  const fetchLocationSuggestions = useCallback(
    async (input) => {
      if (!input) {
        setLocationSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/geocode/autocomplete?input=${encodeURIComponent(input)}&lang=${lang}`,
        );
        const data = await response.json();
        if (data.predictions) {
          setLocationSuggestions(data.predictions);
        }
      } catch (error) {
        console.error("Error fetching geocode suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [lang],
  );

  // Handle location geocode autocomplete query changes
  useEffect(() => {
    if (activeDropdown !== "location") return;
    const handler = setTimeout(
      () => fetchLocationSuggestions(locationInput),
      300,
    );
    return () => clearTimeout(handler);
  }, [locationInput, fetchLocationSuggestions, activeDropdown]);

  // Resolve geocoded location details and select it
  const handleLocationSelect = async (placeDescription) => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/geocode/search?address=${encodeURIComponent(placeDescription)}&lang=${lang}`,
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const place = data.results[0];
        const locationData = {
          name: placeDescription,
          lat: place.geometry?.location.lat,
          lng: place.geometry?.location.lng,
        };
        setSelectedLocation(locationData);
        setLocationInput(placeDescription);
        setActiveDropdown(null);
      }
    } catch (error) {
      console.error("Error retrieving place details:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoadingSuggestions(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `/api/geocode/reverse?lat=${latitude}&lng=${longitude}&lang=${lang}`,
            );
            const data = await response.json();
            if (data.status === "OK" && data.results.length > 0) {
              let cityName = data.results[0].formatted_address;
              if (data.results[0].address_components) {
                const cityComponent = data.results[0].address_components.find(
                  (component) =>
                    component.types.includes("administrative_area_level_2"),
                );
                if (cityComponent) {
                  cityName = cityComponent.long_name;
                }
              }
              const locationData = {
                name: cityName,
                lat: latitude,
                lng: longitude,
              };
              setSelectedLocation(locationData);
              setLocationInput(cityName);
              setActiveDropdown(null);
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          } finally {
            setLoadingSuggestions(false);
          }
        },
        (error) => {
          console.error("GPS retrieval error:", error);
          setLoadingSuggestions(false);
        },
      );
    }
  };

  // Handle outside clicks to close dropdown menus
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.closest('[role="dialog"]') || e.target.closest(".fixed")) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchValue.trim().length >= 2) {
      trackFinalSearch({ term: searchValue, lang });
    }
    setShowResults(false);

    const params = new URLSearchParams();
    if (searchValue) params.set("name", searchValue);
    if (selectedLocation) {
      params.set("lat", selectedLocation.lat);
      params.set("lng", selectedLocation.lng);
      params.set("location", selectedLocation.name);
    }
    if (providerId) params.set("providerId", providerId);
    if (userId) params.set("userId", userId);

    let basePath;
    if (selectedCategory && selectedSubCategory) {
      basePath = `/${langPrefix}${selectedCategory}/${selectedSubCategory}/products`;
    } else if (selectedCategory) {
      basePath = `/${langPrefix}${selectedCategory}/products`;
    } else {
      basePath = `/${langPrefix}search/products`;
    }

    const queryStr = params.toString();
    const finalUrl = queryStr ? `${basePath}?${queryStr}` : basePath;
    router.push(finalUrl);
  };

  // Get selected category label
  const selectedCategoryObj = categoriesData.find(
    (c) => c.key === selectedCategory,
  );
  const selectedCategoryLabel = selectedCategoryObj
    ? selectedCategoryObj.label
    : "";

  // Get selected subcategory label
  const subCategoriesList = subCategoriesData[selectedCategory] || [];
  const selectedSubCategoryObj = subCategoriesList.find(
    (s) => s.key === selectedSubCategory,
  );
  const selectedSubCategoryLabel = selectedSubCategoryObj
    ? selectedSubCategoryObj.label
    : "";

  return (
    <div ref={dropdownRef} className="w-full max-w-6xl px-2 md:px-0">
      {/* 1. Desktop Search Pill (md & up) */}
      <form
        onSubmit={handleFormSubmit}
        className="hidden md:flex items-center bg-white rounded-full border border-gray-150 shadow-2xl w-full py-1 px-4 gap-0 relative select-none hover:border-gray-300 transition-all duration-300"
      >
        {/* Column 1: Search Keywords */}
        <div
          onClick={() => {
            setActiveDropdown(null);
            setShowResults(true);
          }}
          className="md:min-w-32 lg:min-w-48 flex-1 flex flex-col justify-center px-6 py-3 cursor-pointer text-start h-full"
        >
          <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {lang === "ar" ? "ابحث عن" : "Search for"}
          </span>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="bg-transparent border-none outline-none text-darkNavy font-bold text-[15px] placeholder-gray-300 w-full mt-0.5 focus:ring-0 p-0"
            autoComplete="off"
          />

          {/* Keyword suggestion results dropdown */}
          <div className="absolute top-full start-4 w-[97.5%] z-50 mt-2">
            <SearchResultsDropdown
              showResults={showResults}
              isSearching={isSearching}
              searchResults={searchResults}
              searchValue={searchValue}
              selectedCategory={selectedCategory}
              selectedLocation={selectedLocation}
              lang={lang}
              langPrefix={langPrefix}
              trans={trans}
              t={t}
              onResultClick={() => setShowResults(false)}
              trackFinalSearch={trackFinalSearch}
              providerId={providerId}
              userId={userId}
            />
          </div>
        </div>

        <div className="w-[1px] h-8 bg-gray-200" />

        {/* Column 2: Category Selector */}
        <div
          onClick={() => {
            setShowResults(false);
            setActiveDropdown(
              activeDropdown === "category" ? null : "category",
            );
          }}
          className="w-52 flex flex-col justify-center px-6 py-2 cursor-pointer text-start h-full relative"
        >
          <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {t("category")}
          </span>
          <span className="text-[14px] font-bold text-darkNavy mt-0.5 truncate flex items-center justify-between gap-2">
            {selectedCategoryLabel ||
              (lang === "ar" ? "كل الأقسام" : "All Categories")}
            <svg
              className="w-3 h-3 text-[#5A2D9C] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>

          {/* Category Dropdown Popup */}
          {activeDropdown === "category" && (
            <div className="absolute top-full start-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-150 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto flex flex-col">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory("");
                    setSelectedSubCategory("");
                    setActiveDropdown("subcategory");
                  }}
                  className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-start text-sm font-semibold text-darkNavy transition-colors flex items-center gap-2"
                >
                  {!selectedCategory && (
                    <span className="-ms-3 w-[7px] h-[7px] rounded-full bg-secondary" />
                  )}
                  {lang === "ar" ? "كل الأقسام" : "All Categories"}
                </button>
                {categoriesData.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(cat.key);
                      // Reset subcategory on parent category change
                      const firstSubCat =
                        subCategoriesData[cat.key]?.[0]?.key || "";
                      setSelectedSubCategory(firstSubCat);
                      setActiveDropdown("subcategory");
                    }}
                    className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-start text-sm font-semibold text-darkNavy transition-colors flex items-center gap-2"
                  >
                    {selectedCategory === cat.key && (
                      <span className="-ms-3 w-[7px] h-[7px] rounded-full bg-secondary" />
                    )}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-8 bg-gray-200" />

        {/* Column 3: Subcategory Selector */}
        <div
          onClick={() => {
            setShowResults(false);
            if (!selectedCategory) return;
            setActiveDropdown(
              activeDropdown === "subcategory" ? null : "subcategory",
            );
          }}
          className={`w-52 flex flex-col justify-center px-6 py-2 cursor-pointer text-start h-full relative ${
            !selectedCategory ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {t("supCategory")}
          </span>
          <span className="text-[14px] font-bold text-darkNavy mt-0.5 truncate flex items-center justify-between gap-2">
            {selectedSubCategoryLabel ||
              (lang === "ar" ? "كل التصنيفات" : "All Subcategories")}
            <svg
              className="w-3 h-3 text-[#5A2D9C] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>

          {/* Subcategory Dropdown Popup */}
          {activeDropdown === "subcategory" && selectedCategory && (
            <div className="absolute top-full start-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-150 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto flex flex-col">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubCategory("");
                    setActiveDropdown("location");
                  }}
                  className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-start text-sm font-semibold text-darkNavy transition-colors flex items-center gap-2"
                >
                  {!selectedSubCategory && (
                    <span className="-ms-3 w-[7px] h-[7px] rounded-full bg-secondary" />
                  )}
                  {lang === "ar" ? "كل التصنيفات" : "All Subcategories"}
                </button>
                {subCategoriesList.map((sub) => (
                  <button
                    key={sub.key}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubCategory(sub.key);
                      setActiveDropdown("location");
                    }}
                    className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-start text-sm font-semibold text-darkNavy transition-colors flex items-center gap-2"
                  >
                    {selectedSubCategory === sub.key && (
                      <span className="-ms-3 w-[7px] h-[7px] rounded-full bg-secondary" />
                    )}
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-8 bg-gray-200" />

        {/* Column 4: Location Autocomplete */}
        <div
          onClick={() => {
            setShowResults(false);
            setActiveDropdown(
              activeDropdown === "location" ? null : "location",
            );
          }}
          className="w-52 flex flex-col justify-center px-6 py-2 cursor-pointer text-start h-full relative"
        >
          <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {t("location")}
          </span>
          <span className="text-[14px] font-bold text-darkNavy mt-0.5 truncate flex items-center justify-between gap-2">
            {selectedLocation?.name ||
              (lang === "ar" ? "اختر الموقع" : "Choose City")}
            <svg
              className="w-3 h-3 text-[#5A2D9C] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>

          {/* Location Autocomplete Dropdown Popup */}
          {activeDropdown === "location" && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full end-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-150 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex flex-col gap-3">
                {/* Search input field */}
                <input
                  type="text"
                  placeholder={t("location")}
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-white border border-gray-150 outline-none focus:ring-2 focus:ring-secondary/20 text-darkNavy"
                />

                {/* GPS trigger button */}
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="flex items-center gap-2 text-xs font-bold text-secondary hover:text-[#5A2D9C] transition-colors py-1.5 self-start"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {lang === "ar"
                    ? "تحديد موقعي الحالي"
                    : "Use current location"}
                </button>

                {/* Geocode Autocomplete predictions list */}
                {loadingSuggestions ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : locationSuggestions.length > 0 ? (
                  <div className="flex flex-col border-t border-gray-50 pt-2 max-h-48 overflow-y-auto">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.description}
                        type="button"
                        onClick={() =>
                          handleLocationSelect(suggestion.description)
                        }
                        className="px-2 py-2 text-start text-xs font-semibold text-darkNavy hover:bg-gray-50 rounded-lg transition-colors truncate"
                      >
                        {suggestion.description}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Primary Search Trigger Button */}
        <button
          type="submit"
          className="h-12 bg-darkNavy text-white rounded-full px-12 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-md flex-shrink-0 cursor-pointer ms-2 hover:shadow-lg font-bold text-sm md:text-base"
          aria-label={t("searchForRentalProducts")}
        >
          <Search className="w-4 h-4" color="#fff" />
          <span>{trans("ui.button.search")}</span>
        </button>
      </form>

      {/* 2. Mobile – compact single row + bottom sheet */}
      <div className="md:hidden w-full relative">
        {/* Compact row */}
        <div className="flex items-center gap-2 bg-white rounded-full border border-gray-150 shadow-2xl px-4 py-2.5 select-none">
          {/* Search input */}
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              setShowResults(true);
              setActiveDropdown(null);
            }}
            className="flex-1 bg-transparent border-none outline-none text-darkNavy font-bold text-xs placeholder-gray-300 focus:ring-0 p-0 min-w-0"
            autoComplete="off"
          />

          {/* Active filter dot indicator */}
          {(selectedCategory || selectedSubCategory || selectedLocation) && (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* Filter button */}
          <button
            type="button"
            onClick={onMobileSheetOpen}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 px-2.5 py-1.5 rounded-full border border-gray-100/80 transition-all duration-200 active:scale-95 flex-shrink-0"
          >
            <svg
              className="w-3.5 h-3.5 text-primary/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="text-[11px] font-bold leading-none">
              {lang === "ar" ? "الفلاتر" : "Filters"}
            </span>
          </button>

          {/* Search trigger button */}
          <button
            type="button"
            onClick={handleFormSubmit}
            className="flex-shrink-0 w-7 h-7 bg-primary/95 text-white rounded-full flex items-center justify-center active:scale-95 hover:bg-opacity-95 transition-all duration-200 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" color="#fff" strokeWidth={3} />
          </button>
        </div>

        {/* Search results dropdown */}
        {showResults && searchValue && (
          <div className="absolute top-full start-0 end-0 z-50 mt-2">
            <SearchResultsDropdown
              showResults={showResults}
              isSearching={isSearching}
              searchResults={searchResults}
              searchValue={searchValue}
              selectedCategory={selectedCategory}
              selectedLocation={selectedLocation}
              lang={lang}
              langPrefix={langPrefix}
              trans={trans}
              t={t}
              onResultClick={() => setShowResults(false)}
              trackFinalSearch={trackFinalSearch}
              providerId={providerId}
              userId={userId}
            />
          </div>
        )}

        {/* Bottom sheet panel */}
        <CustomDrawer
          isOpen={isMobileSheetOpen}
          onClose={() => onMobileSheetOpenChange(false)}
          hideCloseButton
          className="max-h-[85vh]"
          showGrabHandle={true}
        >
          {/* Sheet header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 select-none">
            <h3 className="text-base font-bold text-darkNavy">
              {lang === "ar" ? "تصفية البحث" : "Search Filters"}
            </h3>
            {(selectedCategory || selectedSubCategory || selectedLocation) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSubCategory("");
                  setSelectedLocation(null);
                  setLocationInput("");
                }}
                className="text-xs text-red-400 font-semibold"
              >
                {lang === "ar" ? "مسح الكل" : "Clear all"}
              </button>
            )}
          </div>

          <div className="py-4 px-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto select-none">
            {/* Search input */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {lang === "ar" ? "ابحث عن" : "Search for"}
              </span>
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border border-gray-150">
                <Search
                  className="w-4 h-4 text-gray-400"
                  color="currentColor"
                />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  className="w-full bg-transparent border-none outline-none text-darkNavy font-bold text-sm placeholder-gray-300 focus:ring-0 p-0"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t("category")}
              </span>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCategory(val);
                    const firstSubCat = subCategoriesData[val]?.[0]?.key || "";
                    setSelectedSubCategory(firstSubCat);
                  }}
                  className="w-full bg-white border border-gray-150 rounded-2xl px-4 py-3 text-sm font-semibold text-darkNavy outline-none focus:border-[#5A2D9C] focus:ring-1 focus:ring-[#5A2D9C]/10 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235A2D9C' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition:
                      lang === "ar" ? "left 1rem center" : "right 1rem center",
                    backgroundSize: "1em",
                    paddingLeft: lang === "ar" ? "2.5rem" : "1rem",
                    paddingRight: lang === "ar" ? "1rem" : "2.5rem",
                  }}
                >
                  <option value="">
                    {lang === "ar" ? "كل الأقسام" : "All Categories"}
                  </option>
                  {categoriesData.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategory */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t("supCategory")}
              </span>
              <div className="relative">
                <select
                  value={selectedSubCategory}
                  disabled={!selectedCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className={`w-full bg-white border border-gray-150 rounded-2xl px-4 py-3 text-sm font-semibold text-darkNavy outline-none focus:border-[#5A2D9C] focus:ring-1 focus:ring-[#5A2D9C]/10 appearance-none ${
                    !selectedCategory ? "opacity-50" : ""
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235A2D9C' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition:
                      lang === "ar" ? "left 1rem center" : "right 1rem center",
                    backgroundSize: "1em",
                    paddingLeft: lang === "ar" ? "2.5rem" : "1rem",
                    paddingRight: lang === "ar" ? "1rem" : "2.5rem",
                  }}
                >
                  <option value="">
                    {lang === "ar" ? "كل التصنيفات" : "All Subcategories"}
                  </option>
                  {subCategoriesList.map((sub) => (
                    <option key={sub.key} value={sub.key}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t("location")}
              </span>
              <div className="relative flex items-center bg-white border border-gray-150 rounded-2xl px-4 py-3 gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={
                    lang === "ar" ? "أختر المدينة..." : "Choose city..."
                  }
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                  }}
                  className="w-full flex-1 bg-transparent border-none outline-none text-darkNavy font-semibold text-sm placeholder-gray-300 focus:ring-0 p-0"
                />
                {locationInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocationInput("");
                      setLocationSuggestions([]);
                      setSelectedLocation(null);
                    }}
                    className="text-gray-300 hover:text-gray-500"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* GPS button */}
              <button
                type="button"
                onClick={() => {
                  handleGetCurrentLocation();
                }}
                className="flex items-center gap-1 text-xs font-bold text-secondary pt-2 pb-1 self-start"
              >
                <svg
                  className="w-4 h-4 text-secondary flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {lang === "ar" ? "تحديد موقعي الحالي" : "Use current location"}
              </button>

              {/* Location suggestions */}
              {loadingSuggestions ? (
                <div className="flex justify-center py-2">
                  <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : locationSuggestions.length > 0 ? (
                <div className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden">
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.description}
                      type="button"
                      onClick={() => {
                        handleLocationSelect(suggestion.description);
                        setLocationSuggestions([]);
                      }}
                      className="px-4 py-3 text-start text-sm font-semibold text-darkNavy hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 truncate"
                    >
                      {suggestion.description}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Search CTA */}
            <button
              type="button"
              onClick={() => {
                onMobileSheetOpenChange(false);
                handleFormSubmit();
              }}
              className="w-full bg-darkNavy text-white font-bold mt-2 mb-4 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
            >
              <Search className="w-[15px] h-[15px]" color="#fff" />
              {trans("ui.button.search")}
            </button>
          </div>
        </CustomDrawer>
      </div>
    </div>
  );
}
