"use client";
import React from "react";
import {
  FaPlus,
  FaTrash,
  FaChevronRight,
  FaGripVertical,
} from "@/components/ui/svgs/AdminIcons";
import { useTranslations } from "@/hooks/useTranslations";
import ProductSelector from "../../partners/ProductSelector";
import Button from "@/components/ui/Button";

export default function ShopSlidersTab({
  formData,
  addSlider,
  removeSlider,
  handleSliderChange,
  addProductToSlider,
  removeProductFromSlider,
  reorderProductsInSlider,
  lang,
  translate,
  categories,
  subCategories,
  ownerId,
  mode = "list", // 'list' or 'edit'
  sliderIndex = null,
  onEditSlider,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.shops.${key}`);

  if (mode === "edit" && sliderIndex !== null) {
    const slider = formData.sliders[sliderIndex];
    if (!slider) return null;

    return (
      <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Title Fields Card */}
        <div className="flex flex-col gap-4 bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {t("sliderTitleAr")?.split(" ")[0]}{" "}
              {t("sliderTitleEn")?.split(" ")[0]}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-darkNavy/80">
                {t("sliderTitleAr")}
              </label>
              <input
                type="text"
                value={slider.titleAr}
                onChange={(e) =>
                  handleSliderChange(sliderIndex, "titleAr", e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300"
                placeholder={t("sliderTitleAr")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-darkNavy/80">
                {t("sliderTitleEn")}
              </label>
              <input
                type="text"
                value={slider.titleEn}
                onChange={(e) =>
                  handleSliderChange(sliderIndex, "titleEn", e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300"
                placeholder={t("sliderTitleEn")}
              />
            </div>
          </div>
        </div>

        {/* Section Source Segment */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-darkNavy/80 flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {t("sectionSource")}
          </label>
          <div className="flex bg-neutral-100/80 p-1 rounded-xl">
            {[
              { key: "manual", label: t("manual") },
              { key: "newest", label: t("newest") },
              { key: "random", label: t("random") },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() =>
                  handleSliderChange(sliderIndex, "type", option.key)
                }
                className={`flex-1 py-2 text-[11px] font-bold rounded-[10px] transition-all duration-200 ${
                  slider.type === option.key ||
                  (!slider.type && option.key === "manual")
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-white/60"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Display Mode Segment */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-darkNavy/80 flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {t("displayMode")}
          </label>
          <div className="flex bg-neutral-100/80 p-1 rounded-xl">
            {[
              { key: "slider", label: t("slider") },
              { key: "grid", label: t("grid") },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() =>
                  handleSliderChange(sliderIndex, "displayMode", option.key)
                }
                className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all duration-200 ${
                  slider.displayMode === option.key ||
                  (!slider.displayMode && option.key === "slider")
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-white/60"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Selector */}
        {(slider.type === "manual" || !slider.type) && (
          <ProductSelector
            selectedProducts={slider.products}
            onSelect={(product) => addProductToSlider(sliderIndex, product)}
            onRemove={(productId) =>
              removeProductFromSlider(sliderIndex, productId)
            }
            onReorder={(from, to) =>
              reorderProductsInSlider(sliderIndex, from, to)
            }
            lang={lang}
            translate={translate}
            categories={categories}
            subCategories={subCategories}
            fixedUserId={ownerId}
            translatePath="admin.shops"
          />
        )}

        {/* Remove Slider Button */}
        <div className="pt-4 mt-1 border-t border-neutral-100">
          <Button
            type="button"
            variant="flat"
            onPress={() => removeSlider(sliderIndex)}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-red-400 hover:text-red-500 bg-red-50/50 hover:bg-red-50 transition-all border border-red-100/60 text-[13px] font-bold"
          >
            <FaTrash size={13} />
            {t("removeSlider")}
          </Button>
        </div>
      </div>
    );
  }

  // --- Management List View ---
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {formData.sliders.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-[#fef7f2] to-neutral-50 rounded-2xl border-2 border-dashed border-primary/15">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <FaGripVertical size={22} />
            </div>
            <p className="text-sm font-bold text-darkNavy">
              {t("noSliders")}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1.5 max-w-[200px]">
              Add your first product slider to get started
            </p>
          </div>
        ) : (
          formData.sliders.map((slider, index) => (
            <button
              key={index}
              onClick={() => onEditSlider(index)}
              className="w-full group flex items-center justify-between p-4 bg-white hover:bg-[#fef7f2] rounded-xl border border-neutral-200/60 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-200 text-start"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary/70 group-hover:text-primary group-hover:bg-primary/12 transition-all shrink-0">
                  <FaGripVertical size={14} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] font-bold text-darkNavy truncate">
                    {lang === "ar"
                      ? slider.titleAr || `Slider #${index + 1}`
                      : slider.titleEn || `Slider #${index + 1}`}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {slider.products.length} {t("products")}
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-primary/10 flex items-center justify-center text-neutral-300 group-hover:text-primary transition-all shrink-0">
                <FaChevronRight
                  size={11}
                  className={lang === "ar" ? "rotate-180" : ""}
                />
              </div>
            </button>
          ))
        )}
      </div>

      <Button
        type="button"
        variant="flat"
        onPress={addSlider}
        className="w-full py-4 rounded-xl flex items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.02] hover:bg-primary/5 transition-all duration-200 text-primary/60 hover:text-primary text-[13px] font-bold mt-1"
      >
        <FaPlus size={13} />
        {t("addSlider")}
      </Button>
    </div>
  );
}
