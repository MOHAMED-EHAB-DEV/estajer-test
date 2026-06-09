"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "@/components/ui/svgs/CardsSvg";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Sort } from "@/components/ui/svgs/icons/SortSvg";
import { CloseFilled } from "@/components/ui/svgs/icons/CloseFilledSvg";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDownSvg";
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUpSvg";
import { FaTrash } from "@/components/ui/svgs/AdminIcons";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { formatNumeric } from "@/lib/utils";
import { Spinner } from "@heroui/react";
import { Product } from "@/components/ui/svgs/Admin";

export default function TableCategories({
  translate,
  langPrefix,
  categories = [],
  loading = false,
  onDelete,
  onDeleteSingle,
  onEdit,
}) {
  const trans = useTranslations(translate);
  const t = (text) =>
    trans(`admin.products.categories.tableCategories.${text}`);

  const CurrentStatus = (category) => {
    const { status, hideFromHome } = category;
    const statusOptions = [
      {
        label: t("inactive"),
        condition: status === "inactive",
        className: "bg-[#F44242]",
      },
      {
        label: t("active"),
        condition: status === "active",
        className: "bg-[#4FD658]",
      },
    ];
    const currentStatus = statusOptions.find((item) => item.condition);
    return (
      <div className="px-1 whitespace-nowrap flex gap-2">
        <span
          className={`px-2 font-IBMPlex py-1 text-white rounded-[5px] text-xs font-semibold ${
            currentStatus?.className || "bg-gray-400"
          }`}
        >
          {currentStatus?.label || status}
        </span>
        {hideFromHome && (
          <span
            className={`px-2 font-IBMPlex py-1 text-white rounded-[5px] text-xs font-semibold bg-red-500`}
          >
            {t("hidden")}
          </span>
        )}
      </div>
    );
  };

  const [selected, setSelected] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (id) =>
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const allSelected =
    categories.length !== 0 && selected.length === categories.length;
  const toggleAll = () =>
    setSelected((prev) =>
      prev.length === categories.length ? [] : categories.map((o) => o._id),
    );
  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleDeleteSelected = () => {
    if (selected.length > 0 && onDelete) {
      onDelete(selected);
      setSelected([]);
    }
  };

  const handleEditCategory = (
    category,
    isSubcategory = false,
    parentId = null,
  ) => {
    if (onEdit) {
      onEdit(category, isSubcategory, parentId);
    }
  };

  if (loading) {
    return (
      <div className="bg-white mt-6 p-6 sm:p-8 rounded-[0.625rem] flex items-center justify-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white mt-6 p-6 sm:p-8 rounded-[0.625rem]">
      <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-5">
        <h2 className="font-semibold font-IBMPlex text-lg text-darkNavy">
          {t("title")}
        </h2>
        <div className="flex items-center gap-[10px]">
          <Button
            className="flex items-center justify-center rounded-full px-8 py-4 gap-2 bg-[#F9D9D9] text-[#F44242] shadow-none font-semibold text-medium"
            onClick={handleDeleteSelected}
            isDisabled={selected.length === 0}
          >
            <CloseFilled />
            {t("deleteCategories")} ({selected.length})
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-lg font-medium">{t("noCategories")}</p>
          <p className="text-sm">{t("addCategoryHint")}</p>
        </div>
      )}

      {/* Scrollable Table */}
      {categories.length > 0 && (
        <div className="w-full overflow-x-auto">
          <div className="min-w-full w-max max-w-full flex flex-col text-sm">
            {/* Header */}
            <div className="w-full h-fit gap-3 grid grid-cols-[40px_repeat(10,minmax(0,1fr))] py-3 text-black border-b border-b-black/10">
              <div className="px-[5.5px]"></div>
              <div className="py-3 px-1 text-center flex items-center gap-2">
                <Checkbox isChecked={allSelected} onChange={toggleAll} />
                <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                  <span>{t("order")}</span>
                </div>
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                <span>{t("image")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                <span>{t("nameAr")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                <span>{t("nameEn")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                <span>{t("key")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm flex gap-2 items-center whitespace-nowrap">
                <span>{t("adminCreatedCategory")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm flex gap-2 items-center whitespace-nowrap">
                <span>{t("productsCount")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                <span>{t("dateAdded")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                <span>{t("status")}</span>
                <Sort className="w-3 h-3" />
              </div>
              <div className="py-3 px-1 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
                <span>{t("actions")}</span>
              </div>
            </div>

            {categories.map((category, index) => (
              <div
                key={category._id}
                className="flex flex-col w-full border-b border-black/5 last:border-0"
              >
                <div
                  className={`group gap-3 grid grid-cols-[40px_repeat(10,minmax(0,1fr))] w-full justify-center items-center h-fit transition-colors py-3 text-black ${
                    selected.includes(category._id)
                      ? "bg-[#F48A421A]"
                      : "hover:bg-[#F6F6F6] bg-transparent"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(category._id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {expandedRows.includes(category._id) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  <div className="px-1 text-center flex items-center gap-2">
                    <Checkbox
                      isChecked={selected.includes(category._id)}
                      onChange={() => toggleOne(category._id)}
                    />
                    <div className="font-semibold text-sm font-IBMPlex truncate">
                      <span className="font-semibold text-primary">
                        {category.order ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="px-1 whitespace-nowrap flex items-center">
                    {category.image ? (
                      <Image
                        src={anyImgUrl({ src: category.image, size: 100 })}
                        alt={category.nameAr}
                        className="w-[40px] h-[40px] rounded object-cover"
                        unoptimized
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="w-[40px] h-[40px] rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">-</span>
                      </div>
                    )}
                  </div>
                  <div className="px-1 text-sm break-words">
                    <span>{category.nameAr}</span>
                  </div>
                  <div className="px-1 text-sm break-words">
                    <span>{category.nameEn}</span>
                  </div>
                  <div className="px-1 whitespace-nowrap">{category.key}</div>
                  <div className="px-1 whitespace-nowrap">
                    <span>{category.userCreated}</span>
                  </div>
                  <div className="px-1 whitespace-nowrap">
                    <span>{formatNumeric(category.productsCount)}</span>
                  </div>
                  <div className="px-1 font-medium text-sm whitespace-nowrap">
                    {new Date(category.createdAt).toLocaleDateString("ar", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  {CurrentStatus(category)}
                  <div className="px-1 flex gap-2 items-center whitespace-nowrap">
                    <button
                      className="flex items-center gap-1 bg-[#F6F6F6] rounded-sm p-1 font-medium text-xs hover:bg-gray-200 transition-colors"
                      onClick={() => handleEditCategory(category, false, null)}
                    >
                      <Edit size={12} color="#0D092B" />
                      {t("edit")}
                    </button>
                  </div>
                </div>

                {/* Expanded Content for Subcategories */}
                {expandedRows.includes(category._id) && (
                  <div className="w-full bg-gradient-to-b from-[#F8F9FC] to-[#F0F2F8] p-6 border-t border-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-4 w-full">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-primary rounded-full"></div>
                          <span className="text-darkNavy text-sm font-bold">
                            {t("subCategories")}
                          </span>
                          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                            {category.subcategories?.length || 0}
                          </span>
                        </div>
                      </div>

                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                          {/* Table Header */}
                          <div className="grid grid-cols-[60px_60px_1fr_1fr_120px_100px_100px_100px_100px] gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-200/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="text-center">{t("order")}</div>
                            <div className="text-center">{t("image")}</div>
                            <div>{t("nameAr")}</div>
                            <div>{t("nameEn")}</div>
                            <div className="break-all">{t("key")}</div>
                            <div className="text-center">
                              {t("productsCount")}
                            </div>
                            <div className="text-center">{t("status")}</div>
                            <div className="text-center">
                              {t("hideFromHome")}
                            </div>
                            <div className="text-center">{t("actions")}</div>
                          </div>

                          {/* Table Body */}
                          {category.subcategories.map((sub, idx) => (
                            <div
                              key={sub._id || idx}
                              className={`grid grid-cols-[60px_60px_1fr_1fr_120px_100px_100px_100px_100px] gap-3 px-4 py-3.5 items-center transition-all duration-150 hover:bg-primary/5 ${
                                idx !== category.subcategories.length - 1
                                  ? "border-b border-gray-100"
                                  : ""
                              }`}
                            >
                              {/* Order */}
                              <div className="text-center">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm">
                                  {sub.order ?? idx + 1}
                                </span>
                              </div>

                              {/* Image */}
                              <div className="flex justify-center">
                                {sub.image ? (
                                  <Image
                                    src={anyImgUrl({
                                      src: sub.image,
                                      size: 100,
                                    })}
                                    alt={sub.nameAr}
                                    className="w-[35px] h-[35px] rounded-md object-cover border border-gray-100"
                                    unoptimized
                                    width={35}
                                    height={35}
                                  />
                                ) : (
                                  <div className="w-[35px] h-[35px] rounded-md bg-gray-100 flex items-center justify-center border border-dashed border-gray-200 text-[10px] text-gray-400">
                                    -
                                  </div>
                                )}
                              </div>

                              {/* Name Arabic */}
                              <div className="font-medium text-darkNavy text-sm truncate">
                                {sub.nameAr}
                              </div>

                              {/* Name English */}
                              <div className="text-gray-600 text-sm truncate">
                                {sub.nameEn}
                              </div>

                              {/* Key */}
                              <div className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded truncate">
                                {sub.key}
                              </div>

                              {/* Products Count */}
                              <div className="text-center">
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                  <Product
                                    color="#2563eb"
                                    width="12"
                                    height="12"
                                  />
                                  <span className="translate-y-px">
                                    {sub.count || 0}
                                  </span>
                                </span>
                              </div>

                              {/* Status */}
                              <div className="text-center">
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    sub.status === "active"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-red-50 text-red-500"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      sub.status === "active"
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                    }`}
                                  ></span>
                                  {sub.status === "active"
                                    ? t("active")
                                    : t("inactive")}
                                </span>
                              </div>

                              {/* Visibility */}
                              <div className="text-center">
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    sub.hideFromHome
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-sky-50 text-sky-600"
                                  }`}
                                >
                                  {sub.hideFromHome ? (
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  )}
                                  {sub.hideFromHome
                                    ? t("hidden")
                                    : t("visible")}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-600 transition-all duration-200 hover:scale-105"
                                  onClick={() =>
                                    handleEditCategory(sub, true, category._id)
                                  }
                                  title={t("edit")}
                                >
                                  <Edit size={14} color="currentColor" />
                                </button>
                                <button
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-200 hover:scale-105"
                                  onClick={() => {
                                    if (
                                      onDeleteSingle &&
                                      confirm(t("confirmDeleteSub"))
                                    ) {
                                      onDeleteSingle(sub._id);
                                    }
                                  }}
                                  title={t("deleteCategories")}
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">
                            {t("noSubCategories")}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {t("addCategoryHint")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const Checkbox = ({ isChecked, onChange }) => (
  <>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      className="hidden"
    />
    <div
      className={`w-[20px] h-[20px] rounded-[5px] flex items-center justify-center transition-colors ${
        isChecked ? "bg-primary" : "bg-[#D9D9D9]"
      }`}
      onClick={onChange}
    >
      {isChecked && (
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  </>
);
