"use client";
import { Products, Cash, Person, Map } from "@/components/ui/svgs/Admin";
import { Messages } from "@/components/ui/svgs/Dashboard";
import { Note } from "@/components/ui/svgs/icons/NoteSvg";
import { Location } from "@/components/ui/svgs/icons/LocationSvg";
import { Insurance } from "@/components/ui/svgs/icons/InsuranceSvg";
import { ReceiptTax } from "@/components/ui/svgs/icons/ReceiptTaxSvg";
import { CloseFilled } from "@/components/ui/svgs/icons/CloseFilledSvg";
import { CheckFilled } from "@/components/ui/svgs/icons/CheckFilledSvg";
import { Delete } from "@/components/ui/svgs/icons/DeleteSvg";
import { ImageSvg } from "@/components/ui/svgs/icons/ImageSvgSvg";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { statusData } from "@/static/statusData";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import WaffyStatusModal from "./WaffyStatusModal";
import { anyImgUrl } from "@/utils/ImageUrl";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import OrderItemDetails from "./OrderItemDetails";
import ImagePreviewModal from "@/components/shared/ImagePreviewModal";

const OrderDetails = ({ order }) => {
  const [isPending, startTransition] = useTransition();
  const [modalData, setModalData] = useState({ show: false });
  const [showWaffyModal, setShowWaffyModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();

  const handleAction = (orderId, action) =>
    startTransition(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}?client=true`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (!response.ok) throw new Error("Failed to update order");
        const message = () => {
          if (action === "cancel") return "تم رفض الطلب بنجاح";
          else if (action === "confirm") return "تم قبول الطلب بنجاح";
          else if (action === "delete") return "تم حذف الطلب بنجاح";
          else if (action === "confirmRejection")
            return "تم تأكيد الرفض وإلغاء الطلب";
          else if (action === "restoreOrder") return "تم استعادة الطلب بنجاح";
          else if (action === "cancelConfirm")
            return "تم إلغاء تأكيد الطلب بنجاح";
          else if (action === "markNotReturned")
            return "تم تحديد الطلب كـ لم يتم إرجاعه";
          else if (action === "markReturned")
            return "تم تغيير حالة الطلب الى مكتمل بنجاح";
        };
        toast.success(ToastMessage(message()));
        // Refresh the page to show updated status
        if (action === "delete") router.push("/admin/orders/all");
        router.refresh();
      } catch (error) {
        toast.error(ToastMessage(error.message));
        console.error("Error updating order:", error);
      } finally {
        setModalData({ show: false });
      }
    });

  const showModal = (orderId, type) => {
    const modalConfig = {
      cancel: {
        title: "تأكيد رفض الطلب",
        message: "هل أنت متأكد من رفض هذا الطلب؟",
        confirmText: "رفض الطلب",
        cancelText: "إلغاء",
      },
      confirm: {
        title: "تأكيد قبول الطلب",
        message: "هل أنت متأكد من قبول هذا الطلب؟",
        confirmText: "قبول الطلب",
        cancelText: "إلغاء",
      },
      delete: {
        title: "تأكيد الحذف",
        message: "هل أنت متأكد أنك تريد حذف هذا الطلب؟",
        confirmText: "حذف الطلب",
        cancelText: "إلغاء",
      },
      confirmRejection: {
        title: "تأكيد إلغاء الطلب",
        message:
          "هل أنت متأكد من تأكيد الرفض وإلغاء هذا الطلب نهائياً؟ سيتم استرجاع المبلغ للعميل.",
        confirmText: "تأكيد الإلغاء",
        cancelText: "إلغاء",
      },
      restoreOrder: {
        title: "استعادة الطلب",
        message: "هل أنت متأكد من استعادة هذا الطلب إلى حالة الانتظار؟",
        confirmText: "استعادة الطلب",
        cancelText: "إلغاء",
      },
      cancelConfirm: {
        title: "إلغاء تأكيد الطلب",
        message:
          "هل أنت متأكد من إلغاء تأكيد هذا الطلب؟ سيتم إرجاع الطلب إلى حالة الانتظار.",
        confirmText: "إلغاء التأكيد",
        cancelText: "إلغاء",
      },
      markNotReturned: {
        title: "تأكيد عدم الإرجاع",
        message: "هل أنت متأكد من تحديد هذا الطلب كـ 'لم يتم إرجاعه'؟",
        confirmText: "تأكيد",
        cancelText: "إلغاء",
      },
      markReturned: {
        title: "تأكيد الإرجاع",
        message: "هل أنت متأكد من تغيير حالة الطلب إلى 'مكتمل'؟",
        confirmText: "تأكيد",
        cancelText: "إلغاء",
      },
    }[type];

    setModalData({
      show: true,
      ...modalConfig,
      onConfirm: () => handleAction(orderId, type),
      type,
    });
  };

  const handleReceiveOrder = (order) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.startDate);
    orderDate.setHours(0, 0, 0, 0);

    if (orderDate.getTime() > today.getTime()) {
      return toast.warning(ToastMessage("يرجى الانتظار حتى تاريخ بدء الطلب"));
    }

    // Redirect to documentation page
    router.push(`/documentation/${order._id}`);
  };
  return (
    <div className="bg-white md:rounded-3xl rounded-2xl mb-6 overflow-hidden shadow-md">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4 md:px-8 md:py-6 px-4 py-3 bg-[#EAEEF3]">
        <div className="flex flex-col gap-1">
          <h2 className="flex flex-wrap items-center gap-4 text-darkNavy font-semibold text-sm md:text-lg font-NotoSansArabic">
            رقم الطلب: {order?._id}
            {order?.contractId && (
              <span className="text-darkNavy font-semibold font-NotoSansArabic">
                رقم العقد: {order?.contractId}
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-darkNavy font-NotoSansArabic font-semibold text-sm md:text-lg">
            حالة الطلب:{" "}
          </span>
          <span
            className="md:px-5 md:py-2 px-3 py-1.5 text-white rounded-[5px] text-xs md:text-medium font-semibold font-IBMPlex"
            style={{
              backgroundColor: statusData[order.status].color,
            }}
          >
            {statusData[order.status].text}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="md:px-5 md:py-2 px-3 py-1.5 text-white rounded-[5px] text-xs md:text-medium font-semibold font-IBMPlex"
              style={{
                backgroundColor: statusData[order.status].color,
              }}
            >
              {order.waffyStatus}
            </span>
            <button
              onClick={() => setShowWaffyModal(true)}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              title="تعديل حالة وافي"
            >
              <Edit className="md:w-[18px] md:h-[18px] w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:p-8 p-3">
        {/* Products Section */}
        <div className="bg-[#F9FAFC] p-4 mb-4">
          <div className="flex items-center gap-2 text-base md:text-lg font-semibold mb-5 pb-4 border-b border-[#d6d7d8] leading-6">
            <Products isActive={true} activeColor="#F48A42" />
            <span className="text-darkNavy font-NotoSansArabic font-bold">
              المنتجات
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 gap-4 py-2">
            {order.items.map((item) => (
              <OrderItemDetails key={item._id} item={item} />
            ))}
          </div>
        </div>

        {/* User Data Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Owner Data */}
          <div className="bg-[#F9FAFC] p-4">
            <div className="flex items-center gap-2 text-base md:text-lg font-semibold mb-5 pb-4 border-b border-[#d6d7d8] leading-6">
              <Person />
              <span className="text-darkNavy font-NotoSansArabic font-bold">
                بيانات صاحب الطلب
              </span>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="md:w-[7rem] w-[5rem] aspect-square relative overflow-hidden rounded-full">
                  <Image
                    src={anyImgUrl({
                      src: order.userData.id.avatar,
                      size: 500,
                      quality: 80,
                    })}
                    alt={order.userData.fullName}
                    fill
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-darkNavy font-semibold text-base md:text-lg font-IBMPlex">
                    {order.userData.fullName}
                  </div>
                  <div className="mt-1 text-xs md:text-sm text-[#5B5656]">
                    انضم إلى استأجر{" "}
                    {new Date(order.userData.id.createdAt).getFullYear()}
                  </div>
                  <div className="my-1 text-xs md:text-sm">
                    {order.userData.email}
                  </div>
                  <div className="my-1 text-xs md:text-sm">
                    {order.userData.phone}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex gap-2 text-sm md:text-lg">
                  <div className="mt-1">
                    <Location className="md:w-[18px] md:h-[22px] w-4 h-[18px]" />
                  </div>
                  <div>
                    <span className="font-semibold">العنوان: </span>
                    <span>{order.userData.address}</span>
                  </div>
                </div>
                <Link
                  href={`https://www.google.com/maps?q=${order.userData.location.lat},${order.userData.location.lng}`}
                  target="_blank"
                  className="flex w-max items-center gap-2 text-primary underline font-semibold text-sm md:text-lg mt-2 font-IBMPlex"
                >
                  <Map className="w-4 h-4 md:w-5 md:h-5" />
                  <span>عرض في الخريطة</span>
                </Link>
              </div>
              {order.userData.notes && (
                <div>
                  <div className="flex gap-2 text-base md:text-lg">
                    <div className="mt-1">
                      <Note />
                    </div>
                    <div>
                      <span className="font-semibold">ملاحظة: </span>
                      <span>{order.userData.notes || "لا توجد ملاحظات"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Owner Data */}
          <div className="bg-[#F9FAFC] p-4">
            <div className="flex items-center gap-2 text-base md:text-lg font-semibold mb-5 pb-4 border-b border-[#d6d7d8] leading-6">
              <Person />
              <span className="text-darkNavy font-NotoSansArabic font-bold">
                بيانات صاحب المنتجات
              </span>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="md:w-[7rem] w-[5rem] aspect-square relative overflow-hidden rounded-full">
                  <Image
                    src={anyImgUrl({
                      src: order.ownerData.avatar,
                      size: 500,
                      quality: 80,
                    })}
                    alt={order.ownerData.fullName}
                    fill
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-darkNavy font-semibold text-base md:text-lg font-IBMPlex">
                    {order.ownerData.fullName}
                  </div>
                  <div className="mt-1 text-xs md:text-sm text-[#5B5656]">
                    انضم إلى استأجر{" "}
                    {new Date(order.ownerData.createdAt).getFullYear()}
                  </div>
                  <div className="my-1 text-xs md:text-sm">
                    {order.ownerData.email}
                  </div>
                  <div className="my-1 text-xs md:text-sm">
                    {order.ownerData.phone}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex gap-2 text-sm md:text-lg">
                  <div className="mt-1">
                    <Location className="md:w-[18px] md:h-[22px] w-4 h-[18px]" />
                  </div>
                  <div>
                    <span className="font-semibold">العنوان: </span>
                    <span>{order.ownerData.address}</span>
                  </div>
                </div>
                <Link
                  href={`https://www.google.com/maps?q=${order.ownerData?.location?.lat},${order.ownerData?.location?.lng}`}
                  target="_blank"
                  className="flex w-max items-center gap-2 text-primary underline font-semibold text-sm md:text-lg mt-2 font-IBMPlex"
                >
                  <Map className="w-4 h-4 md:w-5 md:h-5" />
                  <span>عرض في الخريطة</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation & Verification Section */}
        {(order.documentationImages?.length > 0 ||
          order.ownerDocumentationImages?.length > 0 ||
          order.renterConfirmedAt ||
          order.ownerConfirmedAt) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Renter Documentation */}
            <div className="bg-[#F9FAFC] md:p-4 p-3 rounded-2xl border border-[#EAEEF3]">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#d6d7d8] leading-6">
                <div className="flex items-center gap-2">
                  <ImageSvg />
                  <span className="text-darkNavy font-NotoSansArabic font-bold text-sm md:text-base">
                    توثيق المستأجر
                  </span>
                </div>
                {order.renterConfirmedAt && (
                  <span className="text-[10px] md:text-xs bg-success/10 text-success px-2 py-1 rounded-full font-IBMPlex font-medium">
                    تأكيد الاستلام:{" "}
                    {new Date(order.renterConfirmedAt).toLocaleString("ar", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              {order.documentationImages?.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {order.documentationImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 border border-[#eee] shadow-sm"
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={anyImgUrl({ src: img, size: 500 })}
                        alt={`renter-doc-${idx}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[#5B5656] text-sm text-center py-4 italic">
                  لم يتم رفع صور من قبل المستأجر
                </div>
              )}
            </div>

            {/* Owner Documentation */}
            <div className="bg-[#F9FAFC] md:p-4 p-3 rounded-2xl border border-[#EAEEF3]">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#d6d7d8] leading-6">
                <div className="flex items-center gap-2">
                  <ImageSvg />
                  <span className="text-darkNavy font-NotoSansArabic font-bold text-sm md:text-base">
                    توثيق المؤجر
                  </span>
                </div>
                {order.ownerConfirmedAt && (
                  <span className="text-[10px] md:text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full font-IBMPlex font-medium">
                    تأكيد المؤجر:{" "}
                    {new Date(order.ownerConfirmedAt).toLocaleString("ar", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              {order.ownerDocumentationImages?.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {order.ownerDocumentationImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 border border-[#eee] shadow-sm"
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={anyImgUrl({ src: img, size: 500 })}
                        alt={`owner-doc-${idx}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[#5B5656] text-sm text-center py-4 italic">
                  لم يتم رفع صور من قبل المؤجر
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Section - Order Summary & Actions */}
      <div className="flex flex-wrap justify-between gap-4 items-center md:px-8 md:py-6 px-4 py-3 bg-[#EAEEF3]">
        {/* Order Summary */}
        <div className="flex flex-col gap-3">
          <div className="text-base md:text-lg font-semibold text-darkNavy font-NotoSansArabic">
            ملخص الطلب
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex md:gap-2 gap-1 items-center">
              <Products className="md:w-5 md:h-5 !w-3 !h-3" />
              <span className="font-semibold">القطع:</span>
              <span>
                {order.items.reduce(
                  (total, { quantity }) => total + quantity,
                  0,
                )}
              </span>
            </div>

            <div className="flex md:gap-[10px] gap-1 items-center">
              <Cash />
              <div className="flex gap-1 items-center text-xs md:text-medium text-darkNavy">
                <span className="font-IBMPlex font-bold">السعر:</span>
                <span className="font-semibold font-NotoSansArabic">
                  {order.price} ر.س
                </span>
              </div>
            </div>
            <div className="flex md:gap-[10px] gap-1 items-center">
              <Insurance />
              <div className="flex gap-1 items-center text-xs md:text-medium text-darkNavy">
                <span className="font-IBMPlex font-bold">التأمين:</span>
                <span className="font-semibold font-NotoSansArabic">
                  {order.insurance} ر.س
                </span>
              </div>
            </div>
            <div className="flex md:gap-[10px] gap-1 items-center">
              <ReceiptTax />
              <div className="flex gap-1 items-center text-xs md:text-medium text-darkNavy">
                <span className="font-IBMPlex font-bold">الضريبة:</span>
                <span className="font-semibold font-NotoSansArabic">
                  {order.tax} ر.س
                </span>
              </div>
            </div>
            {order.deliveryCost > 0 && (
              <div className="flex md:gap-[10px] gap-1 items-center">
                <Cash />
                <div className="flex gap-1 items-center text-xs md:text-medium text-darkNavy">
                  <span className="font-IBMPlex font-bold">التوصيل:</span>
                  <span className="font-semibold font-NotoSansArabic">
                    {order.deliveryCost} ر.س
                  </span>
                </div>
              </div>
            )}
            <div className="flex md:gap-[10px] gap-1 items-center">
              <Cash isActive={true} activeColor="#F48A42" />
              <span className="text-[#F48A42] font-NotoSansArabic font-semibold text-xs md:text-medium">
                الاجمالي: {order.totalAmount} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          <div className="text-base md:text-lg font-semibold text-darkNavy font-NotoSansArabic">
            اجراءات سريعة
          </div>
          <div className="flex gap-2 flex-wrap">
            {order.status === "not-paid" && (
              <Button
                className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-[#F9D9D9] text-[#F44242] shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                onPress={() => showModal(order._id, "delete")}
                isDisabled={isPending}
              >
                <Delete className="md:w-5 md:h-5 w-4 h-4" />
                حذف الطلب
              </Button>
            )}
            {order.status === "pending" && (
              <>
                <Button
                  className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-[#F9D9D9] text-[#F44242] shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                  onPress={() => showModal(order._id, "cancel")}
                  isDisabled={isPending}
                >
                  <CloseFilled className="md:w-5 md:h-5 w-4 h-4" />
                  رفض الطلب
                </Button>
                <Button
                  className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-success text-white shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                  onPress={() => showModal(order._id, "confirm")}
                  isDisabled={isPending}
                >
                  <CheckFilled className="md:w-5 md:h-5 w-4 h-4" />
                  قبول الطلب
                </Button>
              </>
            )}
            {order.status === "confirmed" && (
              <>
                <Button
                  className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-[#F9D9D9] text-[#F44242] shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                  onPress={() => showModal(order._id, "cancelConfirm")}
                  isDisabled={isPending}
                >
                  <CloseFilled className="md:w-5 md:h-5 w-4 h-4" />
                  الغاء التأكيد
                </Button>
                <Button
                  className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-success text-white shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                  onPress={() => handleReceiveOrder(order)}
                  isDisabled={isPending}
                >
                  <CheckFilled className="md:w-5 md:h-5 w-4 h-4" />
                  استلام الطلب
                </Button>
              </>
            )}
            {console.log("order: ", order.rejectionApproved)}
            {order.status === "rejecting" &&
              (!order.rejectionApproved ? (
                <>
                  <Button
                    className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-[#F9D9D9] text-[#F44242] shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                    onPress={() => showModal(order._id, "confirmRejection")}
                    isDisabled={isPending}
                  >
                    <CloseFilled className="md:w-5 md:h-5 w-4 h-4" />
                    تأكيد الرفض
                  </Button>
                  <Button
                    className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-success text-white shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                    onPress={() => showModal(order._id, "restoreOrder")}
                    isDisabled={isPending}
                  >
                    <CheckFilled className="md:w-5 md:h-5 w-4 h-4" />
                    استعادة الطلب
                  </Button>
                </>
              ) : (
                <Button
                  isDisabled
                  className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-[#F9D9D9] text-[#F44242] shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                >
                  تم رفض الطلب
                </Button>
              ))}
            {order.status === "completed" && (
              <Button
                className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-[#F9D9D9] text-[#E74C3C] shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                onPress={() => showModal(order._id, "markNotReturned")}
                isDisabled={isPending}
              >
                <CloseFilled className="md:w-5 md:h-5 w-4 h-4" />
                لم يتم ارجاعه
              </Button>
            )}
            {order.status === "not-returned" && (
              <Button
                className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 gap-2 bg-[#2ECC71] text-white shadow-none font-semibold text-xs md:text-medium font-NotoSansArabic"
                onPress={() => showModal(order._id, "markReturned")}
                isDisabled={isPending}
              >
                <CheckFilled className="md:w-5 md:h-5 w-4 h-4" />
                تم ارجاعه
              </Button>
            )}
            <Button className="flex items-center justify-center rounded-full md:px-6 h-auto md:py-4 px-4 py-2 bg-white text-darkNavy shadow-none font-semibold font-NotoSansArabic text-xs md:text-medium">
              <Messages className="md:w-5 md:h-5 w-4 h-4" />
              عرض المحادثة
            </Button>
            {/* <Button className="flex items-center justify-center rounded-full px-6 py-3 bg-white text-darkNavy shadow-none font-semibold font-NotoSansArabic text-medium">
              <File />
              تصدير
              <ChevronDown />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Waffy Status Modal */}
      {showWaffyModal && (
        <WaffyStatusModal
          order={order}
          onClose={() => setShowWaffyModal(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Confirmation Modal */}
      {modalData.show && (
        <ConfirmModal
          loading={isPending}
          isOpen={modalData.show}
          onClose={() => setModalData({ show: false })}
          {...modalData}
          t={(type) => {
            if (type === "confirm") {
              return "تأكيد الطلب";
            } else if (type === "cancel") {
              return "رفض الطلب";
            }
          }}
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage}
      />
    </div>
  );
};

export default OrderDetails;
