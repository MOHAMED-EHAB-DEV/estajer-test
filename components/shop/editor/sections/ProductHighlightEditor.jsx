"use client";

import React from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { FaImage as ImageIcon } from "@/components/ui/svgs/AdminIcons";
import ProductHighlightProductPicker from "../ProductHighlightProductPicker";
import ProductLinkPicker from "../ProductLinkPicker";

export default function ProductHighlightEditor({
  data,
  onDataChange,
  handleChange,
  handleImageUpload,
  formData,
  lang,
  translate,
  t,
  isAr,
  labelCls,
  inputCls,
}) {
  const ownerId = formData?.owner;
  const shopSlug = formData?.slug;
  const pickedProduct = data.product || null;

  const handlePickProduct = (product) => {
    const hasTaxCode = !!product.owner?.companyDetails?.taxCode;
    const basePrice =
      product.pricingModel === "packages"
        ? product.rental?.packages?.[0]?.price
        : product.rental?.value;
    const priceWithTax = hasTaxCode
      ? Math.round(basePrice * 1.15)
      : basePrice;

    const hasDiscount =
      product.rental?.discountTiers &&
      product.pricingModel !== "packages" &&
      product.rental.discountTiers.length > 0;
    const discountPrice = hasDiscount
      ? product.rental.discountTiers[0].discountPrice
      : null;
    const discountPriceWithTax = hasDiscount
      ? hasTaxCode
        ? Math.round(discountPrice * 1.15)
        : discountPrice
      : null;

    onDataChange((prev) => ({
      ...prev,
      product: {
        ...product,
        name: product.name || (isAr ? product.nameAr : product.nameEn),
        description: product.description || (isAr ? product.descriptionAr : product.descriptionEn),
      },
      isManuallyCleared: false,
      // Auto-fill manual fields from product as defaults
      manualNameAr: prev.manualNameAr || product.nameAr || product.name || "",
      manualNameEn: prev.manualNameEn || product.nameEn || product.name || "",
      manualDescriptionAr: prev.manualDescriptionAr || product.descriptionAr || product.description || "",
      manualDescriptionEn: prev.manualDescriptionEn || product.descriptionEn || product.description || "",
      manualPrice: prev.manualPrice || String(priceWithTax || 0),
      manualDiscountPrice: prev.manualDiscountPrice || (discountPriceWithTax ? String(discountPriceWithTax) : ""),
      manualImage: prev.manualImage || product.images?.[0]?.preview || product.images?.[0] || "",
      manualImageGradientStyle: prev.manualImageGradientStyle || product.images?.[0]?.gradientStyle || "",
    }));
  };

  const handleRemoveProduct = () => {
    onDataChange((prev) => ({ ...prev, product: null, isManuallyCleared: true }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      {/* Section title & subtitle */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-4">
        <p className={labelCls}>
          {t("sectionTitle")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "titleAr", placeholder: "العنوان (Ar)" },
            { name: "titleEn", placeholder: "Title (En)" },
            {
              name: "subtitleAr",
              placeholder: "العنوان الفرعي (Ar) — اختياري",
            },
            {
              name: "subtitleEn",
              placeholder: "Subtitle (En) — optional",
            },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              name={name}
              value={data[name] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              className={inputCls}
            />
          ))}
        </div>
      </div>

      {/* Product Picker */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-4">
        <ProductHighlightProductPicker
          lang={lang}
          translate={translate}
          ownerId={formData.owner}
          onSelect={handlePickProduct}
          selectedId={pickedProduct?._id}
          inputCls={inputCls}
          labelCls={labelCls}
          isAr={isAr}
        />
        <p className={labelCls}>
          {t("pickProduct")}
        </p>
        {pickedProduct ? (
          <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            {pickedProduct.images?.[0]?.preview && (
              <div className="w-12 h-12 rounded-lg overflow-hidden relative border border-neutral-100 shrink-0">
                <Image
                  unoptimized
                  src={anyImgUrl({
                    src: pickedProduct.images[0].preview,
                    size: 100,
                  })}
                  alt={pickedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-darkNavy truncate">
                {pickedProduct.name}
              </p>
              <p className="text-[11px] text-neutral-400">
                {t("selected")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveProduct}
              className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors px-2 shrink-0"
            >
              {t("remove")}
            </button>
          </div>
        ) : (
          <div className="text-center py-4 text-neutral-400 text-[12px] border border-dashed border-neutral-200 rounded-xl">
            {t("noProductSelected")}
          </div>
        )}
      </div>

      {/* Manual Override Fields */}
      <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 flex flex-col gap-4">
        <p className={labelCls}>
          {t("manualOverride")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="manualNameAr"
            value={data.manualNameAr || ""}
            onChange={handleChange}
            placeholder={t("nameAr")}
            className={inputCls}
          />
          <input
            name="manualNameEn"
            value={data.manualNameEn || ""}
            onChange={handleChange}
            placeholder={t("nameEn")}
            className={inputCls}
          />
          <textarea
            name="manualDescriptionAr"
            value={data.manualDescriptionAr || ""}
            onChange={handleChange}
            placeholder={t("descriptionAr")}
            className={`${inputCls} col-span-2 min-h-[80px] pt-2 resize-y`}
          />
          <textarea
            name="manualDescriptionEn"
            value={data.manualDescriptionEn || ""}
            onChange={handleChange}
            placeholder={t("descriptionEn")}
            className={`${inputCls} col-span-2 min-h-[80px] pt-2 resize-y`}
          />
          <input
            name="manualPrice"
            value={data.manualPrice || ""}
            onChange={handleChange}
            placeholder={t("price")}
            className={inputCls}
            type="number"
            min="0"
          />
          <input
            name="manualDiscountPrice"
            value={data.manualDiscountPrice || ""}
            onChange={handleChange}
            placeholder={t("discountPriceOptional")}
            className={inputCls}
            type="number"
            min="0"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {t("productLinkOptional")}
          </label>
          <ProductLinkPicker
            value={data.manualLink || ""}
            onChange={(val) =>
              handleChange({
                target: { name: "manualLink", value: val },
              })
            }
            lang={lang}
            translate={translate}
            ownerId={ownerId}
            shopSlug={shopSlug}
            inputCls={inputCls}
          />
        </div>
        {/* Manual image uploader */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {t("manualImageOptional")}
          </label>
          <div className="relative aspect-video rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 group cursor-pointer">
            {data.manualImage ? (
              <img
                src={
                  data.manualImage.startsWith("data:")
                    ? data.manualImage
                    : anyImgUrl({ src: data.manualImage, size: 600 })
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
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleImageUpload(e, "manualImage", true)}
            />
          </div>
        </div>
      </div>

      {/* CTA + Image Position */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col gap-4">
        <p className={labelCls}>{t("ctaButton")}</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="ctaTextAr"
            value={data.ctaTextAr || ""}
            onChange={handleChange}
            placeholder={t("buttonTextAr")}
            className={inputCls}
          />
          <input
            name="ctaTextEn"
            value={data.ctaTextEn || ""}
            onChange={handleChange}
            placeholder={t("buttonTextEn")}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {t("imagePosition")}
          </label>
          <div className="flex gap-2">
            {["left", "right"].map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() =>
                  onDataChange((prev) => ({
                    ...prev,
                    imagePosition: pos,
                  }))
                }
                className={`flex-1 h-9 rounded-xl text-[12px] font-bold border-2 transition-all ${
                  (data.imagePosition || "right") === pos
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                }`}
              >
                {pos === "left"
                  ? t("left")
                  : t("right")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
