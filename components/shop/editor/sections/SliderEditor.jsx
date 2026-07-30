"use client";

import React from "react";
import ShopSlidersTab from "@/components/admin/shops/modal/ShopSlidersTab";

export default function SliderEditor({
  data,
  onDataChange,
  formData,
  onDeleteSection,
  lang,
  translate,
  categories,
  subCategories,
}) {
  return (
    <ShopSlidersTab
      formData={{ ...formData, sliders: [data] }}
      addSlider={() => {}}
      removeSlider={onDeleteSection}
      handleSliderChange={(_, field, value) =>
        onDataChange((prev) => ({ ...prev, [field]: value }))
      }
      addProductToSlider={(_, product) => {
        onDataChange((prev) => {
          const products = prev.products || [];
          if (
            !products.some((p) => p._id === product._id) &&
            products.length < 100
          ) {
            return { ...prev, products: [...products, product] };
          }
          return prev;
        });
      }}
      addProductsToSlider={(_, newProducts) => {
        onDataChange((prev) => {
          const products = prev.products || [];
          const toAdd = newProducts.filter(
            (p) => !products.some((ep) => ep._id === p._id),
          );
          // Limit to 100 total
          const spaceLeft = 100 - products.length;
          const safeToAdd = toAdd.slice(0, Math.max(0, spaceLeft));
          if (safeToAdd.length === 0) return prev;
          return { ...prev, products: [...products, ...safeToAdd] };
        });
      }}
      removeProductFromSlider={(_, productId) =>
        onDataChange((prev) => ({
          ...prev,
          products: (prev.products || []).filter(
            (p) => p._id !== productId,
          ),
        }))
      }
      removeProductsFromSlider={(_, productIds) =>
        onDataChange((prev) => ({
          ...prev,
          products: (prev.products || []).filter(
            (p) => !productIds.includes(p._id),
          ),
        }))
      }
      reorderProductsInSlider={(_, from, to) => {
        onDataChange((prev) => {
          const arr = [...(prev.products || [])];
          const [moved] = arr.splice(from, 1);
          arr.splice(to, 0, moved);
          return { ...prev, products: arr };
        });
      }}
      lang={lang}
      translate={translate}
      categories={categories}
      subCategories={subCategories}
      ownerId={formData.owner}
      mode="edit"
      sliderIndex={0}
    />
  );
}
