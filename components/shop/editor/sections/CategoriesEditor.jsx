"use client";

import React from "react";
import ShopCategoriesTab from "@/components/admin/shops/modal/ShopCategoriesTab";

export default function CategoriesEditor({
  data,
  onDataChange,
  formData,
  lang,
  translate,
  t,
  categories,
  subCategories,
}) {
  return (
    <ShopCategoriesTab
      formData={{ ...formData, categories: data.categories || [] }}
      setFormData={(updater) => {
        onDataChange((prev) => {
          const next =
            typeof updater === "function"
              ? updater({
                  ...formData,
                  categories: prev.categories || [],
                })
              : updater;
          return { ...prev, categories: next.categories };
        });
      }}
      handleImageUpload={(e, field, index, subField) => {
        const file = e.target.files[0];
        if (!file) return;
        import("@/utils/ImageResizer").then(({ resizeImage }) =>
          resizeImage(file).then((resized) => {
            onDataChange((prev) => {
              const cats = [...(prev.categories || [])];
              cats[index] = {
                ...cats[index],
                [subField]: resized.preview,
              };
              return { ...prev, categories: cats };
            });
          }),
        );
      }}
      lang={lang}
      translate={translate}
      t={t}
      categories={categories}
      subCategories={subCategories}
    />
  );
}
