"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";

/**
 * Minimal single-product search picker for the productHighlight editor.
 * Fetches products live as the user types, shows a list, user clicks to select.
 */
export default function ProductHighlightProductPicker({
  lang,
  translate,
  ownerId,
  onSelect,
  selectedId,
  inputCls,
  labelCls,
  isAr,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.editor.${key}`);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (q) => {
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: 10,
          showAll: "true",
          compressed: "true",
          fields: "images,owner,nameAr,nameEn,descriptionAr,descriptionEn,rental,rating,pricingModel,addressAr,addressEn,category",
          name: q,
          ...(ownerId ? { userId: ownerId } : { status: "approved" }),
        });
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (data.success) {
          const mapped = data.data.map((p) => ({
            ...p,
            name: isAr ? p.nameAr : p.nameEn,
            description: isAr ? p.descriptionAr : p.descriptionEn,
            address: isAr ? p.addressAr : p.addressEn,
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

  return (
    <div className="flex flex-col gap-2">
      <label className={labelCls}>
        {t("searchProducts")}
      </label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchProductsPlaceholder")}
        className={inputCls}
      />
      {loading && (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}
      {results.length > 0 && (
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border border-neutral-100 rounded-xl bg-white shadow-sm">
          {results.map((p) => {
            const hasTaxCode = !!p.owner?.companyDetails?.taxCode;
            const basePrice =
              p.pricingModel === "packages"
                ? p.rental?.packages?.[0]?.price
                : p.rental?.value;
            const priceWithTax = hasTaxCode
              ? Math.round(basePrice * 1.15)
              : basePrice;

            return (
              <button
                key={p._id}
                type="button"
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                  setResults([]);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-50 transition-colors text-start ${
                  selectedId === p._id ? "bg-primary/5" : ""
                }`}
              >
                {p.images?.[0]?.preview && (
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-neutral-100 shrink-0">
                    <Image
                      unoptimized
                      src={anyImgUrl({ src: p.images[0].preview, size: 80 })}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="block text-[12px] font-semibold text-darkNavy truncate">
                    {p.name}
                  </span>
                  <span className="block text-[10px] text-neutral-400 font-medium mt-0.5">
                    {priceWithTax || 0} {t("sar")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
