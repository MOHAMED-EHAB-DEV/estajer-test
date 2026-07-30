"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "@/components/ui/svgs/CardsSvg";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Sort } from "@/components/ui/svgs/icons/SortSvg";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { CheckFilled } from "@/components/ui/svgs/icons/CheckFilledSvg";
import Button from "@/components/ui/Button";
import Link from "next/link";
import categories from "@/static/categories";
import { useTranslations } from "@/hooks/useTranslations";

export default function TableProducts({
  translate,
  langPrefix,
  lang,
  products = [],
  totalProducts = 0,
  totalPages = 1,
  initialCurrentPage = 1,
  isAll = true,
  onRestore,
  handleSelected,
  checkSelectedInNana,
  checkSelectedStatus,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.products.tableProducts.${text}`);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [categoriesD, setCategoriesD] = useState([]);
  const [searchParams, setSearchParams] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categories(lang);
        setCategoriesD(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const CurrentStatus = (product) => {
    const { deleted, hidden, rejected, approved } = product;
    const status = [
      { label: t("deleted"), condition: deleted, className: "bg-red-600" },
      { label: t("hidden"), condition: hidden, className: "bg-gray-500" },
      { label: t("rejected"), condition: rejected, className: "bg-dangerRed" },
      {
        label: t("approved"),
        condition: approved,
        className: "bg-successGreen",
      },
      {
        label: t("pendingApproval"),
        condition: !approved && !rejected,
        className: "bg-primary",
      },
    ];
    const currentStatus = status.find((item) => item.condition);
    return (
      <span
        className={`px-2 font-IBMPlex py-1 text-white rounded-[5px] text-xs font-semibold whitespace-nowrap ${currentStatus.className}`}
      >
        {currentStatus.label}
      </span>
    );
  };

  const [selected, setSelected] = useState(new Set());
  const allSelected =
    products.length !== 0 && selected.size === products.length;
  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === products.length
        ? new Set()
        : new Set(products.map((o) => o._id)),
    );
  };
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const updatePage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
    setCurrentPage(page);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParams(window.location.search);
    }
  }, []);

  const allSelectedInNana = checkSelectedInNana(selected);
  const allSelectedStatus = checkSelectedStatus(selected);

  return (
    <div className="bg-white mt-4 md:mt-6 p-4 md:p-8 rounded-[0.625rem]">
      <div className="flex justify-between items-center mb-2 md:mb-4 border-b border-black/10 pb-3 md:pb-5">
        <h2 className="font-semibold font-IBMPlex text-base md:text-lg text-darkNavy">
          {t("title")}
        </h2>
        {isAll ? (
          <div className="flex items-center gap-1 md:gap-[10px]">
            <Button
              color="primary"
              onClick={() =>
                handleSelected(
                  allSelectedInNana ? "removeFromNana" : "addToNana",
                  selected,
                  setSelected,
                )
              }
              isDisabled={allSelectedInNana || selected.size === 0}
              className="flex items-center justify-center rounded-full px-4 md:px-8 py-2 md:py-4 gap-1 md:gap-2 shadow-none font-semibold font-NotoSansArabic"
            >
              {allSelectedInNana ? "ازالة" : "اضافة"} المنتجات الي نعناع (
              {selected.size})
            </Button>
            <Button
              onClick={() => handleSelected("approve", selected, setSelected)}
              isDisabled={
                allSelectedStatus === "approved" || selected.size === 0
              }
              className="flex items-center justify-center rounded-full px-4 md:px-8 py-2 md:py-4 gap-1 md:gap-2 shadow-none font-semibold font-NotoSansArabic"
            >
              <CheckFilled />
              {t("acceptProduct")} ({selected.size})
            </Button>
          </div>
        ) : (
          <Link
            href={`/${langPrefix}admin/products/all`}
            className="text-darkNavy font-NotoSansArabic text-sm font-semibold flex gap-1 items-center justify-center"
          >
            {t("showAll")}
            <ChevronLeft className="" />
          </Link>
        )}
      </div>

      {/* Scrollable Table */}
      <div className="w-full overflow-x-auto pb-4">
        <table className="w-full min-w-max text-[13px] md:text-sm text-start border-collapse">
          <thead>
            <tr className="text-black border-b border-b-black/10">
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap">
                <div className="flex items-center justify-center gap-3">
                  <Checkbox isChecked={allSelected} onChange={toggleAll} />
                  <span>#</span>
                </div>
              </th>
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap text-start">
                <div className="flex items-center gap-2">
                  <span>{t("product")}</span>
                  <Sort className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap text-start">
                <div className="flex items-center gap-2">
                  <span>{t("landlord")}</span>
                  <Sort className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap text-start">
                <div className="flex items-center gap-2">
                  <span>{t("renterPricePerDay")}</span>
                  <Sort className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap text-start">
                <div className="flex items-center gap-2">
                  <span>{t("dateAdded")}</span>
                  <Sort className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap text-start">
                <div className="flex items-center gap-2">
                  <span>{t("dateEdited")}</span>
                  <Sort className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap text-start">
                <div className="flex items-center gap-2">
                  <span>{t("status")}</span>
                  <Sort className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 font-IBMPlex font-semibold text-sm whitespace-nowrap text-end">
                <span>{t("actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className={`group transition-colors text-black border-b border-b-black/5 ${
                  selected.has(product._id)
                    ? "bg-[#F48A421A]"
                    : "hover:bg-lightBg bg-transparent"
                }`}
              >
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 flex justify-center">
                      <Checkbox
                        isChecked={selected.has(product._id)}
                        onChange={() => toggleOne(product._id)}
                      />
                    </div>
                    <div
                      className="font-semibold text-sm font-IBMPlex truncate max-w-[80px]"
                      title={product._id}
                    >
                      {product._id}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <div className="flex flex-col text-xs text-start">
                    <span className="font-medium text-sm font-NotoSansArabic truncate max-w-[200px] md:max-w-[250px] inline-block">
                      {product.name}
                    </span>
                    <span
                      className={`py-[5px] px-[10px] mt-1 ${
                        selected.has(product._id)
                          ? "bg-white"
                          : "bg-lightBg group-hover:bg-white"
                      } text-darkNavy w-fit rounded-sm font-normal text-[12px] font-NotoSansArabic`}
                    >
                      {
                        categoriesD?.find((cat) => cat.key === product.category)
                          ?.name
                      }
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img
                      src={product.owner?.avatar}
                      alt={product.owner?.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    />
                    <div className="flex flex-col text-start">
                      <span className="text-sm font-medium font-NotoSansArabic truncate">
                        {product.owner?.fullName}
                      </span>
                      <span className="text-xs font-normal font-NotoSansArabic text-gray-500">
                        {product.owner?.phone}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-1 justify-start">
                    <span>{product.rental.value}</span>
                    <Currency size={14} className="w-3 h-3" />
                  </div>
                </td>
                <td className="px-3 py-3 font-medium text-sm align-middle whitespace-nowrap text-start">
                  <span dir={lang === "ar" ? "rtl" : "ltr"}>
                    {new Date(product.createdAt).toLocaleDateString(
                      lang === "en" ? "en-US" : "ar-EG",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-sm align-middle whitespace-nowrap text-start">
                  <span dir={lang === "ar" ? "rtl" : "ltr"}>
                    {new Date(product.updatedAt).toLocaleDateString(
                      lang === "en" ? "en-US" : "ar-EG",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-start">
                  {CurrentStatus(product)}
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <div className="flex gap-2 items-center justify-end">
                    <Link
                      href={`/${langPrefix}products/${product._id}`}
                      className="flex items-center gap-1 bg-lightBg rounded-sm p-1 font-medium text-xs"
                    >
                      <Eye color="#0D092B" size={12} />
                      عرض
                    </Link>
                    <Link
                      href={`/${langPrefix}edit-product/${product._id}`}
                      className="flex items-center gap-1 bg-lightBg rounded-[2px] p-1 font-medium text-sm"
                    >
                      <Edit size={12} color="#0D092B" />
                      تعديل
                    </Link>
                    {product.rejected && onRestore && (
                      <button
                        onClick={() => onRestore(product._id)}
                        className="flex items-center gap-1 bg-green-100 rounded-[2px] p-1 font-medium text-sm text-green-700 hover:bg-green-200"
                        title="Restore"
                      >
                        <span className="text-xs">استعادة</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && isAll && (
        <div className="mt-8 flex justify-center">
          <div className="bg-white w-full rounded-xl shadow-lg bproduct bproduct-gray-200 p-4">
            <div className="bg-white w-full px-4 py-3 flex items-center justify-between sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => updatePage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 bproduct bproduct-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trans("admin.users.previous")}
                </button>
                <button
                  onClick={() =>
                    updatePage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 bproduct bproduct-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trans("admin.users.next")}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {trans("admin.users.showing")}{" "}
                    <span className="font-medium">{products.length}</span>{" "}
                    {trans("admin.users.to")}{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, products.length)}
                    </span>{" "}
                    {trans("admin.users.of")}{" "}
                    <span className="font-medium">{totalProducts}</span>{" "}
                    {trans("admin.users.results")}
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => updatePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md bproduct bproduct-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {trans("admin.users.previous")}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2),
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => updatePage(page)}
                            className={`relative inline-flex items-center px-4 py-2 bproduct text-sm font-medium ${
                              page === currentPage
                                ? "z-10 bg-blue-50 bproduct-blue-500 text-blue-600"
                                : "bg-white bproduct-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() =>
                        updatePage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md bproduct bproduct-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {trans("admin.users.next")}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
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
