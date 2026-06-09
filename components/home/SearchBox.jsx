"use client";
import Button from "../ui/Button";
import { Input } from "@heroui/input";
import { Line } from "../ui/svgs/icons/LineSvg";
import { Search } from "../ui/svgs/icons/SearchSvg";
import dynamic from "next/dynamic";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchResultsDropdown from "../shared/SearchResultsDropdown";

const Location = dynamic(() => import("./Location"), { ssr: true });
const SelectCategory = dynamic(() => import("./SelectCategory"), {
  ssr: true,
});

export default function SearchBox({
  categoriesData,
  subCategoriesData,
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

  const submitSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim().length >= 2) {
      trackFinalSearch({ term: searchValue, lang });
    }
    setShowResults(false);
    setSearchValue("");
    router.push(`/${langPrefix}search/products?${queryParams}`);
  };

  return (
    <>
      <section
        className="md:block w-full px-2 md:px-0"
        aria-labelledby="search-heading"
        role="search"
      >
        <form
          ref={searchRef}
          onSubmit={submitSearch}
          className={`${providerId ? "mt-2 md:mt-10" : " my-10"} flex mx-auto bg-white rounded-full max-w-full md:max-w-[95vw] w-full md:w-[820px] md:py-4 py-1 ps-4 pe-3 md:px-8 items-center gap-0.5 md:gap-2 justify-between md:shadow-lg shadow relative`}
          role="search"
          aria-label={t("searchForRentalProducts")}
          itemScope
          itemType="https://schema.org/SearchAction"
          onClick={() => setShowResults(true)}
        >
          <meta
            itemProp="target"
            content={`${process.env.NEXT_PUBLIC_APP_URL}/${langPrefix}search/products?name={search_term_string}`}
          />

          <div aria-hidden="true">
            <Search className="md:w-7 md:h-7 w-[18px] h-[18px]" />
          </div>
          <div className="w-full text-start">
            <Input
              classNames={{
                inputWrapper: "!bg-transparent shadow-none px-2 text-darkNavy",
                input: "md:text-lg text-[15px] text-darkNavy ",
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
            providerId={providerId}
            userId={userId}
          />

          <div className="flex gap-0 items-center">
            <SelectCategory
              categories={categoriesData}
              subCategories={subCategoriesData}
              onCategoryChange={setSelectedCategory}
              onSubCategoryChange={setSelectedSubCategory}
              translate={translate}
            />
            <div className="hidden md:block -translate-x-1">
              <Line color={"#a1a1a1"} />
            </div>
            <Location
              lang={lang}
              onLocationSelect={setSelectedLocation}
              placeholder={t("location")}
            />
            <Button
              size="sm"
              className="md:py-5 md:px-8 rounded-full md:text-sm ms-2"
              type="submit"
              color="secondary"
              variant="solid"
              aria-label={t("searchForRentalProducts")}
            >
              {trans("ui.button.search")}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
