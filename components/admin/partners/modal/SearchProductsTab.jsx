"use client";

import React from "react";
import ProductSelector from "../ProductSelector";

export default function SearchProductsTab({
  formData,
  setFormData,
  lang,
  translate,
  t,
  categories,
  subCategories,
}) {
  const handleAddProduct = (product) => {
    setFormData((prev) => ({
      ...prev,
      allowedProducts: [...(prev.allowedProducts || []), product],
    }));
  };

  const handleAddMany = (products) => {
    setFormData((prev) => {
      const existing = prev.allowedProducts || [];
      const toAdd = products.filter(
        (p) => !existing.some((ep) => ep._id === p._id),
      );
      return { ...prev, allowedProducts: [...existing, ...toAdd] };
    });
  };

  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      allowedProducts: (prev.allowedProducts || []).filter(
        (p) => p._id !== productId,
      ),
    }));
  };

  const handleRemoveMany = (productIds) => {
    setFormData((prev) => ({
      ...prev,
      allowedProducts: (prev.allowedProducts || []).filter(
        (p) => !productIds.includes(p._id),
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h3 className="text-sm font-bold text-darkNavy">
          {t("searchProductsTab")}
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          {t("searchProductsTabDesc")}
        </p>
      </div>

      <ProductSelector
        selectedProducts={formData.allowedProducts || []}
        onSelect={handleAddProduct}
        onSelectMany={handleAddMany}
        onRemove={handleRemoveProduct}
        onRemoveMany={handleRemoveMany}
        lang={lang}
        translate={translate}
        categories={categories}
        subCategories={subCategories}
        fixedUserId={formData.owner}
      />
    </div>
  );
}
