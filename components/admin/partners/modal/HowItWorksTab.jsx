"use client";

import React from "react";
import { FaPlus, FaTrash } from "@/components/ui/svgs/AdminIcons";

const StepEditor = ({
  stepKey,
  formData,
  setFormData,
  t,
  color,
  colorBg,
  colorBorder,
}) => {
  const step = formData.howItWorks?.[stepKey] || {
    titleAr: "",
    titleEn: "",
    itemsAr: [],
    itemsEn: [],
  };

  const handleStepChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      howItWorks: {
        ...prev.howItWorks,
        [stepKey]: {
          ...prev.howItWorks?.[stepKey],
          [field]: value,
        },
      },
    }));
  };

  const addItem = (lang) => {
    const field = lang === "ar" ? "itemsAr" : "itemsEn";
    handleStepChange(field, [...(step[field] || []), ""]);
  };

  const updateItem = (lang, index, value) => {
    const field = lang === "ar" ? "itemsAr" : "itemsEn";
    const newItems = [...(step[field] || [])];
    newItems[index] = value;
    handleStepChange(field, newItems);
  };

  const removeItem = (lang, index) => {
    const field = lang === "ar" ? "itemsAr" : "itemsEn";
    const newItems = (step[field] || []).filter((_, i) => i !== index);
    handleStepChange(field, newItems);
  };

  return (
    <div
      className={`rounded-2xl border ${colorBorder} ${colorBg} p-5 space-y-5 shadow-sm`}
    >
      {/* Step Header */}
      <div className="flex items-center gap-2.5 mb-1 px-1">
        <div
          className="w-1.5 h-4 rounded-full shadow-sm"
          style={{ backgroundColor: color }}
        />
        <h4 className="text-[13px] font-bold text-darkNavy uppercase tracking-wider">
          {t(`howItWorks.${stepKey}`)}
        </h4>
      </div>

      {/* Titles */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-darkNavy/70 px-1">
            {t("howItWorks.stepTitleAr")}
          </label>
          <input
            value={step.titleAr || ""}
            onChange={(e) => handleStepChange("titleAr", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300"
            placeholder={t("howItWorks.stepTitlePlaceholder")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-darkNavy/70 px-1">
            {t("howItWorks.stepTitleEn")}
          </label>
          <input
            value={step.titleEn || ""}
            onChange={(e) => handleStepChange("titleEn", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300"
            placeholder={t("howItWorks.stepTitlePlaceholderEn")}
          />
        </div>
      </div>

      {/* Items - Arabic */}
      <div className="space-y-3 bg-white/40 p-4 rounded-xl border border-neutral-200/40">
        <div className="flex items-center justify-between px-1">
          <label className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest">
            {t("howItWorks.itemsAr")}
          </label>
          <button
            type="button"
            onClick={() => addItem("ar")}
            className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/8 px-3 py-1.5 rounded-lg hover:bg-primary/12 transition-all"
          >
            <FaPlus size={10} />
            {t("howItWorks.addItem")}
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {(step.itemsAr || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 group/item">
              <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors shrink-0 shadow-sm border border-neutral-200/20">
                {idx + 1}
              </div>
              <input
                value={item}
                onChange={(e) => updateItem("ar", idx, e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:outline-none transition-all"
                placeholder={t("howItWorks.itemPlaceholder")}
                dir="rtl"
              />
              <button
                type="button"
                onClick={() => removeItem("ar", idx)}
                className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:text-red-500 hover:bg-red-100/50 flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
          {(step.itemsAr || []).length === 0 && (
            <p className="text-[11px] text-neutral-400 italic text-center py-2">
              No Arabic items added
            </p>
          )}
        </div>
      </div>

      {/* Items - English */}
      <div className="space-y-3 bg-white/40 p-4 rounded-xl border border-neutral-200/40">
        <div className="flex items-center justify-between px-1">
          <label className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest">
            {t("howItWorks.itemsEn")}
          </label>
          <button
            type="button"
            onClick={() => addItem("en")}
            className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/8 px-3 py-1.5 rounded-lg hover:bg-primary/12 transition-all"
          >
            <FaPlus size={10} />
            {t("howItWorks.addItem")}
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {(step.itemsEn || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 group/item">
              <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors shrink-0 shadow-sm border border-neutral-200/20">
                {idx + 1}
              </div>
              <input
                value={item}
                onChange={(e) => updateItem("en", idx, e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:outline-none transition-all"
                placeholder={t("howItWorks.itemPlaceholderEn")}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => removeItem("en", idx)}
                className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:text-red-500 hover:bg-red-100/50 flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
          {(step.itemsEn || []).length === 0 && (
            <p className="text-[11px] text-neutral-400 italic text-center py-2">
              No English items added
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HowItWorksTab({ formData, setFormData, t }) {
  const handleSectionTitleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      howItWorks: {
        ...prev.howItWorks,
        [field]: value,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-6">
      {/* Section Header Card */}
      <div className="bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h4 className="text-[13px] font-bold text-primary uppercase tracking-wider">
            {t("howItWorks.sectionTitleAr")?.split(" ")[0] || "How Content"}
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
              {t("howItWorks.sectionTitleAr")}
            </label>
            <input
              value={formData.howItWorks?.sectionTitleAr || ""}
              onChange={(e) =>
                handleSectionTitleChange("sectionTitleAr", e.target.value)
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300 shadow-sm shadow-black/[0.01]"
              placeholder={t("howItWorks.sectionTitlePlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
              {t("howItWorks.sectionTitleEn")}
            </label>
            <input
              value={formData.howItWorks?.sectionTitleEn || ""}
              onChange={(e) =>
                handleSectionTitleChange("sectionTitleEn", e.target.value)
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300 shadow-sm shadow-black/[0.01]"
              placeholder={t("howItWorks.sectionTitlePlaceholderEn")}
            />
          </div>
        </div>
      </div>

      {/* Three Steps */}
      <div className="flex flex-col gap-5">
        <StepEditor
          stepKey="estajerSide"
          formData={formData}
          setFormData={setFormData}
          t={t}
          color="#f48a42"
          colorBg="bg-orange-50/20"
          colorBorder="border-orange-200/30"
        />

        <StepEditor
          stepKey="partnerSide"
          formData={formData}
          setFormData={setFormData}
          t={t}
          color="#f59e0b"
          colorBg="bg-amber-50/20"
          colorBorder="border-amber-200/30"
        />

        <StepEditor
          stepKey="sharedBenefits"
          formData={formData}
          setFormData={setFormData}
          t={t}
          color="#10b981"
          colorBg="bg-emerald-50/10"
          colorBorder="border-emerald-200/20"
        />
      </div>
    </div>
  );
}
