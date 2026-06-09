"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import DocumentationImages from "./DocumentationImages";
import { Checkbox } from "@heroui/react";
import Button from "../ui/Button";
import Link from "next/link";
import ToastMessage from "@/components/ui/ToastMessage";

export default function DocumentationForm({
  translate,
  lang,
  langPrefix,
  id,
  order,
  userRole = "renter",
}) {
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`productDocumentation.${key}`);

  const [images, setImages] = useState([]);
  const [isReceived, setIsReceived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);

  const isOwner = userRole === "owner";
  const isRenter = userRole === "renter";

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace - move to previous input
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pastedData)) {
      setOtpCode(pastedData.split(""));
      const lastInput = document.getElementById("otp-3");
      if (lastInput) lastInput.focus();
    }
  };

  const handleSubmit = async () => {
    try {
      setError("");

      if (isRenter) {
        if (!isReceived) return setError(t("error.mustAgreeToReceipt"));
      }

      if (isOwner) {
        const code = otpCode.join("");
        if (code.length !== 4) {
          return setError(t("error.mustEnterCode"));
        }
      }

      setIsLoading(true);

      const body = isOwner
        ? {
            ownerDocumentationImages: images,
            deliveryCode: otpCode.join(""),
          }
        : {
            documentationImages: images,
          };

      const response = await fetch(`/api/order-received/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error === "INVALID_CODE") {
          throw new Error(t("error.invalidCode"));
        }
        throw new Error(
          data.error || trans("addProductPage.common.errorSomethingWentWrong"),
        );
      }

      if (isOwner) {
        toast.success(ToastMessage(t("toast.ownerVerifiedSuccess")));
      } else {
        toast.success(ToastMessage(t("toast.productReceivedSuccess")));
      }

      router.replace(
        `/${langPrefix}dashboard/${isOwner ? "requests" : "my-orders"}`,
      );
    } catch (error) {
      console.error(error);
      setError(
        error.message || trans("addProductPage.common.errorSomethingWentWrong"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startDate = order?.startDate ? new Date(order.startDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Set both dates to midnight to compare only the date part, not the time
  if (startDate) startDate.setHours(0, 0, 0, 0);
  const showSupport = startDate && today > startDate;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    toast.success(ToastMessage(t("copiedToClipboard")));
  };

  const copyDeliveryCode = () => {
    if (order.deliveryCode) {
      navigator.clipboard.writeText(order.deliveryCode);
      toast.success(ToastMessage(t("copiedToClipboard")));
    }
  };

  return (
    <div>
      {/* RENTER: Show delivery code */}
      {isRenter && order.deliveryCode && (
        <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-full">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-emerald-600"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-emerald-800">
              {t("deliveryCodeTitle")}
            </h3>
          </div>
          <p className="text-sm text-emerald-700 mb-3">
            {t("deliveryCodeDescription")}
          </p>
          <div
            onClick={copyDeliveryCode}
            className="cursor-pointer inline-flex items-center gap-3 bg-white px-6 py-3 rounded-xl border-2 border-emerald-300 shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-3xl font-mono font-bold text-emerald-700 tracking-[0.5em] select-all">
              {order.deliveryCode}
            </span>
            <button
              className="text-emerald-400 hover:text-emerald-600 transition-all p-1 rounded-lg hover:bg-emerald-50 active:scale-95"
              title={t("copyOrderId")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* OWNER: Show OTP input */}
      {isOwner && (
        <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-amber-600"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-800">
              {t("ownerVerificationTitle")}
            </h3>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            {t("ownerVerificationDescription")}
          </p>
          <div className="flex items-center justify-center gap-3" dir="ltr">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                className="w-14 h-16 text-center text-2xl font-mono font-bold border-2 border-amber-300 rounded-xl bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all shadow-sm"
                autoComplete="off"
              />
            ))}
          </div>
        </div>
      )}

      <DocumentationImages
        review={true}
        lang={lang}
        files={images}
        setFiles={setImages}
        translate={translate}
      />
      <div className="mt-6 space-y-6">
        {/* Only show the rental agreement checkbox for renters */}
        {isRenter && (
          <div className="flex flex-wrap gap-1 items-center">
            <Checkbox
              classNames={{
                wrapper: "bg-[#d9d9d9] pointer-events-auto",
                base: "pointer-events-none",
                label: "pointer-events-auto",
              }}
              size="lg"
              isRequired
              isSelected={isReceived}
              onChange={(e) => {
                setIsReceived(e.target.checked);
              }}
            >
              <span className="md:text-lg ps-2">
                {t("checkboxLabelPart1")}{" "}
              </span>
              <Link
                target="_blank"
                href={`/${langPrefix}contract/${id}`}
                className="text-primary md:text-lg font-semibold border-primary border-b-2"
              >
                {t("rentalContractLink")}
              </Link>
            </Checkbox>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-2 p-3 bg-red-100 border border-red-300 rounded-md text-center">
            {error}
          </p>
        )}

        {images.length === 0 && (
          <p className="text-orange-600 text-sm mt-2 p-3 bg-orange-100 border border-orange-300 rounded-md text-center">
            {t("imageDocumentationNote")}{" "}
          </p>
        )}
        <Button
          isLoading={isLoading}
          onClick={handleSubmit}
          className="py-7 md:min-w-60 w-full md:w-auto md:text-xl text-lg font-IBMPlex md:px-12 px-4"
          startContent={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 24C13.5759 24 15.1363 23.6896 16.5922 23.0866C18.0481 22.4835 19.371 21.5996 20.4853 20.4853C21.5996 19.371 22.4835 18.0481 23.0866 16.5922C23.6896 15.1363 24 13.5759 24 12C24 10.4241 23.6896 8.86371 23.0866 7.4078C22.4835 5.95189 21.5996 4.62902 20.4853 3.51472C19.371 2.40042 18.0481 1.5165 16.5922 0.913445C15.1363 0.310389 13.5759 -2.34822e-08 12 0C8.8174 4.74244e-08 5.76516 1.26428 3.51472 3.51472C1.26428 5.76515 0 8.8174 0 12C0 15.1826 1.26428 18.2348 3.51472 20.4853C5.76516 22.7357 8.8174 24 12 24ZM11.6907 16.8533L18.3573 8.85333L16.3093 7.14667L10.576 14.0253L7.60933 11.0573L5.724 12.9427L9.724 16.9427L10.756 17.9747L11.6907 16.8533Z"
              />
            </svg>
          }
        >
          {isOwner ? t("ownerSubmitButtonText") : t("submitButtonText")}
        </Button>

        {showSupport && isRenter && (
          <div className="mt-16 p-8 rounded-2xl border-2 border-red-100 shadow-lg">
            {/* Header with Icon */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#F48A42]"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {lang === "ar" ? "هل تحتاج مساعدة؟" : "Need Help?"}
              </h3>
            </div>

            {/* Support Text */}
            <p className="text-gray-700 text-base text-center mb-6 leading-relaxed max-w-2xl mx-auto">
              {t("supportText")}
              <Link
                href={`/${langPrefix}contact`}
                className="ps-2 text-[#F48A42] hover:text-[#d67535] font-semibold underline underline-offset-4 transition-colors"
              >
                <span>{lang === "ar" ? "تواصل معنا" : "Contact Us"}</span>
              </Link>
            </p>

            {/* Order ID Section */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                {t("supportOrderId")}
              </span>
              <div
                onClick={copyOrderId}
                className="cursor-pointer flex items-center gap-2 bg-white px-5 py-3 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <button
                  className="text-gray-400 hover:text-[#F48A42] transition-all p-2 rounded-lg hover:bg-orange-50 active:scale-95"
                  title={t("copyOrderId")}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                <span className="text-gray-900 font-bold md:text-lg text-sm select-all">
                  {order.orderId}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
