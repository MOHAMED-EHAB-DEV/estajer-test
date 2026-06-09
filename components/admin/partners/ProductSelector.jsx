"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaGripVertical,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
} from "@/components/ui/svgs/AdminIcons";
import { Checkbox, Button } from "@heroui/react";
import { useTranslations } from "@/hooks/useTranslations";
import ProductFilters from "@/components/dashboard/ProductFilters";
import SimpleProductItem from "./modal/SimpleProductItem";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function ProductSelector({
  selectedProducts,
  onSelect,
  onRemove,
  onReorder,
  lang,
  translate,
  categories,
  subCategories,
  fixedUserId,
  translatePath = "admin.partners",
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`${translatePath}.${key}`);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterParams, setFilterParams] = useState({
    limit: 20,
    page: 1,
    status: "approved", // Default to approved for sliders
    showAll: true,
    userId: fixedUserId || "",
  });
  const [pagination, setPagination] = useState({ hasMore: false });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(
    async (params, append = false) => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(params);
        const langSuffix = lang === "en" ? "En" : "Ar";
        searchParams.set("lang", lang);
        searchParams.set("compressed", "true");
        searchParams.set(
          "fields",
          `images,owner,name${langSuffix},rental,rating,category`,
        );

        const res = await fetch(`/api/products?${searchParams.toString()}`);
        const data = await res.json();

        if (data.success) {
          setProducts((prev) => (append ? [...prev, ...data.data] : data.data));
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    },
    [lang],
  );

  useEffect(() => {
    if (fixedUserId !== undefined) {
      setFilterParams((prev) => ({ ...prev, userId: fixedUserId, page: 1 }));
    }
  }, [fixedUserId]);

  useEffect(() => {
    fetchProducts(filterParams, filterParams.page > 1);
  }, [filterParams, fetchProducts]);

  const handleFilterChange = (change) => {
    setFilterParams({ ...change.allParams, page: 1 });
  };

  const handleToggleProduct = (product) => {
    const isAlreadyInSlider = selectedProducts.some(
      (p) => p._id === product._id,
    );
    if (isAlreadyInSlider) {
      onRemove(product._id);
    } else {
      onSelect(product);
    }
  };

  const handleSelectAll = () => {
    const allVisibleSelected = products.every((product) =>
      selectedProducts.some((p) => p._id === product._id),
    );

    if (allVisibleSelected) {
      // If all are selected, remove all visible ones
      products.forEach((product) => {
        if (selectedProducts.some((p) => p._id === product._id)) {
          onRemove(product._id);
        }
      });
    } else {
      // If not all are selected, add all missing ones
      products.forEach((product) => {
        if (!selectedProducts.some((p) => p._id === product._id)) {
          onSelect(product);
        }
      });
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      const nextPage = (filterParams.page || 1) + 1;
      setFilterParams((prev) => ({ ...prev, page: nextPage }));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Selection Control Bar */}
      <div className="flex flex-col gap-3 bg-gradient-to-br from-[#fef7f2] to-white p-4 rounded-2xl border border-primary/10">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-darkNavy flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <FaFilter className="text-primary" size={11} />
            </span>
            {t("productSelection")}
          </h4>
          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Checkbox
                  isSelected={products.every((product) =>
                    selectedProducts.some((p) => p._id === product._id),
                  )}
                  onValueChange={handleSelectAll}
                  color="primary"
                  size="sm"
                />
                <span className="text-[10px] font-medium text-neutral-400">
                  {t("selectAll")}
                </span>
              </div>
            )}
            <Button
              size="sm"
              variant="flat"
              onPress={() => setShowFilters(!showFilters)}
              className="rounded-xl text-[11px] h-7 min-w-0 px-2.5 gap-1"
            >
              {showFilters ? t("hideFilters") : t("showFilters")}
              {showFilters ? (
                <FaChevronUp size={10} />
              ) : (
                <FaChevronDown size={10} />
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-primary/5">
            <ProductFilters
              lang={lang}
              categories={categories}
              subCategories={subCategories}
              translate={translate}
              queryParams={filterParams}
              queryStatus={filterParams.status}
              queryName={filterParams.name}
              queryCategory={filterParams.category}
              querySubCategory={filterParams.subCategory}
              queryUserId={fixedUserId || filterParams.userId}
              admin={true}
              onFilterChange={handleFilterChange}
              isShop={true}
              disableUserFilter={!!fixedUserId}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-0.5 custom-scrollbar">
          {products.map((product) => (
            <SimpleProductItem
              key={product._id}
              product={product}
              lang={lang}
              isSelected={selectedProducts.some((p) => p._id === product._id)}
              onSelect={handleToggleProduct}
            />
          ))}

          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-7 h-7 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-10 text-neutral-300 text-[12px]">
              No products found matching your filters.
            </div>
          )}

          {pagination.hasMore && !loading && (
            <div className="flex justify-center py-3">
              <Button
                size="sm"
                variant="light"
                onPress={loadMore}
                className="text-primary font-bold text-[12px] h-8"
              >
                {t("loadMore")}...
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Products Preview */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h5 className="text-[13px] font-bold text-darkNavy flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary" />
            {t("selectedInSlider")}
            <span className="text-[11px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">
              {selectedProducts.length}
            </span>
          </h5>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-neutral-100 rounded-2xl text-neutral-300 text-[12px]">
            {t("noProductsSelected")}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedProducts.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-neutral-100 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden relative border border-neutral-50 flex-shrink-0">
                  <Image
                    unoptimized
                    src={anyImgUrl({
                      src: product.images[0]?.preview || product.images[0],
                      size: 100,
                    })}
                    alt="product"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-darkNavy truncate">
                    {product.name}
                  </p>
                </div>

                <button
                  onClick={() => onRemove(product._id)}
                  className="w-7 h-7 rounded-lg text-neutral-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
