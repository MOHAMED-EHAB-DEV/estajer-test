"use client";
import { useState, useTransition } from "react";
import { toast } from "@/utils/toast";
import { Button, Chip, Textarea, Select, SelectItem } from "@heroui/react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import ToastMessage from "@/components/ui/ToastMessage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUrlName } from "@/lib/sitemap";
import ImagePreviewModal from "./ImagePreviewModal";

// Status configuration
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
const DocumentIcon = () => (
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

const EditIcon = () => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const SaveIcon = () => (
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
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);

const BackIcon = () => (
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
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

// Image Gallery Component (Reused and adapted)
const DetailImageGallery = ({ images, title, icon, onImageClick }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#f48a42]/10 rounded-lg text-[#f48a42]">
          {icon}
        </div>
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {images.length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[#f48a42]/30 cursor-pointer shadow-sm transition-all duration-300 hover:shadow-lg"
            onClick={() => onImageClick(img.preview || img)}
          >
            <Image
              src={anyImgUrl({
                src: img.preview || img,
                size: 300,
                quality: 75,
              })}
              fill
              alt={`${title} ${index + 1}`}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                <svg
                  className="w-5 h-5 text-gray-800"
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
    </div>
  );
};

export default function DamageReportDetails({
  report,
  translate,
  lang,
  langPrefix,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || "");
  const [status, setStatus] = useState(report.status);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/damage-reports/${report._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            adminNotes,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(ToastMessage("تم تحديث التقرير بنجاح"));
          setIsEditing(false);
          router.refresh();
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ أثناء تحديث التقرير"));
      }
    });
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="">
      {/* Top Navigation & Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#f48a42] to-[#e6762d] rounded-2xl shadow-lg shadow-[#f48a42]/25">
              <DocumentIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                تقرير ضرر - {report.product?.nameAr}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
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
                <span className="text-gray-400 text-sm">#{report._id}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button
              as={Link}
              href={`/${langPrefix}admin/damage-reports`}
              variant="light"
              className="font-medium text-gray-600 hover:text-gray-800"
              startContent={<BackIcon />}
            >
              العودة
            </Button>
            <Button
              className={`font-medium px-6 ${
                isEditing
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                  : "bg-gradient-to-r from-[#f48a42] to-[#e6762d] text-white shadow-lg shadow-[#f48a42]/25"
              }`}
              onPress={() => {
                if (isEditing) handleUpdate();
                else setIsEditing(true);
              }}
              isLoading={isPending}
              startContent={!isEditing && <EditIcon />}
            >
              {isEditing ? "حفظ التغييرات" : "تعديل التقرير"}
            </Button>
            {isEditing && (
              <Button
                color="danger"
                variant="flat"
                onPress={() => {
                  setIsEditing(false);
                  setAdminNotes(report.adminNotes || "");
                  setStatus(report.status);
                }}
              >
                إلغاء
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Info Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
              {/* Decorative background element */}
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 transition-transform group-hover:scale-110" />

              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                  <UserIcon />
                </span>
                معلومات المزود (المبلغ)
              </h3>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={anyImgUrl({ src: report.reporter?.avatar, size: 100 })}
                    fill
                    alt={report.reporter?.fullName}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {report.reporter?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {report.reporter?.email}
                  </p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    صاحب المتجر
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-green-50 rounded-full opacity-50 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                <span className="p-1.5 bg-green-100 rounded-lg text-green-600">
                  <UserIcon />
                </span>
                معلومات العميل
              </h3>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={anyImgUrl({ src: report.customer?.avatar, size: 100 })}
                    fill
                    alt={report.customer?.fullName}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {report.customer?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {report.customer?.email}
                  </p>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    المستأجر
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 shadow-sm">
              <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                وصف الضرر
              </h3>
              <p className="text-gray-800 leading-relaxed bg-white/50 p-4 rounded-xl">
                {report.damageDescription || "لا يوجد وصف"}
              </p>
            </div>

            {report.notes && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-700 mb-3">
                  ملاحظات إضافية
                </h3>
                <p className="text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
                  {report.notes}
                </p>
              </div>
            )}
          </div>

          {/* Image Galleries */}
          <div className="space-y-6">
            <DetailImageGallery
              images={report.beforeImages}
              title="صور قبل التأجير"
              icon={<ImageIcon />}
              onImageClick={setPreviewImage}
            />
            <DetailImageGallery
              images={report.afterImages}
              title="صور بعد التأجير"
              icon={<ImageIcon />}
              onImageClick={setPreviewImage}
            />
            {report.order?.documentationImages && (
              <DetailImageGallery
                images={report.order.documentationImages}
                title="صور توثيق العميل"
                icon={<ImageIcon />}
                onImageClick={setPreviewImage}
              />
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Admin Controls Panel */}
          <div
            className={`bg-white rounded-2xl border ${isEditing ? "border-[#f48a42]" : "border-gray-100"} shadow-sm p-6 transition-colors duration-300`}
          >
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-gray-100 rounded-lg">
                <EditIcon />
              </span>
              إدارة التقرير
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  حالة التقرير
                </label>
                <Select
                  selectedKeys={[status]}
                  onChange={(e) => setStatus(e.target.value)}
                  isDisabled={!isEditing}
                  placeholder="اختر الحالة"
                  variant="bordered"
                  classNames={{
                    trigger:
                      "h-12 border-gray-200 data-[hover=true]:border-[#f48a42] data-[focus=true]:border-[#f48a42]",
                  }}
                >
                  <SelectItem
                    key="pending"
                    value="pending"
                    startContent={
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    }
                  >
                    معلق
                  </SelectItem>
                  <SelectItem
                    key="reviewed"
                    value="reviewed"
                    startContent={
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    }
                  >
                    تمت المراجعة
                  </SelectItem>
                  <SelectItem
                    key="resolved"
                    value="resolved"
                    startContent={
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    }
                  >
                    تم الحل
                  </SelectItem>
                  <SelectItem
                    key="rejected"
                    value="rejected"
                    startContent={
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    }
                  >
                    مرفوض
                  </SelectItem>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ملاحظات الإدارة
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أضف ملاحظات للمراجعة الداخلية..."
                  minRows={4}
                  isDisabled={!isEditing}
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "border-gray-200 data-[hover=true]:border-[#f48a42] data-[focus=true]:border-[#f48a42] bg-gray-50",
                  }}
                />
              </div>

              {report.reviewedBy && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">
                    آخر مراجعة بواسطة
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 relative overflow-hidden">
                      {report.reviewedBy.avatar && (
                        <Image
                          src={anyImgUrl({
                            src: report.reviewedBy.avatar,
                            size: 100,
                          })}
                          fill
                          alt={report.reviewedBy.fullName}
                          unoptimized
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {report.reviewedBy.fullName}
                    </span>
                  </div>
                  {report.reviewedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(report.reviewedAt).toLocaleDateString("ar")} -{" "}
                      {new Date(report.reviewedAt).toLocaleTimeString("ar")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Info Widget */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-gray-100 rounded-lg">
                <CalendarIcon />
              </span>
              تفاصيل الحجز
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">رقم الطلب</span>
                <span className="font-mono font-medium text-gray-900">
                  #{report.order?._id}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">بداية الحجز</span>
                <span className="text-sm font-medium">
                  {new Date(report.order?.startDate).toLocaleDateString("ar")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">نهاية الحجز</span>
                <span className="text-sm font-medium">
                  {new Date(report.order?.endDate).toLocaleDateString("ar")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">قيمة الحجز</span>
                <span className="text-sm font-bold text-[#f48a42]">
                  {report.order?.totalAmount} ريال
                </span>
              </div>
            </div>
          </div>

          {/* Product Mini Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="aspect-video relative rounded-xl overflow-hidden mb-4 bg-gray-100">
              <Image
                src={anyImgUrl({
                  src: report.product?.images[0]?.preview,
                  size: 300,
                })}
                fill
                alt={report.product?.nameAr}
                className="object-contain"
                unoptimized
              />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">
              {report.product?.nameAr}
            </h4>
            <p className="text-sm text-gray-500 mb-3">
              {report.product?.nameEn}
            </p>
            <Button
              as={Link}
              href={`/products/${getUrlName(report.product?.nameAr)}_ref_${report.product?._id}`}
              className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100"
              size="sm"
            >
              صفحة المنتج
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
