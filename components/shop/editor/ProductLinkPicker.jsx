"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import { getUrlName } from "@/lib/sitemap";
import Image from "next/image";

/**
 * Shared ProductLinkPicker component.
 * Integrates an inline live product search dropdown to automatically generate product URLs.
 */
export default function ProductLinkPicker({
  value,
  onChange,
  lang,
  translate,
  ownerId,
  shopSlug,
  branch,
  providerId,
  inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300",
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.editor.${key}`);
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const search = useCallback(
    async (q) => {
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const queryParams = {
          limit: 8,
          showAll: "true",
          compressed: "true",
          fields: "images,owner,nameAr,nameEn,pricingModel,rental",
          name: q,
        };

        if (ownerId) {
          queryParams.userId = ownerId;
        } else {
          queryParams.status = "approved";
        }

        const params = new URLSearchParams(queryParams);
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (data.success) {
          const mapped = data.data.map((p) => ({
            ...p,
            name: p.name || (isAr ? p.nameAr : p.nameEn),
          }));
          setResults(mapped);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    },
    [isAr, ownerId],
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelectProduct = (product) => {
    const langPrefix = lang === "ar" ? "" : "en/";
    const productSlug = getUrlName(product.name);
    const pId = providerId || ownerId;
    const queryParams = {};
    if (branch) queryParams.branch = branch;
    if (pId && !shopSlug) queryParams.providerId = pId;

    const queryString =
      Object.keys(queryParams).length > 0
        ? `?${new URLSearchParams(queryParams).toString()}`
        : "";

    const productUrl = `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}products/${productSlug}_ref_${product._id}${queryString}`;
    onChange(productUrl);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative flex flex-col gap-1.5 w-full" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <input
          value={value || ""}
          placeholder={t("enterLinkOrPickProduct")}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} pe-[85px]`}
        />

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`absolute end-2 top-1/2 -translate-y-1/2 text-primary flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-[9px] font-bold shadow-sm transition-all z-10 ${
            open
              ? "bg-neutral-100 border-neutral-300"
              : "bg-white border-neutral-200 hover:bg-neutral-50 active:scale-95"
          }`}
          title={t("pickProductTitle")}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>{t("pick")}</span>
        </button>
      </div>

      {open && (
        <div className="absolute top-[calc(100%+4px)] inset-x-0 bg-white border border-neutral-200/80 rounded-2xl shadow-xl z-modal p-3 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchToLinkProduct")}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200/70 bg-neutral-50/20 text-xs focus:border-primary focus:outline-none transition-all placeholder:text-neutral-400"
            autoFocus
          />
          {loading && (
            <div className="flex justify-center py-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}
          {results.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {results.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-neutral-50 rounded-lg transition-colors text-start w-full"
                >
                  {p.images?.[0]?.preview && (
                    <div className="w-7 h-7 rounded-md overflow-hidden relative border border-neutral-100 shrink-0">
                      <Image
                        unoptimized
                        src={anyImgUrl({ src: p.images[0].preview, size: 70 })}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-semibold text-darkNavy truncate">
                      {p.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            query.length >= 2 &&
            !loading && (
              <div className="text-center py-3 text-[11px] text-neutral-400 font-medium">
                {t("noResults")}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
