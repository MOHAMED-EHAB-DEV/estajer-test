"use client";
import Image from "next/image";
import { CalendarIcon } from "@/components/ui/svgs/icons/CalendarIconSvg";
import { Location } from "@/components/ui/svgs/icons/LocationSvg";
import { User } from "@/components/ui/svgs/icons/UserSvg";
import { Note } from "@/components/ui/svgs/icons/NoteSvg";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";
import { EmptyBag } from "@/components/ui/svgs/icons/EmptyBagSvg";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useState, useTransition, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import FilterOptions from "../admin/orders/FilterOptions";
import {
  Checked,
  Map,
  Money,
  Order,
  Review,
  Receipt,
} from "../ui/svgs/OrdersSvg";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import OrderStatus from "./OrderStatus";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import PushNotificationModal from "../shared/PushNotificationModal";
import ChatButton from "../chat/ChatButton";

const statusColors = {
  "not-paid": { backgroundColor: "#EAEEF3" },
  pending: { backgroundColor: "#EAEEF3" },
  confirmed: { backgroundColor: "#4FD65833" },
  received: { backgroundColor: "#F48A4233" },
  cancelled: { backgroundColor: "#F9D9D9" },
  rejecting: { backgroundColor: "#F9D9D9" },
  completed: { backgroundColor: "#4FD65833" },
  "not-returned": { backgroundColor: "#F9D9D9" },
};

function getDirection({ userLocation, destination }) {
  let originParam = `${userLocation?.[1]},${userLocation?.[0]}`;
  let destinationParam = `${destination?.lat || destination?.[1]},${
    destination?.lng || destination?.[0]
  }`;
  return `https://www.google.com/maps/dir/${originParam}/${destinationParam}`;
}

export default function OrdersList({
  lang,
  isOwner,
  orders,
  translate,
  langPrefix,
  admin,
}) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [date, setDate] = useState(searchParams.get("date") || "all");
  const [search, setSearch] = useState(searchParams.get("id") || "");

  const updateQueryParams = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });
    if (params.get("page")) params.delete("page");
    const query = params.toString();
    const url = `${window.location.pathname}${query ? "?" + query : ""}`;
    router.replace(url, { scroll: false });
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    updateQueryParams({ status: newStatus });
  };

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    updateQueryParams({ id: newSearch });
  };

  const handleRangeSelect = (range) => {
    const startDate = range?.from
      ? range.from.toLocaleDateString("en").replaceAll("/", "-")
      : null;
    const endDate = range?.to
      ? range.to.toLocaleDateString("en").replaceAll("/", "-")
      : null;

    const params = new URLSearchParams(searchParams.toString());
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");
    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    if (params.get("page")) params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.requests.${text}`);
  const tOrdersList = (text) => trans(`dashboard.ordersList.${text}`);
  const [modalData, setModalData] = useState({ show: false });

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
          if (action === "cancel") return t("rejectOrderToast");
          else if (action === "confirm") return t("acceptOrderToast");
          else if (action === "delivery") return t("emailSentToCustomer");
          else if (action === "delete") return t("orderDeleted");
        };
        toast.success(ToastMessage(message()));
        // Refresh the page to show updated status
        router.refresh();
      } catch (error) {
        toast.error(ToastMessage(error.message));
        console.error("Error updating order:", error);
      } finally {
        setModalData({ show: false });
      }
    });

  const handleDeliveryConfirmation = async (order, isOwner) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.startDate);
    orderDate.setHours(0, 0, 0, 0);

    if (orderDate.getTime() > today.getTime())
      return toast.warning(
        ToastMessage(
          isOwner
            ? tOrdersList("waitForDeliveryDate")
            : tOrdersList("waitForReceiptDate"),
        ),
      );
    if (orderDate.getTime() < today.getTime() && order.status === "pending")
      return showModal(order._id, "cancel");
    if (!isOwner)
      return router.push(`/${langPrefix}documentation/${order._id}`);

    if (order.deliveryNotificationSent) {
      return toast.warning(ToastMessage(tOrdersList("emailAlreadySent")));
    }

    showModal(order._id, "delivery");
  };

  const showModal = (orderId, type) => {
    const modalConfig = {
      cancel: {
        title: t("confirmReject.title"),
        message: t("confirmReject.message"),
        confirmText: t("confirmReject.confirmText"),
        cancelText: t("confirmReject.cancelText"),
      },
      confirm: {
        title: t("confirmAccept.title"),
        message: t("confirmAccept.message"),
        confirmText: t("confirmAccept.confirmText"),
        cancelText: t("confirmAccept.cancelText"),
      },
      delivery: {
        title: tOrdersList("confirmEmailTitle"),
        message: tOrdersList("confirmEmailMessage"),
        confirmText: tOrdersList("send"),
        cancelText: tOrdersList("cancel"),
      },
      delete: {
        title: tOrdersList("confirmDeleteTitle"),
        message: tOrdersList("confirmDeleteMessage"),
        confirmText: tOrdersList("delete"),
        cancelText: tOrdersList("cancel"),
      },
    }[type];

    setModalData({
      show: true,
      ...modalConfig,
      onConfirm: () => handleAction(orderId, type),
      type,
    });
  };

  const statusOptions = [
    { key: "all" },
    ...(isOwner ? [] : [{ key: "not-paid" }]),
    { key: "pending" },
    { key: "confirmed" },
    { key: "received" },
    { key: "completed" },
    { key: "rejecting" },
    { key: "cancelled" },
  ];

  return (
    <>
      <PushNotificationModal
        customer={!isOwner}
        translate={translate}
        open={true}
        lang={lang}
      />
      <div className="mb-6">
        <FilterOptions
          translate={translate}
          status={status}
          setStatus={handleStatusChange}
          date={date}
          setDate={(newDate) => {
            setDate(newDate);
            updateQueryParams({ date: newDate });
          }}
          search={search}
          setSearch={handleSearchChange}
          onRangeSelect={handleRangeSelect}
          selectedRange={{
            from: searchParams.get("startDate")
              ? new Date(searchParams.get("startDate"))
              : undefined,
            to: searchParams.get("endDate")
              ? new Date(searchParams.get("endDate"))
              : undefined,
          }}
          isShowPrintButton={false}
          statusOptions={statusOptions}
        />
      </div>

      {orders.length > 0 ? (
        orders?.map((order) => {
          const totalItems = order.items.reduce(
            (acc, item) => acc + item.quantity,
            0,
          );
          return (
            <div
              className="bg-white rounded-3xl mb-6 overflow-hidden shadow-md"
              key={order._id}
            >
              <div className="md:p-8 p-3" key={order._id}>
                <div className={`bg-[#F9FAFC] md:p-4 p-3`}>
                  <div className="flex items-center gap-2 md:text-lg text-base font-semibold md:mb-5 mb-3 md:pb-4 pb-2 border-b border-[#d6d7d8] leading-6">
                    <Order
                      color="#F48A42"
                      className="md:w-5 md:h-5 w-[18px] h-[18px]"
                    />
                    {tOrdersList("products")}
                  </div>
                  {/*  order data  */}
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 gap-3 py-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-center flex-wrap sm:flex-nowrap justify-center sm:justify-normal"
                      >
                        <div className="min-w-32 aspect-[1.1/1] rounded-3xl overflow-hidden relative">
                          <div
                            className="absolute inset-0 opacity-95 group-hover:opacity-90 transition-opacity duration-300"
                            style={{
                              background:
                                item.product?.images[0]?.gradientStyle ||
                                "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
                            }}
                          />
                          <Image
                            src={anyImgUrl({
                              src: item.product?.images[0]?.preview,
                              size: 500,
                            })}
                            fill
                            alt={
                              item.product?.[
                                `name${lang === "ar" ? "Ar" : "En"}`
                              ]
                            }
                            className="h-full w-full object-contain"
                            unoptimized
                            priority
                          />
                        </div>
                        <div>
                          <div className="text-darkNavy font-IBMPlex font-semibold md:text-lg text-sm mb-2">
                            {
                              item.product?.[
                                `name${lang === "ar" ? "Ar" : "En"}`
                              ]
                            }
                          </div>
                          <div className="text-[#5B5656] mb-3 flex gap-2 md:text-sm text-sm">
                            <span>
                              {tOrdersList("orderCreationDate")}{" "}
                              {new Date(order.createdAt).toLocaleString(lang, {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-2 font-semibold mb-2 md:text-base text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="md:w-[18px] md:h-[18px] w-4 h-4 -translate-y-px" />
                              {new Date(item.startDate).toLocaleDateString(
                                lang,
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                },
                              )}{" "}
                              {" ~ "}
                              {new Date(item.endDate).toLocaleDateString(lang, {
                                weekday: "long",
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm md:text-base">
                              <Order
                                color="#0D092B"
                                className="md:w-[15px] md:h-[15px] w-3.5 h-3.5"
                              />
                              <span>
                                {item.quantity} {t("pieces")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm md:text-base">
                              <Money className="md:w-[18px] md:h-[18px] w-4 h-4" />
                              <span className="flex items-center gap-1">
                                {item.price}
                                <Currency className="w-4 h-4" />
                              </span>
                            </div>
                            {item.deliveryType && (
                              <div className="flex items-center gap-2 md:text-base text-sm">
                                <Location
                                  color="#0D092B"
                                  className="md:w-4 md:h-4 w-3.5 h-3.5"
                                />
                                <span className="font-semibold">
                                  {t("deliveryMethod")} :{" "}
                                </span>

                                <span>
                                  {item.selectedBranch
                                    ? `${t("pickupFrom")} ${
                                        order.ownerData.branches.find(
                                          (branch) =>
                                            branch._id.toString() ===
                                            item.selectedBranch._id.toString(),
                                        )?.name?.[lang] ||
                                        item.selectedBranch?.name
                                      }`
                                    : t(item.deliveryType)}
                                </span>
                              </div>
                            )}
                            {item?.deliveryCost > 0 && (
                              <div className="flex items-center gap-2 md:text-base text-sm">
                                <Money className="md:w-[18px] md:h-[18px] w-4 h-4" />
                                <span className="font-semibold">
                                  {t("deliveryCost")} :
                                </span>
                                <span className="flex items-center gap-1">
                                  {item.deliveryCost}
                                  <Currency className="w-4 h-4" />
                                </span>
                              </div>
                            )}
                            {!isOwner && item.deliveryType === "receive" && (
                              <Link
                                href={getDirection({
                                  userLocation: [
                                    user?.location?.lng,
                                    user?.location?.lat,
                                  ],
                                  destination:
                                    order.ownerData.branches?.find(
                                      (branch) =>
                                        branch._id.toString() ===
                                        item?.selectedBranch?._id.toString(),
                                    )?.location ||
                                    item.product?.location?.coordinates,
                                })}
                                target="_blank"
                                className="flex w-max items-center gap-1 text-primary underline font-semibold font-IBMPlex"
                              >
                                <Map className="md:w-4 md:h-4 w-3.5 h-3.5" />
                                <span>{tOrdersList("viewOnMap")}</span>
                              </Link>
                            )}
                          </div>
                          {item?.services?.length > 0 && (
                            <div className="md:text-base text-sm">
                              <span className="font-semibold">
                                {tOrdersList("additionalServices")}
                              </span>
                              <div className="flex flex-wrap justify-between mt-1 gap-x-6 gap-y-1">
                                {item?.services?.map((service, idx) => (
                                  <div
                                    className="flex items-center gap-1"
                                    key={`${service.id}-${idx}`}
                                  >
                                    <Checked color="#0D092B" />
                                    <span className="text-primary">
                                      {service.quantity}
                                    </span>
                                    <span>{service.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {!isOwner &&
                            (order.status === "received" ||
                              order.status === "completed") && (
                              <Link
                                href={`/${langPrefix}products/${item.product._id}#reviews`}
                                className="flex w-max items-center gap-2 text-primary underline font-semibold md:text-lg text-sm mt-2 font-IBMPlex"
                              >
                                <Review className="md:w-[22px] md:h-[22px] w-[18px] h-[18px]" />
                                <span>{tOrdersList("reviewProduct")}</span>
                              </Link>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status !== "not-paid" && (
                  <div className="bg-[#F9FAFC] p-4 mt-4">
                    <div className="flex items-center gap-2 text-lg font-semibold mb-5 pb-4 border-b border-[#d6d7d8] leading-6">
                      <User
                        color="#F48A42"
                        className="md:w-[22px] md:h-[22px] w-[18px] h-[18px]"
                      />
                      {isOwner
                        ? tOrdersList("requesterData")
                        : tOrdersList("ownerData")}
                    </div>
                    <div className="grid md:grid-cols-3 grid-cols-1 md:gap-8 gap-4">
                      <div className="flex flex-wrap items-center md:gap-4 gap-2">
                        <div className="md:w-[7rem] w-[4.5rem] aspect-square relative overflow-hidden rounded-full">
                          <Image
                            src={anyImgUrl({
                              src: isOwner
                                ? order.userData?.id?.avatar
                                : order.ownerData?.avatar,
                              size: 500,
                            })}
                            alt={
                              isOwner
                                ? order.userData.fullName
                                : order.ownerData?.fullName
                            }
                            className="h-full w-full object-cover"
                            unoptimized
                            fill
                          />
                        </div>
                        <div>
                          <div className="text-darkNavy font-semibold md:text-lg text-sm font-IBMPlex">
                            {isOwner
                              ? order.userData.fullName
                              : order.ownerData?.fullName}
                          </div>
                          <div className="mt-1 md:text-sm text-[13px]">
                            {`${tOrdersList("joinedEstajer")} 
                        ${new Date(
                          isOwner
                            ? order.userData?.id?.createdAt
                            : order.ownerData?.createdAt,
                        ).toLocaleDateString(lang === "ar" ? lang : "fr")}`}
                          </div>
                          <div className="my-1 md:text-sm text-[13px]">
                            {isOwner
                              ? order.userData.email
                              : order.ownerData?.email}
                          </div>
                          <div className="my-1 md:text-sm text-[13px]">
                            {isOwner
                              ? order.userData.phone
                              : order.ownerData?.phone}
                          </div>
                          {isOwner && order.userData.companyDetails && (
                            <div className="md:text-sm text-[13px]">
                              <div className="my-1">
                                {tOrdersList("companyName")} :{" "}
                                {order.userData.companyDetails.companyName}
                              </div>
                              <div className="my-1">
                                {tOrdersList("registerNumber")} :{" "}
                                {order.userData.companyDetails.registerNumber}
                              </div>
                              <div className="my-1">
                                {tOrdersList("taxCode")} :{" "}
                                {order.userData.companyDetails.taxCode}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-2 md:text-lg text-[13px]">
                          <div className="mt-1">
                            <Location className="md:w-[18px] md:h-[22px] w-[15px] h-[18px]" />
                          </div>
                          <div>
                            <span className="font-semibold">
                              {t("address")} :{" "}
                            </span>
                            <span>
                              {isOwner
                                ? order.userData.address
                                : order.ownerData?.address}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={
                            isOwner
                              ? user?.location
                                ? getDirection({
                                    userLocation: user?.location?.lng
                                      ? [user.location.lng, user.location.lat]
                                      : order.items[0]?.product?.location
                                          ?.coordinates,
                                    destination: order.userData.location,
                                  })
                                : "#"
                              : order.ownerData?.location
                                ? getDirection({
                                    userLocation: [
                                      user?.location?.lng,
                                      user?.location?.lat,
                                    ],
                                    destination: order.ownerData.location,
                                  })
                                : "#"
                          }
                          target="_blank"
                          className="flex w-max items-center gap-2 text-primary underline font-semibold md:text-lg text-sm mt-2 font-IBMPlex"
                        >
                          <Map className="md:w-[21px] md:h-[19px] w-[18px] h-[16px]" />
                          <span>{tOrdersList("viewOnMap")}</span>
                        </Link>
                      </div>
                      <div>
                        {isOwner && (
                          <div className="flex gap-2 md:text-lg text-sm mb-4">
                            <div className="mt-1">
                              <Note className="md:w-[18px] md:h-[18px] w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold">
                                {t("notes")} :{" "}
                              </span>
                              <span>
                                {order.userData.notes || tOrdersList("noNotes")}
                              </span>
                            </div>
                          </div>
                        )}
                        <ChatButton
                          translate={translate}
                          product={{
                            owner: {
                              _id: isOwner
                                ? order.userData.id._id
                                : order.ownerData._id,
                              ...(isOwner
                                ? order.userData.id
                                : order.ownerData),
                            },
                          }}
                          langPrefix={langPrefix}
                          home={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/*  order price  */}
              <div
                className="flex flex-wrap justify-between gap-4 items-center md:px-8 px-4 md:py-6 py-3"
                style={{
                  backgroundColor: statusColors[order.status]?.backgroundColor,
                }}
              >
                <div className="flex md:gap-4 gap-y-2 gap-x-3 flex-wrap items-center">
                  <div className="md:text-lg text-sm font-semibold w-full md:w-auto">
                    {tOrdersList("orderSummary")}
                  </div>
                  <div className="flex md:gap-2 gap-1 md:text-base text-[13px]">
                    <span className="font-semibold">{t("piecesCount")} : </span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex md:gap-2 gap-1 md:text-base text-[13px]">
                    <span className="font-semibold flex items-center gap-1">
                      {t("price")} :
                    </span>
                    <span className="flex items-center gap-1">
                      {order.price} <Currency className="w-4 h-4" size={16} />
                    </span>
                  </div>
                  <div className="flex md:gap-2 gap-1 md:text-base text-[13px]">
                    <span className="font-semibold">{t("tax")} : </span>
                    <span className="flex items-center gap-1">
                      {order.tax} <Currency className="w-4 h-4" size={16} />
                    </span>
                  </div>
                  <div className="flex md:gap-2 gap-1 md:text-base text-[13px]">
                    <span className="font-semibold">{t("insurance")} : </span>
                    <span className="flex items-center gap-1">
                      {order.insurance}{" "}
                      <Currency className="w-4 h-4" size={16} />
                    </span>
                  </div>
                  {order.deliveryCost > 0 && (
                    <div className="flex md:gap-2 gap-1 md:text-base text-[13px]">
                      <span className="font-semibold">
                        {t("deliveryCost")} :{" "}
                      </span>
                      <span className="flex items-center gap-1">
                        {order.deliveryCost}{" "}
                        <Currency className="w-4 h-4" size={16} />
                      </span>
                    </div>
                  )}
                  <div className="flex md:gap-2 gap-1 text-primary font-semibold md:text-base text-[13px]">
                    <span className="flex items-center gap-1">
                      <Money
                        color="#F48A42"
                        className="md:w-[18px] md:h-[18px] w-4 h-4"
                      />{" "}
                      {t("totalAmount")} :
                    </span>
                    <span className="flex items-center gap-1">
                      {order.totalAmount}{" "}
                      <Currency className="w-4 h-4" size={16} color="#f48a42" />
                    </span>
                  </div>
                  {!isOwner &&
                    order.status !== "not-paid" &&
                    order.status !== "cancelled" && (
                      <Link
                        href={`/api/orders/${order._id}/invoice?lang=${lang}`}
                        target="_blank"
                        className="flex w-max items-center gap-2 text-primary underline font-semibold font-IBMPlex md:text-base text-sm"
                      >
                        <Receipt className="md:w-[18px] md:h-[18px] w-4 h-4" />
                        <span>{tOrdersList("viewReceipt")}</span>
                      </Link>
                    )}
                  {isOwner &&
                    order?.invoiceId &&
                    order.status === "completed" && (
                      <Link
                        href={`/api/invoice/${order?.invoiceId}`}
                        target="_blank"
                        className="flex w-max items-center gap-2 text-primary underline font-semibold font-IBMPlex md:text-base text-sm"
                      >
                        <Receipt className="md:w-[18px] md:h-[18px] w-4 h-4" />
                        <span>{tOrdersList("viewInvoice")}</span>
                      </Link>
                    )}
                </div>
                {!admin && (
                  <OrderStatus
                    isOwner={isOwner}
                    status={order.status}
                    order={order}
                    isPending={isPending}
                    showModal={showModal}
                    handleDeliveryConfirmation={handleDeliveryConfirmation}
                    t={trans}
                    lang={lang}
                  />
                )}
              </div>
            </div>
          );
        })
      ) : (
        <EmptyPlaceholder
          Icon={EmptyBag}
          title={isOwner ? t("noRequests") : tOrdersList("noOrders")}
          description={
            isOwner
              ? t("noRequestsDescription")
              : tOrdersList("noOrdersDescription")
          }
          titleClassName="md:text-3xl text-xl"
          descriptionClassName="md:text-xl text-base"
          detailsContainerClassName="w-fit"
          actionText={isOwner ? t("addProduct") : tOrdersList("searchProducts")}
          url={
            isOwner
              ? `/${langPrefix}add-product`
              : `/${langPrefix}search/products`
          }
          ActionIcon={Send}
        />
      )}
      {modalData.show && (
        <ConfirmModal
          t={t}
          loading={isPending}
          isOpen={modalData.show}
          onClose={() => setModalData({ show: false })}
          {...modalData}
        />
      )}
    </>
  );
}
