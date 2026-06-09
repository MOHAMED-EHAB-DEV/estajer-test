"use client";
import { Button, Chip } from "@heroui/react";
import { useState, useTransition } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import UpdateReportModal from "./UpdateReportModal";
import ImagePreviewModal from "./ImagePreviewModal";

// Status configuration with colors and icons
const statusConfig = {
  pending: {
    label: "معلق",
    color: "warning",
    bgGradient: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-100",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  reviewed: {
    label: "تمت المراجعة",
    color: "primary",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    textColor: "text-blue-700",
    dotColor: "bg-blue-500",
  },
  resolved: {
    label: "تم الحل",
    color: "success",
    bgGradient: "from-emerald-50 to-green-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-100",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "مرفوض",
    color: "danger",
    bgGradient: "from-red-50 to-rose-50",
    borderColor: "border-red-200",
    iconBg: "bg-red-100",
    textColor: "text-red-700",
    dotColor: "bg-red-500",
  },
};

// Icons
const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DocumentIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ImageIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const EmptyStateIcon = () => (
  <svg
    className="w-24 h-24 text-gray-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// Loading Skeleton Component
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100" />
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
          <div className="h-6 w-48 bg-gray-200 rounded-lg" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2 text-left">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="h-20 bg-gray-100 rounded-xl mb-4" />
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        <div className="h-10 w-32 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
);

// Image Gallery Component
const ImageGallery = ({
  images,
  title,
  icon,
  onImageClick,
  isDocumentation = false,
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-white rounded-lg shadow-sm">{icon}</div>
        <p className="font-semibold text-gray-700 text-sm">{title}</p>
        <span className="text-xs text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">
          {images.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 3).map((img, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-[#f48a42]/30"
            onClick={() => onImageClick(isDocumentation ? img : img.preview)}
          >
            <Image
              src={anyImgUrl({
                src: isDocumentation ? img : img.preview,
                size: 200,
                quality: 60,
              })}
              fill
              alt={`${title} ${index + 1}`}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <svg
                  className="w-4 h-4 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
      {images.length > 3 && (
        <button
          onClick={() =>
            onImageClick(isDocumentation ? images[0] : images[0].preview)
          }
          className="mt-3 text-xs text-[#f48a42] hover:text-[#e6762d] font-medium flex items-center gap-1 transition-colors"
        >
          <span>+{images.length - 3} صور أخرى</span>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default function DamageReportsContainer({
  initialReports,
  initialPagination,
}) {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState(initialReports);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const currentFilter = searchParams.get("status") || "";

  const fetchReports = async (page = 1, status = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(searchParams);
      queryParams.set("page", page);
      queryParams.set("client", "true");
      if (status) {
        queryParams.set("status", status);
      } else {
        queryParams.delete("status");
      }

      const res = await fetch(`/api/damage-reports?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReports(data.data);
        setPagination(data.pagination);
        const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
        window.history.pushState({ path: newUrl }, "", newUrl);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(ToastMessage("حدث خطأ أثناء جلب التقارير"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = () => {
    if (!selectedReport) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/damage-reports/${selectedReport._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus || selectedReport.status,
            adminNotes,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setReports(
            reports.map((report) =>
              report._id === selectedReport._id
                ? { ...report, status: newStatus || report.status, adminNotes }
                : report,
            ),
          );
          toast.success(ToastMessage("تم تحديث التقرير بنجاح"));
          handleModalClose();
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });
  };

  const handleModalOpen = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setNewStatus(report.status);
  };

  const handleModalClose = () => {
    setSelectedReport(null);
    setAdminNotes("");
    setNewStatus("");
  };

  const handlePageChange = (page) => {
    const currentStatus = searchParams.get("status") || "";
    fetchReports(page, currentStatus);
  };

  const getStatusConfig = (status) =>
    statusConfig[status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-6">
      {/* Header Section */}
      <div className="mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#f48a42] to-[#e6762d] rounded-2xl shadow-lg shadow-[#f48a42]/25">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  تقارير الأضرار
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  إدارة ومتابعة تقارير الأضرار المقدمة
                </p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400 text-sm hidden md:inline-flex items-center gap-1">
                <FilterIcon />
                تصفية:
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    !currentFilter
                      ? "bg-gradient-to-r from-[#f48a42] to-[#e6762d] text-white shadow-lg shadow-[#f48a42]/25"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onPress={() => fetchReports(1, "")}
                  isDisabled={isPending || loading}
                  size="sm"
                >
                  الكل
                </Button>
                <Button
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    currentFilter === "pending"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  }`}
                  onPress={() => fetchReports(1, "pending")}
                  isDisabled={isPending || loading}
                  size="sm"
                >
                  <ClockIcon />
                  المعلقة
                </Button>
                <Button
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    currentFilter === "reviewed"
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                  onPress={() => fetchReports(1, "reviewed")}
                  isDisabled={isPending || loading}
                  size="sm"
                >
                  <CheckCircleIcon />
                  تمت المراجعة
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600">
                  الإجمالي:{" "}
                  <strong className="text-gray-900">
                    {pagination.total || 0}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-gray-600">
                  الصفحة:{" "}
                  <strong className="text-gray-900">
                    {pagination.page || 1}
                  </strong>{" "}
                  من <strong>{pagination.pages || 1}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div>
        {loading ? (
          // Loading Skeletons
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gray-50 rounded-full">
                <EmptyStateIcon />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد تقارير أضرار
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              لم يتم العثور على أي تقارير أضرار مطابقة للفلتر المحدد. جرب تغيير
              معايير البحث.
            </p>
          </div>
        ) : (
          // Reports Grid
          <div className="grid gap-6">
            {reports.map((report) => {
              const config = getStatusConfig(report.status);
              return (
                <div
                  key={report._id}
                  className={`bg-white rounded-2xl border ${config.borderColor} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group`}
                >
                  {/* Status Bar */}
                  <div
                    className={`h-1.5 bg-gradient-to-r ${config.bgGradient}`}
                  >
                    <div className={`h-full ${config.dotColor} w-24`} />
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 ${config.iconBg} rounded-xl`}>
                          <DocumentIcon />
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#f48a42] transition-colors">
                            تقرير ضرر - {report.product?.nameAr}
                          </h2>
                          <div className="flex items-center gap-3">
                            <Chip
                              color={config.color}
                              variant="flat"
                              className="font-medium"
                              startContent={
                                <span
                                  className={`w-2 h-2 rounded-full ${config.dotColor}`}
                                />
                              }
                            >
                              {config.label}
                            </Chip>
                            <span className="text-xs text-gray-400">
                              #{report._id?.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <CalendarIcon />
                          <span>
                            {new Date(report.createdAt).toLocaleDateString(
                              "ar",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          طلب #{report.order?._id}
                        </span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <UserIcon />
                          معلومات الأطراف
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              المُبلّغ
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {report.reporter?.fullName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              العميل
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {report.customer?.fullName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              البريد
                            </span>
                            <span className="text-sm text-gray-600 truncate max-w-[180px]">
                              {report.customer?.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <CalendarIcon />
                          فترة التأجير
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              تاريخ البداية
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(
                                report.order?.startDate,
                              ).toLocaleDateString("ar", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              تاريخ النهاية
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(
                                report.order?.endDate,
                              ).toLocaleDateString("ar", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description Sections */}
                    <div className="space-y-4 mb-6">
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                        <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          وصف الضرر
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {report.damageDescription || "لا يوجد وصف"}
                        </p>
                      </div>

                      {report.notes && (
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                            ملاحظات إضافية
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {report.notes}
                          </p>
                        </div>
                      )}

                      {report.adminNotes && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            ملاحظات الإدارة
                          </h4>
                          <p className="text-blue-700 text-sm leading-relaxed">
                            {report.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Images Grid */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <ImageGallery
                        images={report.beforeImages}
                        title="قبل التأجير"
                        icon={<ImageIcon />}
                        onImageClick={setPreviewImage}
                      />
                      <ImageGallery
                        images={report.afterImages}
                        title="بعد التأجير"
                        icon={<ImageIcon />}
                        onImageClick={setPreviewImage}
                      />
                      <ImageGallery
                        images={report.order?.documentationImages}
                        title="توثيق العميل"
                        icon={<ImageIcon />}
                        onImageClick={setPreviewImage}
                        isDocumentation={true}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      <Button
                        className="bg-gradient-to-r from-[#f48a42] to-[#e6762d] text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-[#f48a42]/25 hover:shadow-xl hover:shadow-[#f48a42]/30 transition-all duration-300"
                        onPress={() => handleModalOpen(report)}
                        isDisabled={isPending}
                      >
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        تحديث التقرير
                      </Button>
                      <Button
                        as={Link}
                        href={`/admin/damage-reports/${report._id}`}
                        className="bg-white border-2 border-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                      >
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-1">
              <Button
                size="sm"
                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                onPress={() =>
                  handlePageChange(Math.max(1, pagination.page - 1))
                }
                isDisabled={pagination.page === 1 || isPending || loading}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    size="sm"
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${
                      pagination.page === page
                        ? "bg-gradient-to-r from-[#f48a42] to-[#e6762d] text-white shadow-lg shadow-[#f48a42]/25"
                        : "bg-transparent text-gray-600 hover:bg-gray-100"
                    }`}
                    onPress={() => handlePageChange(page)}
                    isDisabled={isPending || loading}
                  >
                    {page}
                  </Button>
                ),
              )}

              <Button
                size="sm"
                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                onPress={() =>
                  handlePageChange(
                    Math.min(pagination.pages, pagination.page + 1),
                  )
                }
                isDisabled={
                  pagination.page === pagination.pages || isPending || loading
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* Update Report Modal */}
      <UpdateReportModal
        isOpen={!!selectedReport}
        onClose={handleModalClose}
        selectedReport={selectedReport}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        onUpdate={handleUpdateReport}
        isPending={isPending}
      />
    </div>
  );
}
