"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import DocumentationImages from "./DocumentationImages";
import { Checkbox } from "@/components/ui/Checkbox";
import Button from "../ui/Button";
import Link from "next/link";
import ToastMessage from "@/components/ui/ToastMessage";
import CustomModal from "../ui/CustomModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceived, setIsReceived] = useState(false);
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);

  const isOwner = userRole === "owner";
  const isRenter = userRole === "renter";

  const lessorInfo = {
    name: order?.ownerData?.fullName,
    id: order?.ownerData?.nationalId,
    phone: order?.ownerData?.phone,
    email: order?.ownerData?.email,
    address: order?.ownerData?.address,
    unifiedNumber: order?.ownerData?.unifiedNumber,
    taxCode: order?.ownerData?.companyDetails?.taxCode,
  };

  const lesseeInfo = {
    name: order?.userData?.fullName,
    id: order?.userData?.nationalId,
    phone: order?.userData?.phone,
    email: order?.userData?.email,
    address: order?.userData?.address,
    unifiedNumber: order?.userData?.unifiedNumber,
    taxCode: order?.userData?.companyDetails?.taxCode,
  };

  const nafathData = order?.userData?.nafathData || null;

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
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
        if (!isReceived)
          return setError(
            t("error.mustAgreeToReceipt") ||
              (lang === "ar"
                ? "يجب تأكيد قراءة العقد"
                : "You must confirm reading the contract"),
          );
        if (!signature.trim())
          return setError(
            lang === "ar"
              ? "يرجى إدخال توقيعك الإلكتروني"
              : "Please enter your electronic signature",
          );
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
            ownerElectronicSignature: signature,
          }
        : {
            documentationImages: images,
            userElectronicSignature: signature,
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
    <div className="flex flex-col gap-6">
      {/* RENTER: Show delivery code */}
      {isRenter && order?.deliveryCode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-emerald-900 text-lg">
              {t("deliveryCodeTitle") ||
                (lang === "ar" ? "رمز التسليم" : "Delivery Code")}
            </h3>
            <p className="text-emerald-700 text-sm mt-1">
              {t("deliveryCodeDescription") ||
                (lang === "ar"
                  ? "قدم هذا الرمز للمالك لتأكيد الاستلام"
                  : "Provide this code to the owner to confirm receipt")}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 border border-emerald-100 rounded-lg shadow-sm">
            <span className="text-2xl font-mono font-bold tracking-widest text-emerald-600">
              {order.deliveryCode}
            </span>
            <button
              onClick={copyDeliveryCode}
              className="text-emerald-400 hover:text-emerald-600 transition-all p-1.5 rounded-md hover:bg-emerald-50 active:scale-95"
              title={t("copyOrderId")}
            >
              <svg
                width="20"
                height="20"
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <h3 className="font-bold text-amber-900 text-lg mb-2">
            {t("ownerVerificationTitle")}
          </h3>
          <p className="text-amber-700 text-sm mb-4">
            {t("ownerVerificationDescription")}
          </p>
          <div className="flex justify-center gap-3" dir="ltr">
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

      {/* Documentation Images Upload */}
      {images.length === 0 && (
        <p className="text-orange-600 text-sm mt-2 p-3 bg-orange-100 border border-orange-300 rounded-md text-center">
          {t("imageDocumentationNote")}{" "}
        </p>
      )}

      <div className="mt-2">
        <DocumentationImages
          review="true"
          lang={lang}
          translate={translate}
          files={images}
          setFiles={setImages}
        />
      </div>

      {/* RENTER: Contract  Section */}
      <div className="flex flex-col gap-6 mt-4">
        {isRenter && (
          <>
            {/* 1. Contract Snippet & Full Contract Link */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <h3 className="font-bold text-gray-800">
                    {t("contractSnippetTitle")}
                  </h3>
                </div>
                <Link
                  href={`/${langPrefix}contract/${order?.contractId || order?._id}`}
                  onClick={(e) => {
                    if (images.length > 0) {
                      e.preventDefault();
                      setIsModalOpen(true);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  {t("viewFullContract")}
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </Link>
              </div>

              {/* Scrollable Arabic Contract Box */}
              <div
                dir="rtl"
                className="p-6 bg-white max-h-80 overflow-y-auto text-sm text-gray-800 border-b border-gray-100"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">عقد تأجير</h1>
                  <p className="text-center text-gray-600">
                    بحمد الله وتوفيقه، تم إبرام هذا العقد بتاريخ{" "}
                    {order?.startDate
                      ? new Date(order.startDate).toLocaleDateString("ar")
                      : ""}{" "}
                    في مدينة الرياض من بين كلاً:
                  </p>
                </div>

                <div className="mb-6">
                  <p className="mb-2 leading-10">
                    <span className="font-bold underline">أولاً</span>:{" "}
                    <span className="font-semibold">{lessorInfo.name}</span> ،
                    {lessorInfo.taxCode ? (
                      <>
                        {" "}
                        الرقم الضريبي :{" "}
                        <span className="font-semibold">
                          {lessorInfo.taxCode}
                        </span>
                      </>
                    ) : lessorInfo.unifiedNumber ? (
                      <>
                        {" "}
                        الرقم الموحد :{" "}
                        <span className="font-semibold">
                          {lessorInfo.unifiedNumber}
                        </span>
                      </>
                    ) : lessorInfo.id ? (
                      <>
                        {" "}
                        رقم الهوية :{" "}
                        <span className="font-semibold">{lessorInfo.id}</span>
                      </>
                    ) : (
                      ""
                    )}
                    ، العنوان:{" "}
                    <span className="font-semibold">{lessorInfo.address}</span>
                    ،<br /> رقم الهاتف:{" "}
                    <span className="font-semibold" dir="ltr">
                      {lessorInfo.phone}
                    </span>
                    ، البريد الإلكتروني:{" "}
                    <span className="font-semibold">{lessorInfo.email}</span>،
                    ويُشار إليه فيما بعد بـ ("
                    <span className="font-bold underline">المؤجر</span>
                    ").
                  </p>

                  <p className="mb-4 leading-10">
                    <span className="font-bold underline">ثانياً</span>:{" "}
                    <span className="font-semibold">{lesseeInfo.name}،</span>
                    {lesseeInfo.taxCode ? (
                      <>
                        {" "}
                        الرقم الضريبي :{" "}
                        <span className="font-semibold">
                          {lesseeInfo.taxCode}
                        </span>
                      </>
                    ) : lesseeInfo.unifiedNumber ? (
                      <>
                        {" "}
                        الرقم الموحد :{" "}
                        <span className="font-semibold">
                          {lesseeInfo.unifiedNumber}
                        </span>{" "}
                      </>
                    ) : lesseeInfo.id ? (
                      <>
                        {" "}
                        رقم الهوية :{" "}
                        <span className="font-semibold">
                          {lesseeInfo.id}
                        </span>{" "}
                        {nafathData?.issuePlace && (
                          <>
                            ، مكان اصدار الهوية :{" "}
                            <span className="font-semibold">
                              {nafathData.issuePlace}
                            </span>{" "}
                          </>
                        )}
                        {nafathData?.dateOfBirthG && (
                          <>
                            ، تاريخ الميلاد :{" "}
                            <span className="font-semibold">
                              {nafathData.dateOfBirthG}
                            </span>{" "}
                            <br />
                          </>
                        )}
                      </>
                    ) : (
                      ""
                    )}
                    العنوان:{" "}
                    <span className="font-semibold">{lesseeInfo.address}</span>
                    ،<br /> رقم الهاتف:{" "}
                    <span className="font-semibold" dir="ltr">
                      {lesseeInfo.phone}
                    </span>
                    ، البريد الإلكتروني:{" "}
                    <span className="font-semibold">{lesseeInfo.email}</span>،
                    ويُشار إليه فيما بعد بـ ("
                    <span className="font-bold underline">المستأجر</span>
                    ").
                  </p>
                  <p>يشار إلى كل منهما مجتمعين بـ "الطرفين" أو "الطرفان"</p>
                </div>
              </div>
            </div>

            {/* 2. Locked Checkbox for Read Confirmation */}
            <div
              className={`p-5 rounded-xl border transition-all duration-300 flex items-center gap-2 ${isReceived ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
            >
              <Checkbox
                isSelected={isReceived}
                isDisabled={isReceived} // CANNOT UNCHECK ONCE CHECKED
                onValueChange={(val) => {
                  if (val) setIsReceived(true);
                }}
                color="success"
                classNames={{
                  label: `text-base font-bold select-none ml-2 ${isReceived ? "text-green-800" : "text-gray-700"}`,
                  wrapper: isReceived ? "after:bg-green-500" : "",
                  icon: "text-white",
                }}
              >
                {lang === "ar"
                  ? "لقد قرأت العقد بالكامل واستلمت المنتج."
                  : "I have read the contract completely and received the product."}
              </Checkbox>
            </div>
          </>
        )}
        {/* 3. Electronic Signature Area */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">
            {lang === "ar" ? "توقيعك الإلكتروني" : "Your Electronic Signature"}
          </h3>

          {/* Signature Input */}
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            disabled={isLoading}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-5 text-center font-bold text-lg md:text-xl focus:border-[#F48A42] focus:ring-1 focus:ring-[#F48A42] outline-none transition-all"
            placeholder={
              lang === "ar"
                ? "اكتب اسمك الثلاثي هنا..."
                : "Type your full name here..."
            }
          />

          {/* Signature Preview */}
          <div className="mt-6 bg-gray-50/80 border border-gray-100 rounded-xl py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[10px] sm:text-xs text-gray-400 font-bold tracking-widest uppercase mb-6">
              Signature Preview
            </span>

            <div className="border-b border-gray-400 min-w-[200px] sm:min-w-[300px] text-center pb-2 relative flex justify-center">
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                disabled={isLoading}
                placeholder={lang === "ar" ? "الاسم" : "Name"}
                className={`bg-transparent outline-none text-center w-full text-2xl sm:text-3xl text-gray-800 ${lang === "ar" ? "font-bold" : "font-serif italic"} transition-all`}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 leading-relaxed max-w-2xl mx-auto">
            {lang === "ar"
              ? "بكتابة اسمك أعلاه، تؤكد أن هذا يشكل توقيعك الإلكتروني الصالح قانونياً وأنك توافق على جميع الشروط الموضحة في اتفاقية الخدمة هذه."
              : "By typing your name above, you confirm that this constitutes your legally valid electronic signature and that you agree to all the terms outlined in this service agreement."}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2 p-3 bg-red-100 border border-red-300 rounded-md text-center font-medium">
          {error}
        </p>
      )}

      <Button
        isLoading={isLoading}
        onClick={handleSubmit}
        className="py-6 mt-4 w-full md:w-auto md:text-xl text-lg font-bold md:px-14 px-6 self-center"
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

      {/* RENTER: Show Support Block */}
      {showSupport && isRenter && (
        <div className="mt-16 p-8 rounded-2xl border-2 border-red-100 shadow-lg bg-white">
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
                className="text-primary"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {lang === "ar" ? "هل تحتاج مساعدة؟" : "Need Help?"}
            </h3>
          </div>

          <p className="text-gray-700 text-base text-center mb-6 leading-relaxed max-w-2xl mx-auto">
            {t("supportText")}{" "}
            <Link
              href={`/${langPrefix}contact`}
              className="text-primary hover:text-[#d67535] font-semibold underline underline-offset-4 transition-colors"
            >
              <span>{lang === "ar" ? "تواصل معنا" : "Contact Us"}</span>
            </Link>
          </p>

          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
              {t("supportOrderId") ||
                (lang === "ar" ? "رقم الطلب" : "Order ID")}
            </span>
            <div
              onClick={copyOrderId}
              className="cursor-pointer flex items-center gap-2 bg-white px-5 py-3 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow"
            >
              <button
                className="text-gray-400 hover:text-primary transition-all p-2 rounded-lg hover:bg-orange-50 active:scale-95"
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
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
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

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <div
          className="p-6 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-850 shadow-xl"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/50 mb-4">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t("warnModal.title")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {t("warnModal.message")}
          </p>

          <div className="flex justify-center gap-3">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="bordered"
              color="default"
              size="md"
              radius="lg"
              className="px-5 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("warnModal.cancel")}
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                router.push(
                  `/${langPrefix}contract/${order?.contractId || order?._id}`,
                );
              }}
              color="warning"
              variant="solid"
              size="md"
              radius="lg"
              className="px-5 py-2.5 font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              {t("warnModal.confirm")}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
