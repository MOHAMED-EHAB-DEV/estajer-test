"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { Select, SelectItem } from "@/components/ui/Select";
import { Modal, ModalContent, ModalBody } from "@/components/ui/CustomModal";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp";

// SVG Icons
const BugIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const LightbulbIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const HeartIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ExternalLinkIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const MaximizeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
    />
  </svg>
);

const CloseIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const FilterIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const EditIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const SpinnerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function SupportAnalyticsClient({ initialData, lang }) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("frequent");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [toggledUserIds, setToggledUserIds] = useState(new Set());
  const [editingStatusItemId, setEditingStatusItemId] = useState(null);

  // Data state
  const [totalUsers, setTotalUsers] = useState(initialData?.totalUsers || 0);
  const [counts, setCounts] = useState(
    initialData?.counts || { all: 0, bug: 0, suggestion: 0, review: 0 },
  );
  const [statusCounts, setStatusCounts] = useState(
    initialData?.statusCounts || {
      all: 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      hidden: 0,
    },
  );
  const [userGroups, setUserGroups] = useState(initialData?.userGroups || []);
  const [pagination, setPagination] = useState(
    initialData?.pagination || {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 10,
    },
  );
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [updatingTargetStatus, setUpdatingTargetStatus] = useState(null);
  const [openPopoverItemId, setOpenPopoverItemId] = useState(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAr = lang === "ar";
  const isInitialState = useRef(true);

  // Debounce search input
  useEffect(() => {
    if (searchQuery === "") {
      setDebouncedSearch("");
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch backend data
  const fetchAnalyticsData = useCallback(
    async (type, status, search, sort, pageNum) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          client: "true",
          type,
          status,
          search,
          sort,
          page: pageNum.toString(),
          limit: "10",
        });

        const res = await fetch(
          `/api/admin/support/analytics?${query.toString()}`,
        );
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();

        setTotalUsers(data.totalUsers || 0);
        setCounts(data.counts || { all: 0, bug: 0, suggestion: 0, review: 0 });
        setStatusCounts(
          data.statusCounts || {
            all: 0,
            pending: 0,
            in_progress: 0,
            resolved: 0,
            hidden: 0,
          },
        );
        setUserGroups(data.userGroups || []);
        setPagination(
          data.pagination || {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            limit: 10,
          },
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Trigger fetch ONLY when filters change away from initial server state
  useEffect(() => {
    if (
      isInitialState.current &&
      activeTab === "all" &&
      activeStatus === "all" &&
      debouncedSearch === "" &&
      sortBy === "frequent" &&
      page === 1
    ) {
      return;
    }

    isInitialState.current = false;
    fetchAnalyticsData(activeTab, activeStatus, debouncedSearch, sortBy, page);
  }, [
    activeTab,
    activeStatus,
    debouncedSearch,
    sortBy,
    page,
    fetchAnalyticsData,
  ]);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === activeStatus) return;
    setActiveStatus(newStatus);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const toggleUserExpand = (userId) => {
    setToggledUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // Admin Actions: Update Item Status or Toggle Hide
  const handleUpdateItem = async (userId, feedbackId, updates) => {
    setUpdatingItemId(feedbackId);
    if (updates.status) setUpdatingTargetStatus(updates.status);
    try {
      const res = await fetch("/api/admin/support/analytics?client=true", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, feedbackId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update item");

      toast.success(
        ToastMessage(
          isAr ? "تم تحديث حالة الملاحظة بنجاح" : "Updated successfully",
        ),
      );
      setOpenPopoverItemId(null);
      await fetchAnalyticsData(
        activeTab,
        activeStatus,
        debouncedSearch,
        sortBy,
        page,
      );
    } catch (err) {
      toast.error(err.message || "Failed to update item");
    } finally {
      setUpdatingItemId(null);
      setUpdatingTargetStatus(null);
    }
  };

  // Admin Actions: Delete Item
  const handleConfirmDelete = async () => {
    if (!deleteTargetItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/support/analytics?client=true&userId=${deleteTargetItem.userId}&feedbackId=${deleteTargetItem.feedbackId}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete item");

      toast.success(
        ToastMessage(isAr ? "تم حذف الملاحظة بنجاح" : "Deleted successfully"),
      );
      setDeleteTargetItem(null);
      await fetchAnalyticsData(
        activeTab,
        activeStatus,
        debouncedSearch,
        sortBy,
        page,
      );
    } catch (err) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-7 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f48a42]/15 to-[#f48a42]/5 text-primary flex items-center justify-center shrink-0 shadow-xs border border-[#f48a42]/10">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-darkNavy">
                {isAr
                  ? "تحليلات وآراء مستخدمي استأجر"
                  : "Estajer User Feedback & Analytics"}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                <span>{isAr ? "تغذية تجميعية" : "Aggregated Insights"}</span>
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 max-w-xl">
              {isAr
                ? "لوحة تحكم تجميعية لمتابعة الأخطاء والاقتراحات مقسّمة ومجمّعة حسب كل مستخدم."
                : "Aggregated dashboard tracking reported feedback grouped cleanly by each user."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/messages/support"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f48a42] to-[#f6a66a] text-white font-semibold text-xs md:text-sm shadow-md shadow-[#f48a42]/20 hover:shadow-lg transition-all"
          >
            <UsersIcon className="w-4 h-4" />
            <span>{isAr ? "محادثات الدعم" : "Support Chats"}</span>
            <ExternalLinkIcon className="w-4 h-4 ms-1" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Users */}
        <div className="relative p-5 rounded-2xl bg-white border border-purple-100/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-700">
              {isAr ? "المشاركون" : "Total Users"}
            </span>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {totalUsers}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {isAr ? "مستخدم" : "users"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            <span>{isAr ? "شاركوا ملاحظاتهم" : "Shared feedback"}</span>
          </div>
        </div>

        {/* Total Bugs */}
        <div className="relative p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <BugIcon className="w-5 h-5" />
            </div>
            <span className="text-xs md:text-sm font-bold text-rose-700">
              {isAr ? "المشاكل والأخطاء" : "Reported Bugs"}
            </span>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-600">
              {counts.bug || 0}
            </span>
            <span className="text-xs font-medium text-rose-400">
              ({isAr ? "بلاغ مشكلة" : "bug reports"})
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{isAr ? "تتطلب متابعة وتحديث" : "Requires attention"}</span>
          </div>
        </div>

        {/* Total Suggestions */}
        <div className="relative p-5 rounded-2xl bg-white border border-blue-100/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <LightbulbIcon className="w-5 h-5" />
            </div>
            <span className="text-xs md:text-sm font-bold text-blue-700">
              {isAr ? "الاقتراحات والتحسينات" : "Suggestions"}
            </span>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-blue-600">
              {counts.suggestion || 0}
            </span>
            <span className="text-xs font-medium text-blue-400">
              ({isAr ? "اقتراح مسجل" : "ideas"})
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{isAr ? "أفكار لتطوير المنصة" : "Growth ideas"}</span>
          </div>
        </div>

        {/* User Reviews */}
        <div className="relative p-5 rounded-2xl bg-white border border-amber-100/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <HeartIcon className="w-5 h-5" />
            </div>
            <span className="text-xs md:text-sm font-bold text-amber-700">
              {isAr ? "الانطباعات العامة" : "General Reviews"}
            </span>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-600">
              {counts.review || 0}
            </span>
            <span className="text-xs font-medium text-amber-500">
              {isAr ? "تقييم ورأي" : "reviews"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <span>⭐ {isAr ? "انطباعات إيجابية" : "Positive feedback"}</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        {/* Row 1: Type Tabs & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => handleTabChange("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {isAr ? "الكل" : "All"} ({counts.all || 0})
            </button>
            <button
              onClick={() => handleTabChange("bug")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "bug"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-rose-600"
              }`}
            >
              <BugIcon className="w-3.5 h-3.5" />
              {isAr ? "الأخطاء" : "Bugs"} ({counts.bug || 0})
            </button>
            <button
              onClick={() => handleTabChange("suggestion")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "suggestion"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              <LightbulbIcon className="w-3.5 h-3.5" />
              {isAr ? "الاقتراحات" : "Suggestions"} ({counts.suggestion || 0})
            </button>
            <button
              onClick={() => handleTabChange("review")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "review"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-amber-600"
              }`}
            >
              <HeartIcon className="w-3.5 h-3.5" />
              {isAr ? "الآراء" : "Reviews"} ({counts.review || 0})
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80 overflow-x-auto">
            <span className="text-[11px] font-bold text-gray-400 px-2 shrink-0">
              {isAr ? "الحالة:" : "Status:"}
            </span>
            <button
              onClick={() => handleStatusChange("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeStatus === "all"
                  ? "bg-gray-800 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {isAr ? "الجميع" : "All Statuses"}
            </button>
            <button
              onClick={() => handleStatusChange("pending")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeStatus === "pending"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{isAr ? "جديد / قيد الانتظار" : "Pending"}</span>
              <span className="opacity-80">({statusCounts.pending || 0})</span>
            </button>
            <button
              onClick={() => handleStatusChange("in_progress")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeStatus === "in_progress"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              <ClockIcon className="w-3.5 h-3.5 animate-spin" />
              <span>{isAr ? "قيد الحل" : "In Progress"}</span>
              <span className="opacity-80">
                ({statusCounts.in_progress || 0})
              </span>
            </button>
            <button
              onClick={() => handleStatusChange("resolved")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeStatus === "resolved"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>{isAr ? "تمت / محلولة" : "Resolved"}</span>
              <span className="opacity-80">({statusCounts.resolved || 0})</span>
            </button>
            <button
              onClick={() => handleStatusChange("hidden")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeStatus === "hidden"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-purple-700 hover:bg-purple-50"
              }`}
            >
              <EyeOffIcon className="w-3.5 h-3.5" />
              <span>{isAr ? "المخفية" : "Hidden"}</span>
              <span className="opacity-80">({statusCounts.hidden || 0})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search & Sort Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-gray-50">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={
                isAr
                  ? "بحث بالاسم، الإيميل أو الملاحظة..."
                  : "Search name, email or topic..."
              }
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 min-w-[160px]">
            <FilterIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <Select
              selectedKeys={[sortBy]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                if (val) {
                  setSortBy(val);
                  setPage(1);
                }
              }}
              size="sm"
              variant="flat"
              aria-label={isAr ? "ترتيب الملاحظات" : "Sort feedback"}
              className="w-36"
            >
              <SelectItem key="frequent" value="frequent">
                {isAr ? "الأكثر ملاحظات" : "Most Feedback"}
              </SelectItem>
              <SelectItem key="newest" value="newest">
                {isAr ? "الأحدث" : "Newest"}
              </SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* User Groups List */}
      <div className="relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-md border">
              <SpinnerIcon className="w-5 h-5 text-primary" />
              <span>
                {isAr ? "جاري تحميل البيانات..." : "Loading feedback..."}
              </span>
            </div>
          </div>
        )}

        {userGroups.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
              <SearchIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {isAr ? "لا يوجد مستخدمون مطابقون" : "No matching users found"}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {isAr
                ? "لم يتم العثور على أية حسابات مطابقة لمعايير البحث الحالية."
                : "Try adjusting your search query or tab filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userGroups.map((group) => {
              const {
                user,
                displayItems,
                bugsCount,
                suggestionsCount,
                reviewsCount,
                displayCount,
              } = group;
              const isDefaultOpen = displayCount <= 3;
              const isOpen = isDefaultOpen
                ? !toggledUserIds.has(user.userId)
                : toggledUserIds.has(user.userId);
              const isCollapsed = !isOpen;

              return (
                <div
                  key={user.userId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* User Card Header Row */}
                  <div
                    onClick={() => toggleUserExpand(user.userId)}
                    className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <Image
                          src={user.avatar || DEFAULT_AVATAR}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                          <span>{user.name}</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {user.email ||
                            user.phone ||
                            (isAr ? "مستخدم استأجر" : "Estajer User")}
                        </p>
                      </div>
                    </div>

                    {/* Summary Badges & Action */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {bugsCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                            <BugIcon className="w-3.5 h-3.5" />
                            <span>{bugsCount}</span>
                          </span>
                        )}
                        {suggestionsCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                            <LightbulbIcon className="w-3.5 h-3.5" />
                            <span>{suggestionsCount}</span>
                          </span>
                        )}
                        {reviewsCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                            <HeartIcon className="w-3.5 h-3.5" />
                            <span>{reviewsCount}</span>
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/admin/messages/support?userId=${user.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-primary hover:text-white text-gray-700 transition-all text-xs font-semibold"
                      >
                        <span>
                          {isAr ? "عرض المحادثة" : "View Conversation"}
                        </span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </Link>

                      <div className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-transform">
                        <ChevronDownIcon
                          className={`w-5 h-5 transition-transform duration-200 ${
                            !isCollapsed ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items List for this User */}
                  {!isCollapsed && (
                    <div className="p-5 pt-0 border-t border-gray-100 bg-gray-50/40 space-y-3">
                      <div className="pt-3 flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span>
                          {isAr
                            ? `ملاحظات المستخدم (${displayCount}):`
                            : `User Feedback Items (${displayCount}):`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayItems.map((item, i) => {
                          const isBug = item.type === "bug";
                          const isSuggestion = item.type === "suggestion";
                          const isReview = item.type === "review";

                          const badgeColor = isBug
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isSuggestion
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200";

                          const accentBar = isBug
                            ? "border-t-2 border-t-rose-500"
                            : isSuggestion
                              ? "border-t-2 border-t-blue-500"
                              : "border-t-2 border-t-amber-400";

                          const titleKey = isBug
                            ? isAr
                              ? "مشكلة / خطأ"
                              : "Bug / Issue"
                            : isSuggestion
                              ? isAr
                                ? "اقترح / تحسين"
                                : "Suggestion"
                              : isAr
                                ? "رأي / انطباع"
                                : "User Review";

                          const currentStatus = item.status || "pending";
                          const isHidden = Boolean(item.isHidden);
                          const isEditingThisStatus =
                            editingStatusItemId === item.id;

                          return (
                            <div
                              key={item.id || i}
                              className={`group relative bg-white p-4 md:p-5 rounded-2xl border ${
                                isHidden
                                  ? "border-purple-200 bg-purple-50/20"
                                  : "border-gray-100"
                              } shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${accentBar}`}
                            >
                              {/* Header: Type Badge & Date */}
                              <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badgeColor}`}
                                >
                                  {isBug && <BugIcon className="w-3.5 h-3.5" />}
                                  {isSuggestion && (
                                    <LightbulbIcon className="w-3.5 h-3.5" />
                                  )}
                                  {isReview && (
                                    <HeartIcon className="w-3.5 h-3.5" />
                                  )}
                                  <span>{titleKey}</span>
                                </span>

                                {item.createdAt && (
                                  <span className="text-[11px] font-medium text-gray-400">
                                    {new Date(
                                      item.createdAt,
                                    ).toLocaleDateString(
                                      isAr ? "ar-EG" : "en-US",
                                      { month: "short", day: "numeric" },
                                    )}
                                  </span>
                                )}
                              </div>

                              {/* Body: Summary Text */}
                              <div className="flex-1 my-1">
                                <p className="text-xs md:text-sm font-medium text-gray-700 leading-relaxed text-start">
                                  {item.summary}
                                </p>
                              </div>

                              {/* Image Screenshot Preview */}
                              {item.imageUrl && (
                                <div className="pt-2">
                                  <div className="relative group/img w-full h-48 md:h-52 rounded-xl overflow-hidden border border-gray-200/80 bg-slate-900/5">
                                    <Image
                                      src={item.imageUrl}
                                      alt="Screenshot"
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                                      unoptimized
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(item.imageUrl);
                                      }}
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]"
                                    >
                                      <MaximizeIcon className="w-4 h-4" />
                                      <span>
                                        {isAr ? "تكبير الصورة" : "Zoom Image"}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Admin Status & Actions Toolbar Footer */}
                              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap relative">
                                {/* Status Badge & Edit Pencil ONLY for Bugs and Suggestions */}
                                {!isReview ? (
                                  <Popover
                                    placement="top"
                                    isOpen={openPopoverItemId === item.id}
                                    onOpenChange={(open) =>
                                      setOpenPopoverItemId(
                                        open ? item.id : null,
                                      )
                                    }
                                  >
                                    <div className="relative flex items-center gap-1">
                                      {/* Display Current Status Badge */}
                                      {currentStatus === "resolved" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                          <CheckCircleIcon className="w-3.5 h-3.5" />
                                          <span>
                                            {isAr ? "تمت / محلولة" : "Resolved"}
                                          </span>
                                        </span>
                                      )}
                                      {currentStatus === "in_progress" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                                          <ClockIcon className="w-3.5 h-3.5 animate-spin" />
                                          <span>
                                            {isAr ? "قيد الحل" : "In Progress"}
                                          </span>
                                        </span>
                                      )}
                                      {currentStatus === "pending" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                                          <ClockIcon className="w-3.5 h-3.5" />
                                          <span>
                                            {isAr
                                              ? "جديد / قيد الانتظار"
                                              : "Pending"}
                                          </span>
                                        </span>
                                      )}
                                      {currentStatus === "dismissed" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                          <CloseIcon className="w-3.5 h-3.5" />
                                          <span>
                                            {isAr ? "ملغي" : "Dismissed"}
                                          </span>
                                        </span>
                                      )}

                                      {/* Pencil Edit Button in PopoverTrigger */}
                                      <PopoverTrigger>
                                        <button
                                          title={
                                            isAr
                                              ? "تعديل الحالة"
                                              : "Edit status"
                                          }
                                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                        >
                                          <EditIcon className="w-3.5 h-3.5" />
                                        </button>
                                      </PopoverTrigger>

                                      <PopoverContent className="w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 space-y-1">
                                        <button
                                          disabled={updatingItemId === item.id}
                                          onClick={() =>
                                            handleUpdateItem(
                                              user.userId,
                                              item.id,
                                              {
                                                status: "pending",
                                              },
                                            )
                                          }
                                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-amber-50 text-amber-700 text-xs font-semibold transition-colors text-start disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {updatingItemId === item.id &&
                                          updatingTargetStatus === "pending" ? (
                                            <SpinnerIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                          ) : (
                                            <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                                          )}
                                          <span>
                                            {isAr
                                              ? "جديد / قيد الانتظار"
                                              : "Pending"}
                                          </span>
                                        </button>
                                        <button
                                          disabled={updatingItemId === item.id}
                                          onClick={() =>
                                            handleUpdateItem(
                                              user.userId,
                                              item.id,
                                              {
                                                status: "in_progress",
                                              },
                                            )
                                          }
                                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-blue-50 text-blue-700 text-xs font-semibold transition-colors text-start disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {updatingItemId === item.id &&
                                          updatingTargetStatus ===
                                            "in_progress" ? (
                                            <SpinnerIcon className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                          ) : (
                                            <ClockIcon className="w-3.5 h-3.5 animate-spin shrink-0" />
                                          )}
                                          <span>
                                            {isAr ? "قيد الحل" : "In Progress"}
                                          </span>
                                        </button>
                                        <button
                                          disabled={updatingItemId === item.id}
                                          onClick={() =>
                                            handleUpdateItem(
                                              user.userId,
                                              item.id,
                                              {
                                                status: "resolved",
                                              },
                                            )
                                          }
                                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition-colors text-start disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {updatingItemId === item.id &&
                                          updatingTargetStatus ===
                                            "resolved" ? (
                                            <SpinnerIcon className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                          ) : (
                                            <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                          )}
                                          <span>
                                            {isAr ? "تمت / محلولة" : "Resolved"}
                                          </span>
                                        </button>
                                        <button
                                          disabled={updatingItemId === item.id}
                                          onClick={() =>
                                            handleUpdateItem(
                                              user.userId,
                                              item.id,
                                              {
                                                status: "dismissed",
                                              },
                                            )
                                          }
                                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 text-xs font-semibold transition-colors text-start disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {updatingItemId === item.id &&
                                          updatingTargetStatus ===
                                            "dismissed" ? (
                                            <SpinnerIcon className="w-3.5 h-3.5 shrink-0 text-gray-600" />
                                          ) : (
                                            <CloseIcon className="w-3.5 h-3.5 shrink-0" />
                                          )}
                                          <span>
                                            {isAr
                                              ? "ملغي / غير متاح"
                                              : "Dismissed"}
                                          </span>
                                        </button>
                                      </PopoverContent>
                                    </div>
                                  </Popover>
                                ) : (
                                  <div /> // Spacer for reviews
                                )}

                                {/* Action Buttons: Hide & Delete */}
                                <div className="flex items-center gap-1 ms-auto">
                                  <button
                                    onClick={() =>
                                      handleUpdateItem(user.userId, item.id, {
                                        isHidden: !isHidden,
                                      })
                                    }
                                    title={
                                      isHidden
                                        ? isAr
                                          ? "إلغاء الإخفاء"
                                          : "Unhide"
                                        : isAr
                                          ? "إخفاء الملاحظة"
                                          : "Hide"
                                    }
                                    className={`p-1.5 rounded-lg border transition-colors ${
                                      isHidden
                                        ? "bg-purple-100 text-purple-700 border-purple-200"
                                        : "bg-gray-50 text-gray-500 hover:text-gray-800 border-gray-200"
                                    }`}
                                  >
                                    {isHidden ? (
                                      <EyeOffIcon className="w-4 h-4" />
                                    ) : (
                                      <EyeIcon className="w-4 h-4" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      setDeleteTargetItem({
                                        userId: user.userId,
                                        feedbackId: item.id,
                                      })
                                    }
                                    title={isAr ? "حذف الملاحظة" : "Delete"}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Backend Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-500">
            {isAr
              ? `عرض الصفحة ${pagination.currentPage} من ${pagination.totalPages} (إجمالي ${pagination.totalItems} مستخدم)`
              : `Showing page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalItems} total users)`}
          </div>

          <Pagination
            total={pagination.totalPages}
            page={pagination.currentPage}
            onChange={(newPage) => setPage(newPage)}
            showControls
            color="primary"
          />
        </div>
      )}

      {/* Lightbox Screenshot Modal using CustomModal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="full"
        backdrop="blur"
        classNames={{
          base: "bg-transparent h-[80vh]",
        }}
        className="!p-0 !m-0 overflow-hidden border-none flex flex-col justify-center items-center"
      >
        <ModalContent className="bg-transparent shadow-none border-none p-0 w-full h-full flex items-center justify-center">
          <ModalBody className="p-4 w-full h-full flex items-center justify-center overflow-hidden">
            {selectedImage && (
              <div className="relative w-full h-[80vh] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Full Screenshot"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Admin Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetItem}
        onClose={() => setDeleteTargetItem(null)}
        onConfirm={handleConfirmDelete}
        title={isAr ? "حذف الملاحظة!" : "Delete Feedback!"}
        message={
          isAr
            ? "هل أنت تأكد من رغبتك في حذف هذه الملاحظة نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this feedback item permanently? This action cannot be undone."
        }
        cancelText={isAr ? "إلغاء" : "Cancel"}
        confirmText={isAr ? "حذف الملاحظة" : "Delete"}
        type="delete"
        loading={isDeleting}
        t={(key) => key}
      />
    </div>
  );
}
