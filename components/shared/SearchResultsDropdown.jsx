"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "../ui/svgs/icons/SearchSvg";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { Location as LocationIcon } from "../ui/svgs/icons/LocationSvg";
import { anyImgUrl } from "@/utils/ImageUrl";
import formatDuration from "@/utils/formatDuration";
import { getUrlName } from "@/lib/sitemap";

export default function SearchResultsDropdown({
  showResults,
  isSearching,
  searchResults,
  searchValue,
  selectedCategory,
  selectedLocation,
  lang,
  langPrefix,
  trans,
  t,
  onResultClick,
  trackFinalSearch,
  providerId,
}) {
  if (!showResults) return null;

  const hasSearchParameters =
    searchValue.trim().length >= 2 || selectedCategory || selectedLocation;

  if (!hasSearchParameters) return null;
  console.log("product: ", searchResults);
  return (
    <div className="absolute text-start top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-2 max-h-[70vh] overflow-y-auto w-full">
      {isSearching ? (
        <div className="p-4 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
            {lang === "ar" ? "النتائج المقترحة" : "Suggested Results"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {searchResults.map((product) => {
              const discountTier = product?.rental?.discountTiers?.find(
                (tier) => tier.minDays === 1,
              );
              const hasDiscount =
                !!discountTier && product.pricingModel !== "packages";
              const discountPrice = hasDiscount
                ? discountTier.discountPrice
                : null;
              const tax = 0.15;
              const hasTaxCode = !!product.owner?.companyDetails?.taxCode;
              const basePrice =
                product.pricingModel === "packages"
                  ? product.rental?.packages?.[0]?.price || 0
                  : product.rental?.value || 0;
              const priceWithTax = hasTaxCode
                ? Math.round(basePrice * (1 + tax))
                : basePrice;
              const discountPriceWithTax = hasDiscount
                ? hasTaxCode
                  ? Math.round(discountPrice * (1 + tax))
                  : discountPrice
                : null;

              return (
                <Link
                  key={product._id}
                  href={`/${langPrefix}products/${getUrlName(product.name)}_ref_${product._id}${providerId ? `?providerId=${providerId}` : ""}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-primary/5 transition-colors group border-b border-gray-50 md:border-none"
                  onClick={() => {
                    // Clicking a product = user found what they wanted = final committed search
                    if (trackFinalSearch && searchValue?.trim().length >= 2) {
                      trackFinalSearch({
                        term: searchValue,
                        lang,
                        hasResults: true,
                      });
                    }
                    onResultClick?.();
                  }}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 italic">
                    <div
                      className="absolute inset-0 opacity-95 transition-opacity duration-300"
                      style={{
                        background:
                          product?.images?.[0]?.gradientStyle ||
                          "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
                      }}
                    />
                    {product.images?.[0]?.preview && (
                      <Image
                        unoptimized
                        src={anyImgUrl({
                          src: product.images[0].preview,
                          size: 100,
                          quality: 70,
                          aspectRatio: "1:1",
                        })}
                        alt={product.name}
                        fill
                        className="object-cover relative z-10 group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-darkNavy truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                            {discountPriceWithTax}
                            <Currency className="w-3 h-3" color="#F48A42" />
                          </span>
                          <span className="text-[10px] text-gray-400 line-through flex items-center">
                            {priceWithTax}
                            <Currency className="w-2.5 h-2.5" color="#A0AEC0" />
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                          {priceWithTax}
                          <Currency className="w-3 h-3" color="#F48A42" />
                        </span>
                      )}
                      <span className="text-[10px] text-black/70">
                        {product.pricingModel === "packages" &&
                        product.rental?.packages?.[0]
                          ? `${lang === "ar" ? "لكل" : "per"} ${formatDuration({
                              duration: product.rental.packages[0].duration,
                              unit: product.rental.packages[0].unit,
                              t: (key) =>
                                trans(
                                  `productComponent.bookingPackages.${key}`,
                                ),
                              lang,
                            })}`
                          : lang === "ar"
                            ? "باليوم"
                            : "per Day"}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <LocationIcon className="w-2.5 h-2.5" color="#9393A1" />
                        {product.address?.city}
                      </span>
                    </div>
                  </div>
                  <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className={`w-4 h-4 text-primary ${lang === "ar" ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-gray-50 flex items-center justify-center gap-2"
          >
            {lang === "ar" ? "عرض جميع النتائج" : "View all results"}
            <Search className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Search className="w-8 h-8 mx-auto opacity-20" />
          </div>
          <p className="text-sm text-gray-500">
            {lang === "ar" ? "لم يتم العثور على نتائج" : "No results found"}
          </p>
        </div>
      )}
    </div>
  );
}
