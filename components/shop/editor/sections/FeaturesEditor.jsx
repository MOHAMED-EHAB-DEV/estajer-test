"use client";

import React, { useState } from "react";
import { FEATURE_ICONS, FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";

export default function FeaturesEditor({
  data,
  onDataChange,
  t,
  labelCls,
  inputCls,
  isAr,
}) {
  const [openPickerIdx, setOpenPickerIdx] = useState(null);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      <p className={labelCls}>{t("features")}</p>
      <div className="flex flex-col gap-5">
        {(data.features || []).map((feature, idx) => {
          const activeIconObj = FEATURE_ICONS.find((item) => item.key === feature.iconType) || 
            FEATURE_ICONS.find((item) => item.key === "quality");

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/30 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOpenPickerIdx(null);
                    const newFeatures = (data.features || []).filter((_, i) => i !== idx);
                    onDataChange({ ...data, features: newFeatures });
                  }}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title={t("remove")}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Icon Picker Popover */}
              <div className="flex flex-col gap-2 relative">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                  {t("chooseIcon")}
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenPickerIdx(openPickerIdx === idx ? null : idx)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all text-xs font-bold text-neutral-800 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FeatureIcon type={feature.iconType} className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-start">
                      {isAr ? activeIconObj?.labelAr : activeIconObj?.labelEn}
                    </span>
                    <svg
                      className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${
                        openPickerIdx === idx ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openPickerIdx === idx && (
                    <>
                      {/* Backdrop to close picker when clicking outside */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenPickerIdx(null)}
                      />
                      <div className="absolute top-full start-0 mt-2 z-20 w-full max-w-[280px] p-3 bg-white border border-neutral-200 rounded-2xl shadow-xl grid grid-cols-4 gap-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {FEATURE_ICONS.map((ico) => (
                          <button
                            key={ico.key}
                            type="button"
                            onClick={() => {
                              const newFeatures = [...data.features];
                              newFeatures[idx].iconType = ico.key;
                              onDataChange({ ...data, features: newFeatures });
                              setOpenPickerIdx(null);
                            }}
                            title={isAr ? ico.labelAr : ico.labelEn}
                            className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                              feature.iconType === ico.key
                                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                            }`}
                          >
                            {ico.icon("w-6 h-6")}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={feature.titleAr}
                  onChange={(e) => {
                    const newFeatures = [...data.features];
                    newFeatures[idx].titleAr = e.target.value;
                    onDataChange({ ...data, features: newFeatures });
                  }}
                  placeholder="العنوان (Ar)"
                  className={inputCls}
                />
                <input
                  value={feature.titleEn}
                  onChange={(e) => {
                    const newFeatures = [...data.features];
                    newFeatures[idx].titleEn = e.target.value;
                    onDataChange({ ...data, features: newFeatures });
                  }}
                  placeholder="Title (En)"
                  className={inputCls}
                />
              </div>
              <textarea
                value={feature.descAr}
                onChange={(e) => {
                  const newFeatures = [...data.features];
                  newFeatures[idx].descAr = e.target.value;
                  onDataChange({ ...data, features: newFeatures });
                }}
                placeholder="الوصف (Ar)"
                className={`${inputCls} h-16 pt-2 resize-none`}
              />
              <textarea
                value={feature.descEn}
                onChange={(e) => {
                  const newFeatures = [...data.features];
                  newFeatures[idx].descEn = e.target.value;
                  onDataChange({ ...data, features: newFeatures });
                }}
                placeholder="Description (En)"
                className={`${inputCls} h-16 pt-2 resize-none`}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          const newFeatures = [
            ...(data.features || []),
            {
              iconType: "verified",
              titleAr: "",
              titleEn: "",
              descAr: "",
              descEn: "",
            },
          ];
          onDataChange({ ...data, features: newFeatures });
        }}
        className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-primary hover:text-primary text-neutral-500 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-white hover:bg-neutral-50/50 shadow-sm active:scale-[0.99]"
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {isAr ? "إضافة ميزة جديدة" : "Add New Feature"}
      </button>
    </div>
  );
}
