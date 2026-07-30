import React, { useState } from "react";
import CustomModal from "@/components/ui/CustomModal";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { FaUpload } from "../ui/svgs/AdminIcons";

function CopyButton({ textToCopy, isAr }) {
  const [copied, setCopied] = useState(false);

  if (
    !textToCopy ||
    textToCopy === "غير محدد" ||
    textToCopy === "Not specified" ||
    textToCopy === "—"
  ) {
    return null;
  }

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={isAr ? "نسخ" : "Copy"}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md text-gray-500 hover:text-primary bg-gray-100 hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 dark:text-gray-400 dark:hover:text-primary transition-all shrink-0 ms-auto"
    >
      {copied ? (
        <>
          <svg
            className="w-3.5 h-3.5 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {isAr ? "تم النسخ" : "Copied"}
          </span>
        </>
      ) : (
        <>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{isAr ? "نسخ" : "Copy"}</span>
        </>
      )}
    </button>
  );
}

export default function OwnerTaxInvoiceDetailsModal({
  isOpen,
  onClose,
  user,
  lang,
  t,
  onUploadClick,
  onDropFile,
  isUploading,
}) {
  const isAr = lang === "ar";
  const langPrefix = isAr ? "" : "en/";
  const [isDragging, setIsDragging] = useState(false);

  // Extract customer's details and companyDetails
  const companyDetails = user?.id?.companyDetails || user?.companyDetails || {};
  const companyName =
    companyDetails.companyName || (isAr ? "غير محدد" : "Not specified");
  const registerNumber =
    companyDetails.registerNumber || (isAr ? "غير محدد" : "Not specified");
  const taxCode =
    companyDetails.taxCode || (isAr ? "غير محدد" : "Not specified");

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFile?.(e.dataTransfer.files[0]);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="2xl">
      <div
        className="relative flex flex-col w-full text-start"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="flex items-center gap-3.5 p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm ring-1 ring-primary/20 shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="pe-8">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-darkNavy dark:text-white">
                {isAr
                  ? "تفاصيل الفاتورة الضريبية للمستأجر"
                  : "Renter Tax Invoice Details"}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isAr
                ? "بيانات المستأجر والشركة لإصدار الفاتورة الضريبية الرسمية ورفعها"
                : "Renter and company info to issue and upload the official tax invoice"}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Quick Notice Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-200 text-xs md:text-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="leading-relaxed">
              {isAr
                ? "انسخ البيانات التالية واستخدمها لإصدار الفاتورة الضريبية من نظامك المحاسبي (مثل قيود/دفترة/غيرها)، ثم ارفع الفاتورة أدناه."
                : "Copy the details below to issue the tax invoice from your accounting system, then upload the generated PDF or image."}
            </p>
          </div>

          {/* Tax Highlight Box (Hero Cards for VAT & CR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* VAT Code Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 flex flex-col justify-between gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {isAr ? "الرقم الضريبي (VAT)" : "Tax Number (VAT)"}
                </span>
                <CopyButton textToCopy={taxCode} isAr={isAr} />
              </div>
              <div className="font-bold text-lg md:text-xl text-darkNavy dark:text-amber-100">
                {taxCode}
              </div>
            </div>

            {/* CR Number Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 flex flex-col justify-between gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  {isAr ? "رقم السجل التجاري (CR)" : "Commercial Reg. (CR)"}
                </span>
                <CopyButton textToCopy={registerNumber} isAr={isAr} />
              </div>
              <div className="font-bold text-lg md:text-xl text-darkNavy dark:text-blue-100">
                {registerNumber}
              </div>
            </div>
          </div>

          {/* User & Contact Overview Card */}
          <div className="border border-gray-200/80 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            {/* Header sub-bar */}
            <div className="bg-gray-50/80 dark:bg-gray-800/60 px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>
                  {isAr ? "بيانات المستأجر والاتصال" : "Renter Contact Details"}
                </span>
              </div>
            </div>

            {/* Grid rows */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-gray-100 dark:divide-gray-800">
                {/* Full Name */}
                <div className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      {isAr ? "الاسم الكامل" : "Full Name"}
                    </span>
                    <CopyButton textToCopy={user?.fullName} isAr={isAr} />
                  </div>
                  <span className="font-bold text-darkNavy dark:text-gray-100 text-base">
                    {user?.fullName || "—"}
                  </span>
                </div>

                {/* Phone */}
                <div className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      {isAr ? "رقم الهاتف" : "Phone"}
                    </span>
                    <CopyButton textToCopy={user?.phone} isAr={isAr} />
                  </div>
                  <span className="font-semibold text-darkNavy dark:text-gray-100 text-base dir-ltr text-start">
                    {user?.phone || "—"}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 flex flex-col gap-1.5 bg-gray-50/30 dark:bg-gray-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </span>
                  <CopyButton textToCopy={user?.email} isAr={isAr} />
                </div>
                <span className="font-semibold text-darkNavy dark:text-gray-100 text-base break-all">
                  {user?.email || "—"}
                </span>
              </div>

              {/* Address */}
              <div className="p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    {isAr ? "العنوان المسجل" : "Registered Address"}
                  </span>
                  <CopyButton textToCopy={user?.address} isAr={isAr} />
                </div>
                <span className="font-medium text-darkNavy dark:text-gray-200 text-sm leading-relaxed">
                  {user?.address || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div className="border border-gray-200/80 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            {/* Header sub-bar */}
            <div className="bg-gray-50/80 dark:bg-gray-800/60 px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>{isAr ? "بيانات الشركة" : "Company Information"}</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  {isAr ? "اسم الشركة" : "Company Name"}
                </span>
                <CopyButton textToCopy={companyName} isAr={isAr} />
              </div>
              <span className="font-bold text-darkNavy dark:text-gray-100 text-base">
                {companyName}
              </span>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {isAr ? "رفع الفاتورة الضريبية" : "Upload Tax Invoice"}
            </label>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                  : "border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-primary/5 hover:border-primary dark:hover:border-primary"
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onUploadClick}
            >
              <div className="flex flex-col items-center justify-center gap-3 pointer-events-none min-h-[7rem]">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-0.5">
                    <FaUpload size={22} />
                  </div>
                )}
                <p className="text-darkNavy dark:text-gray-200 text-sm md:text-base font-bold">
                  {isUploading
                    ? isAr
                      ? "جاري الرفع..."
                      : "Uploading..."
                    : isDragging
                      ? isAr
                        ? "أفلت الملف هنا"
                        : "Drop the file here"
                      : isAr
                        ? "اسحب وأفلت الفاتورة الضريبية هنا أو اضغط للاختيار"
                        : "Drag and drop the tax invoice here or click to choose"}
                </p>
                {!isUploading && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {isAr
                      ? "صيغة الملف المقبولة: PDF أو صور (PNG, JPG)"
                      : "Accepted formats: PDF or Images (PNG, JPG)"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Guide Link Card */}
          <Link
            href={`/${langPrefix}tax-invoice-guide`}
            target="_blank"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-blue-50/70 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/20 hover:from-blue-100/80 hover:to-indigo-100/60 dark:hover:from-blue-950/40 border border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all rounded-2xl group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0 ring-1 ring-blue-500/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 21h6v-2H9v2zm3-19C7.58 2 4 5.58 4 10c0 2.76 1.4 5.2 3.54 6.64L8 18h8l.46-1.36C18.6 15.2 20 12.76 20 10c0-4.42-3.58-8-8-8zm2.62 12.63l-.26.77H9.64l-.26-.77C7.8 13.43 7 11.8 7 10c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.8-.8 3.43-2.38 4.63z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-bold text-darkNavy dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {isAr
                    ? "دليل إرشادي: كيف تصدر فاتورتك الضريبية للمستأجر؟"
                    : "Guideline: How to issue your tax invoice to the renter?"}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {isAr
                    ? "اضغط هنا لقراءة الدليل المالي والخطوات التفصيلية"
                    : "Click here to read the financial guide and detailed steps"}
                </span>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all me-1 shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rtl:rotate-180"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-4 px-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <Button
            variant="border"
            className="border-gray-300 dark:border-gray-700"
            onPress={onClose}
          >
            {t("dashboard.requests.confirmModal.cancel")}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}
