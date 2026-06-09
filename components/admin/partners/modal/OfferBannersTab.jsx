"use client";

import React from "react";
import {
  FaPlus,
  FaTrash,
  FaChevronRight,
  FaGripVertical,
  FaImage,
} from "@/components/ui/svgs/AdminIcons";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function OfferBannersTab({
  formData,
  addOfferBannerSection,
  removeOfferBannerSection,
  handleOfferBannerSectionChange,
  addBannerToSection,
  removeBannerFromSection,
  handleBannerChangeInSection,
  handleImageUpload,
  t,
  lang,
  mode = "list", // 'list' or 'edit'
  sectionIndex = null,
  onEditOffer,
}) {
  if (mode === "edit" && sectionIndex !== null) {
    const section = formData.offerBanners[sectionIndex];
    if (!section) return null;

    return (
      <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Section Header Card */}
        <div className="flex flex-col gap-4 bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {t("sliderTitleAr")?.split(" ")[0] || "Section"} Details
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-darkNavy/80">
                {t("sliderTitleAr")}
              </label>
              <input
                value={section.titleAr}
                onChange={(e) =>
                  handleOfferBannerSectionChange(
                    sectionIndex,
                    "titleAr",
                    e.target.value,
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300"
                placeholder={t("sectionTitleArPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-darkNavy/80">
                {t("sliderTitleEn")}
              </label>
              <input
                value={section.titleEn}
                onChange={(e) =>
                  handleOfferBannerSectionChange(
                    sectionIndex,
                    "titleEn",
                    e.target.value,
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all placeholder:text-neutral-300"
                placeholder={t("sectionTitleEnPlaceholder")}
              />
            </div>
          </div>
        </div>

        {/* Banners List Header */}
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[13px] font-bold text-darkNavy flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {t("banners")}
            <span className="text-[11px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">
              {section.banners.length}
            </span>
          </h4>
          <Button
            onPress={() => addBannerToSection(sectionIndex)}
            variant="flat"
            size="sm"
            className="flex items-center gap-1.5 text-[11px] font-bold h-8 rounded-lg"
          >
            <FaPlus size={10} />
            {t("addOfferBanner")}
          </Button>
        </div>

        {/* Banners List */}
        <div className="flex flex-col gap-4">
          {section.banners.map((banner, bIdx) => (
            <div
              key={bIdx}
              className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <span className="text-[10px] font-bold">#{bIdx + 1}</span>
                  </div>
                  <span className="text-[12px] font-bold text-darkNavy/70 uppercase tracking-tight">
                    Banner {bIdx + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeBannerFromSection(sectionIndex, bIdx)}
                  className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:text-red-500 hover:bg-red-100/50 flex items-center justify-center transition-all"
                >
                  <FaTrash size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Image Uploaders */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Arabic Image */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                      {t("imageAr")}
                    </label>
                    <div className="aspect-[16/9] w-full bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 relative overflow-hidden flex items-center justify-center p-2 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group/upload">
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
                            alt="AR"
                            fill
                            className="object-cover group-hover/upload:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                              <FaPlus size={14} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-neutral-300 group-hover/upload:text-primary transition-colors">
                          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100 group-hover/upload:shadow-md group-hover/upload:border-primary/20 transition-all">
                            <FaPlus size={16} />
                          </div>
                          <p className="text-[9px] uppercase font-bold tracking-widest mt-1">
                            AR IMAGE
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            "offerBanners",
                            sectionIndex,
                            "imageAr",
                            bIdx,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* English Image */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                      {t("imageEn")}
                    </label>
                    <div className="aspect-[16/9] w-full bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 relative overflow-hidden flex items-center justify-center p-2 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group/upload">
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
                            alt="EN"
                            fill
                            className="object-cover group-hover/upload:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                              <FaPlus size={14} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-neutral-300 group-hover/upload:text-primary transition-colors">
                          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100 group-hover/upload:shadow-md group-hover/upload:border-primary/20 transition-all">
                            <FaPlus size={16} />
                          </div>
                          <p className="text-[9px] uppercase font-bold tracking-widest mt-1">
                            EN IMAGE
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            "offerBanners",
                            sectionIndex,
                            "imageEn",
                            bIdx,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-darkNavy/80 px-1">
                      {t("link")}
                    </label>
                    <input
                      value={banner.link || ""}
                      placeholder="https://..."
                      onChange={(e) =>
                        handleBannerChangeInSection(
                          sectionIndex,
                          bIdx,
                          "link",
                          e.target.value,
                        )
                      }
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
                          handleBannerChangeInSection(
                            sectionIndex,
                            bIdx,
                            "altAr",
                            e.target.value,
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-[12px] focus:border-primary focus:outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                        {t("altEn")}
                      </label>
                      <input
                        value={banner.altEn || ""}
                        onChange={(e) =>
                          handleBannerChangeInSection(
                            sectionIndex,
                            bIdx,
                            "altEn",
                            e.target.value,
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-[12px] focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                        {t("ctaTextAr") || "CTA AR"}
                      </label>
                      <input
                        value={banner.ctaTextAr || ""}
                        onChange={(e) =>
                          handleBannerChangeInSection(
                            sectionIndex,
                            bIdx,
                            "ctaTextAr",
                            e.target.value,
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-[12px] focus:border-primary focus:outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                        {t("ctaTextEn") || "CTA EN"}
                      </label>
                      <input
                        value={banner.ctaTextEn || ""}
                        onChange={(e) =>
                          handleBannerChangeInSection(
                            sectionIndex,
                            bIdx,
                            "ctaTextEn",
                            e.target.value,
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-[12px] focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {section.banners.length === 0 && (
            <div className="py-14 bg-gradient-to-br from-[#fef7f2]/50 to-neutral-50 rounded-2xl border-2 border-dashed border-primary/15 flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary/40 mb-4">
                <FaImage size={24} />
              </div>
              <p className="text-sm font-bold text-darkNavy/50 uppercase tracking-widest">
                {t("noBanners") || "No banners added"}
              </p>
              <p className="text-[11px] text-neutral-400 mt-2 max-w-[200px]">
                Add promotional banners to showcase your top products and offers
              </p>
            </div>
          )}
        </div>

        {/* Remove Section Button */}
        <div className="pt-4 mt-1 border-t border-neutral-100">
          <Button
            onPress={() => removeOfferBannerSection(sectionIndex)}
            variant="flat"
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-red-400 hover:text-red-500 bg-red-50/50 hover:bg-red-50 transition-all border border-red-100/60 text-[13px] font-bold"
          >
            <FaTrash size={13} />
            {t("removeSection") || "Remove Section"}
          </Button>
        </div>
      </div>
    );
  }

  // --- Management List View ---
  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-2">
        {formData.offerBanners.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-[#fef7f2] to-neutral-50 rounded-2xl border-2 border-dashed border-primary/15">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <FaGripVertical size={22} />
            </div>
            <p className="text-sm font-bold text-darkNavy">
              {t("noOfferBanners")}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1.5 max-w-[200px]">
              Create your first banner section to display collections and
              promotions
            </p>
          </div>
        ) : (
          formData.offerBanners.map((section, index) => (
            <button
              key={index}
              onClick={() => onEditOffer(index)}
              className="w-full group flex items-center justify-between p-4 bg-white hover:bg-[#fef7f2] rounded-xl border border-neutral-200/60 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-200 text-start"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary/70 group-hover:text-primary group-hover:bg-primary/12 transition-all shrink-0">
                  <FaGripVertical size={14} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] font-bold text-darkNavy truncate">
                    {lang === "ar"
                      ? section.titleAr || `Section #${index + 1}`
                      : section.titleEn || `Section #${index + 1}`}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {section.banners?.length || 0} {t("banners")}
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-primary/10 flex items-center justify-center text-neutral-300 group-hover:text-primary transition-all shrink-0">
                <FaChevronRight
                  size={11}
                  className={lang === "ar" ? "rotate-180" : ""}
                />
              </div>
            </button>
          ))
        )}
      </div>

      <Button
        onPress={addOfferBannerSection}
        variant="flat"
        className="w-full py-4 rounded-xl flex items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.02] hover:bg-primary/5 transition-all duration-200 text-primary/60 hover:text-primary text-[13px] font-bold mt-1"
      >
        <FaPlus size={13} />
        {t("addOfferBannerSection")}
      </Button>
    </div>
  );
}
