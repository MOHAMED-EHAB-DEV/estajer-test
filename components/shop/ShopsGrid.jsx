"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import ShopCard from "./ShopCard";

// ── Icons ──────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-5 h-5"
  >
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);


const XIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);


// ── Main Grid Component ────────────────────────────────────────────────────
export default function ShopsGrid({ shops, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`shops.grid.${key}`);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return shops;
    const q = query.toLowerCase();
    return shops.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.nameAr?.toLowerCase().includes(q) ||
        s.nameEn?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.slug?.toLowerCase().includes(q),
    );
  }, [shops, query]);

  return (
    <div className="flex flex-col gap-8">
      {/* Search bar */}
      <div className="relative max-w-lg mx-auto w-full">
        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          id="shops-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full ps-12 pe-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-sm text-darkNavy placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="clear"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Results count */}
      {query && (
        <p className="text-sm text-center text-neutral-500">
          {filtered.length} {t("results")}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-neutral-400">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-lg font-semibold">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {filtered.map((shop) => (
            <ShopCard key={shop._id} shop={shop} lang={lang} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
