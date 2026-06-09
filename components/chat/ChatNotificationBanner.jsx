"use client";
import { useState, useEffect } from "react";
import usePushNotifications from "@/hooks/usePushNotifications";



export default function ChatNotificationBanner({ t, isApp }) {
  const { isSubscribed, subscribe } = usePushNotifications({ isApp });
  console.log('isSubscribed: ', isSubscribed);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already confirmed subscribed — hide immediately
    if (isSubscribed) {
      setVisible(false);
      return;
    }

    const isHidden = localStorage.getItem("hideNotificationsChat") === "true";
    if (isHidden) return;

    const snoozeUntil = localStorage.getItem("chatNotificationSnoozeUntil");
    if (snoozeUntil && Date.now() < parseInt(snoozeUntil)) return;

    if (Notification?.permission === "denied") return;
    setVisible(true);
  }, [isSubscribed]);

  if (!visible) return null;

  const dismiss = () => {
    const count = parseInt(localStorage.getItem("chatNotificationDismissCount") || "0");
    const now = Date.now();

    if (count === 0) {
      // 1 day
      localStorage.setItem("chatNotificationSnoozeUntil", (now + 24 * 60 * 60 * 1000).toString());
      localStorage.setItem("chatNotificationDismissCount", "1");
    } else if (count === 1) {
      // 3 days
      localStorage.setItem("chatNotificationSnoozeUntil", (now + 3 * 24 * 60 * 60 * 1000).toString());
      localStorage.setItem("chatNotificationDismissCount", "2");
    } else {
      // Permanent
      localStorage.setItem("hideNotificationsChat", "true");
    }

    setVisible(false);
  };

  const handleEnable = async () => {
    setLoading(true);
    await subscribe({ t: (key) => t(`notifications.model.${key}`) });
    setLoading(false);
    setVisible(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-primary/10 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Bell icon */}
      <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <svg
          className="w-4 h-4 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-darkNavy leading-tight truncate">
          {t("chat.notifyBannerTitle")}
        </p>
        <p className="text-[10px] text-gray-500 leading-tight truncate">
          {t("chat.notifyBannerDesc")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0 px-2">
        <button
          onClick={handleEnable}
          disabled={loading}
          className="text-[11px] font-bold text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? "..." : t("chat.notifyBannerBtn")}
        </button>
        <button
          onClick={dismiss}
          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t("chat.notifyBannerDismiss")}
        </button>
      </div>
    </div>
  );
}
