"use client";
import { useState } from "react";
import { Input } from "@heroui/react";

import { useTranslations } from "@/hooks/useTranslations";
import { Lightning } from "@/components/ui/svgs/icons/LightningSvg";
import { Clipboard } from "@/components/ui/svgs/icons/ClipboardSvg";
import { Star } from "@/components/ui/svgs/icons/StarSvg";
import { Chevron } from "@/components/ui/svgs/icons/ChevronSvg";
import { Plus } from "@/components/ui/svgs/icons/PlusSvg";
import { Trash } from "@/components/ui/svgs/icons/TrashSvg";
import { Globals } from "../ui/svgs/icons/GlobalsSvg";

/* ─── Reusable input with language badge ─── */
function LangInput({ dir, lang, ...props }) {
  return (
    <Input
      dir={dir}
      radius="sm"
      variant="flat"
      classNames={{
        input: "text-sm",
        inputWrapper: "bg-gray-100 h-11",
      }}
      endContent={
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-500 select-none flex-shrink-0">
          {lang}
        </span>
      }
      {...props}
    />
  );
}

/* ─── Panel wrapper ─── */
function Panel({
  id,
  open,
  onToggle,
  icon,
  iconBg,
  title,
  subtitle,
  children,
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden mb-3 ${open ? "border-orange-200 shadow-sm" : "border-gray-100"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${open ? "bg-orange-50" : "bg-gray-50 hover:bg-gray-100"}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            {icon}
          </span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? "bg-orange-200" : "bg-gray-200"}`}
        >
          <Chevron
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 bg-white space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Add button ─── */
function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-orange-300 text-orange-500 font-semibold text-sm hover:bg-orange-50 hover:border-orange-400 transition-all"
    >
      <Plus />
      {label}
    </button>
  );
}

/* ─── Main component ─── */
export default function AdditionalDetails({
  user,
  lang,
  translate,
  useCases,
  setUseCases,
  specs,
  setSpecs,
  features,
  setFeatures,
  seoData,
  setSeoData,
  productData,
  isEditing,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.formSteps.additionalDetails.${key}`);

  const [openPanels, setOpenPanels] = useState({
    "use-cases":
      isEditing &&
      (useCases?.length > 1 ||
        (useCases?.length === 1 && (useCases[0].nameAr || useCases[0].nameEn))),
    specs:
      isEditing &&
      (specs?.length > 1 ||
        (specs?.length === 1 && (specs[0].keyAr || specs[0].valueAr))),
    features:
      isEditing &&
      (features?.length > 1 ||
        (features?.length === 1 &&
          (features[0].titleAr || features[0].descAr))),
    seo:
      isEditing &&
      (seoData.titleAr ||
        seoData.titleEn ||
        seoData.descriptionAr ||
        seoData.descriptionEn),
  });

  const togglePanel = (id) =>
    setOpenPanels((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ─── Use Cases Logic ─── */
  const addUseCaseRow = () =>
    setUseCases([...useCases, { id: Date.now(), nameAr: "", nameEn: "" }]);
  const updateUseCase = (id, field, val) => {
    setUseCases(
      useCases.map((uc) => (uc.id === id ? { ...uc, [field]: val } : uc)),
    );
  };
  const removeUseCase = (id) => {
    if (useCases.length === 1) {
      setUseCases([{ id: Date.now(), nameAr: "", nameEn: "" }]);
    } else {
      setUseCases(useCases.filter((uc) => uc.id !== id));
    }
  };

  /* ─── Specs Logic ─── */
  const addSpecRow = () =>
    setSpecs([
      ...specs,
      { id: Date.now(), keyAr: "", keyEn: "", valueAr: "", valueEn: "" },
    ]);
  const updateSpec = (id, field, val) => {
    setSpecs(specs.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };
  const removeSpec = (id) => {
    if (specs.length === 1) {
      setSpecs([
        { id: Date.now(), keyAr: "", keyEn: "", valueAr: "", valueEn: "" },
      ]);
    } else {
      setSpecs(specs.filter((s) => s.id !== id));
    }
  };

  /* ─── Features Logic ─── */
  const addFeatureRow = () =>
    setFeatures([
      ...features,
      { id: Date.now(), titleAr: "", titleEn: "", descAr: "", descEn: "" },
    ]);
  const updateFeature = (id, field, val) => {
    setFeatures(
      features.map((f) => (f.id === id ? { ...f, [field]: val } : f)),
    );
  };
  const removeFeature = (id) => {
    if (features.length === 1) {
      setFeatures([
        { id: Date.now(), titleAr: "", titleEn: "", descAr: "", descEn: "" },
      ]);
    } else {
      setFeatures(features.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="flex max-w-screen-xl mx-auto md:px-4 mt-4">
      {/* Left number column */}
      <div className="hidden md:flex bg-[rgba(253,220,166,0.5)] min-w-48 justify-center">
        <div className="mt-12 bg-[rgba(255,255,255,0.5)] font-IBMPlex font-semibold text-4xl w-28 h-28 rounded-full flex justify-center items-center">
          5
        </div>
      </div>

      <div className="grow md:p-10 px-4 py-8 bg-white">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <h2 className="lg:text-[1.7rem] md:text-[1.5rem] text-[1.3rem] font-semibold text-darkNavy font-IBMPlex">
              {t("title")}
            </h2>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              {t("optional")}
            </span>
          </div>
          <p className="lg:text-[1.3rem] md:text-[1.2rem] text-[1.15rem] text-darkNavy">
            {t("description")}
          </p>
        </div>

        {/* ── Panel 1: Use Cases ── */}
        <Panel
          id="use-cases"
          open={openPanels["use-cases"]}
          onToggle={() => togglePanel("use-cases")}
          icon={
            <span className="text-green-500">
              <Lightning />
            </span>
          }
          iconBg="bg-green-100"
          title={t("useCases.title")}
          subtitle={t("useCases.subtitle")}
        >
          <div className="space-y-4">
            {useCases.map((uc, index) => (
              <div
                key={uc.id}
                className="relative bg-orange-50/30 border border-orange-100 p-4 rounded-2xl flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-orange-400">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUseCase(uc.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <LangInput
                    dir="rtl"
                    lang="AR"
                    value={uc.nameAr}
                    onChange={(e) =>
                      updateUseCase(uc.id, "nameAr", e.target.value)
                    }
                    placeholder={t("useCases.placeholderAr")}
                  />
                  <LangInput
                    dir="ltr"
                    lang="EN"
                    value={uc.nameEn}
                    onChange={(e) =>
                      updateUseCase(uc.id, "nameEn", e.target.value)
                    }
                    placeholder={t("useCases.placeholderEn")}
                  />
                </div>
              </div>
            ))}
            <AddButton
              onClick={addUseCaseRow}
              label={t("useCases.addButton")}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{t("useCases.hint")}</p>
        </Panel>

        {/* ── Panel 2: Specs ── */}
        <Panel
          id="specs"
          open={openPanels["specs"]}
          onToggle={() => togglePanel("specs")}
          icon={
            <span className="text-blue-500">
              <Clipboard />
            </span>
          }
          iconBg="bg-blue-100"
          title={t("specs.title")}
          subtitle={t("specs.subtitle")}
        >
          <div className="space-y-4">
            {specs.map((spec, index) => (
              <div
                key={spec.id}
                className="relative bg-blue-50/30 border border-blue-100 p-4 rounded-2xl flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-blue-400">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSpec(spec.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Arabic block */}
                  <div
                    className="bg-white border border-orange-100 rounded-xl p-3 space-y-2"
                    dir="rtl"
                  >
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-orange-100 text-orange-500 text-[9px] font-black flex items-center justify-center">
                        ع
                      </span>
                      عربي
                    </p>
                    <LangInput
                      dir="rtl"
                      lang="AR"
                      value={spec.keyAr}
                      onChange={(e) =>
                        updateSpec(spec.id, "keyAr", e.target.value)
                      }
                      placeholder={t("specs.keyPlaceholderAr")}
                    />
                    <LangInput
                      dir="rtl"
                      lang="AR"
                      value={spec.valueAr}
                      onChange={(e) =>
                        updateSpec(spec.id, "valueAr", e.target.value)
                      }
                      placeholder={t("specs.valuePlaceholderAr")}
                    />
                  </div>
                  {/* English block */}
                  <div
                    className="bg-white border border-blue-100 rounded-xl p-3 space-y-2"
                    dir="ltr"
                  >
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-blue-100 text-blue-500 text-[9px] font-black flex items-center justify-center">
                        E
                      </span>
                      English
                    </p>
                    <LangInput
                      dir="ltr"
                      lang="EN"
                      value={spec.keyEn}
                      onChange={(e) =>
                        updateSpec(spec.id, "keyEn", e.target.value)
                      }
                      placeholder={t("specs.keyPlaceholderEn")}
                    />
                    <LangInput
                      dir="ltr"
                      lang="EN"
                      value={spec.valueEn}
                      onChange={(e) =>
                        updateSpec(spec.id, "valueEn", e.target.value)
                      }
                      placeholder={t("specs.valuePlaceholderEn")}
                    />
                  </div>
                </div>
              </div>
            ))}
            <AddButton onClick={addSpecRow} label={t("useCases.addButton")} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{t("specs.hint")}</p>
        </Panel>

        {/* ── Panel 3: Features ── */}
        <Panel
          id="features"
          open={openPanels["features"]}
          onToggle={() => togglePanel("features")}
          icon={
            <span className="text-purple-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={"currentColor"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                width={20}
                height={20}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          }
          iconBg="bg-purple-100"
          title={t("features.title")}
          subtitle={t("features.subtitle")}
        >
          <div className="space-y-4">
            {features.map((feat, index) => (
              <div
                key={feat.id}
                className="relative bg-purple-50/30 border border-purple-100 p-4 rounded-2xl flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-purple-400">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeature(feat.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Arabic block */}
                  <div
                    className="bg-white border border-orange-100 rounded-xl p-3 space-y-2"
                    dir="rtl"
                  >
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-orange-100 text-orange-500 text-[9px] font-black flex items-center justify-center">
                        ع
                      </span>
                      عربي
                    </p>
                    <LangInput
                      dir="rtl"
                      lang="AR"
                      value={feat.titleAr}
                      onChange={(e) =>
                        updateFeature(feat.id, "titleAr", e.target.value)
                      }
                      placeholder={t("features.titlePlaceholderAr")}
                    />
                    <LangInput
                      dir="rtl"
                      lang="AR"
                      value={feat.descAr}
                      onChange={(e) =>
                        updateFeature(feat.id, "descAr", e.target.value)
                      }
                      placeholder={t("features.descPlaceholderAr")}
                    />
                  </div>
                  {/* English block */}
                  <div
                    className="bg-white border border-blue-100 rounded-xl p-3 space-y-2"
                    dir="ltr"
                  >
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-blue-100 text-blue-500 text-[9px] font-black flex items-center justify-center">
                        E
                      </span>
                      English
                    </p>
                    <LangInput
                      dir="ltr"
                      lang="EN"
                      value={feat.titleEn}
                      onChange={(e) =>
                        updateFeature(feat.id, "titleEn", e.target.value)
                      }
                      placeholder={t("features.titlePlaceholderEn")}
                    />
                    <LangInput
                      dir="ltr"
                      lang="EN"
                      value={feat.descEn}
                      onChange={(e) =>
                        updateFeature(feat.id, "descEn", e.target.value)
                      }
                      placeholder={t("features.descPlaceholderEn")}
                    />
                  </div>
                </div>
              </div>
            ))}
            <AddButton
              onClick={addFeatureRow}
              label={t("useCases.addButton")}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{t("features.hint")}</p>
        </Panel>

        {/* ── Panel 4: SEO ── */}
        {user?.accountType === "admin" && (
          <Panel
            id="seo"
            open={openPanels["seo"]}
            onToggle={() => togglePanel("seo")}
            icon={<Globals />}
            iconBg="bg-orange-100"
            title={t("seo.title") || "تحسين محركات البحث (SEO)"}
            subtitle={
              t("seo.subtitle") || "أضف عنوانا ووصفا مخصصا لمحركات البحث"
            }
          >
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Arabic block */}
                <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-3">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-green-100 text-green-600 text-[9px] font-black flex items-center justify-center">
                      ع
                    </span>
                    عربي
                  </p>
                  <div className="space-y-3">
                    <LangInput
                      labelPlacement="outside"
                      dir="rtl"
                      classNames={{
                        mainWrapper: "mt-10",
                        label: "-mt-2 flex items-center",
                        base: "max-w-full !mt-0",
                        input: "text-base",
                        inputWrapper: "bg-gray-100 h-12",
                      }}
                      lang="AR"
                      label={t("seo.titleLabelAr") || "عنوان SEO"}
                      value={seoData.titleAr}
                      onChange={(e) =>
                        setSeoData({ ...seoData, titleAr: e.target.value })
                      }
                      placeholder={`استأجر ${productData.nameAr || "اسم المنتج"}`}
                    />
                    <Input
                      dir="rtl"
                      radius="sm"
                      classNames={{
                        mainWrapper: "mt-10",
                        label: "-mt-2 flex items-center",
                        base: "max-w-full !mt-0",
                        input: "text-base",
                        inputWrapper: "bg-gray-100 h-12",
                      }}
                      variant="flat"
                      labelPlacement="outside"
                      label={t("seo.descLabelAr") || "وصف SEO"}
                      endContent={
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-500 select-none flex-shrink-0">
                          AR
                        </span>
                      }
                      value={seoData.descriptionAr}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          descriptionAr: e.target.value,
                        })
                      }
                      placeholder={productData.descriptionAr || "وصف المنتج"}
                    />
                  </div>
                </div>

                {/* English block */}
                <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-3">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-green-100 text-green-600 text-[9px] font-black flex items-center justify-center">
                      E
                    </span>
                    English
                  </p>
                  <div className="space-y-3">
                    <LangInput
                      dir="ltr"
                      classNames={{
                        mainWrapper: "mt-10",
                        label: "-mt-2 flex items-center",
                        base: "max-w-full !mt-0",
                        input: "text-base",
                        inputWrapper: "bg-gray-100 h-12",
                      }}
                      labelPlacement="outside"
                      lang="EN"
                      label={t("seo.titleLabelEn") || "SEO Title"}
                      value={seoData.titleEn}
                      onChange={(e) =>
                        setSeoData({ ...seoData, titleEn: e.target.value })
                      }
                      placeholder={`rent ${productData.nameEn || "product name"}`}
                    />
                    <Input
                      dir="ltr"
                      classNames={{
                        mainWrapper: "mt-10",
                        label: "-mt-2 flex items-center",
                        base: "max-w-full !mt-0",
                        input: "text-base",
                        inputWrapper: "bg-gray-100 h-12",
                      }}
                      radius="sm"
                      variant="flat"
                      labelPlacement="outside"
                      label={t("seo.descLabelEn") || "SEO Description"}
                      endContent={
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-500 select-none flex-shrink-0">
                          EN
                        </span>
                      }
                      value={seoData.descriptionEn}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          descriptionEn: e.target.value,
                        })
                      }
                      placeholder={
                        productData.descriptionEn || "Product description"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {t("seo.hint") || "اتركه فارغا لاستخدام القيم الافتراضية"}
            </p>
          </Panel>
        )}

        <p className="text-xs text-center text-gray-300 mt-5">
          {t("skipHint")}
        </p>
      </div>
    </div>
  );
}
