"use client";
import CustomModal from "../../ui/CustomModal";
import { Textarea } from "@heroui/input";
import { RadioGroup, Radio } from "@heroui/radio";
import { useState } from "react";
import { toast } from "@/utils/toast";
import Button from "../../ui/Button";
import { Dangers } from "@/components/ui/svgs/icons/DangersSvg";
import ToastMessage from "@/components/ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import { sendGTMEvent } from "@next/third-parties/google";

export default function ReportModal({
  isOpen,
  onClose,
  productId,
  lang,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`singleProduct.report.${text}`);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!reason) {
      toast.error(ToastMessage(trans("report.toast.selectReason")));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reports?client=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          reason,
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage(trans("report.toast.success")));
        // GTM event for successful product report submission
        sendGTMEvent({
          event: "report_submit",
          product_id: productId,
          reason,
          has_description: !!description,
          description_length: description?.length || 0,
          language: lang,
        });
        onClose();
      } else {
        toast.error(ToastMessage(data.error || trans("report.toast.error")));
      }
    } catch (error) {
      toast.error(ToastMessage(trans("report.toast.error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col p-4 md:p-6"
      backdropClass="bg-black/40 backdrop-blur-sm"
    >
      <div className="flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="flex gap-2 items-center text-[#F44242] font-semibold text-lg border-b border-gray-200 dark:border-gray-800 pb-3 mb-4 flex-shrink-0">
          <Dangers />
          <span>{t("reportTitle")}</span>
        </div>

        {/* Close Button */}
        <Button
          onPress={onClose}
          type="button"
          radius="full"
          className="absolute top-0 end-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 shadow-sm z-50 p-2 min-w-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-6 py-2">
          <RadioGroup
            label={t("reportReason")}
            value={reason}
            onValueChange={setReason}
          >
            <Radio value="fake">{t("fakeProduct")}</Radio>
            <Radio value="inappropriate">{t("inappropriateContent")}</Radio>
            <Radio value="scam">{t("scam")}</Radio>
            <Radio value="other">{t("otherReason")}</Radio>
          </RadioGroup>

          <Textarea
            label={t("additionalDetails")}
            placeholder={t("detailsPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={4}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 flex-shrink-0">
          <Button
            isDisabled={loading}
            className="bg-[#F44242] text-white"
            onPress={handleSubmit}
          >
            {loading ? t("sending") : t("send")}
          </Button>
          <Button color="transparent" onPress={onClose}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}
