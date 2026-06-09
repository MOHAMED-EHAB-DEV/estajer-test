"use client";
import { useState, useCallback } from "react";
import { Pagination, Spinner } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";

const STATUS_CONFIG = {
  new: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    activeBg: "bg-blue-600",
  },
  inprogress: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    activeBg: "bg-orange-500",
  },
  solved: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    activeBg: "bg-green-600",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
    activeBg: "bg-red-500",
  },
};

const UserTicketsContainer = ({
  initialTickets,
  initialTotalPages,
  initialCurrentPage,
  lang,
  translate,
  langPrefix,
  placeholder = false,
}) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`dashboard.support.${key}`);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";
  const [isPending, setIsPending] = useState(false);

  const statusOptions = [
    { key: "all", label: t("allTickets") },
    { key: "new", label: t("status.new") },
    { key: "inprogress", label: t("status.inprogress") },
    { key: "solved", label: t("status.solved") },
    { key: "cancelled", label: t("status.cancelled") },
  ];

  const updateSearchParam = useCallback(
    (key, value) => {
      setIsPending(true);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") {
        params.delete("page");
      }
      router.push(`/${langPrefix}dashboard/tickets?${params.toString()}`);
      setTimeout(() => setIsPending(false), 500);
    },
    [router, searchParams, langPrefix],
  );

  const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
      dot: "bg-gray-400",
      activeBg: "bg-gray-500",
    };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return lang === "ar" ? "اليوم" : "Today";
    if (diffDays === 1) return lang === "ar" ? "أمس" : "Yesterday";
    if (diffDays < 7)
      return lang === "ar" ? `منذ ${diffDays} أيام` : `${diffDays}d ago`;
    if (diffDays < 30)
      return lang === "ar"
        ? `منذ ${Math.floor(diffDays / 7)} أسبوع`
        : `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(dateStr);
  };

  if (placeholder) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
        <Spinner color="primary" />
      </div>
    );
  }

  const ticketCount = initialTickets?.length || 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusOptions.map((opt) => {
          const isActive = currentStatus === opt.key;
          const config = opt.key !== "all" ? getStatusConfig(opt.key) : null;

          return (
            <button
              key={opt.key}
              onClick={() => updateSearchParam("status", opt.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
                ${
                  isActive
                    ? opt.key === "all"
                      ? "bg-darkNavy text-white border-darkNavy shadow-sm"
                      : `${config.activeBg} text-white border-transparent shadow-sm`
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {opt.key !== "all" && (
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : config.dot}`}
                />
              )}
              {opt.label}
            </button>
          );
        })}

        {/* Ticket count */}
        <span className="text-xs text-gray-400 font-medium ms-auto">
          {ticketCount}{" "}
          {ticketCount === 1
            ? lang === "ar"
              ? "تذكرة"
              : "ticket"
            : lang === "ar"
              ? "تذاكر"
              : "tickets"}
        </span>
      </div>

      {/* Tickets List */}
      <div
        className={`flex flex-col gap-3 transition-opacity duration-200 min-h-[200px] ${isPending ? "opacity-40 pointer-events-none" : "opacity-100"}`}
      >
        {!initialTickets || initialTickets.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-[#FDF5EE] rounded-2xl flex items-center justify-center mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-[#f48a42]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-bold text-base mb-1">
              {t("noTickets")}
            </p>
            <p className="text-gray-400 text-sm">
              {currentStatus !== "all"
                ? lang === "ar"
                  ? "جرب تغيير الفلتر"
                  : "Try changing the filter"
                : lang === "ar"
                  ? "يمكنك إنشاء تذكرة جديدة من صفحة الدعم"
                  : "You can create a new ticket from the support page"}
            </p>
          </div>
        ) : (
          initialTickets.map((ticket) => {
            const config = getStatusConfig(ticket.status);
            const lastMsg = ticket.messages?.[ticket.messages.length - 1];
            const msgCount = ticket.messages?.length || 0;

            return (
              <Link
                key={ticket._id}
                href={`/${langPrefix}dashboard/tickets/${ticket._id}`}
                className="group bg-white rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Status Accent Bar */}
                  <div className={`w-1 shrink-0 ${config.dot}`} />

                  {/* Content */}
                  <div className="flex-1 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800 truncate text-sm md:text-base group-hover:text-primary transition-colors">
                          {ticket.title}
                        </h3>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${config.bg} ${config.text}`}
                        >
                          {t(`status.${ticket.status}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>#{ticket._id?.slice(-6).toUpperCase()}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>
                          {trans(`ticket.subjectOptions.${ticket.subject}`)}
                        </span>
                        {msgCount > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-3 h-3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                                />
                              </svg>
                              {msgCount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-gray-400 font-medium">
                        {getRelativeTime(ticket.updatedAt || ticket.createdAt)}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors rtl:rotate-180"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {initialTotalPages > 1 && (
        <div className="flex justify-center mt-2">
          <Pagination
            isCompact
            showControls
            total={initialTotalPages}
            page={initialCurrentPage}
            onChange={(page) => updateSearchParam("page", page.toString())}
            classNames={{
              cursor: "bg-primary text-white",
              next: `${lang === "ar" ? "rotate-180" : ""} !rounded-lg`,
              prev: `${lang === "ar" ? "rotate-180" : ""} !rounded-lg`,
              item: "!rounded-lg",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserTicketsContainer;
