"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import ImageUploader from "@/components/addProduct/ImageUploader";
import DocumentationImages from "@/components/productDocumentation/DocumentationImages";
import { Button, Textarea, Chip } from "@heroui/react";
import ToastMessage from "@/components/ui/ToastMessage";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

// Icons
const DocumentIcon = ({ className = "w-5 h-5 text-white" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

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
    className="w-5 h-5"
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

export default function DamageReportForm({
  order,
  translate,
  lang,
  langPrefix,
}) {
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`dashboard.damageReport.${key}`);

  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [notes, setNotes] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");

      if (!damageDescription.trim())
        return setError(t("errors.damageDescriptionRequired"));

      if (beforeImages.length === 0)
        return setError(t("errors.beforeImagesRequired"));

      if (afterImages.length === 0)
        return setError(t("errors.afterImagesRequired"));

      setIsLoading(true);

      // Get the first product from the order items
      const product = order.items[0]?.product;
      if (!product) throw new Error(t("errors.productNotFound"));

      const response = await fetch("/api/damage-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          productId: product._id,
          beforeImages,
          afterImages,
          notes,
          damageDescription,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || t("errors.submitFailed"));
      }

      toast.success(ToastMessage(t("success.reportSubmitted")));
      router.push(`/${langPrefix}dashboard/requests`);
    } catch (error) {
      console.error("Error submitting damage report:", error);
      setError(error.message || t("errors.submitFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-from-bottom">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-gradient-to-br from-[#f48a42] to-[#e6762d] rounded-2xl shadow-lg shadow-[#f48a42]/25">
            <DocumentIcon />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {t("title")}
            </h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photos Sections */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-10">
            {/* Before Images */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <ImageIcon />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {t("beforeImages.title")}
                </h2>
              </div>
              <p className="text-gray-500 text-sm mb-6 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                {t("beforeImages.description")}
              </p>
              <ImageUploader
                files={beforeImages}
                setFiles={setBeforeImages}
                translate={translate}
                review={true}
              />
            </div>

            <div className="h-px bg-gray-100" />

            {/* After Images */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                  <ImageIcon />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {t("afterImages.title")}
                </h2>
              </div>
              <p className="text-gray-500 text-sm mb-6 bg-red-50/50 p-3 rounded-xl border border-red-100">
                {t("afterImages.description")}
              </p>
              <DocumentationImages
                files={afterImages}
                setFiles={setAfterImages}
                translate={translate}
              />
            </div>
          </div>

          {/* Description & Notes Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
            {/* Damage Description */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-[#f48a42]/10 text-[#f48a42] rounded-lg">
                  <AlertIcon />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {t("damageDescription.title")}
                </h2>
              </div>
              <Textarea
                placeholder={t("damageDescription.placeholder")}
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                minRows={4}
                maxRows={8}
                variant="bordered"
                classNames={{
                  inputWrapper:
                    "border-gray-200 focus-within:!border-[#f48a42] bg-gray-50/50 rounded-2xl",
                  input: "text-base py-2",
                }}
                isRequired
              />
            </div>

            {/* Additional Notes */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                {t("notes.title")}
              </h2>
              <Textarea
                placeholder={t("notes.placeholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minRows={3}
                maxRows={6}
                variant="bordered"
                classNames={{
                  inputWrapper:
                    "border-gray-200 focus-within:!border-[#f48a42] bg-gray-50/50 rounded-2xl",
                  input: "text-base py-2",
                }}
              />
            </div>
          </div>

          {/* Customer Documentation Images (Read-only reference) */}
          {order.documentationImages &&
            order.documentationImages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ImageIcon />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("customerDocumentation.title")}
                  </h2>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  {t("customerDocumentation.description")}
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {order.documentationImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-200 transition-all duration-300 shadow-sm"
                    >
                      <Image
                        src={anyImgUrl({ src: image, size: 300 })}
                        fill
                        alt={`Customer documentation ${idx + 1}`}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Error & Actions */}
          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-shake">
                <div className="text-red-600">
                  <AlertIcon />
                </div>
                <p className="text-red-600 font-medium text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end mb-4">
              <Button
                onSubmit={handleSubmit}
                isLoading={isLoading}
                size="lg"
                className="bg-gradient-to-r from-[#f48a42] to-[#e6762d] text-white font-bold px-12 py-7 rounded-2xl shadow-xl shadow-[#f48a42]/30 hover:shadow-2xl hover:shadow-[#f48a42]/40 transition-all duration-300 text-lg"
                isDisabled={isLoading}
              >
                {t("submitReport")}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Order & Product Info Sidebar */}
        {/* Order Details Widget */}
        <div className="bg-white max-h-max rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
              <DocumentIcon className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900 leading-none">
              {t("orderInformation")}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t("orderId")}</span>
              <span className="text-sm font-mono font-bold text-gray-900">
                #{order._id}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t("orderStatus")}</span>
              <Chip
                color="success"
                variant="flat"
                size="sm"
                className="font-bold"
              >
                {order.status}
              </Chip>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <CalendarIcon />
                <span className="text-sm text-gray-500">{t("startDate")}</span>
              </div>
              <span className="text-sm font-medium">
                {new Date(order.startDate).toLocaleDateString("ar")}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-2">
                <CalendarIcon />
                <span className="text-sm text-gray-500">{t("endDate")}</span>
              </div>
              <span className="text-sm font-medium">
                {new Date(order.endDate).toLocaleDateString("ar")}
              </span>
            </div>
          </div>

          {/* Product Section In Sidebar */}
          {order.items && order.items.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                {t("productInformation")}
              </h4>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-center mb-4 last:mb-0 group cursor-default"
                >
                  <div className="w-16 h-16 relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <div
                      className="absolute inset-0 opacity-95 transition-opacity group-hover:opacity-100"
                      style={{
                        background:
                          item.product?.images[0]?.gradientStyle ||
                          "linear-gradient(135deg, #fff, #fff)",
                      }}
                    />
                    <Image
                      src={anyImgUrl({
                        src: item.product?.images[0]?.preview,
                        size: 100,
                      })}
                      fill
                      alt={item.product?.[`name${lang === "ar" ? "Ar" : "En"}`]}
                      className="object-contain relative z-10 p-1 transition-transform group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">
                      {item.product?.[`name${lang === "ar" ? "Ar" : "En"}`]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("quantity")}:{" "}
                      <span className="text-[#f48a42] font-bold">
                        {item.quantity}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
