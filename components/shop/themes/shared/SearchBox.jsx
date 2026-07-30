"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchResultsDropdown from "@/components/shared/SearchResultsDropdown";
import { Search } from "@/components/ui/svgs/icons/SearchSvg";
import { Line } from "@/components/ui/svgs/icons/LineSvg";
import dynamic from "next/dynamic";

const Location = dynamic(() => import("@/components/home/Location"), {
  ssr: true,
});
const SelectCategory = dynamic(
  () => import("@/components/home/SelectCategory"),
  { ssr: true },
);

/**
 * Unified SearchBox component supporting multiple theme designs via the "theme" prop.
 * Styles supported: "classic" (pill with inline selects), "bold" (boxy with inline selects),
 * "minimal" (editorial underline style), "modern" (card with secondary selects row).
 */
export default function SearchBox({
  categoriesData,
  subCategoriesData,
  lang,
  translate,
  providerId,
  userId,
  shopSlug,
  theme = "classic",
  shop,
  brandColor: customBrandColor,
  className = "",
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
  const brandColor = shop?.brandColor || customBrandColor;

  const submitSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim().length >= 2) {
      trackFinalSearch({ term: searchValue, lang });
    }
    setShowResults(false);
    setSearchValue("");

    const params = new URLSearchParams();
    if (searchValue) params.set("name", searchValue);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSubCategory) params.set("subCategory", selectedSubCategory);
    if (selectedLocation) {
      params.set("lat", selectedLocation.lat);
      params.set("lng", selectedLocation.lng);
      params.set("location", selectedLocation.name);
    }
    // Only add providerId/userId when not in shop context
    if (!shopSlug) {
      if (providerId) params.set("providerId", providerId);
      if (userId) params.set("userId", userId);
    }

    router.push(
      `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}search/products${params.toString() ? `?${params}` : ""}`,
    );
  };

  // Determine styling based on theme config
  const isModern = theme === "modern";
  const isMinimal = theme === "minimal";
  const isBold = theme === "bold";
  const isClassic = theme === "classic";

  let formClass = "";
  let inputRowClass = "";
  let inputWrapperClass = "";
  let inputClass = "";

  if (isModern) {
    formClass = "relative w-full flex flex-col gap-2";
    inputRowClass =
      "flex items-center gap-2 bg-white border border-neutral-200/70 rounded-2xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300";
    inputWrapperClass =
      "!bg-transparent shadow-none px-0 border-none min-h-0 h-8";
    inputClass = "text-sm text-neutral-800 placeholder:text-neutral-400";
  } else if (isMinimal) {
    formClass = "relative w-full max-w-lg group";
    inputRowClass =
      "flex items-center gap-3 border-b-2 border-neutral-200 group-focus-within:border-neutral-900 transition-colors duration-300 pb-2";
    inputWrapperClass = "!bg-transparent shadow-none px-0 border-none";
    inputClass =
      "text-lg text-neutral-900 placeholder:text-neutral-300 font-light tracking-wide";
  } else if (isBold) {
    formClass =
      "relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2";
    inputRowClass = "flex-1 flex items-center gap-2";
    inputWrapperClass = "!bg-transparent shadow-none px-1 text-neutral-900";
    inputClass =
      "text-base md:text-lg text-neutral-900 placeholder:text-neutral-400";
  } else {
    // classic
    const defaultMargin = providerId || userId ? "mt-2 md:mt-10" : "my-10";
    const marginClass = className ? "" : defaultMargin;
    formClass =
      `${marginClass} flex mx-auto bg-white rounded-full max-w-full md:max-w-[95vw] w-full md:w-[820px] md:py-4 py-1 ps-4 pe-3 md:px-8 items-center gap-0.5 md:gap-2 justify-between md:shadow-2xl shadow relative ${className}`.trim();
    inputRowClass = "flex-1 flex items-center gap-2 text-start";
    inputWrapperClass = "!bg-transparent shadow-none px-2 text-darkNavy";
    inputClass = "md:text-lg text-[15px] text-darkNavy";
  }

  // Render Theme Search Icon
  const renderSearchIcon = () => {
    if (isClassic) {
      return <Search className="md:w-7 md:h-7 w-4.5 h-4.5" />;
    }
    if (isMinimal) {
      return (
        <svg
          className="w-5 h-5 text-neutral-300 group-focus-within:text-neutral-700 transition-colors shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
      );
    }
    return (
      <svg
        className="w-5 h-5 text-neutral-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
    );
  };

  // Render Theme Submit Button
  const renderSubmitButton = () => {
    let buttonClass = "";
    let defaultBg = "#111111";

    if (isClassic) {
      buttonClass =
        "md:py-3.5 md:px-8 px-4 py-2 rounded-full md:text-sm ms-2 text-white font-bold flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all shadow-md";
      defaultBg = "#0D092B";
    } else if (isMinimal) {
      buttonClass =
        "shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-white hover:opacity-90 active:scale-90 transition-all duration-200";
      defaultBg = "#111111";
    } else if (isModern) {
      buttonClass =
        "shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95";
      defaultBg = "#111111";
    } else {
      // bold
      buttonClass =
        "shrink-0 hover:opacity-90 active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary/30";
      defaultBg = "#F48A42";
    }

    return (
      <button
        type="submit"
        className={buttonClass}
        style={{ backgroundColor: brandColor || defaultBg }}
        aria-label={t("searchForRentalProducts")}
      >
        {isMinimal ? (
          <svg
            className={`w-4 h-4 text-white ${lang === "ar" ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        ) : (
          trans("ui.button.search")
        )}
      </button>
    );
  };

  // Render Theme Selectors (Category + Location)
  const renderSelectors = (isModernRow = false) => {
    if ((isModern && !isModernRow) || (!isModern && isModernRow)) {
      return null;
    }

    const wrapperClass = isModern
      ? "hidden md:flex items-center gap-2 ps-1"
      : isMinimal
        ? "hidden md:flex items-center gap-3"
        : isBold
          ? "hidden md:flex items-center gap-0 shrink-0"
          : "flex gap-0 items-center"; // classic

    const divider = isModern ? (
      <span className="w-px h-4 bg-neutral-200" />
    ) : isMinimal ? (
      <span className="w-px h-5 bg-neutral-200" />
    ) : isBold ? (
      <div className="w-px h-7 bg-neutral-200 mx-1" />
    ) : (
      <div className="hidden md:block -translate-x-1">
        <Line color={"#a1a1a1"} />
      </div>
    ); // classic

    return (
      <div className={wrapperClass}>
        {isClassic && divider}
        <SelectCategory
          categories={categoriesData}
          subCategories={subCategoriesData}
          onCategoryChange={setSelectedCategory}
          onSubCategoryChange={setSelectedSubCategory}
          translate={translate}
        />
        {!isClassic && divider}
        <Location
          lang={lang}
          onLocationSelect={setSelectedLocation}
          placeholder={t("location")}
        />
        {isClassic && renderSubmitButton()}
      </div>
    );
  };

  const formContent = (
    <>
      <meta
        itemProp="target"
        content={`${process.env.NEXT_PUBLIC_APP_URL}/${langPrefix}search/products?name={search_term_string}`}
      />

      {/* Input bar row */}
      <div className={inputRowClass}>
        {isClassic ? (
          <div aria-hidden="true">{renderSearchIcon()}</div>
        ) : (
          renderSearchIcon()
        )}

        <div className={isClassic ? "w-full text-start" : "flex-1 min-w-0"}>
          <Input
            classNames={{
              inputWrapper: inputWrapperClass,
              input: inputClass,
            }}
            placeholder={t("searchPlaceholder")}
            value={searchValue}
            type="text"
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            aria-label={t("searchForProducts")}
            itemProp="query-input"
            name="search"
            autoComplete="off"
          />
        </div>

        {/* Inline Category & Location selectors for minimal and bold themes */}
        {(isMinimal || isBold) && renderSelectors(false)}

        {/* Search button on the input row for modern, minimal, and bold themes */}
        {!isClassic && renderSubmitButton()}
      </div>

      {/* Modern theme selector row rendered outside the input card */}
      {isModern && renderSelectors(true)}

      {/* Classic theme selectors + button inline row */}
      {isClassic && renderSelectors(false)}

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
        shopSlug={shopSlug}
      />
    </>
  );

  return (
    <form
      ref={searchRef}
      onSubmit={submitSearch}
      className={formClass}
      role="search"
      aria-label={t("searchForRentalProducts")}
      itemScope
      itemType="https://schema.org/SearchAction"
      onClick={() => setShowResults(true)}
    >
      {formContent}
    </form>
  );
}
