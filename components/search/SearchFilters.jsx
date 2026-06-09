"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchName from "@/components/search/SearchName";
import SelectCategory from "@/components/search/SelectCategory";
import Location from "@/components/search/Location";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { sendGTMEvent } from "@next/third-parties/google";
import { Locations } from "../ui/svgs/Dashboard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SearchFilters({
  lang,
  translate,
  queryParams,
  queryString,
  categories,
  subCategories,
  langPrefix,
  currentPage = "products",
  map = false,
  categoryPage = null,
  subCategoryPage = null,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (text) => trans(`search.${text}`);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    try {
      sendGTMEvent({
        event: "filters_toggle",
        collapsed: nextState,
        location: "search_filters",
        view: currentPage,
      });
    } catch (_) {}
  };

  // Helper function to get current filters
  const getCurrentFilters = () => {
    const filters = [];

    if (queryParams.name) {
      filters.push({
        type: "searchTerm",
        label: t("searchTerm"),
        value: queryParams.name,
        param: "name",
      });
    }

    if (queryParams.location) {
      filters.push({
        type: "location",
        label: t("location"),
        value: queryParams.location,
        param: "location",
      });
    }

    if (queryParams.category) {
      // Find category name from categories data
      const categoryData = categories?.find(
        (cat) => cat.key === queryParams.category,
      );
      filters.push({
        type: "category",
        label: t("category"),
        value: categoryData?.label || queryParams.category,
        param: "category",
      });
    }

    if (queryParams.subCategory) {
      // Find subcategory name from subCategories data
      // subCategories is an object with category keys, each containing an array of subcategories
      let subCategoryData = null;
      if (subCategories && queryParams.category) {
        const categorySubCategories = subCategories[queryParams.category];
        if (categorySubCategories && Array.isArray(categorySubCategories)) {
          subCategoryData = categorySubCategories.find(
            (subCat) => subCat.key === queryParams.subCategory,
          );
        }
      }
      filters.push({
        type: "subCategory",
        label: t("subCategory"),
        value: subCategoryData?.label || queryParams.subCategory,
        param: "subCategory",
      });
    }

    return filters;
  };

  // Helper function to remove a filter
  const removeFilter = (paramToRemove) => {
    const newParams = new URLSearchParams(queryString.toString());
    newParams.delete(paramToRemove);

    // If removing category, also remove subCategory
    if (paramToRemove === "category") {
      newParams.delete("subCategory");
      // If we are on a category or subcategory page and removing category, go to search page
      if (categoryPage || subCategoryPage) {
        newParams.delete("category");
        router.push(
          `/${langPrefix}search/${currentPage}?${newParams.toString()}`,
          { scroll: false },
        );
        return;
      }
    }

    // Determine the category and subcategory to use for the path
    const activeCategory = categoryPage || newParams.get("category");
    const activeSubCategory = subCategoryPage || newParams.get("subCategory");

    // If we have them, remove them from query params for the URL structure
    if (activeCategory) newParams.delete("category");
    if (activeSubCategory) newParams.delete("subCategory");

    const newQueryString = newParams.toString();

    // Specific base URL for category/subcategory page
    let baseUrl;
    if (activeCategory && activeSubCategory) {
      baseUrl = `/${langPrefix}${activeCategory}/${activeSubCategory}/${currentPage}`;
    } else if (activeCategory) {
      baseUrl = `/${langPrefix}${activeCategory}/${currentPage}`;
    } else {
      baseUrl = `/${langPrefix}search/${currentPage}`;
    }

    const newUrl = newQueryString ? `${baseUrl}?${newQueryString}` : baseUrl;

    try {
      sendGTMEvent({
        event: "filter_remove",
        filter_param: paramToRemove,
        location: "search_filters",
        view: currentPage,
      });
    } catch (_) {}

    router.push(newUrl, { scroll: false });
  };

  // Helper function to clear all filters
  const clearAllFilters = () => {
    try {
      sendGTMEvent({
        event: "filters_clear",
        location: "search_filters",
        view: currentPage,
      });
    } catch (_) {}

    const params = new URLSearchParams();
    if (queryParams.providerId) {
      params.set("providerId", queryParams.providerId);
    }
    const qs = params.toString();

    router.push(`/${langPrefix}search/${currentPage}${qs ? "?" + qs : ""}`, {
      scroll: false,
    });
  };

  const currentFilters = getCurrentFilters();

  return (
    <div className="px-3 sm:px-4">
      {/* Enhanced Header Section */}
      <header className="flex justify-between items-center flex-wrap gap-2 max-w-screen-2xl mx-auto pt-6 pb-2 sm:pt-8 md:pb-6 lg:pt-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            {(() => {
              const activeCategory = categoryPage;
              const activeSubCategory = subCategoryPage;
              let label = "";

              if (activeSubCategory && subCategories && activeCategory) {
                const subCat = subCategories[activeCategory]?.find(
                  (s) => s.key === activeSubCategory,
                );
                if (subCat) label = subCat.label;
              }
              if (!label && activeCategory && categories) {
                const cat = categories.find((c) => c.key === activeCategory);
                if (cat) label = cat.label;
              }

              if (label) {
                const rentTitle = trans("product.page.rentCategory");
                return rentTitle.replace("{categoryName}", label);
              }

              return trans("search.seo.page.h1");
            })()}
            {currentPage === "map" && ` - ${t("showMap")}`}
          </h1>
          {/* Breadcrumb */}
          <div className="mb-2">
            <Breadcrumbs
              lang={lang}
              items={(() => {
                const items = [
                  {
                    href: `/${langPrefix}`,
                    text: trans("search.seo.schema.breadcrumb.home"),
                  },
                ];

                const searchItem = {
                  href: `/${langPrefix}search/products`,
                  text: trans("search.seo.schema.breadcrumb.search"),
                };

                // If purely search page without category params/props
                if (
                  !categoryPage &&
                  !subCategoryPage &&
                  !queryParams?.category &&
                  !queryParams?.subCategory &&
                  currentPage !== "map"
                ) {
                  items.push({
                    text: trans("search.seo.schema.breadcrumb.search"),
                  });
                  return items;
                }

                items.push(searchItem);

                const activeCategory = categoryPage || queryParams?.category;
                const activeSubCategory =
                  subCategoryPage || queryParams?.subCategory;

                if (activeCategory) {
                  let catLabel = activeCategory;
                  const cat = categories?.find((c) => c.key === activeCategory);
                  if (cat) catLabel = cat.label;

                  if (activeSubCategory || currentPage === "map") {
                    items.push({
                      href: `/${langPrefix}${activeCategory}/products`,
                      text: catLabel,
                    });
                  } else {
                    items.push({ text: catLabel });
                    return items;
                  }
                }

                if (activeSubCategory) {
                  let subCatLabel = activeSubCategory;
                  if (
                    categories &&
                    activeCategory &&
                    subCategories?.[activeCategory]
                  ) {
                    const sub = subCategories[activeCategory].find(
                      (s) => s.key === activeSubCategory,
                    );
                    if (sub) subCatLabel = sub.label;
                  }

                  if (currentPage === "map") {
                    items.push({
                      href: `/${langPrefix}${activeCategory}/${activeSubCategory}/products`,
                      text: subCatLabel,
                    });
                  } else {
                    items.push({ text: subCatLabel });
                    return items;
                  }
                }

                if (currentPage === "map") {
                  items.push({ text: t("showMap") });
                }

                return items;
              })()}
              textClassName="text-sm font-medium"
            />
          </div>
        </div>
        <div className="hidden md:flex flex-wrap gap-1 mx-auto w-full md:w-auto md:mx-0 bg-[#F6F6F6] rounded-full md:p-2 p-[6px] ms-auto">
          <Button
            as={Link}
            href={`${(() => {
              const p = new URLSearchParams(queryString.toString());
              const cat = categoryPage || p.get("category");
              const subCat = subCategoryPage || p.get("subCategory");
              if (cat) p.delete("category");
              if (subCat) p.delete("subCategory");
              const qs = p.toString();
              let path;
              if (cat && subCat) path = `${cat}/${subCat}/products`;
              else if (cat) path = `${cat}/products`;
              else path = "search/products";
              return `/${langPrefix}${path}${qs ? "?" + qs : ""}`;
            })()}`}
            className="gap-1 flex-1 h-11 md:h-12 text-[15px] md:text-base"
            variant={currentPage === "products" ? "shadow" : ""}
            scroll={false}
            startContent={
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="currentColor"
                viewBox="0 0 20 16"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                />
              </svg>
            }
          >
            {t("showList")}
          </Button>
          <Button
            as={Link}
            href={`${(() => {
              const p = new URLSearchParams(queryString.toString());
              if (categoryPage && !p.has("category")) {
                p.set("category", categoryPage);
              }
              const qs = p.toString();
              return `/${langPrefix}search/map${qs ? "?" + qs : ""}`;
            })()}`}
            variant={currentPage === "map" ? "shadow" : ""}
            color="transparent"
            scroll={false}
            startContent={
              <Locations color={currentPage === "map" ? "white" : "#f48a42"} />
            }
            className="gap-2 flex-1 h-11 md:h-12 text-[15px] md:text-base"
          >
            {t("showMap")}
          </Button>
        </div>
      </header>
      {/* Enhanced Filter Section */}
      <div
        className={`${
          !isCollapsed ? "shadow-lg" : ""
        } max-w-screen-2xl mx-auto bg-white rounded-xl border border-gray-100 mb-6 md:mb-3 overflow-hidden`}
      >
        <div
          className={`${
            !isCollapsed ? "px-4 pt-2" : ""
          } md:bg-gradient-to-r from-orange-50 to-amber-50 md:px-8 md:py-4 md:border-b md:border-gray-100`}
        >
          <div className="flex items-center justify-between">
            <div className="w-full md:hidden">
              <SearchName
                isCollapsed={isCollapsed}
                lang={lang}
                translate={translate}
                queryParams={queryParams}
                map={map}
                categoryPage={categoryPage}
                subCategoryPage={subCategoryPage}
                endContent={
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    className="md:hidden p-1 rounded-lg"
                    aria-label={isCollapsed ? "Show filters" : "Hide filters"}
                  >
                    <svg width="20" height="17" fill="none" viewBox="0 0 20 17">
                      <path
                        fill={isCollapsed ? "#f48a42" : "#B3B3B3"}
                        fillRule="evenodd"
                        d="M13 7a3.5 3.5 0 0 0 3.355-2.5H19a1 1 0 0 0 0-2.001h-2.645a3.503 3.503 0 0 0-6.71 0H1a1 1 0 0 0 0 2h8.645A3.5 3.5 0 0 0 13 7M1 12.5a1 1 0 0 0 0 2.001h2.145a3.503 3.503 0 0 0 6.71 0H19a1 1 0 0 0 0-2H9.855a3.503 3.503 0 0 0-6.71 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                }
              />
            </div>
            <h2 className="hidden md:flex text-lg sm:text-xl font-semibold text-gray-800 items-center gap-2">
              <svg
                className="w-5 h-5 text-[#f48a42]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              {t("filterProducts")}
            </h2>
          </div>
        </div>

        {/* Collapsible Filter Content */}
        <div
          className={`transition-all duration-100 ease-in-out overflow-hidden ${
            isCollapsed
              ? "max-h-0 md:max-h-none"
              : "max-h-[1000px] md:max-h-none"
          }`}
        >
          <div className="p-4 sm:p-6 md:pb-4">
            <div className="lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
              <div className="w-full md:block hidden">
                <SearchName
                  lang={lang}
                  translate={translate}
                  queryParams={queryParams}
                  map={map}
                  categoryPage={categoryPage}
                  subCategoryPage={subCategoryPage}
                />
              </div>
              <div className="w-full mb-4 md:mb-0">
                <Location
                  lang={lang}
                  queryParams={queryParams}
                  translate={translate}
                  map={map}
                  categoryPage={categoryPage}
                  subCategoryPage={subCategoryPage}
                />
              </div>
              <div className="w-full lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <SelectCategory
                  queryParams={queryParams}
                  lang={lang}
                  translate={translate}
                  categories={categories}
                  subCategories={subCategories}
                  map={map}
                  categoryPage={categoryPage}
                  subCategoryPage={subCategoryPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Filters Display - Minimalist Design */}
      {currentFilters.length > 0 && (
        <div className="hidden md:block max-w-screen-2xl mx-auto mb-4 md:mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">
              {t("currentFilters")}:
            </span>

            {currentFilters.map((filter, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm transition-colors duration-200"
              >
                <span className="text-gray-700">{filter.value}</span>
                <button
                  onClick={() => removeFilter(filter.param)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label={`Remove ${filter.label} filter`}
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
              </div>
            ))}

            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors duration-200"
            >
              {t("clearAllFilters")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
