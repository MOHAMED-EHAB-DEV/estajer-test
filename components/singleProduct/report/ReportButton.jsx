"use client";
import { useState } from "react";
import Button from "../../ui/Button";
import { Dangers } from "@/components/ui/svgs/icons/DangersSvg";;
import ReportModal from "./ReportModal";
import { useTranslations } from "@/hooks/useTranslations";

export default function ReportButton({ productId, lang, translate }) {
  const t = useTranslations(translate);
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <Button
        className="w-full font-semibold py-7 mt-4 lg:text-[1.35rem] text-[1rem] text-[#F44242] !outline-none"
        color="transparent"
        onPress={() => setShowReportModal(true)}
      >
        <Dangers className="lg:w-7 lg:h-7 w-5 h-5" />
        {t("singleProduct.report.reportProduct")}
      </Button>
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        productId={productId}
        lang={lang}
        translate={translate}
      />
    </>
  );
}
