import { useState, useRef, useTransition } from "react";
import Button from "../ui/Button";
import { Download } from "../ui/svgs/OrdersSvg";
import { Report } from "../ui/svgs/icons/ReportSvg";
import { Eye } from "../ui/svgs/icons/EyeSvg";
import { FaUpload } from "../ui/svgs/AdminIcons";
import { Send } from "../ui/svgs/icons/SendSvg";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import TaxInvoiceTicketModal from "./TaxInvoiceTicketModal";
import RequestTaxInvoiceModal from "./RequestTaxInvoiceModal";
import OwnerTaxInvoiceDetailsModal from "./OwnerTaxInvoiceDetailsModal";

export default function TaxInvoiceAction({
  order,
  isOwner,
  owner,
  t,
  tOrdersList,
  lang,
}) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOwnerDetailsModal, setShowOwnerDetailsModal] = useState(false);
  const fileInputRef = useRef(null);

  // State to optimistically update UI after upload/request
  const [taxInvoiceUrl, setTaxInvoiceUrl] = useState(order.taxInvoice);
  const [isRequested, setIsRequested] = useState(order.taxInvoiceRequested);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return toast.error(ToastMessage(t("dashboard.requests.invalidFileType")));
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/orders/${order._id}/tax-invoice`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.message || data.error || "Failed to upload tax invoice",
        );
      }

      setTaxInvoiceUrl(data.url);
      toast.success(ToastMessage(t("dashboard.requests.taxInvoiceUploaded")));
      setShowOwnerDetailsModal(false);
    } catch (error) {
      toast.error(ToastMessage(error.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    uploadFile(file);
  };

  if (!owner?.accountType === "company" || !owner?.companyDetails?.taxCode)
    return null;

  if (isOwner) {
    if (taxInvoiceUrl) {
      return (
        <div className="flex gap-2">
          <Button
            variant="border"
            radius="lg"
            startContent={
              <Eye className="md:w-5 md:h-5 w-4 h-4" color="currentColor" />
            }
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent md:px-7 px-4 py-[0.6rem] md:py-4 h-auto md:text-sm text-xs font-semibold"
            as="a"
            href={`/api/orders/${order._id}/tax-invoice/${taxInvoiceUrl}`}
            target="_blank"
          >
            {tOrdersList("viewTaxInvoice")}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,image/*"
            className="hidden"
          />
          <Button
            variant="border"
            radius="lg"
            startContent={
              <FaUpload size={18} className="md:w-5 md:h-5 w-4 h-4" />
            }
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-transparent md:px-7 px-4 py-[0.6rem] md:py-4 h-auto md:text-sm text-xs font-semibold"
            onPress={() => setShowOwnerDetailsModal(true)}
            isLoading={isUploading}
          >
            {t("dashboard.requests.reuploadTaxInvoice")}
          </Button>
          <OwnerTaxInvoiceDetailsModal
            isOpen={showOwnerDetailsModal}
            onClose={() => setShowOwnerDetailsModal(false)}
            user={order?.userData}
            lang={lang}
            t={t}
            onUploadClick={handleUploadClick}
            onDropFile={uploadFile}
            isUploading={isUploading}
          />
        </div>
      );
    }

    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,image/*"
          className="hidden"
        />
        <Button
          variant="border"
          radius="lg"
          startContent={
            <FaUpload size={18} className="md:w-5 md:h-5 w-4 h-4" />
          }
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-transparent md:px-7 px-4 py-[0.6rem] md:py-4 h-auto md:text-sm text-xs font-semibold"
          onPress={() => setShowOwnerDetailsModal(true)}
          isLoading={isUploading}
        >
          {t("dashboard.requests.uploadTaxInvoice")}
        </Button>
        <OwnerTaxInvoiceDetailsModal
          isOpen={showOwnerDetailsModal}
          onClose={() => setShowOwnerDetailsModal(false)}
          user={order?.userData}
          lang={lang}
          t={t}
          onUploadClick={handleUploadClick}
          onDropFile={uploadFile}
          isUploading={isUploading}
        />
      </>
    );
  }

  // For Renter
  if (taxInvoiceUrl) {
    return (
      <div className="flex gap-2">
        <Button
          variant="border"
          radius="lg"
          startContent={<Download className="md:w-5 md:h-5 w-4 h-4" />}
          className="bg-[#EAFBEB] text-[#137333] hover:bg-[#DCEFDC] border-transparent md:px-7 px-4 py-[0.6rem] md:py-4 h-auto md:text-sm text-xs font-semibold"
          as="a"
          href={`/api/orders/${order._id}/tax-invoice/${taxInvoiceUrl}`}
          target="_blank"
          download
        >
          {t("dashboard.requests.downloadTaxInvoice")}
        </Button>
        <Button
          variant="border"
          radius="lg"
          startContent={
            <Report className="md:w-5 md:h-5 w-4 h-4" fill="currentColor" />
          }
          className="bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] border-transparent md:px-7 px-4 py-[0.6rem] md:py-4 h-auto md:text-sm text-xs font-semibold"
          onPress={() => setShowTicketModal(true)}
        >
          {t("dashboard.requests.openTicket")}
        </Button>
        {showTicketModal && (
          <TaxInvoiceTicketModal
            isOpen={showTicketModal}
            onClose={() => setShowTicketModal(false)}
            order={order}
            lang={lang}
            t={t}
            hasInvoice={true}
          />
        )}
      </div>
    );
  }

  if (isRequested) {
    return (
      <>
        <Button
          variant="border"
          radius="lg"
          startContent={
            <Report className="md:w-5 md:h-5 w-4 h-4" fill="currentColor" />
          }
          className="bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] border-transparent md:px-7 px-4 py-[0.6rem] md:py-4 h-auto md:text-sm text-xs font-semibold"
          onPress={() => setShowTicketModal(true)}
        >
          {t("dashboard.requests.openTicket")}
        </Button>
        {showTicketModal && (
          <TaxInvoiceTicketModal
            isOpen={showTicketModal}
            onClose={() => setShowTicketModal(false)}
            order={order}
            lang={lang}
            t={t}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant="border"
        radius="lg"
        startContent={
          <Send className="md:w-5 md:h-5 w-4 h-4" color="currentColor" />
        }
        className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent md:px-7 px-4 py-[0.6rem] md:py-4 h-auto md:text-sm text-xs font-semibold"
        onPress={() => setShowRequestModal(true)}
        isLoading={isPending}
      >
        {t("dashboard.requests.requestTaxInvoice")}
      </Button>
      <RequestTaxInvoiceModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        user={order?.userData}
        order={order}
        lang={lang}
        t={t}
        onSuccess={() => setIsRequested(true)}
      />
    </>
  );
}
