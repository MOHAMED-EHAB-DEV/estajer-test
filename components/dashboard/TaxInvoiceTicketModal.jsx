import React, { useState } from "react";
import CustomModal from "@/components/ui/CustomModal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { useUser } from "@/context/UserContext";

export default function TaxInvoiceTicketModal({ isOpen, onClose, order, lang, t, hasInvoice = false }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const initialMessage = hasInvoice
    ? (lang === "ar"
        ? `يوجد مشكلة في الفاتورة الضريبية المرفقة للطلب رقم #${order._id}.`
        : `There is a problem with the uploaded tax invoice for order #${order._id}.`)
    : (lang === "ar"
        ? `لم يتم رفع الفاتورة الضريبية للطلب رقم #${order._id} حتى الآن.`
        : `The tax invoice for order #${order._id} has not been uploaded yet.`);

  const [message, setMessage] = useState(initialMessage);

  const subjectText = hasInvoice
    ? "problemWithTaxInvoice"
    : "delayedTaxInvoiceUpload";

  const handleSubmit = async () => {
    if (!message.trim()) {
      return toast.error(ToastMessage(t("dashboard.requests.pleaseEnterMessage")));
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user?.fullName || "User",
          email: user?.email || "",
          phone: user?.phone || "",
          subject: subjectText,
          message: message,
          lang: lang,
          ticketImages: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      toast.success(ToastMessage(t("dashboard.requests.ticketOpenedSuccessfully")));
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
        <h2 className="text-xl font-bold">
          {t("dashboard.requests.openSupportTicket")}
        </h2>
        <p className="text-sm text-gray-500 font-normal mt-2 p-3 bg-blue-50 rounded-lg">
          {t("dashboard.requests.taxInvoiceModalNote")}
        </p>
      </div>
      <div className="p-6 py-2">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("dashboard.requests.ticketSubject")}
            </label>
            <Input
              value={subjectText}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("dashboard.requests.ticketMessage")}
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 p-6 pt-4">
        <Button variant="border" className="border-gray-300" onPress={onClose}>
          {t("dashboard.requests.confirmModal.cancel")}
        </Button>
        <Button
          variant="solid"
          className="bg-primary text-white"
          onPress={handleSubmit}
          isLoading={isSubmitting}
        >
          {t("dashboard.requests.submitTicket")}
        </Button>
      </div>
    </CustomModal>
  );
}
