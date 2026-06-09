"use client";

import React from "react";
import { FaPlus, FaTrash, FaUpload } from "@/components/ui/svgs/AdminIcons";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function HeroBannersTab({
  formData,
  addHeroBanner,
  removeHeroBanner,
  handleBannerChange,
  handleInputChange,
  handleImageUpload,
  t,
}) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Hero Text Customization Card */}
      <div className="bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h4 className="text-[13px] font-bold text-primary uppercase tracking-wider">
            {t("heroTextCustomization")}
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {/* Arabic Section */}
          <div className="space-y-3.5 bg-white/50 p-4 rounded-xl border border-primary/5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                {t("heroTitleAr")}
              </label>
              <input
                name="heroTitleAr"
                value={formData.heroTitleAr || ""}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300 shadow-sm shadow-black/[0.02]"
                placeholder={t("heroTitleArPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                {t("heroDescriptionAr")}
              </label>
              <textarea
                name="heroDescriptionAr"
                value={formData.heroDescriptionAr || ""}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm min-h-[90px] focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all resize-none placeholder:text-neutral-300 shadow-sm shadow-black/[0.02]"
                placeholder={t("heroDescriptionArPlaceholder")}
              />
            </div>
          </div>

          {/* English Section */}
          <div className="space-y-3.5 bg-white/50 p-4 rounded-xl border border-primary/5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                {t("heroTitleEn")}
              </label>
              <input
                name="heroTitleEn"
                value={formData.heroTitleEn || ""}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300 shadow-sm shadow-black/[0.02]"
                placeholder={t("heroTitleEnPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                {t("heroDescriptionEn")}
              </label>
              <textarea
                name="heroDescriptionEn"
                value={formData.heroDescriptionEn || ""}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm min-h-[90px] focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all resize-none placeholder:text-neutral-300 shadow-sm shadow-black/[0.02]"
                placeholder={t("heroDescriptionEnPlaceholder")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-[13px] font-bold text-darkNavy flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {t("heroBanners")}
          </h3>
        </div>
        <Button
          onPress={addHeroBanner}
          variant="light"
          size="sm"
          className="flex items-center gap-1.5 text-[12px] h-8 rounded-lg"
        >
          <FaPlus size={12} />
          {t("addHeroBanner")}
        </Button>
      </div>

      <div className="flex flex-col gap-5 pb-4">
        {formData.heroBanners.map((banner, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 relative group"
          >
            <button
              onClick={() => removeHeroBanner(index)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <FaTrash size={12} />
            </button>

            <div className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Arabic Image */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                    {t("imageAr")}
                  </label>
                  <div className="aspect-[21/9] w-full bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 relative overflow-hidden flex items-center justify-center p-2 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group/upload">
                    {banner.imageAr ? (
                      <>
                        <Image
                          unoptimized
                          src={
                            banner.imageAr.startsWith("data:")
                              ? banner.imageAr
                              : anyImgUrl({
                                  src: banner.imageAr,
                                  size: 400,
                                  quality: 90,
                                })
                          }
                          alt="banner"
                          fill
                          className="object-cover group-hover/upload:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <FaUpload size={14} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-neutral-300 group-hover/upload:text-primary transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-neutral-100 group-hover/upload:shadow-md group-hover/upload:border-primary/20 transition-all">
                          <FaUpload size={14} />
                        </div>
                        <span className="text-[8px] uppercase font-bold tracking-widest mt-1">
                          AR BANNER
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        handleImageUpload(e, "heroBanners", index, "imageAr")
                      }
                    />
                  </div>
                </div>

                {/* English Image */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                    {t("imageEn")}
                  </label>
                  <div className="aspect-[21/9] w-full bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 relative overflow-hidden flex items-center justify-center p-2 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group/upload">
                    {banner.imageEn ? (
                      <>
                        <Image
                          unoptimized
                          src={
                            banner.imageEn.startsWith("data:")
                              ? banner.imageEn
                              : anyImgUrl({
                                  src: banner.imageEn,
                                  size: 400,
                                  quality: 90,
                                })
                          }
                          alt="banner"
                          fill
                          className="object-cover group-hover/upload:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <FaUpload size={14} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-neutral-300 group-hover/upload:text-primary transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-neutral-100 group-hover/upload:shadow-md group-hover/upload:border-primary/20 transition-all">
                          <FaUpload size={14} />
                        </div>
                        <span className="text-[8px] uppercase font-bold tracking-widest mt-1">
                          EN BANNER
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        handleImageUpload(e, "heroBanners", index, "imageEn")
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Banner Info */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                    {t("link")}
                  </label>
                  <input
                    value={banner.link || ""}
                    onChange={(e) =>
                      handleBannerChange(
                        "heroBanners",
                        index,
                        "link",
                        e.target.value,
                      )
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                      {t("altAr")}
                    </label>
                    <input
                      value={banner.altAr || ""}
                      onChange={(e) =>
                        handleBannerChange(
                          "heroBanners",
                          index,
                          "altAr",
                          e.target.value,
                        )
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-[12px] focus:border-primary focus:outline-none transition-all"
                      placeholder={t("altArPlaceholder")}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                      {t("altEn")}
                    </label>
                    <input
                      value={banner.altEn || ""}
                      onChange={(e) =>
                        handleBannerChange(
                          "heroBanners",
                          index,
                          "altEn",
                          e.target.value,
                        )
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-[12px] focus:border-primary focus:outline-none transition-all"
                      placeholder={t("altEnPlaceholder")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {formData.heroBanners.length === 0 && (
          <div className="py-16 bg-gradient-to-br from-[#fef7f2]/50 to-neutral-50 rounded-2xl border-2 border-dashed border-primary/15 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary/40 mb-4">
              <FaUpload size={24} />
            </div>
            <p className="text-sm font-bold text-darkNavy/50 uppercase tracking-widest max-w-[200px]">
              {t("noBanners") || "No banners yet"}
            </p>
            <p className="text-[11px] text-neutral-400 mt-2 max-w-[220px]">
              Click "{t("addHeroBanner")}" to start adding sliders for the top
              of the page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
