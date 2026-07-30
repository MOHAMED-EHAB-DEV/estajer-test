"use client";

import React from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { FaImage as ImageIcon } from "@/components/ui/svgs/AdminIcons";

export default function FooterEditor({
  data,
  handleChange,
  handleImageUpload,
  t,
  trans,
  labelCls,
  inputCls,
}) {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-5">
        {/* Footer Logo Uploader */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50/30 border border-neutral-100">
          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-neutral-200 relative overflow-hidden group hover:border-primary/40 transition-all bg-white flex items-center justify-center cursor-pointer shadow-sm">
            {data.logo ? (
              <Image
                unoptimized
                src={
                  data.logo.startsWith("data:")
                    ? data.logo
                    : anyImgUrl({ src: data.logo, size: 160 })
                }
                alt="footer-logo"
                fill
                className="object-contain p-2"
              />
            ) : (
              <ImageIcon size={18} className="text-neutral-300" />
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleImageUpload(e, "logo", true)}
            />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-[12px] font-bold text-darkNavy/80">
              {t("image") || "Footer Logo"}
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {trans("admin.shops.logoHint") || "Recommended: 400x400px"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t("footerDescriptionAr")}</label>
            <textarea
              name="descriptionAr"
              value={data.descriptionAr || ""}
              onChange={handleChange}
              className={`${inputCls} min-h-[80px] resize-none`}
              placeholder={t("footerDescriptionPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t("footerDescriptionEn")}</label>
            <textarea
              name="descriptionEn"
              value={data.descriptionEn || ""}
              onChange={handleChange}
              className={`${inputCls} min-h-[80px] resize-none`}
              placeholder={t("footerDescriptionPlaceholder")}
            />
          </div>
        </div>
      </div>

      <p className={labelCls}>{t("socialLinks")}</p>
      <div className="grid grid-cols-1 gap-3.5">
        {[
          {
            name: "facebook",
            label: "Facebook",
            placeholder: "https://facebook.com/...",
          },
          {
            name: "instagram",
            label: "Instagram",
            placeholder: "https://instagram.com/...",
          },
          {
            name: "twitter",
            label: "Twitter (X)",
            placeholder: "https://twitter.com/...",
          },
          {
            name: "snapchat",
            label: "Snapchat",
            placeholder: "https://snapchat.com/add/...",
          },
          {
            name: "tiktok",
            label: "TikTok",
            placeholder: "https://tiktok.com/@...",
          },
          {
            name: "whatsapp",
            label: "WhatsApp",
            placeholder: "https://wa.me/...",
          },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-neutral-500 px-1">
              {field.label}
            </label>
            <input
              name={field.name}
              value={data[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={inputCls}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
