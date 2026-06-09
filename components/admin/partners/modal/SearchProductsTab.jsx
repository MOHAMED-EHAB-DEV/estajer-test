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

  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      allowedProducts: (prev.allowedProducts || []).filter(
        (p) => p._id !== productId,
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h3 className="text-sm font-bold text-darkNavy">
          {t("searchProductsTab")}
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">{t("searchProductsTabDesc")}</p>
      </div>

      <ProductSelector
        selectedProducts={formData.allowedProducts || []}
        onSelect={handleAddProduct}
        onRemove={handleRemoveProduct}
        lang={lang}
        translate={translate}
        categories={categories}
        subCategories={subCategories}
      />
    </div>
  );
}
