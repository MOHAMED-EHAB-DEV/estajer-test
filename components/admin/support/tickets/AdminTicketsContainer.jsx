"use client";
import { useState, useEffect } from "react";
import FilterOptions from "../../orders/FilterOptions";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Pagination } from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const statusConfig = {
  new: {
    label: "جديد",
    bg: "bg-amber-100 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  inprogress: {
    label: "قيد الحل",
    bg: "bg-blue-100 text-blue-700 border-blue-300",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
  solved: {
    label: "تم الحل",
    bg: "bg-emerald-100 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  cancelled: {
    label: "تم الالغاء",
    bg: "bg-red-100 text-red-700 border-red-300",
    dot: "bg-red-500",
    ring: "ring-red-200",
  },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? {
    label: status,
    bg: "bg-gray-100 text-gray-600 border-gray-300",
    dot: "bg-gray-400",
    ring: "ring-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ring-2 ${cfg.ring}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

function MetaRow({ icon, label }) {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-xs truncate">{label}</span>
    </div>
  );
}

const AdminTicketsContainer = ({
  translate,
  tickets,
  lang,
  totalPages,
  currentPage,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dateAdded, setDateAdded] = useState(
    searchParams.get("dateAdded") || "all",
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsPrintLoading(true);
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/tickets/export?${params.toString()}`);
      if (!response.ok) throw new Error("فشل في تصدير البيانات");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tickets-${new Date().toLocaleDateString("en").replaceAll("/", "-")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(ToastMessage("تم تصدير التذاكر بنجاح"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(ToastMessage("حدث خطأ أثناء تصدير البيانات"));
    } finally {
      setIsPrintLoading(false);
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    const currentSearch = params.get("search") || "";
    if (search !== currentSearch) {
      if (search && search !== "all") params.set("search", search);
      else params.delete("search");
      hasChanges = true;
    }

    const currentStatus = params.get("status") || "all";
    if (status !== currentStatus) {
      if (status && status !== "all") params.set("status", status);
      else params.delete("status");
      hasChanges = true;
    }

    const currentDateAdded = params.get("dateAdded") || "all";
    if (dateAdded !== currentDateAdded) {
      if (dateAdded && dateAdded !== "all") params.set("dateAdded", dateAdded);
      else params.delete("dateAdded");
      hasChanges = true;
    }

    if (hasChanges) {
      params.delete("page");
      router.push(`?${params.toString()}`);
    }
  }, [status, search, dateAdded]);

  return (
    <>
      <FilterOptions
        showDateAdded={true}
        showDate={false}
        setDateAdded={setDateAdded}
        dateAdded={dateAdded}
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        translate={translate}
        onPrint={handleExportExcel}
        lang={lang}
        statusOptions={[
          { key: "all" },
          { key: "new" },
          { key: "inprogress" },
          { key: "solved" },
          { key: "cancelled" },
        ]}
        dateAddedOptions={[{ key: "all" }, { key: "week" }, { key: "month" }]}
      />

      <div className="flex flex-col gap-8 mb-16">
        {tickets?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-500">
              لا توجد تذاكر هنا
            </p>
            <p className="text-sm text-gray-400 mt-1">
              جرّب تغيير الفلتر المحدد
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tickets?.map((ticket) => (
              <TicketCard ticket={ticket} key={ticket._id} lang={lang} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 pb-12 w-full flex justify-center gap-1.5">
            <Pagination
              page={currentPage}
              total={totalPages}
              color="warning"
              showControls
              initialPage={1}
              classNames={{
                next: lang === "ar" ? "rotate-180" : "",
                prev: lang === "ar" ? "rotate-180" : "",
              }}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTicketsContainer;

const TicketCard = ({ ticket, lang }) => {
  const [expanded, setExpanded] = useState(false);
  const lastMessage =
    ticket.messages?.length > 0
      ? ticket.messages[ticket.messages.length - 1]
      : { content: ticket.message || "لا توجد رسائل بعد", sender: ticket }; // fallback to original ticket message

  const lastMessageText = lastMessage?.content || "لا توجد رسائل بعد";
  const isLong = lastMessageText.length > 120;

  const formattedDate = new Date(
    ticket.lastMessageAt || ticket.createdAt,
  ).toLocaleString(lang === "en" ? "en-US" : "ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* colored top stripe based on status */}
      <div
        className={`h-1 w-full ${
          ticket.status === "new"
            ? "bg-gradient-to-r from-amber-400 to-orange-400"
            : ticket.status === "solved"
              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
              : ticket.status === "cancelled"
                ? "bg-gradient-to-r from-red-400 to-rose-400"
                : "bg-gradient-to-r from-blue-400 to-cyan-400"
        }`}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* ── Top row ── */}
        <div className="flex justify-between items-start gap-2 mb-4">
          <h2 className="text-base font-bold text-gray-800 leading-snug line-clamp-2 flex-1">
            {ticket.title || ticket.subject}
          </h2>
          <StatusBadge status={ticket.status} />
        </div>

        {/* ── Meta info ── */}
        <div className="space-y-1.5 mb-4">
          <MetaRow
            icon={
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            }
            label={ticket.name}
          />
          <MetaRow
            icon={
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            }
            label={ticket.email}
          />
          {ticket.phone && (
            <MetaRow
              icon={
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              }
              label={ticket.phone}
            />
          )}
          <MetaRow
            icon={
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            }
            label={formattedDate}
          />
        </div>

        {/* ── Sender identity pill ── */}
        {ticket.user ? (
          <div className="flex items-center gap-2.5 mb-4 p-2.5 bg-orange-50 rounded-xl border border-orange-100">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white items-center justify-center flex">
              {ticket.user.avatar ? (
                <Image
                  src={anyImgUrl({ src: ticket.user.avatar, size: 100 })}
                  fill
                  alt={ticket.user.fullName}
                  className="object-cover"
                />
              ) : (
                <span className="font-bold text-gray-400 text-sm">
                  {ticket.user.fullName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#f48a42] truncate">
                👤 {ticket.user.fullName}
              </p>
              <p className="text-[10px] text-orange-600/70 truncate">
                {ticket.user.email}
              </p>
            </div>
            <span className="ms-auto shrink-0 text-[10px] bg-[#f48a42] text-white rounded-full px-2 py-0.5 font-semibold">
              مسجّل
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 mb-4 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-amber-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-800">زائر</p>
              <p className="text-[10px] text-amber-500 break-all line-clamp-1">
                {ticket.visitorId || ""}
              </p>
            </div>
            <span className="ms-auto shrink-0 text-[10px] bg-amber-500 text-white rounded-full px-2 py-0.5 font-semibold">
              زائر
            </span>
          </div>
        )}

        {/* ── Message body ── */}
        <div className="mb-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed">
          <p
            className={`whitespace-pre-line ${!expanded && isLong ? "line-clamp-3" : ""}`}
          >
            {lastMessageText}
          </p>
          {isLong && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setExpanded((v) => !v);
              }}
              className="text-xs text-[#f48a42] font-semibold mt-1.5 hover:underline"
            >
              {expanded ? "إخفاء" : "قراءة المزيد..."}
            </button>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
          <Link
            href={`/${lang}/admin/support/tickets/${ticket._id}`}
            className="flex w-full justify-center items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f48a42] text-white hover:opacity-90 shadow-sm shadow-[#f48a42]/20 transition-all"
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              />
            </svg>
            متابعة المحادثة
          </Link>
        </div>
      </div>
    </div>
  );
};
