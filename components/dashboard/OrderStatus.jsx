import Link from "next/link";
import Button from "../ui/Button";
import { Delete } from "../ui/svgs/icons/DeleteSvg";
import { Send } from "../ui/svgs/icons/SendSvg";
import { Report } from "../ui/svgs/icons/ReportSvg";
import { Checked, RoundedX } from "../ui/svgs/OrdersSvg";

const StatusIndicator = ({ children, color, icon: Icon }) => (
  <div
    className={`bg-white font-semibold rounded-lg md:py-3 py-2 md:px-6 px-4 flex items-center gap-2 md:text-base text-[13px]`}
    style={{ color: color }}
  >
    {Icon}
    {children}
  </div>
);

const OrderStatus = ({
  status,
  order,
  isPending,
  showModal,
  isOwner,
  handleDeliveryConfirmation,
  t,
  lang,
}) => {
  const langPrefix = lang === "ar" ? "" : "en/";
  const ownerConfig = {
    pending: (
      <div className="flex gap-2">
        <Button
          variant="solid"
          startContent={<RoundedX />}
          className="bg-[#F9D9D9] text-[#F44242] md:px-7 px-4 md:text-sm text-xs"
          onPress={() => showModal(order._id, "cancel")}
          isDisabled={isPending}
        >
          {t("dashboard.requests.rejectOrder")}
        </Button>
        <Button
          variant="solid"
          startContent={<Checked color="#fff" />}
          className="text-white bg-[#4FD658] md:px-7 px-4 md:text-sm text-xs"
          onPress={() => showModal(order._id, "confirm")}
          isDisabled={isPending}
        >
          {t("dashboard.requests.acceptOrder")}
        </Button>
      </div>
    ),
    rejecting: (
      <StatusIndicator color="#F48A42" icon={<RoundedX />}>
        {t("dashboard.orderStatus.processingRejection")}
      </StatusIndicator>
    ),
    confirmed: (
      <Button
        variant="solid"
        endContent={
          <span className="-rotate-45">
            <Send className="md:w-5 md:h-5 w-4 h-4" />
          </span>
        }
        className="text-white bg-[#4FD658] md:px-7 px-4 md:text-sm text-xs"
        onPress={() => handleDeliveryConfirmation(order, isOwner)}
        isDisabled={isPending}
      >
        {t("dashboard.orderStatus.sendReceiptRequest")}
      </Button>
    ),
    received: (
      <div className="flex gap-2">
        <Button
          variant="border"
          startContent={<Report className="md:w-5 md:h-5 w-4 h-4" />}
          className={`${
            order.hasDamageReport
              ? "bg-gray-100 text-gray-500"
              : "bg-[#F9D9D9] text-[#F44242]"
          } rounded-lg md:py-3 py-2 md:px-6 px-4 font-semibold md:text-sm text-xs`}
          as={Link}
          href={
            order.hasDamageReport
              ? `/${langPrefix}dashboard/damage-reports`
              : `/${langPrefix}dashboard/report/${order._id}`
          }
          isDisabled={isPending}
        >
          {order.hasDamageReport
            ? t("dashboard.orderStatus.damageReported")
            : t("dashboard.orderStatus.reportDamage")}
        </Button>
        <StatusIndicator color="#F48A42" icon={<Checked color="#F48A42" />}>
          {t("dashboard.orderStatus.orderDelivered")}
        </StatusIndicator>
      </div>
    ),
    completed: (
      <div className="flex gap-2">
        <Button
          variant="border"
          startContent={<Report className="md:w-5 md:h-5 w-4 h-4" />}
          className={`${
            order.hasDamageReport
              ? "bg-gray-100 text-gray-500"
              : "bg-[#F9D9D9] text-[#F44242]"
          } rounded-lg md:py-3 py-2 md:px-6 px-4 font-semibold md:text-sm text-xs`}
          as={Link}
          href={
            order.hasDamageReport
              ? `/${langPrefix}dashboard/damage-reports`
              : `/${langPrefix}dashboard/report/${order._id}`
          }
          isDisabled={isPending}
        >
          {order.hasDamageReport
            ? t("dashboard.orderStatus.damageReported")
            : t("dashboard.orderStatus.reportDamage")}
        </Button>
        <StatusIndicator color="#4FD658" icon={<Checked />}>
          {t("dashboard.orderStatus.orderCompleted")}
        </StatusIndicator>
      </div>
    ),
    cancelled: (
      <StatusIndicator color="#F44242" icon={<RoundedX />}>
        {t("dashboard.orderStatus.rejected")}
      </StatusIndicator>
    ),
  };
  const customerConfig = {
    "not-paid":
      order.waffyStatus === "PAYMENT_PROCESSING" ? (
        <StatusIndicator
          color="#F48A42"
          icon={
            <svg
              fill="#F48A42"
              className="md:w-5 md:h-5 w-4 h-4"
              version="1.1"
              viewBox="0 0 48 48"
            >
              <path d="M42.3 39.8h-.4V8.2h.4c2.1 0 3.8-1.7 3.8-3.9 0-2.1-1.7-3.9-3.8-3.9H5.7C3.6.4 1.8 2.1 1.8 4.3c0 2.1 1.7 3.9 3.9 3.9h.4v31.6h-.4c-2.1 0-3.9 1.7-3.9 3.8s1.7 3.9 3.9 3.9h36.6c2.1 0 3.8-1.7 3.8-3.9 0-2.1-1.7-3.8-3.8-3.8M20.8 22l-6.5-6.8c-.6-.7-1-1.6-1-2.5V8.2h21.3v4.4c0 .9-.4 1.8-1 2.5L27.2 22c-1.1 1.1-1.1 2.9 0 4 l6.5 6.9c.6.7 1 1.6 1 2.5v4.4H13.4v-4.4c0-.9.4-1.8 1-2.5l6.5-6.8c1-1.2 1-3-.1-4.1m19.1 17.8h-3.2v-4.4c0-1.5-.6-2.8-1.6-3.9l-6.5-6.9c-.3-.3-.3-.9 0-1.2l6.5-6.9c1-1.1 1.6-2.4 1.6-3.9V8.2h3.2zM8.1 8.2h3.2v4.4c0 1.5.6 2.8 1.6 3.9l6.5 6.9c.3.3.3.9 0 1.2l-6.5 6.8c-1 1.1-1.6 2.4-1.6 3.9v4.4H8.1z"></path>
              <path d="m23.1 21.9.9 1.8.9-1.9c.2-.4.5-.8.8-1.2l5.7-6H16.6l5.7 6c.3.4.6.8.8 1.3M15.3 35.4v2.5h17.4v-2.5c0-.4-.2-.9-.5-1.2l-6.5-6.8c-.3-.4-.6-.8-.8-1.2l-.9-1.9-.9 1.8c-.2.4-.5.8-.8 1.2l-6.5 6.8c-.3.4-.5.8-.5 1.3"></path>
            </svg>
          }
        >
          {t("dashboard.orderStatus.paymentProcessing")}
        </StatusIndicator>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="border"
            startContent={<Delete className="md:w-5 md:h-5 w-4 h-4" />}
            className="bg-[#F9D9D9] text-[#F44242] md:px-7 px-4 py-[0.6rem] md:gap-3 gap-1 md:py-4 h-auto md:text-sm text-xs"
            onPress={() => showModal(order._id, "delete")}
            isDisabled={isPending}
          >
            {t("dashboard.orderStatus.deleteOrder")}
          </Button>
          <Button
            variant="solid"
            as={Link}
            href={`/${langPrefix}payment-completed/${order._id}`}
            endContent={
              <span className="-rotate-45">
                <Send className="md:w-5 md:h-5 w-4 h-4" />
              </span>
            }
            className="text-white bg-[#4FD658] md:px-7 px-4 py-[0.6rem] md:gap-3 gap-1 md:py-4 h-auto md:text-sm text-xs"
            isDisabled={isPending}
          >
            {t("dashboard.orderStatus.payNow")}
          </Button>
        </div>
      ),
    pending: (
      <StatusIndicator
        color="#F48A42"
        icon={
          <svg
            fill="#F48A42"
            width={20}
            height={20}
            version="1.1"
            viewBox="0 0 48 48"
          >
            <path d="M42.3 39.8h-.4V8.2h.4c2.1 0 3.8-1.7 3.8-3.9 0-2.1-1.7-3.9-3.8-3.9H5.7C3.6.4 1.8 2.1 1.8 4.3c0 2.1 1.7 3.9 3.9 3.9h.4v31.6h-.4c-2.1 0-3.9 1.7-3.9 3.8s1.7 3.9 3.9 3.9h36.6c2.1 0 3.8-1.7 3.8-3.9 0-2.1-1.7-3.8-3.8-3.8M20.8 22l-6.5-6.8c-.6-.7-1-1.6-1-2.5V8.2h21.3v4.4c0 .9-.4 1.8-1 2.5L27.2 22c-1.1 1.1-1.1 2.9 0 4l6.5 6.9c.6.7 1 1.6 1 2.5v4.4H13.4v-4.4c0-.9.4-1.8 1-2.5l6.5-6.8c1-1.2 1-3-.1-4.1m19.1 17.8h-3.2v-4.4c0-1.5-.6-2.8-1.6-3.9l-6.5-6.9c-.3-.3-.3-.9 0-1.2l6.5-6.9c1-1.1 1.6-2.4 1.6-3.9V8.2h3.2zM8.1 8.2h3.2v4.4c0 1.5.6 2.8 1.6 3.9l6.5 6.9c.3.3.3.9 0 1.2l-6.5 6.8c-1 1.1-1.6 2.4-1.6 3.9v4.4H8.1z"></path>
            <path d="m23.1 21.9.9 1.8.9-1.9c.2-.4.5-.8.8-1.2l5.7-6H16.6l5.7 6c.3.4.6.8.8 1.3M15.3 35.4v2.5h17.4v-2.5c0-.4-.2-.9-.5-1.2l-6.5-6.8c-.3-.4-.6-.8-.8-1.2l-.9-1.9-.9 1.8c-.2.4-.5.8-.8 1.2l-6.5 6.8c-.3.4-.5.8-.5 1.3"></path>
          </svg>
        }
      >
        {t("dashboard.orderStatus.waitingForAcceptance")}
      </StatusIndicator>
    ),
    rejecting: (
      <StatusIndicator color="#F48A42" icon={<RoundedX />}>
        {t("dashboard.orderStatus.processingRejection")}
      </StatusIndicator>
    ),
    confirmed: (
      <Button
        variant="solid"
        endContent={
          <span className="-rotate-45">
            <Send className="md:w-5 md:h-5 w-4 h-4" />
          </span>
        }
        className="text-white bg-[#4FD658] md:px-7 px-4 md:text-sm text-xs"
        onPress={() => handleDeliveryConfirmation(order, isOwner)}
        isDisabled={isPending}
      >
        {t("dashboard.orderStatus.receiveOrder")}
      </Button>
    ),
    received: (
      <StatusIndicator color="#F48A42" icon={<Checked color="#F48A42" />}>
        {t("dashboard.orderStatus.received")}
      </StatusIndicator>
    ),
    completed: (
      <StatusIndicator color="#4FD658" icon={<Checked />}>
        {t("dashboard.orderStatus.orderCompleted")}
      </StatusIndicator>
    ),
    cancelled: (
      <StatusIndicator color="#F44242" icon={<RoundedX />}>
        {t("dashboard.orderStatus.rejected")}
      </StatusIndicator>
    ),
  };

  return (isOwner ? ownerConfig?.[status] : customerConfig?.[status]) || null;
};

export default OrderStatus;
