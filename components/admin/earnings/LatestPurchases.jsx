"use client";
import { useState } from "react";
import { Eye } from "@/components/ui/svgs/CardsSvg";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Sort } from "@/components/ui/svgs/icons/SortSvg";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";;
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";

export default function LatestPurchases({
  translate,
  langPrefix,
  lang,
  data = [],
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.earnings.purchasesTable.${text}`);
  const CurrentStatus = (item) => {
    const { status } = item;
    const statusses = [
      { label: t("failed"), condition: status === "failed", className: "bg-red-600" },
      { label: t("pending"), condition: status === "pending", className: "bg-[#F48A42]" },
      { label: t("completed"), condition: status === "completed", className: "bg-[#4FD658]" },
    ];
    const currentStatus = statusses.find((item) => item.condition);
    return (
      <div className="px-3 whitespace-nowrap">
        <span
          className={`px-2 font-IBMPlex py-1 text-white rounded-[5px] text-xs font-semibold ${currentStatus.className}`}
        >
          {currentStatus.label}
        </span>
      </div>
    );
  };

  const [selected, setSelected] = useState([]);
  const allSelected = data.length !== 0 && selected.length === data.length;
  const toggleAll = () =>
    setSelected((prev) =>
      prev.length === data.length ? [] : data.map((o) => o._id)
    );
  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="bg-white mt-6 p-6 sm:p-8 rounded-[0.625rem]">
      <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-5">
        <h2 className="font-semibold font-IBMPlex text-lg text-darkNavy">
          {t("title")}
        </h2>
        <button className="text-darkNavy font-NotoSansArabic text-sm font-semibold flex gap-1 items-center justify-center">
          {t("showAll")}
          <ChevronLeft />
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1024px] grid grid-rows-[auto_4fr] text-sm">
          {/* Header */}
          <div className="w-max h-fit gap-2 grid grid-cols-10 py-3 text-black border-b border-b-black/10 justify-center">
            <div className="p-3 text-center flex items-center gap-3">
              <Checkbox isChecked={allSelected} onChange={toggleAll} />
              <div className="font-IBMPlex font-semibold text-sm">#</div>
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm flex gap-2 items-center whitespace-nowrap">
              <span>{t("renter")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm flex gap-2 items-center whitespace-nowrap">
              <span>{t("numOfItems")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
              <span>{t("period")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
              <span>{t("amountOfPayment")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
              <span>{t("methodOfPayment")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
              <span>{t("dateAdded")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
              <span>{t("dateOfCompletePurchase")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
              <span>{t("status")}</span>
              <Sort className="w-3 h-3" />
            </div>
            <div className="p-3 font-IBMPlex font-semibold text-sm  flex gap-2 items-center whitespace-nowrap">
              <span>{t("actions")}</span>
            </div>
          </div>

          {data.map((item) => (
            <div
              key={item._id}
              className={`group gap-2 grid grid-cols-10 w-full justify-center items-center h-fit transition-colors py-4 text-black ${
                selected.includes(item._id)
                  ? "bg-[#F48A421A]"
                  : "hover:bg-[#F6F6F6] bg-transparent"
              }`}
            >
              <div className="px-3 text-center flex items-center gap-3">
                <div className="w-1/2">
                  <Checkbox
                    isChecked={selected.includes(item._id)}
                    onChange={() => toggleOne(item._id)}
                  />
                </div>
                <div className="font-semibold text-sm font-IBMPlex truncate">
                  {item._id}
                </div>
              </div>
              <div className="px-3 whitespace-nowrap">
                <div className="text-sm font-medium  font-NotoSansArabic truncate">
                  {/* {item.owner?.fullName} */}
                  شركة كذا
                </div>
                <div className="text-xs font-normal font-NotoSansArabic">
                  {/* {item.owner?.phone} */}
                  05xxxxxxxxx
                </div>
              </div>
              <div className="px-3 flex items-center gap-1 whitespace-nowrap">
                {/* {item.products?.length} */} 3
              </div>
              <div className="px-3 font-medium text-sm  whitespace-nowrap">
                3 ايام
              </div>
              <div className="px-3 font-medium text-sm flex items-center gap-1 whitespace-nowrap">
                125 <Currency className="w-3 h-3" />
              </div>
              <div className="px-3 font-medium text-sm  whitespace-nowrap">
                مساتر كارد
              </div>
              <div className="px-3 font-medium text-sm  whitespace-nowrap">
                13 مايو 2024 | 18:32
              </div>
              <div className="px-3 font-medium text-sm  whitespace-nowrap">
                13 مايو 2024 | 18:32
              </div>
              {CurrentStatus(item)}
              <div className="px-3 flex gap-2 items-center justify-end whitespace-nowrap">
                <button
                  className="flex items-center gap-1 bg-[#F6F6F6] rounded-sm p-1 font-medium  text-xs"
                >
                  <Eye color="#0D092B" size={12} />
                  عرض
                </button>
                <button className="flex items-center gap-1 bg-[#F6F6F6] rounded-[2px] p-1 font-medium text-sm">
                  <Edit size={12} color="#0D092B" />
                  تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
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
