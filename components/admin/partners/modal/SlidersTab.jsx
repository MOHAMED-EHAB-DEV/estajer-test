"use client";
import React from "react";
import {
  FaPlus,
  FaTrash,
  FaChevronRight,
  FaGripVertical,
} from "@/components/ui/svgs/AdminIcons";
import Button from "@/components/ui/Button";
import ProductSelector from "../ProductSelector";

export default function SlidersTab({
  formData,
  addSlider,
  removeSlider,
  handleSliderChange,
  addProductToSlider,
  removeProductFromSlider,
  reorderProductsInSlider,
  lang,
  translate,
  t,
  categories,
  subCategories,
  mode = "list",
  sliderIndex = null,
  onEditSlider,
}) {
  if (mode === "edit" && sliderIndex !== null) {
    const slider = formData.sliders[sliderIndex];
    if (!slider) return null;

    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-darkNavy">
                {t("sliderTitleAr")}
              </label>
              <input
                value={slider.titleAr}
                onChange={(e) =>
                  handleSliderChange(sliderIndex, "titleAr", e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-darkNavy">
                {t("sliderTitleEn")}
              </label>
              <input
                value={slider.titleEn}
                onChange={(e) =>
                  handleSliderChange(sliderIndex, "titleEn", e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-sm font-semibold text-darkNavy">
              {t("displayMode")}
            </label>
            <div className="flex bg-white p-1 rounded-xl border border-neutral-200">
              <button
                type="button"
                onClick={() =>
                  handleSliderChange(sliderIndex, "displayMode", "slider")
                }
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  slider.displayMode === "slider" || !slider.displayMode
                    ? "bg-primary text-white shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {t("slider")}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSliderChange(sliderIndex, "displayMode", "grid")
                }
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  slider.displayMode === "grid"
                    ? "bg-primary text-white shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {t("grid")}
              </button>
            </div>
          </div>

          <ProductSelector
            selectedProducts={slider.products}
            onSelect={(product) => addProductToSlider(sliderIndex, product)}
            onRemove={(id) => removeProductFromSlider(sliderIndex, id)}
            onReorder={(from, to) =>
              reorderProductsInSlider(sliderIndex, from, to)
            }
            lang={lang}
            translate={translate}
            categories={categories}
            subCategories={subCategories}
          />

          <div className="pt-4 mt-4 border-t border-neutral-200">
            <Button
              onPress={() => removeSlider(sliderIndex)}
              variant="flat"
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-all border border-red-100 text-sm font-bold"
            >
              <FaTrash size={14} />
              {t("removeSlider")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Management List View ---
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-2">
        {formData.sliders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <FaGripVertical size={20} />
            </div>
            <p className="text-sm font-bold text-darkNavy">{t("noSliders")}</p>
          </div>
        ) : (
          formData.sliders.map((slider, index) => (
            <button
              key={index}
              onClick={() => onEditSlider(index)}
              className="w-full group flex items-center justify-between p-4 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200/60 shadow-sm transition-all text-start"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[13.5px] font-bold text-darkNavy truncate">
                  {lang === "ar"
                    ? slider.titleAr || `Slider #${index + 1}`
                    : slider.titleEn || `Slider #${index + 1}`}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {slider.products?.length || 0} {t("products")}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-primary/10 flex items-center justify-center text-neutral-400 group-hover:text-primary transition-all">
                <FaChevronRight
                  size={12}
                  className={lang === "ar" ? "rotate-180" : ""}
                />
              </div>
            </button>
          ))
        )}
      </div>

      <Button
        onPress={addSlider}
        variant="flat"
        className="w-full py-4 rounded-xl flex items-center justify-center gap-2 border-2 border-dashed border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all text-neutral-500 hover:text-primary text-sm font-bold"
      >
        <FaPlus size={14} />
        {t("addSlider")}
      </Button>
    </div>
  );
}
