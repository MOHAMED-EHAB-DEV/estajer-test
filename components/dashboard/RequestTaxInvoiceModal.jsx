import React, { useState, useEffect } from "react";
import CustomModal from "@/components/ui/CustomModal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";

export default function RequestTaxInvoiceModal({
  isOpen,
  onClose,
  user,
  order,
  lang,
  t,
  onSuccess,
}) {
  const initialCompanyDetails = user?.id?.companyDetails;

  const [companyName, setCompanyName] = useState(initialCompanyDetails.companyName || "");
  const [registerNumber, setRegisterNumber] = useState(initialCompanyDetails.registerNumber || "");
  const [taxCode, setTaxCode] = useState(initialCompanyDetails.taxCode || "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if user prop changes
  useEffect(() => {
    const details = user?.id?.companyDetails;
    setCompanyName(details?.companyName || "");
    setRegisterNumber(details?.registerNumber || "");
    setTaxCode(details?.taxCode || "");
  }, [user]);

  // All details must be completed
  const isFormComplete =
    companyName.trim() !== "" &&
    registerNumber.trim() !== "" &&
    taxCode.trim() !== "";

  const handleSubmit = async () => {
    if (!isFormComplete) {
      return toast.error(
        ToastMessage(
          lang === "ar"
            ? "الرجاء إكمال جميع تفاصيل الشركة"
            : "Please complete all company details"
        )
      );
    }

    setIsSubmitting(true);
    try {
      // 1. Update user's profile with company details
      const updateResponse = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          registerNumber: registerNumber.trim(),
          taxCode: taxCode.trim(),
        }),
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok || updateData.error) {
        throw new Error(
          updateData.error || "Failed to update company details"
        );
      }

      // 2. Send the request tax invoice request
      const requestResponse = await fetch(
        `/api/orders/${order._id}/request-tax-invoice`,
        {
          method: "POST",
        }
      );

      const requestData = await requestResponse.json();
      if (!requestResponse.ok || requestData.error) {
        throw new Error(
          requestData.message || requestData.error || "Failed to request tax invoice"
        );
      }

      toast.success(
        ToastMessage(t("dashboard.requests.taxInvoiceRequestSent"))
      );
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      toast.error(ToastMessage(error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col gap-1 p-6 pb-2">
        <h2 className="text-xl font-bold font-IBMPlex">
          {t("dashboard.requests.requestTaxInvoice")}
        </h2>
        <p className="text-sm text-gray-500 font-normal mt-2 p-3 bg-blue-50 rounded-lg font-IBMPlex">
          {lang === "ar"
            ? "يرجى إكمال تفاصيل الشركة لإرسال طلب الفاتورة الضريبية."
            : "Please complete your company details to send the tax invoice request."}
        </p>
      </div>
      <div className="p-6 py-2 font-IBMPlex">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("dashboard.requests.editModal.companyName")}
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={
                lang === "ar" ? "أدخل اسم الشركة" : "Enter company name"
              }
              isRequired
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("dashboard.requests.editModal.registerNumber")}
            </label>
            <Input
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "أدخل رقم السجل التجاري"
                  : "Enter commercial registration number"
              }
              isRequired
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("dashboard.requests.editModal.taxCode")}
            </label>
            <Input
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              placeholder={
                lang === "ar" ? "أدخل الرقم الضريبي" : "Enter tax number"
              }
              isRequired
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 p-6 pt-4 font-IBMPlex">
        <Button variant="border" className="border-gray-300" onPress={onClose}>
          {t("dashboard.requests.confirmModal.cancel")}
        </Button>
        <Button
          variant="solid"
          className="bg-primary text-white"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!isFormComplete}
        >
          {lang === "ar" ? "إرسال الطلب" : "Send Request"}
        </Button>
      </div>
    </CustomModal>
  );
}
