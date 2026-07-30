"use client";

import React from "react";
import { anyImgUrl } from "@/utils/ImageUrl";
import ProductLinkPicker from "@/components/shop/editor/ProductLinkPicker";

export default function BannerEditor({
  data,
  handleChange,
  handleImageUpload,
  t,
  labelCls,
  inputCls,
  formData,
  lang,
  translate,
}) {
  const ownerId = formData?.owner;
  const shopSlug = formData?.slug;
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      {/* Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("badge") + " (Ar)"}</label>
          <input
            name="badgeAr"
            value={data.badgeAr || ""}
            onChange={handleChange}
            placeholder="عرض حصري"
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("badge") + " (En)"}</label>
          <input
            name="badgeEn"
            value={data.badgeEn || ""}
            onChange={handleChange}
            placeholder="Exclusive Deal"
            className={inputCls}
          />
        </div>
      </div>
      {/* Title */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("title") + " (Ar)"}</label>
          <input
            name="titleAr"
            value={data.titleAr || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("title") + " (En)"}</label>
          <input
            name="titleEn"
            value={data.titleEn || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>
      {/* Subtitle / Description */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("subtitle") + " (Ar)"}</label>
          <input
            name="subtitleAr"
            value={data.subtitleAr || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("subtitle") + " (En)"}</label>
          <input
            name="subtitleEn"
            value={data.subtitleEn || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>
      {/* Button */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("buttonText") + " (Ar)"}</label>
          <input
            name="buttonTextAr"
            value={data.buttonTextAr || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("buttonText") + " (En)"}</label>
          <input
            name="buttonTextEn"
            value={data.buttonTextEn || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>{t("buttonLink")}</label>
        <ProductLinkPicker
          value={data.buttonLink || ""}
          onChange={(val) =>
            handleChange({
              target: { name: "buttonLink", value: val },
            })
          }
          lang={lang}
          translate={translate}
          ownerId={ownerId}
          shopSlug={shopSlug}
          inputCls={inputCls}
        />
      </div>
      {/* Images */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("image") + " (Ar)"}</label>
          <div className="relative aspect-video rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 group">
            {data.imageAr ? (
              <img
                src={
                  data.imageAr.startsWith("data:")
                    ? data.imageAr
                    : anyImgUrl({ src: data.imageAr, size: 400 })
                }
                className="w-full h-full object-cover"
                alt="AR"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                16:9
              </div>
            )}
            <input
              type="file"
              onChange={(e) => handleImageUpload(e, "imageAr", true)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("image") + " (En)"}</label>
          <div className="relative aspect-video rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 group">
            {data.imageEn ? (
              <img
                src={
                  data.imageEn.startsWith("data:")
                    ? data.imageEn
                    : anyImgUrl({ src: data.imageEn, size: 400 })
                }
                className="w-full h-full object-cover"
                alt="EN"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                16:9
              </div>
            )}
            <input
              type="file"
              onChange={(e) => handleImageUpload(e, "imageEn", true)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
