"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="center"
      classNames={{
        body: "py-6",
        backdrop: "bg-black/40 backdrop-blur-sm",
        base: "border-none bg-white dark:bg-gray-900",
        header: "border-b-1 border-gray-200",
        footer: "border-t-1 border-gray-200",
      }}
    >
      <ModalContent className="p-4">
        <ModalHeader className="flex gap-2 items-center text-[#F44242]">
          <Dangers />
          <span>{t("reportTitle")}</span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
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
        </ModalBody>
        <ModalFooter className="flex justify-between">
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
