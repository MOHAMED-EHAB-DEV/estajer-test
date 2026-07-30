"use client";
import Button from "../ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import ToastMessage from "../ui/ToastMessage";
import { Delete } from "../ui/svgs/icons/DeleteSvg";
import { Duplicate } from "../ui/svgs/icons/DuplicateSvg";
import { Edit } from "../ui/svgs/icons/EditSvg";
import { Eye } from "../ui/svgs/icons/EyeSvg";
import { EyeOff } from "../ui/svgs/icons/EyeOffSvg";
import { MoreVertical } from "../ui/svgs/icons/MoreVerticalSvg";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/Dropdown";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReviewChangesModal = dynamic(() => import("./ReviewChangesModal"), {
  ssr: false,
});

const ProductEnhanceImageModal = dynamic(
  () => import("../admin/products/ProductEnhanceImageModal"),
  { ssr: false },
);

export default function ProductOwnerActions({
  sm,
  admin,
  owner,
  product,
  t,
  tUi,
  langPrefix,
  currentStatus,
  getUrlName,
  setModalData,
  onApprove,
  onReject,
  isPending,
  onProductUpdated,
}) {
  const router = useRouter();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const [localProduct, setLocalProduct] = useState(product);

  // Keep localProduct in sync when the parent product prop changes
  const currentProduct =
    localProduct._id === product._id ? localProduct : product;

  const handleDelete = (productId) => {
    setModalData({
      show: true,
      title: t("confirmDeleteTitle"),
      message: t("confirmDeleteMessage"),
      confirmText: t("delete"),
      cancelText: t("cancel"),
      type: "delete",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${productId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            router.refresh();
            await revalidate("/");
            await revalidateWithTag(`product-${productId}`);
            setModalData({ show: false });
            toast.success(ToastMessage(t("toasts.productDeletedSuccess")));
          }
        } catch (error) {
          console.error(t("deleteFailed"), error);
          setModalData({ show: false });
        }
      },
    });
  };

  const handleHide = (productId, hidden) => {
    setModalData({
      show: true,
      title: hidden ? t("confirmShowTitle") : t("confirmHideTitle"),
      message: hidden ? t("confirmShowMessage") : t("confirmHideMessage"),
      confirmText: hidden ? t("show") : t("hide"),
      cancelText: t("cancel"),
      type: "hide",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${productId}`, {
            method: "PATCH",
            body: JSON.stringify({ hidden: !hidden }),
          });
          const data = await res.json();
          if (!data.success)
            return toast.error(
              ToastMessage(data.error || "Error updating product"),
            );
          await revalidateWithTag(`product-${data.data._id}`);
          await revalidate("/");
          toast.success(
            ToastMessage(
              hidden
                ? t("toasts.productShownSuccess")
                : t("toasts.productHiddenSuccess"),
            ),
          );
          router.refresh();
          setModalData({ show: false });
        } catch (error) {
          console.error(t("hideFailed"), error);
          setModalData({ show: false });
        }
      },
    });
  };

  const handleRestore = (productId) => {
    setModalData({
      show: true,
      title: t("confirmRestoreTitle"),
      message: t("confirmRestoreMessage"),
      confirmText: t("restore"),
      cancelText: t("cancel"),
      type: "restore",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${productId}/restore`, {
            method: "PATCH",
          });
          const data = await res.json();
          if (!data.success)
            return toast.error(
              ToastMessage(data.error || "Error restoring product"),
            );
          await revalidateWithTag(`product-${data.data._id}`);
          await revalidate("/");
          toast.success(ToastMessage(t("toasts.productRestoredSuccess")));
          router.refresh();
          setModalData({ show: false });
        } catch (error) {
          console.error(t("restoreFailed"), error);
          setModalData({ show: false });
        }
      },
    });
  };

  const handleResetStatus = (productId) => {
    setModalData({
      show: true,
      title: t("confirmRestoreTitle"),
      message: t("confirmRestoreMessage"),
      confirmText: t("restore"),
      cancelText: t("cancel"),
      type: "restoreStatus",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${productId}/reset-status`, {
            method: "POST",
          });
          const data = await res.json();
          if (!data.success)
            return toast.error(
              ToastMessage(data.error || "Error restoring product status"),
            );
          await revalidateWithTag(`product-${data.data._id}`);
          // await revalidate("/");
          toast.success(ToastMessage(t("toasts.productRestoredSuccess")));
          router.refresh();
          setModalData({ show: false });
        } catch (error) {
          console.error("Failed to restore product status", error);
          setModalData({ show: false });
        }
      },
    });
  };

  const handleDuplicate = (productId) => {
    setModalData({
      show: true,
      title: t("confirmDuplicateTitle"),
      message: t("confirmDuplicateMessage"),
      confirmText: t("duplicate"),
      cancelText: t("cancel"),
      type: "duplicate",
      onConfirm: async () => {
        try {
          setModalData((prev) => ({ ...prev, loading: true }));
          const res = await fetch(`/api/products/${productId}/duplicate`, {
            method: "POST",
          });
          const data = await res.json();
          if (data.success) {
            router.refresh();
            // await revalidate("/");
            setModalData({ show: false });
            toast.success(ToastMessage(t("toasts.productDuplicatedSuccess")));
          } else {
            toast.error(
              ToastMessage(data.error || t("toasts.productDuplicatedError")),
            );
            setModalData({ show: false });
          }
        } catch (error) {
          console.error("Failed to duplicate product", error);
          toast.error(ToastMessage(t("toasts.productDuplicatedError")));
          setModalData({ show: false });
        }
      },
    });
  };

  const isAwaitingApproval = admin && !product.approved && !product.rejected;

  const detailsUrl =
    currentStatus?.type === "approved"
      ? `/${langPrefix}products/${getUrlName(product.name)}_ref_${product._id}`
      : `/${langPrefix}my-products/preview/${product._id}`;

  if (!admin && !owner) return null;

  if (product.deleted) {
    return (
      <div
        className={`flex ${
          sm
            ? "md:gap-1.5 gap-0.5 md:mt-4 mt-1.5"
            : "md:gap-1.5 gap-1 md:mt-4 mt-2"
        } items-center w-full`}
      >
        <Button
          size="md"
          className="flex-1 font-semibold text-white bg-gradient-to-tr from-emerald-500 to-green-400 hover:shadow-md hover:shadow-green-200 hover:scale-[1.02] transition-all duration-200 h-9 md:h-12"
          onPress={() => handleRestore(product._id)}
        >
          <svg
            className="md:w-4 md:h-4 w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          {t("restore")}
        </Button>
        <Button
          as={Link}
          href={detailsUrl}
          size="md"
          className={`${
            sm
              ? "w-8 h-8 min-w-8"
              : "md:min-w-10 md:w-10 md:h-12 w-9 h-9 min-w-9"
          } md:w-10 md:h-12 p-0 bg-[#F0F2F5] hover:bg-[#E4E7EB] transition-all duration-200`}
          title={tUi("details")}
        >
          <Eye className="md:w-5 md:h-5 w-4.5 h-4.5" color="#6B7280" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        sm ? "gap-1 md:gap-1.5 mt-1.5 md:mt-4" : "gap-1 md:gap-1.5 mt-2 md:mt-4"
      } items-center w-full`}
    >
      {/* Primary Actions — depends on product state */}
      {isAwaitingApproval ? (
        <>
          {/* Admin pending: Approve / Reject are primary */}
          <Button
            size="md"
            className={`flex-1 ${
              sm
                ? "text-[10px] md:text-sm h-8 md:h-12 px-1"
                : "text-[11px] md:text-sm h-9 md:h-12"
            } min-w-0 font-semibold text-white bg-gradient-to-tr from-emerald-500 to-green-400 hover:shadow-md hover:shadow-green-200 hover:scale-[1.02] transition-all duration-200`}
            onPress={() => onApprove(product._id)}
            isDisabled={isPending}
          >
            <svg
              className={`${sm ? "w-2.5 h-2.5 md:w-[14px] md:h-[14px]" : "w-3 h-3 md:w-[14px] md:h-[14px]"} shrink-0`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="md:inline hidden">قبول</span>
          </Button>
          <Button
            size="md"
            className={`flex-1 ${
              sm
                ? "text-[10px] md:text-sm h-8 md:h-12 px-1"
                : "text-[11px] md:text-sm h-9 md:h-12"
            } min-w-0 font-semibold text-white bg-gradient-to-tr from-red-500 to-rose-400 hover:shadow-md hover:shadow-red-200 hover:scale-[1.02] transition-all duration-200`}
            onPress={() => onReject(product)}
            isDisabled={isPending}
          >
            <svg
              className={`${sm ? "w-2.5 h-2.5 md:w-[14px] md:h-[14px]" : "w-3 h-3 md:w-[14px] md:h-[14px]"} shrink-0`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="md:inline hidden">رفض</span>
          </Button>
        </>
      ) : (
        <>
          {/* Owner / Admin non-pending: primary depends on pendingChanges state */}
          {admin && product.pendingChanges?.needsReview ? (
            // Review Changes is the primary action
            <Button
              size="md"
              className={`flex-1 min-w-0 font-semibold text-white ${
                sm
                  ? "text-[10px] md:text-sm h-8 md:h-12"
                  : "text-[11px] md:text-sm h-9 md:h-12"
              } bg-gradient-to-tr from-[#6366f1] to-[#818cf8] hover:shadow-md hover:shadow-indigo-200 hover:scale-[1.02] transition-all duration-200`}
              onPress={() => setShowReviewModal(true)}
            >
              <svg
                className="md:w-[13px] md:h-[13px] w-3 h-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="md:inline hidden">مراجعة التعديلات</span>
            </Button>
          ) : (
            // Edit is the primary action
            <Button
              as={Link}
              size="md"
              href={`/${langPrefix}edit-product/${product._id}`}
              title={t("editProduct")}
              className={`flex-1 min-w-0 font-semibold text-white ${
                sm
                  ? "text-[10px] md:text-sm h-8 md:h-12"
                  : "text-[11px] md:text-sm h-9 md:h-12"
              } bg-gradient-to-tr from-[#F48A42] to-[#F6A56E] hover:shadow-md hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200`}
            >
              <svg
                className="md:w-[13px] md:h-[13px] w-3 h-3 shrink-0"
                viewBox="0 0 23 23"
                fill="currentColor"
              >
                <path d="M0.490129 5.2554C0.00836563 4.77363 0.00836563 3.97069 0.490129 3.51363L3.38072 0.623042C3.83777 0.141278 4.64072 0.141278 5.12248 0.623042L7.39542 2.88363L2.76307 7.51598M22.3672 17.8677V22.5001H17.7348L4.07248 8.8254L8.70483 4.19304L22.3672 17.8677Z" />
              </svg>
              <span className="md:inline hidden">{t("editProduct")}</span>
            </Button>
          )}
        </>
      )}

      {/* Details — compact icon button */}
      <Button
        as={Link}
        href={detailsUrl}
        size="md"
        className={`${
          sm
            ? "w-8 h-8 min-w-[32px] md:w-10 md:h-12 md:min-w-10"
            : "w-9 h-9 min-w-9 md:w-10 md:h-12 md:min-w-10"
        } p-0 bg-[#F0F2F5] hover:bg-[#E4E7EB] transition-all duration-200`}
        title={tUi("details")}
      >
        <Eye className="w-4 h-4 md:w-5 md:h-5" color="#6B7280" />
      </Button>

      {/* Restore status — icon button (admin + rejected only) */}
      {admin && product.rejected && (
        <Button
          size="md"
          className={`${
            sm
              ? "w-8 h-8 min-w-[32px] md:w-10 md:h-12 md:min-w-10"
              : "w-9 h-9 min-w-9 md:w-10 md:h-12 md:min-w-10"
          } p-0 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200`}
          onPress={() => handleResetStatus(product._id)}
          title={t("restore")}
        >
          <svg
            className="w-3.5 h-3.5 md:w-4 md:h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </Button>
      )}

      {/* More actions dropdown */}
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            size="md"
            color="transparent"
            className={`${
              sm
                ? "w-8 h-8 min-w-[32px] md:w-10 md:h-12 md:min-w-10"
                : "w-9 h-9 min-w-9 md:w-10 md:h-12 md:min-w-10"
            } p-0 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm`}
            title={t("more")}
          >
            <MoreVertical
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              color="#6B7280"
            />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Product actions"
          variant="flat"
          className="!min-w-[180px]"
        >
          {isAwaitingApproval ||
          (admin && product.pendingChanges?.needsReview) ? (
            <DropdownItem
              key="edit"
              onPress={() =>
                router.push(`/${langPrefix}edit-product/${product._id}`)
              }
              startContent={<Edit size={16} color="#F48A42" />}
            >
              {t("editProduct")}
            </DropdownItem>
          ) : null}
          {admin ? (
            <DropdownItem
              key="enhanceImage"
              onPress={() => setShowEnhanceModal(true)}
              startContent={
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                  <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
                  <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
                </svg>
              }
            >
              تفريغ الصورة
            </DropdownItem>
          ) : null}
          <DropdownItem
            key="duplicate"
            onPress={() => handleDuplicate(product._id)}
            startContent={<Duplicate size={16} color="#4FD658" />}
          >
            {t("duplicateProduct")}
          </DropdownItem>
          <DropdownItem
            key="hide"
            onPress={() => handleHide(product._id, product.hidden)}
            startContent={
              product.hidden ? (
                <Eye size={18} color="#6B7280" />
              ) : (
                <EyeOff size={16} color="#6B7280" />
              )
            }
          >
            {product.hidden ? t("showProduct") : t("hideProduct")}
          </DropdownItem>
          <DropdownItem
            key="delete"
            onPress={() => handleDelete(product._id)}
            className="text-danger"
            color="danger"
            startContent={<Delete size={16} color="#EF4444" />}
          >
            {t("deleteProduct")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {showReviewModal && (
        <ReviewChangesModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          product={product}
          onDone={onProductUpdated}
        />
      )}

      <ProductEnhanceImageModal
        key={currentProduct._id}
        isOpen={showEnhanceModal}
        onClose={() => setShowEnhanceModal(false)}
        product={currentProduct}
        onImageUpdated={async (newImage) => {
          setLocalProduct((prev) => ({
            ...prev,
            images: [newImage, ...(prev.images?.slice(1) || [])],
          }));
          await revalidateWithTag(`product-${product._id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
