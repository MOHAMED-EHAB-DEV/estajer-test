"use client";
import { startTransition, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { useTranslations } from "@/hooks/useTranslations";
import { sendGTMEvent } from "@next/third-parties/google";
import { Search } from "../ui/svgs/icons/SearchSvg";;
import { useSearchTracking } from "@/hooks/useSearchTracking";

export default function SearchName({
  lang,
  translate,
  map,
  queryParams,
  endContent,
  isCollapsed,
  categoryPage,
  subCategoryPage,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`search.${text}`);
  const langPrefix = lang === "ar" ? "" : "en/";
  const router = useRouter();
  const [name, setName] = useState(queryParams?.name || "");
  const [debouncedName] = useDebounce(name.trim(), 1000);
  const [isLoading, setIsLoading] = useState(false);
  const { trackSearch, trackUnmount } = useSearchTracking({ source: "filters" });

  // Keep a stable ref to lang for the unmount cleanup
  const langRef = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  // Track the final committed search term when user navigates away
  useEffect(() => {
    return () => trackUnmount(langRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setIsLoading(false);
    !!queryParams?.name && setName(queryParams?.name || "");
  }, [queryParams]);

  useEffect(() => {
    if (debouncedName !== (queryParams?.name || "")?.trim()) {
      const params = new URLSearchParams(queryParams);
      if (!debouncedName) params.delete("name");
      if (debouncedName) params.set("name", debouncedName);

      // If on category/subcategory page, remove them from params as they're in the path
      if (categoryPage && params.has("category")) params.delete("category");
      if (subCategoryPage && params.has("subCategory"))
        params.delete("subCategory");

      try {
        sendGTMEvent({
          event: "search_update",
          search_term: debouncedName || "",
          location: "search_filters",
          view: map ? "map" : "products",
          language: lang,
        });
      } catch (_) {}

      // Track via the hook — client-side progression logic will suppress
      // intermediate steps (م → مل → ملع → ملعب) automatically.
      // isFinal:false here; the committed term is tracked on unmount instead.
      if (debouncedName && debouncedName.trim().length >= 2) {
        trackSearch({
          term: debouncedName,
          lang,
          isFinal: false,
        });
      }

      let basePath;
      if (categoryPage && subCategoryPage) {
        basePath = `/${langPrefix}${categoryPage}/${subCategoryPage}/${
          map ? "map" : "products"
        }`;
      } else if (categoryPage) {
        basePath = `/${langPrefix}${categoryPage}/${map ? "map" : "products"}`;
      } else {
        basePath = `/${langPrefix}search/${map ? "map" : "products"}`;
      }

      startTransition(() =>
        router.replace(`${basePath}?${params.toString()}`, { scroll: false }),
      );
    }
  }, [debouncedName]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement)
          document.activeElement.blur();
      }}
      className="w-full"
    >
      <div
        className={`${
          !isCollapsed
            ? "max-h-[1000px] md:max-h-none opacity-100 mb-1 md:mb-1"
            : "max-h-0 md:max-h-none opacity-0"
        } md:block transition-all ease-in-out duration-200 overflow-hidden`}
      >
        <label className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-[#f48a42]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          {t("productName")}
        </label>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder={t("productNamePlaceholder")}
          name="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          size="lg"
          radius="lg"
          variant="bordered"
          classNames={{
            base: "max-w-full",
            input: "text-sm sm:text-base placeholder:text-gray-400",
            inputWrapper: [
              "h-12 sm:h-13 lg:h-14",
              "border-2 border-gray-200",
              "hover:border-[#f48a42]",
              "focus-within:border-[#f48a42]",
              "group-data-[focus=true]:border-[#f48a42]",
              "transition-all duration-200",
              "bg-white",
              "shadow-sm hover:shadow-md",
              "group-data-[focus=true]:shadow-lg",
              "group-data-[focus=true]:shadow-orange-100",
            ],
            clearButton: "text-gray-400 hover:text-gray-600 transition-colors",
          }}
          {...(!endContent
            ? {
                onClear: () => {
                  setName("");
                  try {
                    sendGTMEvent({
                      event: "search_clear",
                      location: "search_filters",
                      view: map ? "map" : "products",
                      language: lang,
                    });
                  } catch (_) {}
                },
              }
            : {})}
          startContent={
            <Search
              color={"#9ca3af"}
              className="min-w-4 h-4"
              aria-hidden="true"
              strokeWidth={4}
            />
          }
          endContent={
            isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-[#f48a42] border-t-transparent rounded-full"></div>
              </div>
            ) : (
              endContent
            )
          }
        />
      </div>
    </form>
  );
}
