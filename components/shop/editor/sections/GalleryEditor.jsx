"use client";

import React from "react";
import { anyImgUrl } from "@/utils/ImageUrl";
import { FaImage as ImageIcon } from "@/components/ui/svgs/AdminIcons";

export default function GalleryEditor({
  data,
  onDataChange,
  handleChange,
  t,
  isAr,
  labelCls,
  inputCls,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      {/* Section title */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("title")} (Ar)</label>
          <input
            name="titleAr"
            value={data.titleAr || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("title")} (En)</label>
          <input
            name="titleEn"
            value={data.titleEn || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>

      {/* Layout Selector */}
      <div className="flex flex-col gap-1.5 bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm">
        <label className={labelCls}>
          {t("galleryLayout")}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { key: "magazine", labelAr: "مجلة", labelEn: "Magazine" },
            { key: "grid", labelAr: "شبكة", labelEn: "Grid" },
            { key: "strip", labelAr: "شريط أفقي", labelEn: "Strip" },
            { key: "masonry", labelAr: "موزاييك", labelEn: "Masonry" },
          ].map((lay) => (
            <button
              key={lay.key}
              type="button"
              onClick={() =>
                onDataChange((prev) => ({ ...prev, layout: lay.key }))
              }
              className={`h-9 rounded-xl text-[12px] font-bold border-2 transition-all ${
                (data.layout || "masonry") === lay.key
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
              }`}
            >
              {isAr ? lay.labelAr : lay.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Images list */}
      <div className="flex flex-col gap-3">
        <p className={labelCls}>{t("images")}</p>
        {(data.images || []).map((img, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/30 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() =>
                  onDataChange((prev) => ({
                    ...prev,
                    images: (prev.images || []).filter(
                      (_, i) => i !== idx,
                    ),
                  }))
                }
                className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors px-2"
              >
                {t("remove")}
              </button>
            </div>

            {/* Image uploader */}
            <div className="relative aspect-video rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 group cursor-pointer">
              {img.src ? (
                <img
                  src={
                    img.src.startsWith("data:")
                      ? img.src
                      : anyImgUrl({ src: img.src, size: 400 })
                  }
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 flex-col gap-1">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t("uploadImage")}
                  </span>
                </div>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  import("@/utils/ImageResizer").then(
                    ({ resizeImage }) => {
                      Promise.all(files.map((f) => resizeImage(f))).then(
                        (resizedList) => {
                          onDataChange((prev) => {
                            const arr = [...(prev.images || [])];
                            arr[idx] = {
                              ...arr[idx],
                              src: resizedList[0].preview,
                            };
                            const extra = resizedList
                              .slice(1)
                              .map((resized) => ({
                                src: resized.preview,
                                altAr: "",
                                altEn: "",
                                link: "",
                              }));
                            return {
                              ...prev,
                              images: [...arr, ...extra],
                            };
                          });
                        },
                      );
                    },
                  );
                }}
              />
            </div>

            {/* Alt texts */}
            <div className="grid grid-cols-2 gap-2">
              <input
                value={img.altAr || ""}
                onChange={(e) => {
                  onDataChange((prev) => {
                    const arr = [...(prev.images || [])];
                    arr[idx] = { ...arr[idx], altAr: e.target.value };
                    return { ...prev, images: arr };
                  });
                }}
                placeholder={
                  isAr
                    ? "النص البديل (Ar) — اختياري"
                    : "Alt text (Ar) — optional"
                }
                className={inputCls}
              />
              <input
                value={img.altEn || ""}
                onChange={(e) => {
                  onDataChange((prev) => {
                    const arr = [...(prev.images || [])];
                    arr[idx] = { ...arr[idx], altEn: e.target.value };
                    return { ...prev, images: arr };
                  });
                }}
                placeholder="Alt text (En) — optional"
                className={inputCls}
              />
            </div>

            {/* Link */}
            <input
              value={img.link || ""}
              onChange={(e) => {
                onDataChange((prev) => {
                  const arr = [...(prev.images || [])];
                  arr[idx] = { ...arr[idx], link: e.target.value };
                  return { ...prev, images: arr };
                });
              }}
              placeholder={t("linkOptional")}
              className={inputCls}
            />
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative h-10 rounded-xl border-2 border-dashed border-neutral-200 text-[12px] font-bold text-neutral-400 hover:border-primary hover:text-primary transition-all flex items-center justify-center cursor-pointer">
            <span>
              + {t("uploadMultipleImages")}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                import("@/utils/ImageResizer").then(({ resizeImage }) => {
                  Promise.all(files.map((f) => resizeImage(f))).then(
                    (resizedList) => {
                      onDataChange((prev) => {
                        const newImages = resizedList.map((resized) => ({
                          src: resized.preview,
                          altAr: "",
                          altEn: "",
                          link: "",
                        }));
                        return {
                          ...prev,
                          images: [...(prev.images || []), ...newImages],
                        };
                      });
                    },
                  );
                });
              }}
            />
          </div>
          <button
            type="button"
            onClick={() =>
              onDataChange((prev) => ({
                ...prev,
                images: [
                  ...(prev.images || []),
                  { src: "", altAr: "", altEn: "", link: "" },
                ],
              }))
            }
            className="h-10 rounded-xl border-2 border-dashed border-neutral-200 text-[12px] font-bold text-neutral-400 hover:border-primary hover:text-primary transition-all"
          >
            + {t("addBlankSlide")}
          </button>
        </div>
      </div>
    </div>
  );
}
