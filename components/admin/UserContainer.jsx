"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaEdit,
  FaTrash,
  FaEye,
  MdBlock,
  BsPersonX,
} from "@/components/ui/svgs/AdminIcons";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRightSvg";
import EditUserModal from "@/components/admin/EditUserModal";
import { toast } from "@/utils/toast";
import ConfirmModal from "../dashboard/ConfirmModal";
import { useTranslations } from "@/hooks/useTranslations";
import ToastMessage from "../ui/ToastMessage";
import { format } from "date-fns";

import UserFilters from "@/components/admin/UserFilters";

const UserContainer = ({ initialData, translate, lang, queryParams }) => {
  const trans = useTranslations(translate);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  const getSearchParam = (key) => {
    const params = new URLSearchParams(searchParams);
    return params.get(key);
  };

  const [users, setUsers] = useState(initialData.users || []);
  const [totalUsers, setTotalUsers] = useState(initialData.totalUsers || 0);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage || 1);
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmType, setConfirmType] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setUsers(initialData.users || []);
    setTotalUsers(initialData.totalUsers || 0);
    setTotalPages(initialData.totalPages || 1);
    setCurrentPage(initialData.currentPage || 1);
  }, [initialData]);

  const updatePage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSort = (field) => {
    const params = new URLSearchParams(searchParams);
    const currentSortBy = params.get("sortBy");
    const currentSortOrder = params.get("sortOrder");

    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "desc");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleBanUser = (user) => {
    setSelectedUser(user);
    setConfirmType(user.isBanned ? "unban" : "ban");
    setConfirmAction(() => () => toggleBanUser(user._id, !user.isBanned));
    setShowConfirmModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setConfirmType("delete");
    setConfirmAction(() => () => deleteUser(user._id));
    setShowConfirmModal(true);
  };

  const handleViewUser = (user) => {
    router.push(`/profile/${user.pathName}/products`);
  };

  const toggleBanUser = async (userId, banStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: banStatus }),
      });
      if (!response.ok) throw new Error("Failed to update user status");
      toast.success(
        ToastMessage(`User ${banStatus ? "banned" : "unbanned"} successfully`),
      );
      router.refresh();
    } catch (error) {
      toast.error(ToastMessage("Failed to update user status"));
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      toast.success(ToastMessage("User deleted successfully"));
      router.refresh();
    } catch (error) {
      toast.error(ToastMessage("Failed to delete user"));
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsPrintLoading(true);
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/users/export?${params.toString()}`);
      if (!response.ok) throw new Error("فشل في تصدير البيانات");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-${new Date().toLocaleDateString("en").replaceAll("/", "-")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(ToastMessage("تم تصدير المستخدمين بنجاح"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(ToastMessage("حدث خطأ أثناء تصدير البيانات"));
    } finally {
      setIsPrintLoading(false);
    }
  };

  const getAccountTypeStyle = (accountType, hasDocumentCode) => {
    if (accountType === "personal" && hasDocumentCode) {
      return {
        bg: "bg-orange-50 text-orange-700 border-orange-200 shadow-sm",
        dot: "bg-orange-500",
      };
    }
    switch (accountType) {
      case "personal":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-500",
        };
      case "company":
        return {
          bg: "bg-violet-50 text-violet-700 border-violet-200",
          dot: "bg-violet-500",
        };
      case "admin":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-600 border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const getStatusStyle = (user) => {
    if (user.isBanned)
      return { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
    if (user.isVerified)
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-400",
    };
  };

  const getStatusText = (user) => {
    if (user.isBanned) return trans("admin.users.banned");
    if (user.isVerified) return trans("admin.users.verified");
    return trans("admin.users.pending");
  };

  const SortIndicator = ({ field }) => {
    const active = getSearchParam("sortBy") === field;
    const order = getSearchParam("sortOrder");
    return (
      <span
        className={`text-xs transition-colors ${active ? "text-[#f48a42]" : "text-gray-300 group-hover/col:text-gray-400"}`}
      >
        {active ? (order === "asc" ? "↑" : "↓") : "↕"}
      </span>
    );
  };

  return (
    <>
      <UserFilters
        queryParams={queryParams}
        translate={translate}
        lang={lang}
        onPrint={handleExportExcel}
        isPrintLoading={isPrintLoading}
      />

      <div className="bg-white md:rounded-2xl rounded-xl shadow-sm border border-black/5 overflow-hidden mt-2">
        {/* Table Header Bar */}
        <div className="flex justify-between items-center md:px-6 md:py-5 px-4 py-3 border-b border-black/8">
          <div className="flex items-center gap-3">
            <div className="md:w-1 md:h-6 w-0.5 h-5 rounded-full bg-[#f48a42]" />
            <h2 className="font-semibold font-IBMPlex text-darkNavy text-sm md:text-base">
              {trans("admin.users.totalUsers")}
            </h2>
            <span className="text-[10px] md:text-xs font-bold bg-[#FDF5EE] text-[#f48a42] border border-[#f48a42]/20 px-2.5 py-1 rounded-full">
              {totalUsers}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-[#f48a42]/20 border-t-[#f48a42] animate-spin" />
            </div>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1040px] text-sm">
                {/* Header Row */}
                <div className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr_0.8fr_0.7fr_0.8fr_1fr_140px] gap-2 bg-[#FAFAFA] border-b border-black/5 px-2">
                  <div
                    className="group/col px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex gap-2 items-center cursor-pointer hover:text-[#f48a42] transition-colors select-none"
                    onClick={() => handleSort("fullName")}
                  >
                    {trans("admin.users.name")}
                    <SortIndicator field="fullName" />
                  </div>
                  <div
                    className="group/col px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex gap-2 items-center cursor-pointer hover:text-[#f48a42] transition-colors select-none"
                    onClick={() => handleSort("email")}
                  >
                    {trans("admin.users.email")}
                    <SortIndicator field="email" />
                  </div>
                  <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                    {trans("admin.users.accountType")}
                  </div>
                  <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                    {trans("admin.users.status")}
                  </div>
                  <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                    {trans("admin.users.isRenter")}
                  </div>
                  <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                    عمولة
                  </div>
                  <div
                    className="group/col px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex gap-2 items-center cursor-pointer hover:text-[#f48a42] transition-colors select-none"
                    onClick={() => handleSort("productsCount")}
                  >
                    {trans("admin.users.productsCount") || "المنتجات"}
                    <SortIndicator field="productsCount" />
                  </div>
                  <div
                    className="group/col px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex gap-2 items-center cursor-pointer hover:text-[#f48a42] transition-colors select-none"
                    onClick={() => handleSort("createdAt")}
                  >
                    {trans("admin.users.joined")}
                    <SortIndicator field="createdAt" />
                  </div>
                  <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                    {trans("admin.users.actions")}
                  </div>
                </div>

                {/* Data Rows */}
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#FDF5EE] flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f48a42"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-medium text-xs md:text-sm">
                      {trans("admin.users.noUsersFound")}
                    </p>
                  </div>
                ) : (
                  users.map((user) => {
                    const accountStyle = getAccountTypeStyle(
                      user.accountType,
                      !!user.documentCode,
                    );
                    const statusStyle = getStatusStyle(user);
                    return (
                      <div
                        key={user._id}
                        className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr_0.8fr_0.7fr_0.8fr_1fr_140px] gap-2 w-full items-center transition-colors py-1 hover:bg-[#FDF5EE]/60 border-b border-black/4 last:border-0 group px-2"
                      >
                        {/* Name + Avatar */}
                        <div className="px-3 py-3 flex items-center gap-3 overflow-hidden">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                className="h-8 w-8 md:h-9 md:w-9 rounded-xl object-cover border-2 border-white shadow-sm ring-1 ring-black/5"
                                src={user.avatar}
                                alt=""
                              />
                            ) : (
                              <div
                                className="h-8 w-8 md:h-9 md:w-9 rounded-xl flex items-center justify-center shadow-sm text-white text-[10px] md:text-xs font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #f48a42, #e07530)",
                                }}
                              >
                                {(user.fullName || user.name)
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs md:text-sm font-semibold text-darkNavy truncate font-NotoSansArabic">
                              {user.fullName || user.name || "N/A"}
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                              {user.phone || "—"}
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="px-3 py-3 text-xs md:text-sm text-gray-600 font-medium">
                          {user.email}
                        </div>

                        {/* Account Type */}
                        <div className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wide ${accountStyle.bg}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${accountStyle.dot}`}
                            />
                            {user.accountType === "personal" &&
                            user.documentCode
                              ? trans("admin.users.freelance")
                              : user.accountType || "—"}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="px-3 py-3 flex flex-wrap gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border tracking-wide ${statusStyle.bg}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                            />
                            {getStatusText(user)}
                          </span>
                          {user.premium && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#FDF5EE] text-[#f48a42] border border-[#f48a42]/25 uppercase">
                              ★ PREMIUM
                            </span>
                          )}
                        </div>

                        <div className="mt-1">
                          {user.isRenter ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-sky-100 text-sky-600 border border-sky-200 uppercase tracking-wide">
                              {trans("admin.users.renter")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-violet-100 text-violet-600 border border-violet-200 uppercase tracking-wide">
                              {trans("admin.users.lessor")}
                            </span>
                          )}
                        </div>

                        {/* Commission */}
                        <div className="px-3 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] md:text-xs font-bold bg-[#FDF5EE] text-[#f48a42] rounded-lg border border-[#f48a42]/20">
                            {user.commission || 15}%
                          </span>
                        </div>

                        {/* Products Count */}
                        <div className="px-3 py-3 text-xs md:text-sm text-gray-600 font-medium">
                          {user.productsCount || 0}
                        </div>

                        {/* Date */}
                        <div className="px-3 py-3 text-xs md:text-sm text-gray-400 font-medium">
                          {format(new Date(user.createdAt), "yy/MM/dd")}
                        </div>

                        {/* Actions */}
                        <div className="px-3 py-3 flex gap-1.5 items-center justify-end">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="md:p-2 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-darkNavy transition-all"
                            title={trans("admin.users.viewProfile")}
                          >
                            <FaEye className="md:w-3.5 md:h-3.5 w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="md:p-2 p-1.5 rounded-lg bg-[#FDF5EE] hover:bg-[#f48a42]/15 text-[#f48a42] transition-all"
                            title={trans("admin.users.editUser")}
                          >
                            <FaEdit className="md:w-3.5 md:h-3.5 w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleBanUser(user)}
                            className={`md:p-2 p-1.5 rounded-lg transition-all ${
                              user.isBanned
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-600"
                            }`}
                            title={
                              user.isBanned
                                ? trans("admin.users.unbanUser")
                                : trans("admin.users.banUser")
                            }
                          >
                            {user.isBanned ? (
                              <BsPersonX className="md:w-3.5 md:h-3.5 w-3 h-3" />
                            ) : (
                              <MdBlock className="md:w-3.5 md:h-3.5 w-3 h-3" />
                            )}
                          </button>
                          {user.accountType !== "admin" && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="md:p-2 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all"
                              title={trans("admin.users.deleteUser")}
                            >
                              <FaTrash className="md:w-3.5 md:h-3.5 w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center md:py-6 py-3 border-t border-black/5 md:gap-2 gap-1">
                <button
                  onClick={() => updatePage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="md:p-2 p-1.5 rounded-xl bg-[#FDF5EE] disabled:opacity-30 hover:bg-[#f48a42]/15 text-[#f48a42] transition-colors"
                >
                  {lang === "en" ? (
                    <ChevronLeft size={18} />
                  ) : (
                    <ChevronRight size={18} />
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
                          className={`md:w-9 md:h-9 w-8 h-8 rounded-lg md:text-sm text-xs font-semibold transition-all ${
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
                  onClick={() =>
                    updatePage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="md:p-2 p-1.5 rounded-xl bg-[#FDF5EE] disabled:opacity-30 hover:bg-[#f48a42]/15 text-[#f48a42] transition-colors"
                >
                  {lang === "en" ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            router.refresh();
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          translate={translate}
        />
      )}

      {showConfirmModal && selectedUser && (
        <ConfirmModal
          t={trans}
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedUser(null);
            setConfirmAction(null);
          }}
          onConfirm={() => {
            if (confirmAction) confirmAction();
            setShowConfirmModal(false);
            setSelectedUser(null);
            setConfirmAction(null);
          }}
          title={
            confirmType === "delete"
              ? trans("admin.users.confirmModal.deleteTitle")
              : confirmType === "ban"
                ? trans("admin.users.confirmModal.banTitle")
                : trans("admin.users.confirmModal.unbanTitle")
          }
          message={
            confirmType === "delete"
              ? trans("admin.users.confirmModal.deleteMessage")
              : confirmType === "ban"
                ? trans("admin.users.confirmModal.banMessage")
                : trans("admin.users.confirmModal.unbanMessage")
          }
          type={confirmType}
          cancelText={trans("admin.users.confirmModal.cancel")}
          confirmText={trans("admin.users.confirmModal.confirm")}
        />
      )}
    </>
  );
};

export default UserContainer;
