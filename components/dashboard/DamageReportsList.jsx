"use client";
import { useState } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import { Order } from "@/components/ui/svgs/OrdersSvg";
import { Chip, Button } from "@heroui/react";
import ImagePreviewModal from "../admin/ImagePreviewModal";

// Icons
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

const AlertIcon = () => (
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
);

const statusConfig = {
  pending: {
    color: "warning",
    dotColor: "bg-amber-500",
    accent: "bg-amber-500",
  },
  reviewed: {
    color: "primary",
    dotColor: "bg-blue-500",
    accent: "bg-blue-600",
  },
  resolved: {
    color: "success",
    dotColor: "bg-emerald-500",
    accent: "bg-emerald-600",
  },
  rejected: {
    color: "danger",
    dotColor: "bg-red-500",
    accent: "bg-red-600",
  },
};
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

export default function DamageReportsList({
  reports,
  lang,
  translate,
  langPrefix,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.damageReports.${text}`);
  const [previewImage, setPreviewImage] = useState(null);

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gray-50 rounded-full">
            <EmptyStateIcon />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t("noReports")}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {t("noReportsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {reports.map((report) => {
        const config = statusConfig[report.status] || statusConfig.pending;

        return (
          <div
            key={report._id}
            className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#f48a42]/5 transition-all duration-300"
          >
            <div className={`h-1 w-full ${config.accent}`} />

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {t("reportId")}:
                      <span className="text-sm font-mono font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                        #{report._id}
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon />
                      <span>
                        {new Date(report.createdAt).toLocaleDateString(lang, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Chip
                  color={config.color}
                  variant="flat"
                  className="font-bold px-4"
                  startContent={
                    <span
                      className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}
                    />
                  }
                >
                  {t(`status.${report.status}`)}
                </Chip>
              </div>

              {/* Main Info Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Product & Order Info */}
                <div className="space-y-6">
                  {report.product && (
                    <div className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                      <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
                        <div
                          className="absolute inset-0 opacity-95"
                          style={{
                            background:
                              report.product.images?.[0]?.gradientStyle ||
                              "linear-gradient(135deg, #fff, #fff)",
                          }}
                        />
                        <Image
                          src={anyImgUrl({
                            src: report.product.images?.[0]?.preview,
                            size: 100,
                          })}
                          fill
                          alt={
                            report.product[`name${lang === "ar" ? "Ar" : "En"}`]
                          }
                          className="object-contain relative z-10 p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 leading-tight mb-1 truncate">
                          {report.product[`name${lang === "ar" ? "Ar" : "En"}`]}
                        </p>
                        <Button
                          as={Link}
                          href={`/${langPrefix}dashboard/report/${report.order?._id || report.order}`}
                          variant="light"
                          size="sm"
                          className="font-bold text-[#f48a42] p-0 h-auto min-w-0 bg-transparent hover:underline"
                        >
                          {t("viewOrderDetails")}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-5 rounded-2xl border border-amber-100/50">
                    <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <AlertIcon />
                      {t("damageDescription")}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {report.damageDescription}
                    </p>
                  </div>

                  {report.notes && (
                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50">
                      <h3 className="text-sm font-bold text-gray-600 mb-2">
                        {t("notes")}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {report.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Photo Previews */}
                <div className="grid grid-cols-2 gap-4">
                  {/* After Images */}
                  {report.afterImages && report.afterImages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon />
                        {t("afterImages")}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {report.afterImages.map((image, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group/img cursor-zoom-in"
                            onClick={() =>
                              setPreviewImage(
                                anyImgUrl({ src: image.preview, size: 1200 }),
                              )
                            }
                          >
                            <Image
                              src={anyImgUrl({ src: image.preview, size: 300 })}
                              fill
                              alt="Damage detail"
                              className="object-cover transition-transform group-hover/img:scale-110"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Before Images */}
                  {report.beforeImages && report.beforeImages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon />
                        {t("beforeImages")}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {report.beforeImages.map((image, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group/img cursor-zoom-in"
                            onClick={() =>
                              setPreviewImage(
                                anyImgUrl({ src: image.preview, size: 1200 }),
                              )
                            }
                          >
                            <Image
                              src={anyImgUrl({ src: image.preview, size: 300 })}
                              fill
                              alt="Before detail"
                              className="object-cover transition-transform group-hover/img:scale-110"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Image Preview Modal */}
      <ImagePreviewModal
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
