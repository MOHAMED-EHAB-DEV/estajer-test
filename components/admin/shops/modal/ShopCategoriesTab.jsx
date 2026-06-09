"use client";

import React from "react";
import { FaPlus, FaTrash, FaUpload } from "@/components/ui/svgs/AdminIcons";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { anyImgUrl } from "@/utils/ImageUrl";
import ProductSelector from "../../partners/ProductSelector";

export default function ShopCategoriesTab({
  formData,
  setFormData,
  handleImageUpload,
  lang,
  translate,
  t,
  categories,
  subCategories,
}) {
  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      categories: [
        ...(prev.categories || []),
        {
          nameAr: "",
          nameEn: "",
          image: "",
          allowedProducts: [],
        },
      ],
    }));
  };

  const removeCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...(prev.categories || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, categories: newItems };
    });
  };

  const handleAddProduct = (catIndex, product) => {
    setFormData((prev) => {
      const newCats = [...(prev.categories || [])];
      const allowedProducts = [...(newCats[catIndex].allowedProducts || [])];
      if (!allowedProducts.some((p) => p._id === product._id)) {
        newCats[catIndex].allowedProducts = [...allowedProducts, product];
      }
      return { ...prev, categories: newCats };
    });
  };

  const handleRemoveProduct = (catIndex, productId) => {
    setFormData((prev) => {
      const newCats = [...(prev.categories || [])];
      newCats[catIndex].allowedProducts = (
        newCats[catIndex].allowedProducts || []
      ).filter((p) => p._id !== productId);
      return { ...prev, categories: newCats };
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-[14px] font-bold text-darkNavy flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {t("shopCategories")}
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5 max-w-[240px]">
            {t("shopCategoriesDesc")}
          </p>
        </div>
        <Button
          onPress={addCategory}
          variant="light"
          size="sm"
          className="flex items-center gap-1.5 text-[11px] font-bold h-8 rounded-lg"
        >
          <FaPlus size={12} />
          {t("addCategory")}
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {(formData.categories || []).map((category, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 relative group"
          >
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="absolute -top-3 -end-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <FaTrash size={12} />
            </button>

            <div className="grid grid-cols-1 gap-5 mb-5">
              {/* Image Upload & Names */}
              <div className="flex gap-5 items-start">
                {/* Square Icon Upload */}
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="aspect-square w-16 h-16 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 relative overflow-hidden flex items-center justify-center p-1.5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group/upload">
                    {category.image ? (
                      <>
                        <Image
                          unoptimized
                          src={
                            category.image.startsWith("data:")
                              ? category.image
                              : anyImgUrl({ src: category.image, size: 120 })
                          }
                          alt="category"
                          fill
                          className="object-cover rounded-xl group-hover/upload:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-neutral-300 group-hover/upload:text-primary transition-colors">
                        <FaUpload size={16} />
                        <span className="text-[7px] font-bold uppercase tracking-widest leading-none">
                          ICON
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        handleImageUpload(e, "categories", index, "image")
                      }
                    />
                  </div>
                </div>

                {/* Names */}
                <div className="flex-1 grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                      {t("nameAr")}
                    </label>
                    <input
                      value={category.nameAr}
                      onChange={(e) =>
                        handleCategoryChange(index, "nameAr", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:outline-none transition-all placeholder:text-neutral-300 shadow-sm shadow-black/[0.01]"
                      placeholder="Arabic Category Name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                      {t("nameEn")}
                    </label>
                    <input
                      value={category.nameEn}
                      onChange={(e) =>
                        handleCategoryChange(index, "nameEn", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:outline-none transition-all placeholder:text-neutral-300 shadow-sm shadow-black/[0.01]"
                      placeholder="English Category Name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selector with Gradient Card */}
            <div className="border-t border-neutral-50 pt-5 mt-2 bg-gradient-to-br from-neutral-50/40 to-white -mx-5 px-5 pb-1 rounded-b-2xl">
              <h4 className="text-[12px] font-bold text-darkNavy/60 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                <div className="w-1 h-3 bg-primary/30 rounded-full" />
                {t("categoryProducts")}
              </h4>
              <ProductSelector
                selectedProducts={category.allowedProducts || []}
                onSelect={(product) => handleAddProduct(index, product)}
                onRemove={(productId) => handleRemoveProduct(index, productId)}
                lang={lang}
                translate={translate}
                categories={categories}
                subCategories={subCategories}
                fixedUserId={formData.owner}
                translatePath="admin.shops"
              />
            </div>
          </div>
        ))}

        {(formData.categories || []).length === 0 && (
          <div className="py-20 bg-gradient-to-br from-[#fef7f2]/50 to-neutral-50 rounded-2xl border-2 border-dashed border-primary/15 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary/40 mb-4">
              <FaPlus size={24} />
            </div>
            <p className="text-sm font-bold text-darkNavy/50 uppercase tracking-widest max-w-[200px]">
              {t("noCategories")}
            </p>
            <p className="text-[11px] text-neutral-400 mt-2 max-w-[220px]">
              Click "{t("addCategory")}" to start grouping products into logical
              collections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
