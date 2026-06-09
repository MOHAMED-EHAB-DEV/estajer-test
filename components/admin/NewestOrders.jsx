"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "../ui/svgs/CardsSvg";
import { Edit } from "../ui/svgs/icons/EditSvg";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";
import Link from "next/link";
import categories from "@/static/categories";
import { useTranslations } from "@/hooks/useTranslations";
import { statusData } from "@/static/statusData";
import EditOrderDatesModal from "@/components/admin/orders/EditOrderDatesModal";
import AdminNotesModal from "@/components/admin/orders/AdminNotesModal";
import { Note } from "../ui/svgs/icons/NoteSvg";

export default function NewestOrders({
  translate,
  langPrefix,
  lang,
  isAll,
  orders = [],
  totalOrders = 0,
  totalPages = 1,
  initialCurrentPage = 1,
  queryParams,
  Prefix = "",
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.home.orders.${text}`);
  const router = useRouter();
  const [searchParams, setSearchParams] = useState("");
  const [currentPage, setCurrentPage] = useState(Number(initialCurrentPage) || 1);
  const [categoriesD, setCategoriesD] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesOrder, setNotesOrder] = useState(null);
  const [ordersList, setOrdersList] = useState(orders);

  useEffect(() => {
    setSearchParams(queryParams);
  }, [queryParams]);

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

  // Sync ordersList with orders prop
  useEffect(() => {
    setOrdersList(orders);
  }, [orders]);

  // Sync currentPage when initialCurrentPage changes from server
  useEffect(() => {
    setCurrentPage(Number(initialCurrentPage) || 1);
  }, [initialCurrentPage]);

  // Update page in URL
  const updatePage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
    setCurrentPage(page);
  };

  // Handle opening the edit modal
  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  // Handle successful date update
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
    router.refresh();
  };

  // Handle opening the notes modal
  const handleNotesClick = (order) => {
    setNotesOrder(order);
    setNotesModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mt-2">
        {/* Table Header Bar */}
        <div className="flex justify-between items-center px-3 py-2 md:px-6 md:py-5 border-b border-black/8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-0.5 h-4 md:w-1 md:h-6 rounded-full bg-[#f48a42]" />
            <h2 className="font-semibold font-IBMPlex text-darkNavy text-xs md:text-base">
              {t(isAll ? "allOrders" : "title")}
            </h2>
            <span className="text-[9px] md:text-xs font-bold bg-[#FDF5EE] text-[#f48a42] border border-[#f48a42]/20 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full">
              {totalOrders}
            </span>
          </div>
          {!isAll && (
            <Link
              href={`/${langPrefix}admin/orders/all`}
              className="text-[#f48a42] font-NotoSansArabic text-[9px] md:text-xs font-bold flex gap-1 items-center justify-center hover:opacity-80 transition-opacity"
            >
              {t("showAll")}
              {lang === "en" ? (
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              )}
            </Link>
          )}
        </div>

        {/* Scrollable Table */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1200px] md:text-sm text-xs">
            {/* Header Row */}
            <div className="grid grid-cols-[0.8fr_1.5fr_1.2fr_1.2fr_0.8fr_0.8fr_1fr_1fr_1fr_140px_70px] gap-2 bg-[#FAFAFA] border-b border-black/5 px-2">
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                id
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {t("product")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {t("landlord")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {t("renter")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {t("renterPeriod")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {t("renterCost")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {t("date")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                {t("status")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                حالة وافي
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center">
                {t("actions")}
              </div>
              <div className="px-3 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                المزود
              </div>
            </div>

            {ordersList.length === 0 ? (
              <span className="text-center text-[#838282] py-8">
                ليس هناك طلبات
              </span>
            ) : (
              ordersList.map((order) => (
                <div
                  key={order.contractId || order._id}
                  className="grid grid-cols-[0.8fr_1.5fr_1.2fr_1.2fr_0.8fr_0.8fr_1fr_1fr_1fr_140px_70px] gap-2 w-full items-center transition-colors py-1 hover:bg-[#FDF5EE]/60 border-b border-black/4 last:border-0"
                >
                  <div className="px-3 py-3 font-semibold text-xs text-darkNavy font-IBMPlex truncate">
                    #{order.contractId || order._id}
                  </div>
                  <div className="px-3 py-3 flex flex-col min-w-0">
                    <span className="font-semibold md:text-sm text-xs text-darkNavy font-NotoSansArabic truncate">
                      {order.items[0]?.product?.nameAr}
                    </span>
                    <span className="md:text-[10px] text-[9px] text-[#f48a42] font-semibold mt-0.5 px-2 py-0.5 bg-[#FDF5EE] border border-[#f48a42]/20 rounded-md w-fit uppercase tracking-tight">
                      {
                        categoriesD?.find(
                          (cat) =>
                            cat.key === order.items[0]?.product?.category,
                        )?.name
                      }
                    </span>
                  </div>
                  <div className="px-3 py-3 min-w-0">
                    <div className="md:text-sm text-xs font-semibold text-darkNavy font-NotoSansArabic whitespace-normal break-words">
                      {order.ownerData?.fullName}
                    </div>
                    <div className="md:text-xs text-[10px] text-gray-400 mt-0.5">
                      {order.ownerData?.phone}
                    </div>
                  </div>
                  <div className="px-3 py-3 min-w-0">
                    <div className="md:text-sm text-xs font-semibold text-darkNavy font-NotoSansArabic whitespace-normal break-words">
                      {order.userData?.fullName}
                    </div>
                    <div className="md:text-xs text-[10px] text-gray-400 mt-0.5">
                      {order.userData?.phone}
                    </div>
                  </div>
                  <div className="px-3 py-3 md:text-sm text-xs text-gray-600 font-medium whitespace-nowrap">
                    {Math.ceil(
                      (new Date(order.endDate).getTime() -
                        new Date(order.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ) + 1}{" "}
                    {t("days")}
                  </div>
                  <div className="px-3 py-3 flex items-center gap-1 whitespace-nowrap font-bold text-[#f48a42]">
                    <span>{order.price}</span>
                    <Currency className="md:w-3 md:h-3 w-2.5 h-2.5" />
                  </div>
                  <div className="px-3 py-3 md:text-sm text-xs text-gray-400 font-medium whitespace-nowrap">
                    {new Date(order.startDate).toLocaleDateString("ar", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="px-3 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded-lg border tracking-wide whitespace-nowrap text-white"
                      style={{
                        backgroundColor: statusData[order.status]?.color,
                      }}
                    >
                      {order.status === "rejecting" && order.rejectionApproved
                        ? "تم تأكيد الإلغاء"
                        : statusData[order.status]?.text}
                    </span>
                  </div>
                  <div className="px-3 py-3 max-w-5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded-lg border border-black/5 bg-gray-50 text-gray-600 tracking-wide whitespace-nowrap">
                      {order.waffyStatus || order.nanaStatus || "not paid"}
                    </span>
                  </div>
                  <div className="px-3 py-3 flex gap-1.5 items-center justify-end">
                    <Link
                      href={`${langPrefix}${Prefix}details/${order._id}`}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-darkNavy transition-all"
                      title="عرض"
                    >
                      <Eye color="currentColor" className="md:w-3.5 md:h-3.5 w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => handleEditClick(order)}
                      className="p-2 rounded-lg bg-[#FDF5EE] hover:bg-[#f48a42]/15 text-[#f48a42] transition-all"
                      title="تعديل"
                    >
                      <Edit className="md:w-3.5 md:h-3.5 w-3 h-3" color="currentColor" />
                    </button>
                    <button
                      onClick={() => handleNotesClick(order)}
                      className="relative p-2 rounded-lg bg-[#FDF5EE] hover:bg-[#f48a42]/15 text-[#f48a42] transition-all"
                      title="ملاحظات الإدارة"
                    >
                      <Note className="md:w-4 md:h-4 w-3.5 h-3.5" />
                      {order.adminNotes?.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f48a42] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {order.adminNotes.length > 9 ? "9+" : order.adminNotes.length}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="px-3 py-3 min-w-0">
                    {order.paymentGateway === "nana" ? (
                      <span className="text-fuchsia-600 font-bold text-xs truncate block">
                        نعناع
                      </span>
                    ) : order.providerId ? (
                      <Link
                        href={`/${langPrefix}partners/${order.providerId.slug}`}
                        className="text-[#f48a42] hover:underline font-bold text-xs truncate block"
                        target="_blank"
                      >
                        {lang === "ar"
                          ? order.providerId.nameAr
                          : order.providerId.nameEn}
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-xs">مباشر</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {isAll && totalPages > 1 && (
          <div className="flex justify-center items-center py-6 border-t border-black/5 gap-2">
            <button
              onClick={() => updatePage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[#FDF5EE] disabled:opacity-30 hover:bg-[#f48a42]/15 text-[#f48a42] transition-colors"
            >
              {lang === "en" ? (
                <ChevronLeft className="md:w-[18px] md:h-[18px] w-4 h-4" />
              ) : (
                <ChevronRight className="md:w-[18px] md:h-[18px] w-4 h-4" />
              )}
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1),
                )
                .map((p, idx, arr) => (
                  <div key={p} className="flex">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-2 self-center text-gray-400 text-sm">
                        …
                      </span>
                    )}
                    <button
                      onClick={() => updatePage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                        p === currentPage
                          ? "bg-[#f48a42] text-white shadow-sm shadow-[#f48a42]/30"
                          : "bg-[#FAFAFA] text-gray-600 hover:bg-[#FDF5EE] hover:text-[#f48a42]"
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[#FDF5EE] disabled:opacity-30 hover:bg-[#f48a42]/15 text-[#f48a42] transition-colors"
            >
              {lang === "en" ? (
                <ChevronRight className="md:w-[18px] md:h-[18px] w-4 h-4" />
              ) : (
                <ChevronLeft className="md:w-[18px] md:h-[18px] w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Edit Order Dates Modal */}
      {editModalOpen && selectedOrder && (
        <EditOrderDatesModal
          order={selectedOrder}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleEditSuccess}
          translate={translate}
        />
      )}

      {/* Admin Notes Modal */}
      {notesModalOpen && notesOrder && (
        <AdminNotesModal
          order={notesOrder}
          onClose={() => {
            setNotesModalOpen(false);
            setNotesOrder(null);
          }}
        />
      )}
    </>
  );
}
