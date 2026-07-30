"use client";

import React from "react";
import HeroBannersTab from "@/components/admin/partners/modal/HeroBannersTab";

export default function HeroEditor({ data, onDataChange, handleChange, t, lang, themeId }) {
  const xPositions = ["left", "center", "right"];
  const yPositions = ["top", "center", "bottom"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10 flex flex-col gap-6">
      <HeroBannersTab
        formData={{ ...data, heroBanners: data.heroBanners || [] }}
        lang={lang}
        themeId={themeId}
        addHeroBanner={() =>
          onDataChange((prev) => ({
            ...prev,
            heroBanners: [
              ...(prev.heroBanners || []),
              {
                imageAr: "",
                imageEn: "",
                imageMobileAr: "",
                imageMobileEn: "",
                link: "",
                altAr: "",
                altEn: "",
                order: (prev.heroBanners || []).length,
              },
            ],
          }))
        }
        removeHeroBanner={(idx) =>
          onDataChange((prev) => ({
            ...prev,
            heroBanners: (prev.heroBanners || []).filter((_, i) => i !== idx),
          }))
        }
        handleBannerChange={(field, index, subField, value) => {
          onDataChange((prev) => {
            const arr = [...(prev.heroBanners || [])];
            arr[index] = { ...arr[index], [subField]: value };
            return { ...prev, heroBanners: arr };
          });
        }}
        handleInputChange={handleChange}
        handleImageUpload={(e, field, index, subField) => {
          const file = e.target.files[0];
          if (!file) return;
          import("@/utils/ImageResizer").then(({ resizeImage }) =>
            resizeImage(file).then((resized) => {
              if (index !== null && subField) {
                onDataChange((prev) => {
                  const arr = [...(prev.heroBanners || [])];
                  arr[index] = {
                    ...arr[index],
                    [subField]: resized.preview,
                  };
                  return { ...prev, heroBanners: arr };
                });
              }
            }),
          );
        }}
        t={t}
      />

      {/* Background Settings */}
      <div className="bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h4 className="text-[13px] font-bold text-primary uppercase tracking-wider">
            {t("backgroundSettings")}
          </h4>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] md:text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              {t("overlayOpacity")}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={data.heroBgOpacity ?? 50}
                onChange={(e) =>
                  onDataChange((prev) => ({
                    ...prev,
                    heroBgOpacity: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs font-bold text-neutral-600 w-8">
                {data.heroBgOpacity ?? 50}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[10px] md:text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              {t("backgroundPosition")}
            </label>
            <div className="grid grid-cols-3 gap-2 w-44 h-44 bg-gray-50 p-2 rounded-xl border border-gray-200 self-center">
              {yPositions.map((y) =>
                xPositions.map((x) => {
                  const isSelected =
                    (data.heroBgPositionX || "center") === x &&
                    (data.heroBgPositionY || "center") === y;
                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      onClick={() =>
                        onDataChange((prev) => ({
                          ...prev,
                          heroBgPositionX: x,
                          heroBgPositionY: y,
                        }))
                      }
                      className={`w-full h-full rounded-lg transition-all duration-300 border flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "bg-primary border-primary shadow-md scale-105"
                          : "bg-white border-gray-200 hover:bg-gray-100"
                      }`}
                      title={`${x} ${y}`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-white" : "bg-gray-300"}`}
                      />
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-primary/5">
            <span className="text-[10px] md:text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              {t("backgroundOnly")}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.heroBgOnly || false}
                onChange={(e) =>
                  onDataChange((prev) => ({
                    ...prev,
                    heroBgOnly: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* CTA Button Settings */}
      <div className="bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h4 className="text-[13px] font-bold text-primary uppercase tracking-wider">
            {t("ctaButton")}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] md:text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              {t("ctaTextAr")}
            </label>
            <input
              name="heroCtaTextAr"
              value={data.heroCtaTextAr || ""}
              onChange={handleChange}
              className="w-full px-2.5 py-2 md:px-3.5 md:py-2.5 rounded-lg md:rounded-xl border border-neutral-200/80 bg-white text-xs md:text-sm focus:border-primary focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] md:text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              {t("ctaTextEn") || "Button Text (En)"}
            </label>
            <input
              name="heroCtaTextEn"
              value={data.heroCtaTextEn || ""}
              onChange={handleChange}
              className="w-full px-2.5 py-2 md:px-3.5 md:py-2.5 rounded-lg md:rounded-xl border border-neutral-200/80 bg-white text-xs md:text-sm focus:border-primary focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] md:text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              {t("ctaLinkAr") || "Button Link (Ar)"}
            </label>
            <input
              name="heroCtaLinkAr"
              value={data.heroCtaLinkAr || ""}
              onChange={handleChange}
              className="w-full px-2.5 py-2 md:px-3.5 md:py-2.5 rounded-lg md:rounded-xl border border-neutral-200/80 bg-white text-xs md:text-sm focus:border-primary focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] md:text-[12px] font-bold text-neutral-400 uppercase tracking-wider px-1">
              {t("ctaLinkEn") || "Button Link (En)"}
            </label>
            <input
              name="heroCtaLinkEn"
              value={data.heroCtaLinkEn || ""}
              onChange={handleChange}
              className="w-full px-2.5 py-2 md:px-3.5 md:py-2.5 rounded-lg md:rounded-xl border border-neutral-200/80 bg-white text-xs md:text-sm focus:border-primary focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
