"use client";

import React from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import {
  FaImage as ImageIcon,
  FaChevronRight,
} from "@/components/ui/svgs/AdminIcons";

export default function AboutEditor({
  data,
  handleChange,
  handleImageUpload,
  t,
  trans,
  labelCls,
  inputCls,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      {/* Section Identity */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 flex flex-col gap-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          {[
            { name: "shopNameAr", label: t("title") + " (Ar)" },
            { name: "shopNameEn", label: t("title") + " (En)" },
          ].map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className={labelCls}>{label}</label>
              <input
                name={name}
                value={data[name] || ""}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          ))}
        </div>

        {/* About Image Uploader */}
        <div className="pt-2 border-t border-neutral-50 mt-1">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl border-2 border-dashed border-neutral-200 relative overflow-hidden group/logo hover:border-primary/40 transition-all bg-neutral-50 flex items-center justify-center cursor-pointer shadow-sm">
              {data.aboutImage ? (
                <Image
                  unoptimized
                  src={
                    data.aboutImage.startsWith("data:")
                      ? data.aboutImage
                      : anyImgUrl({ src: data.aboutImage, size: 160 })
                  }
                  alt="about"
                  fill
                  className="object-contain p-1.5 md:p-2"
                />
              ) : (
                <div className="text-neutral-300 flex flex-col items-center gap-1">
                  <ImageIcon className="md:w-4.5 w-[14px] md:h-4.5 h-[14px]" />
                  <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-widest mt-0.5">
                    IMAGE
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleImageUpload(e, "aboutImage", true)}
              />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-[12px] font-bold text-darkNavy/80 leading-tight">
                {t("image") || "About Image"}
              </p>
              <button className="text-primary text-[9px] md:text-[10px] font-bold mt-1 md:mt-1.5 flex items-center gap-1 hover:underline">
                {trans("admin.shops.chooseFile") || "Select Image"}{" "}
                <FaChevronRight className="md:w-[7px] w-[5px] md:h-[7px] h-[5px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Descriptions */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 flex flex-col gap-4 shadow-sm">
        {[
          {
            name: "aboutDescriptionAr",
            label: trans("admin.shops.description") + " (Ar)",
          },
          {
            name: "aboutDescriptionEn",
            label: trans("admin.shops.description") + " (En)",
          },
        ].map(({ name, label }) => (
          <div key={name} className="flex flex-col gap-1.5">
            <label className={labelCls}>{label}</label>
            <textarea
              name={name}
              value={data[name] || ""}
              onChange={handleChange}
              rows={3}
              className={`${inputCls} resize-none pt-2`}
            />
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 flex flex-col gap-4">
        <h4 className="text-[11px] font-black text-darkNavy uppercase tracking-widest opacity-60">
          {t("actionButton")}
        </h4>
        {[
          {
            name: "aboutUsButtonTextAr",
            label: t("buttonText") + " (Ar)",
          },
          {
            name: "aboutUsButtonTextEn",
            label: t("buttonText") + " (En)",
          },
          {
            name: "aboutUsLink",
            label: t("buttonLink"),
            placeholder: "#products",
          },
        ].map(({ name, label, placeholder }) => (
          <div key={name} className="flex flex-col gap-1.5">
            <label className={labelCls}>{label}</label>
            <input
              name={name}
              value={data[name] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              className={inputCls}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
