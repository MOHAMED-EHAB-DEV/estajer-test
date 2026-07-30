"use client";

import React from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { FaImage as ImageIcon } from "@/components/ui/svgs/AdminIcons";

export default function HeaderEditor({
  data,
  handleChange,
  handleImageUpload,
  t,
  labelCls,
  inputCls,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-5">
        <p className={labelCls}>{t("headerLogos")}</p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-darkNavy">
              {t("singleLangLogo") || "One Logo for All Languages"}
            </span>
            <span className="text-[10px] text-neutral-400">
              {t("singleLangLogoDesc") || "Use the same logo for Arabic and English"}
            </span>
          </div>
          <input
            type="checkbox"
            name="singleLangLogo"
            checked={data.singleLangLogo === true}
            onChange={handleChange}
            className="w-5 h-5 rounded-md border-neutral-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        {/* logo images */}
        {(() => {
          const visibleFields = [
            {
              field: "logoLightAr",
              label: t("logoLightAr"),
              hint: t("logoLightHint"),
            },
            {
              field: "logoLightEn",
              label: t("logoLightEn"),
              hint: t("logoLightHint"),
            },
            {
              field: "logoDarkAr",
              label: t("logoDarkAr"),
              hint: t("logoDarkHint"),
            },
            {
              field: "logoDarkEn",
              label: t("logoDarkEn"),
              hint: t("logoDarkHint"),
            },
          ].filter(({ field }) => {
            if (data.alwaysWhite === true && field.includes("Light")) return false;
            if (data.singleLangLogo === true && field.includes("En")) return false;
            return true;
          });

          return (
            <div className={`grid gap-4 ${visibleFields.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {visibleFields.map(({ field, label, hint }) => (
            <div
              key={field}
              className="flex flex-col gap-2 p-3 rounded-xl bg-neutral-50/30 border border-neutral-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl border-2 border-dashed border-neutral-200 relative overflow-hidden group hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm ${field.includes("Light") ? "bg-neutral-800" : "bg-white"}`}
                >
                  {data[field] ? (
                    <Image
                      unoptimized
                      src={
                        data[field].startsWith("data:")
                          ? data[field]
                          : anyImgUrl({ src: data[field], size: 160 })
                      }
                      alt={field}
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
                    onChange={(e) => handleImageUpload(e, field, true)}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-[11px] font-bold text-darkNavy/80">
                    {label}
                  </p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">
                    {hint}
                  </p>
                </div>
              </div>
            </div>
          ))}
            </div>
          );
        })()}

        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-darkNavy">
              {t("alwaysWhite") || "Always White Header"}
            </span>
            <span className="text-[10px] text-neutral-400">
              {t("alwaysWhiteDesc") || "Header background is always white"}
            </span>
          </div>
          <input
            type="checkbox"
            name="alwaysWhite"
            checked={data.alwaysWhite === true}
            onChange={handleChange}
            className="w-5 h-5 rounded-md border-neutral-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        {data.alwaysWhite !== true && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-darkNavy">
                {t("headerDarkText") || "Dark Header Text"}
              </span>
              <span className="text-[10px] text-neutral-400">
                {t("headerDarkTextDesc") || "Make header text and icons dark when transparent"}
              </span>
            </div>
            <input
              type="checkbox"
              name="headerDarkText"
              checked={data.headerDarkText === true}
              onChange={handleChange}
              className="w-5 h-5 rounded-md border-neutral-300 text-primary focus:ring-primary cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-darkNavy">
              {t("stickyHeader")}
            </span>
            <span className="text-[10px] text-neutral-400">
              {t("stickyHeaderDesc")}
            </span>
          </div>
          <input
            type="checkbox"
            name="sticky"
            checked={data.sticky !== false}
            onChange={handleChange}
            className="w-5 h-5 rounded-md border-neutral-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-darkNavy">
              {t("showSearch")}
            </span>
            <span className="text-[10px] text-neutral-400">
              {t("showSearchDesc")}
            </span>
          </div>
          <input
            type="checkbox"
            name="showSearch"
            checked={data.showSearch !== false}
            onChange={handleChange}
            className="w-5 h-5 rounded-md border-neutral-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
