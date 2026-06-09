"use client";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { X } from "../ui/svgs/icons/XSvg";;
import { sendGTMEvent } from "@next/third-parties/google";

export default function SelectCategory({
  categories,
  queryParams,
  subCategories,
  translate,
  lang,
  map,
  categoryPage,
  subCategoryPage,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`search.${text}`);

  const langPrefix = lang === "ar" ? "" : "en/";
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(
    queryParams?.category || "",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    queryParams?.subCategory || "",
  );

  useEffect(() => {
    setIsLoading(false);
    !!queryParams?.category &&
      setSelectedCategory(queryParams?.category || undefined);
    !!queryParams?.subCategory &&
      setSelectedSubCategory(queryParams?.subCategory || undefined);
  }, [queryParams]);

  const [isLoading, setIsLoading] = useState(false);

  const updateSearchParams = (category, subcategory) => {
    setIsLoading(true);
    const params = new URLSearchParams(window.location.search);

    // We don't need category in params for the new route structure
    if (params.has("category")) params.delete("category");

    if (subcategory) params.set("subCategory", subcategory);
    else params.delete("subCategory");

    // Construct the base URL based on whether we are on map view or list view
    let basePath;
    if (map) {
      basePath = `/${langPrefix}search/map`;
      // If we are on map view, we keep category and subcategory in params
      if (category) params.set("category", category);
      if (subcategory) params.set("subCategory", subcategory);
      else params.delete("subCategory");
    } else {
      // For list view, use nested dynamic routes
      if (category && subcategory) {
        basePath = `/${langPrefix}${category}/${subcategory}/products`;
        params.delete("subCategory"); // Remove from query since it's in the path
      } else if (category) {
        basePath = `/${langPrefix}${category}/products`;
        params.delete("subCategory");
      } else {
        basePath = `/${langPrefix}search/products`;
      }
    }
    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const changeCategory = ({ target: { value } }) => {
    setSelectedCategory(value);
    setSelectedSubCategory("");
    updateSearchParams(value, "");
    try {
      sendGTMEvent({
        event: "category_select",
        category: value || "all",
        location: "search_filters",
        view: map ? "map" : "products",
        language: lang,
      });
    } catch (_) {}
  };

  const changeSubCategory = ({ target: { value } }) => {
    setSelectedSubCategory(value);
    updateSearchParams(selectedCategory, value);
    try {
      sendGTMEvent({
        event: "subcategory_select",
        category: selectedCategory || "all",
        sub_category: value || "all",
        location: "search_filters",
        view: map ? "map" : "products",
        language: lang,
      });
    } catch (_) {}
  };

  return (
    <>
      {/* Category Select */}
      <div className="w-full">
        <div className="mb-3">
          <label className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-[#f48a42]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {t("category")}
          </label>
        </div>

        <div className="relative">
          <Select
            aria-label={t("category")}
            scrollShadowProps={{ hideScrollBar: false }}
            classNames={{
              base: "w-full",
              value: "text-sm sm:text-base",
              trigger: [
                "h-12 sm:h-13 lg:h-14",
                "border-2 border-gray-200",
                "hover:border-[#f48a42]",
                "focus:border-[#f48a42]",
                "data-[focus=true]:border-[#f48a42]",
                "transition-all duration-200",
                "bg-white",
                "shadow-sm hover:shadow-md",
                "data-[focus=true]:shadow-lg",
                "data-[focus=true]:shadow-orange-100",
                "rounded-lg",
              ],
              listboxWrapper: "max-h-[250px] shadow-lg",
              popoverContent: "shadow-xl border border-gray-200 rounded-xl",
              innerWrapper: "gap-3",
            }}
            size="lg"
            onChange={changeCategory}
            radius="lg"
            variant="bordered"
            disallowEmptySelection
            selectedKeys={[selectedCategory]}
            isLoading={isLoading}
            placeholder={t("selectCategory")}
            startContent={
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            }
            endContent={
              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <div
                    role="button"
                    onClick={() => changeCategory({ target: { value: "" } })}
                    className="flex items-center justify-center p-1 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                    title="Clear selection"
                  >
                    <X className="text-gray-400 group-hover:text-red-500 w-4 h-4 transition-colors" />
                  </div>
                )}
              </div>
            }
          >
            <SelectItem
              key={""}
              className="text-sm sm:text-base hover:bg-orange-50 transition-colors"
            >
              {t("allCategories")}
            </SelectItem>
            {categories?.map(({ label, key }) => (
              <SelectItem
                key={key}
                className="text-sm sm:text-base hover:bg-orange-50 transition-colors"
              >
                {label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* SubCategory Select */}
      <div className="w-full">
        <div className="mb-3">
          <label className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-[#f48a42]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 11a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {t("subCategory")}
          </label>
        </div>

        <div className="relative">
          <Select
            aria-label={t("subCategory")}
            scrollShadowProps={{ hideScrollBar: false }}
            classNames={{
              base: "w-full",
              value: "text-sm sm:text-base",
              trigger: [
                "h-12 sm:h-13 lg:h-14",
                "border-2",
                subCategories[selectedCategory]?.length > 0
                  ? "border-gray-200 hover:border-blue-300 focus:border-blue-500 data-[focus=true]:border-blue-500"
                  : "border-gray-100 bg-gray-50",
                "transition-all duration-200",
                "shadow-sm",
                subCategories[selectedCategory]?.length > 0
                  ? "hover:shadow-md data-[focus=true]:shadow-lg data-[focus=true]:shadow-blue-100"
                  : "",
                "rounded-lg",
              ],
              listboxWrapper: "max-h-[250px] shadow-lg",
              popoverContent: "shadow-xl border border-gray-200 rounded-xl",
              innerWrapper: "gap-3",
            }}
            size="lg"
            radius="lg"
            variant="bordered"
            disallowEmptySelection
            onChange={changeSubCategory}
            selectedKeys={
              subCategories[selectedCategory]?.length > 0
                ? [selectedSubCategory]
                : ["noSubCategories"]
            }
            {...(subCategories[selectedCategory]?.length > 0
              ? { isDisabled: false }
              : { isDisabled: true })}
            isLoading={isLoading}
            placeholder={
              subCategories[selectedCategory]?.length > 0
                ? t("selectSubCategory")
                : t("noSubCategories")
            }
            startContent={
              <svg
                className={`w-5 h-5 flex-shrink-0 ${
                  subCategories[selectedCategory]?.length > 0
                    ? "text-gray-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 11a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            }
            endContent={
              <div className="flex items-center gap-2">
                {selectedSubCategory &&
                  subCategories[selectedCategory]?.length > 0 && (
                    <div
                      role="button"
                      onClick={() =>
                        changeSubCategory({ target: { value: "" } })
                      }
                      className="flex items-center justify-center p-1 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                      title="Clear selection"
                    >
                      <X className="text-gray-400 group-hover:text-red-500 w-4 h-4 transition-colors" />
                    </div>
                  )}
              </div>
            }
          >
            <SelectItem
              key={""}
              className="text-sm sm:text-base hover:bg-orange-50 transition-colors"
            >
              {t("allSubCategories")}
            </SelectItem>
            {subCategories[selectedCategory]?.length > 0 ? (
              subCategories[selectedCategory]?.map(({ label, key }) => (
                <SelectItem
                  key={key}
                  className="text-sm sm:text-base hover:bg-orange-50 transition-colors"
                >
                  {label}
                </SelectItem>
              ))
            ) : (
              <SelectItem
                key={"noSubCategories"}
                className="text-sm sm:text-base text-gray-400"
              >
                {t("noSubCategories")}
              </SelectItem>
            )}
          </Select>
        </div>

        {/* Helper text */}
        {!queryParams?.category && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {t("selectCategoryFirst")}
          </div>
        )}
      </div>
    </>
  );
}
