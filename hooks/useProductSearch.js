"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchTracking } from "./useSearchTracking";

export function useProductSearch({
  lang,
  initialSearchValue = "",
  providerId,
  userId,
  source = "header",
}) {
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { trackSearch, trackFinalSearch } = useSearchTracking({ source });

  const fetchResults = useCallback(async () => {
    const hasSearchTerm = searchValue.trim().length >= 2;
    const hasFilters =
      selectedCategory || selectedSubCategory || selectedLocation;

    if (!hasSearchTerm && !hasFilters) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchParams = new URLSearchParams({
        ...(searchValue && { name: searchValue }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubCategory && { subCategory: selectedSubCategory }),
        ...(providerId && { providerId }),
        ...(userId && { userId }),
        lang: lang,
        limit: 10,
        fields: `name,images,rental,address,pricingModel,owner,${
          lang === "ar" ? "nameAr,addressAr" : "nameEn,addressEn"
        }`,
        compressed: "true",
      });

      if (selectedLocation) {
        const addedValue = 0.3;
        const bounds = {
          north: +selectedLocation.lat + addedValue,
          south: +selectedLocation.lat - addedValue,
          east: +selectedLocation.lng + addedValue,
          west: +selectedLocation.lng - addedValue,
        };
        searchParams.set("bounds", JSON.stringify(bounds));
      }

      const res = await fetch(`/api/products?${searchParams}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);

        // Track the debounced search term after we know if it returned results
        if (hasSearchTerm) {
          trackSearch({
            term: searchValue,
            lang,
            hasResults: data.data.length > 0,
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [
    searchValue,
    selectedCategory,
    selectedSubCategory,
    selectedLocation,
    providerId,
    userId,
    lang,
    trackSearch,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchResults]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryParams = new URLSearchParams();
  if (searchValue) queryParams.set("name", searchValue);
  if (selectedCategory) queryParams.set("category", selectedCategory);
  if (selectedSubCategory) queryParams.set("subCategory", selectedSubCategory);
  if (selectedLocation) {
    queryParams.set("lat", selectedLocation.lat);
    queryParams.set("lng", selectedLocation.lng);
    queryParams.set("location", selectedLocation.name);
  }
  if (providerId) queryParams.set("providerId", providerId);
  if (userId) queryParams.set("userId", userId);

  return {
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
  };
}
