"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useDebounce } from "use-debounce";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRightSvg";
import { FaEye, FaUserCheck } from "@/components/ui/svgs/AdminIcons";
import { Tooltip } from "@/components/ui/Tooltip";
import { Select, SelectItem } from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "react-toastify";
import ToastMessage from "@/components/ui/ToastMessage";
import { Print } from "@/components/ui/svgs/icons/PrintSvg";

const CopyableEmail = ({ email, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip
      content={
        copied
          ? lang === "ar"
            ? "تم النسخ بنجاح"
            : "Copied successfully"
          : lang === "ar"
            ? "نسخ"
            : "Copy"
      }
      color={copied ? "success" : undefined}
      placement="auto"
    >
      <div
        onClick={handleCopy}
        className="text-[10px] md:text-xs text-gray-500 truncate mt-0.5 cursor-pointer hover:text-sky-600 transition-colors"
        dir="ltr"
      >
        {email}
      </div>
    </Tooltip>
  );
};

const AiChatContainer = ({ initialData, translate, lang, queryParams }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chats = initialData?.chats || [];
  const totalChats = initialData?.totalChats || 0;

  const [isExportLoading, setIsExportLoading] = useState(false);

  const getSearchParam = (key) => {
    const params = new URLSearchParams(searchParams);
    return params.get(key);
  };

  const [searchValue, setSearchValue] = useState(
    getSearchParam("search") || "",
  );
  const [debouncedSearch] = useDebounce(searchValue, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentSearch = params.get("search") || "";

    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  }, [debouncedSearch, searchParams, router]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    router.push(`?${params.toString()}`);
  };

  const handleSort = (field) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get("sortBy");
    const currentOrder = params.get("sortOrder");

    if (currentSort === field) {
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "desc");
    }
    router.push(`?${params.toString()}`);
  };

  const handleExportExcel = async () => {
    try {
      setIsExportLoading(true);
      const params = new URLSearchParams(searchParams);

      const response = await fetch(
        `/api/admin/messages/ai/export?${params.toString()}`,
      );
      if (!response.ok) throw new Error("فشل في تصدير البيانات");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-chats-${new Date().toLocaleDateString("en").replaceAll("/", "-")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        ToastMessage(
          lang === "ar" ? "تم التصدير بنجاح" : "Exported successfully",
        ),
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        ToastMessage(
          lang === "ar"
            ? "حدث خطأ أثناء تصدير البيانات"
            : "Error exporting data",
        ),
      );
    } finally {
      setIsExportLoading(false);
    }
  };

  const SortIndicator = ({ field }) => {
    const active = getSearchParam("sortBy") === field;
    const order = getSearchParam("sortOrder");
    return (
      <span
        className={`text-xs transition-colors ${
          active
            ? "text-primary"
            : "text-gray-300 group-hover/col:text-gray-400"
        }`}
      >
        {active ? (order === "asc" ? "↑" : "↓") : "↕"}
      </span>
    );
  };

  const totalPages = initialData.totalPages || 1;
  const currentPage = initialData.currentPage || 1;

  return (
    <div className="flex flex-col gap-6 font-NotoSansArabic pb-20">
      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Header (Filters Only) */}
        <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full flex-1">
              <input
                type="text"
                placeholder={
                  lang === "ar"
                    ? "ابحث بالاسم أو بيانات التواصل..."
                    : "Search name or contact..."
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full px-4 h-10 pe-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
              <div className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>

            <Select
              selectedKeys={[
                `${getSearchParam("sortBy") || "lastMessageAt"}-${getSearchParam("sortOrder") || "desc"}`,
              ]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                if (!value) return;
                const [field, order] = value.split("-");
                const params = new URLSearchParams(searchParams);
                params.set("sortBy", field);
                params.set("sortOrder", order);
                router.push(`?${params.toString()}`);
              }}
              className="w-full md:w-64 md:flex-shrink-0"
              classNames={{
                trigger:
                  "bg-white border border-gray-200 hover:border-gray-300 rounded-xl h-10 shadow-none",
                value: "text-sm text-gray-700",
              }}
              aria-label="Sort By"
            >
              <SelectItem key="lastMessageAt-desc" value="lastMessageAt-desc">
                {lang === "ar" ? "الأحدث" : "Newest"}
              </SelectItem>
              <SelectItem key="lastMessageAt-asc" value="lastMessageAt-asc">
                {lang === "ar" ? "الأقدم" : "Oldest"}
              </SelectItem>
              <SelectItem key="spamCount-desc" value="spamCount-desc">
                {lang === "ar" ? "الأكثر سبام" : "Highest Spam"}
              </SelectItem>
              <SelectItem key="spamCount-asc" value="spamCount-asc">
                {lang === "ar" ? "الأقل سبام" : "Lowest Spam"}
              </SelectItem>
            </Select>

            <Button
              className="bg-darkNavy rounded-xl h-10 px-6 shadow-[#F48A4233] shadow-lg flex items-center justify-center gap-2 md:w-auto w-full flex-shrink-0"
              onPress={handleExportExcel}
              isDisabled={isExportLoading}
            >
              {isExportLoading ? (
                <svg
                  className="animate-spin md:h-5 md:w-5 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Print className="md:h-5 md:w-5 h-4 w-4" />
              )}
              <span className="font-semibold text-xs md:text-sm text-white font-NotoSansArabic pt-[1px]">
                {lang === "ar" ? "تصدير" : "Export"}
              </span>
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px]">
            {/* Header Row */}
            <div className="grid grid-cols-6 gap-4 w-full bg-gray-50/80 border-b border-gray-100 px-4">
              <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                اسم الزائر
              </div>
              <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                بيانات التواصل
              </div>
              <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                عدد الرسائل
              </div>
              <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center">
                السبام
              </div>
              <div
                className="group/col px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex gap-2 items-center cursor-pointer hover:text-primary transition-colors select-none"
                onClick={() => handleSort("lastMessageAt")}
              >
                آخر رسالة
                <SortIndicator field="lastMessageAt" />
              </div>
              <div className="px-3 md:py-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center">
                الإجراءات
              </div>
            </div>

            {/* Data Rows */}
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brandCream flex items-center justify-center">
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
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <p className="text-gray-400 font-medium text-xs md:text-sm">
                  لا توجد محادثات
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className="grid grid-cols-6 gap-4 w-full items-center transition-colors py-2 hover:bg-brandCream/60 border-b border-black/4 last:border-0 px-4"
                >
                  {/* Visitor Name */}
                  <div className="px-3 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex flex-col justify-center">
                      <div className="text-xs md:text-sm font-semibold text-darkNavy truncate">
                        {chat.visitorName || "زائر مجهول"}
                      </div>
                      {chat.user?.email && (
                        <CopyableEmail email={chat.user.email} lang={lang} />
                      )}
                    </div>
                  </div>

                  {/* Visitor Contact */}
                  <div
                    className="px-3 py-3 text-xs md:text-sm text-gray-600 font-medium"
                    title={chat.user?.phone || chat.visitorContact}
                  >
                    {chat.user?.phone ? (
                      <span className="truncate block" dir="ltr">
                        {chat.user.phone}
                      </span>
                    ) : (
                      <span className="truncate block" dir="ltr">
                        {chat.visitorContact || "—"}
                      </span>
                    )}
                  </div>

                  {/* Messages Count */}
                  <div className="px-3 py-3 text-xs md:text-sm text-gray-600 font-medium">
                    {chat.messagesCount || 0}
                  </div>

                  {/* Spam Count */}
                  <div className="px-3 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${chat.spamCount > 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-50 text-gray-500"}`}
                    >
                      {chat.spamCount || 0}
                    </span>
                  </div>

                  {/* Last Message At */}
                  <div className="px-3 py-3 text-xs md:text-sm text-gray-600 font-medium">
                    {chat.lastMessageAt
                      ? format(new Date(chat.lastMessageAt), "dd/MM/yyyy p")
                      : "—"}
                  </div>

                  {/* Actions */}
                  <div className="px-3 py-3 flex items-center gap-2">
                    <Tooltip
                      content={lang === "ar" ? "عرض المحادثة" : "View Chat"}
                    >
                      <Link
                        href={`/admin/messages/ai?chatId=${chat.sessionId}`}
                      >
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all border border-transparent hover:border-sky-100 shadow-sm hover:shadow-md bg-white"
                        >
                          <FaEye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </Tooltip>
                    {chat.user && chat.user.email && (
                      <Tooltip
                        content={lang === "ar" ? "عرض المستخدم" : "View User"}
                      >
                        <Link
                          href={`/admin/users?search=${chat.user.email}`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100 shadow-sm hover:shadow-md bg-white flex items-center"
                        >
                          <FaUserCheck className="w-4 h-4" />
                        </Link>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-gray-500 font-medium">
              {lang === "ar" ? (
                <>
                  الإجمالي:{" "}
                  <span className="font-bold text-darkNavy">
                    {chats.length}
                  </span>{" "}
                  من{" "}
                  <span className="font-bold text-darkNavy">{totalChats}</span>
                </>
              ) : (
                <>
                  Total:{" "}
                  <span className="font-bold text-darkNavy">
                    {chats.length}
                  </span>{" "}
                  from{" "}
                  <span className="font-bold text-darkNavy">{totalChats}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrent = page === currentPage;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all shadow-sm ${
                          isCurrent
                            ? "bg-primary text-white border-none shadow-orange-500/20"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span
                        key={page}
                        className="w-9 text-center text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChatContainer;
