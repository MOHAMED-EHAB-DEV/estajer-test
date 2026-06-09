"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "../ui/svgs/icons/SearchSvg";
import Button from "../ui/Button";
import dynamic from "next/dynamic";
import { Line } from "../ui/svgs/icons/LineSvg";
import { useTranslations } from "@/hooks/useTranslations";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchResultsDropdown from "../shared/SearchResultsDropdown";

const Location = dynamic(() => import("../home/Location"), { ssr: false });
const SelectCategory = dynamic(() => import("../home/SelectCategory"), {
  ssr: false,
});

export default function HeaderSearch({
  scrolled,
  langPrefix,
  t,
  lang,
  translate,
}) {
  const trans = useTranslations(translate);
  const [categoriesData, setCategoriesData] = useState([]);
  const [subCategoriesData, setSubCategoriesData] = useState({});

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
  } = useProductSearch({ lang, source: "header" });

  const router = useRouter();

  // Fetch categories and subcategories on mount (client side for header)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `/api/categories?mainOnly=true&includeSubcategories=true&status=active`,
        );
        const data = await res.json();
        if (data.success) {
          const dbCategories = data.data;
          const cats = dbCategories.map((cat) => ({
            _id: cat._id,
            key: cat.key,
            label: lang === "en" ? cat.nameEn : cat.nameAr,
          }));
          const subs = {};
          dbCategories.forEach((cat) => {
            subs[cat.key] = (cat.subcategories || []).map((sub) => ({
              _id: sub._id,
              key: sub.key,
              label: lang === "en" ? sub.nameEn : sub.nameAr,
            }));
          });
          setCategoriesData(cats);
          setSubCategoriesData(subs);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [lang]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim().length >= 2) {
      trackFinalSearch({ term: searchValue, lang });
    }
    setShowResults(false);
    setSearchValue("");
    router.push(`/${langPrefix}search/products?${queryParams}`);
  };

  return (
    <form
      ref={searchRef}
      onSubmit={handleSearch}
      className={`${
        scrolled ? "bg-[#EAEEF3] py-2" : "bg-[#0932701a] py-1"
      } hidden md:flex rounded-full max-w-full md:max-w-[70vw] w-full items-center ps-4 pe-2 gap-1 justify-between transition-all flex-1 relative`}
      role="search"
      aria-label={t("search")}
      itemProp="target"
      onClick={() => setShowResults(true)}
    >
      <div className="flex items-center flex-1 gap-2">
        <button
          type="submit"
          aria-label={t("search")}
          className="flex items-center justify-center p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <Search className="md:w-5 md:h-5 w-4 h-4" aria-hidden="true" />
        </button>
        <input
          type="text"
          name="search"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={t("search")}
          className="bg-transparent focus:outline-none w-full text-sm text-darkNavy placeholder:text-gray-500"
          aria-label={t("search")}
          autoComplete="off"
        />
      </div>

      <div className="flex items-center gap-1 relative z-50">
        <div className="scale-90 origin-right">
          <SelectCategory
            categories={categoriesData}
            subCategories={subCategoriesData}
            onCategoryChange={setSelectedCategory}
            onSubCategoryChange={setSelectedSubCategory}
            translate={translate}
          />
        </div>
        <div className="hidden lg:block">
          <Line color={"#a1a1a1"} />
        </div>
        <div className="scale-90 origin-right max-w-[120px] hidden lg:block">
          <Location
            lang={lang}
            onLocationSelect={setSelectedLocation}
            placeholder={lang === "ar" ? "الموقع" : "Location"}
            compact={true}
          />
        </div>
        <Button
          type="submit"
          className={`${scrolled ? "h-9 px-6" : "h-8 px-4"} !transition-all text-xs ms-1`}
          aria-label={t("search")}
        >
          {t("search")}
        </Button>
      </div>

      {/* Premium Search Results Dropdown */}
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
      />
    </form>
  );
}
