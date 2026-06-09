"use client";

import React from "react";
import { FaImage as ImageIcon, FaUpload, FaPlus } from "@/components/ui/svgs/AdminIcons";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function SeoTab({
  formData,
  handleInputChange,
  handleImageUpload,
  t,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-6">
      {/* Search Appearance Card */}
      <div className="bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h4 className="text-[13px] font-bold text-primary uppercase tracking-wider">
            {t("searchAppearance") || "Search Appearance"}
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white/50 p-4 rounded-xl border border-primary/5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                {t("seoTitleAr")}
              </label>
              <input
                name="seoTitleAr"
                value={formData.seoTitleAr}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all shadow-sm shadow-black/[0.01]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                {t("seoTitleEn")}
              </label>
              <input
                name="seoTitleEn"
                value={formData.seoTitleEn}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all shadow-sm shadow-black/[0.01]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description & Keywords Card */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 flex flex-col gap-5 shadow-sm">
        <div className="grid grid-cols-1 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
              {t("seoDescriptionAr")}
            </label>
            <textarea
              name="seoDescriptionAr"
              value={formData.seoDescriptionAr}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all resize-none shadow-sm shadow-black/[0.01]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
              {t("seoDescriptionEn")}
            </label>
            <textarea
              name="seoDescriptionEn"
              value={formData.seoDescriptionEn}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all resize-none shadow-sm shadow-black/[0.01]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
              {t("seoKeywordsAr")}
            </label>
            <input
              name="seoKeywordsAr"
              value={formData.seoKeywordsAr}
              onChange={handleInputChange}
              placeholder="word1, word2..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
              {t("seoKeywordsEn")}
            </label>
            <input
              name="seoKeywordsEn"
              value={formData.seoKeywordsEn}
              onChange={handleInputChange}
              placeholder="keyword1, keyword2..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Social Sharing Card */}
      <div className="bg-gradient-to-br from-neutral-50 to-white p-5 rounded-2xl border border-neutral-200/60 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <h4 className="text-[12px] font-bold text-darkNavy/60 uppercase tracking-widest">
            Social Sharing (Open Graph)
          </h4>
        </div>

        <div className="flex flex-col gap-4">
          <div className="aspect-[120/63] w-full bg-neutral-100/50 rounded-2xl border-2 border-dashed border-neutral-200 relative overflow-hidden flex items-center justify-center p-2 hover:border-primary/40 hover:bg-primary/[0.01] transition-all group/upload cursor-pointer">
            {formData.ogImage ? (
              <>
                <Image
                  unoptimized
                  src={
                    formData.ogImage.startsWith("data:")
                      ? formData.ogImage
                      : anyImgUrl({
                          src: formData.ogImage,
                          size: 600,
                          quality: 90,
                        })
                  }
                  alt="og"
                  fill
                  className="object-cover group-hover/upload:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                    <FaUpload size={18} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2.5 text-neutral-300 group-hover/upload:text-primary transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100 group-hover/upload:shadow-md group-hover/upload:border-primary/20 transition-all">
                  <ImageIcon size={24} />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
                    Upload OG Image
                  </span>
                  <p className="text-[9px] text-neutral-400">
                    Recommended: 1200 x 630 px
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleImageUpload(e, "ogImage")}
            />
          </div>
          <div className="px-1 flex items-center justify-between">
            <p className="text-[11px] text-neutral-400 max-w-[200px] leading-relaxed">
              This image will be displayed when your page is shared on social media like Facebook, Twitter...
            </p>
            {!formData.ogImage && (
              <div className="text-primary font-bold text-[11px] flex items-center gap-1 opacity-60">
                 <FaPlus size={10} /> Select
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
