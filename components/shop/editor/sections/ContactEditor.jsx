"use client";

import React from "react";
import ProductLocation from "@/components/addProduct/ProductLocation";

export default function ContactEditor({
  data,
  onDataChange,
  handleChange,
  lang,
  t,
  labelCls,
  inputCls,
  translate,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {lang === "ar" ? "العنوان (Ar)" : "Title (Ar)"}
          </label>
          <input
            name="titleAr"
            value={data.titleAr || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {lang === "ar" ? "العنوان (En)" : "Title (En)"}
          </label>
          <input
            name="titleEn"
            value={data.titleEn || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("address") + " (Ar)"}</label>
          <input
            name="addressAr"
            value={data.addressAr || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("address") + " (En)"}</label>
          <input
            name="addressEn"
            value={data.addressEn || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("phone")}</label>
          <input
            name="phone"
            value={data.phone || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t("email")}</label>
          <input
            name="email"
            value={data.email || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {lang === "ar" ? "أوقات العمل (Ar)" : "Working Hours (Ar)"}
          </label>
          <input
            name="workingHoursAr"
            value={data.workingHoursAr || ""}
            onChange={handleChange}
            placeholder={lang === "ar" ? "السبت - الخميس: 9:00 ص - 10:00 م" : "Sat - Thu: 9:00 AM - 10:00 PM"}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {lang === "ar" ? "أوقات العمل (En)" : "Working Hours (En)"}
          </label>
          <input
            name="workingHoursEn"
            value={data.workingHoursEn || ""}
            onChange={handleChange}
            placeholder={lang === "ar" ? "السبت - الخميس: 9:00 ص - 10:00 م" : "Sat - Thu: 9:00 AM - 10:00 PM"}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-1 py-1 bg-neutral-50 rounded-xl border border-neutral-200/50 w-fit">
        <input
          type="checkbox"
          id="showMap"
          name="showMap"
          checked={data.showMap !== false}
          onChange={(e) =>
            onDataChange((prev) => ({
              ...prev,
              showMap: e.target.checked,
            }))
          }
          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer ms-2"
        />
        <label
          htmlFor="showMap"
          className="text-xs font-bold text-neutral-600 cursor-pointer select-none me-3"
        >
          {lang === "ar" ? "عرض الخريطة التفاعلية في المتجر" : "Show interactive map in store"}
        </label>
      </div>

      {data.showMap !== false && (
        <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className={labelCls}>
            {lang === "ar" ? "موقع المتجر على الخريطة" : "Shop Location on Map"}
          </label>
          <ProductLocation
            lang={lang}
            emptyLocation={{
              country: "",
              governorate: "",
              city: "",
              neighborhood: "",
            }}
            address={
              data.address || {
                country: "",
                governorate: "",
                city: "",
                neighborhood: "",
              }
            }
            setAddress={(newAddress) => {
              onDataChange((prev) => {
                const resolvedAddress =
                  typeof newAddress === "function"
                    ? newAddress(
                        prev.address || {
                          country: "",
                          governorate: "",
                          city: "",
                          neighborhood: "",
                        },
                      )
                    : newAddress;
                return { ...prev, address: resolvedAddress };
              });
            }}
            markerPosition={data.location || null}
            setMarkerPosition={(newPosition) => {
              onDataChange((prev) => {
                const resolvedPosition =
                  typeof newPosition === "function"
                    ? newPosition(prev.location || null)
                    : newPosition;
                return { ...prev, location: resolvedPosition };
              });
            }}
            translate={translate}
          />
        </div>
      )}
    </div>
  );
}
