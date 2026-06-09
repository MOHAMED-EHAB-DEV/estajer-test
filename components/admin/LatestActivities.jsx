"use client";

import Link from "next/link";
import {
  Message,
  CheckCircle,
  XCircle,
  Product,
} from "@/components/ui/svgs/Admin";
import { User } from "@/components/ui/svgs/icons/UserSvg";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { useTranslations } from "@/hooks/useTranslations";

// Function to get the appropriate icon based on notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case "message":
      return <Message />;
    case "accepted":
      return <CheckCircle />;
    case "canceled":
      return <XCircle className="text-destructive w-5 h-5" />;
    case "order":
      return <Product />;
    default:
      return <User />;
  }
};

// Function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "اليوم";
  } else if (diffDays === 2) {
    return "أمس";
  } else {
    return date.toLocaleDateString("ar");
  }
};

// Function to format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function LatestActivities({
  translate,
  notifications = [],
  placeholder = false,
  title,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.home.latestActivities.${text}`);
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 md:p-8 flex gap-3 rounded-[10px] flex-col">
      <div className="flex items-center justify-between pb-4 md:pb-6 border-b border-b-black/10">
        <h2 className="text-sm md:text-lg font-IBMPlex font-bold text-right text-darkNavy">
          {title}
        </h2>
        <button className="text-darkNavy font-NotoSansArabic font-semibold text-[11px] md:text-sm underline">
          {t("markAll")}
        </button>
      </div>
      <div className="flex-1 justify-center flex flex-col overflow-y-auto">
        {placeholder ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex relative pl-2 py-2 border-b border-black/10 gap-3 md:gap-5 text-right animate-pulse"
            >
              <div className="pt-1 w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 gap-1 flex flex-col">
                <div className="h-3.5 md:h-4 bg-gray-200 rounded w-3/4 mb-1.5 md:mb-2"></div>
                <div className="h-2.5 md:h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-1 h-full bg-gray-200 absolute left-0 top-0" />
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map((notification, idx) => (
            <div
              key={notification._id || idx}
              className={`flex relative pl-2 py-2 border-b border-black/10 gap-3 md:gap-5 text-right ${
                notification.seen ? "opacity-60" : ""
              }`}
            >
              <div className="pt-1 w-10 h-10 md:w-12 md:h-12 bg-[#E0F9F3] flex items-center justify-center rounded-full">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 gap-1 flex flex-col">
                <div className="text-[11px] md:text-sm font-semibold">
                  {notification.title}
                  {notification.user?.fullName && (
                    <div className="font-bold text-primary">
                      {notification.user.fullName}
                    </div>
                  )}
                </div>
                <p className="text-[10px] md:text-xs text-[#5B5656] font-normal font-NotoSansArabic">
                  {formatDate(notification.createdAt)} |{" "}
                  {formatTime(notification.createdAt)}
                </p>
              </div>
              <div
                className={`w-1 h-full ${
                  notification.seen ? "bg-[#B3B3B3]" : "bg-primary"
                } absolute left-0 top-0`}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{t("noActivities")}</p>
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <Link
          href="#"
          className="text-xs md:text-sm font-semibold text-darkNavy flex items-center gap-1"
        >
          {t("viewAll")}
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
      </div>
    </div>
  );
}
