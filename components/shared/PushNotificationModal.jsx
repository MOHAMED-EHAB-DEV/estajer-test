"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import usePushNotifications from "../../hooks/usePushNotifications";
import { useTranslations } from "@/hooks/useTranslations";
import EnableNotificationsGuide from "./EnableNotificationsGuide";
import { toast } from "@/utils/toast";
import Link from "next/link";
import ToastMessage from "../ui/ToastMessage";

export default function PushNotificationModal({
  translate,
  customer,
  isApp,
  open,
  lang,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`notifications.model.${text}`);
  const { isSubscribed, subscribe, error, disableNotifications } =
    usePushNotifications({ isApp });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
    localStorage.setItem(
      isApp ? "hideNotificationsApp" : "hideNotifications",
      "true",
    );
    if (open)
      toast.success(
        <div className="font-semibold font-NotoSansArabic text-lg text-darkNavy text-opacity-80">
          {t("notificationPreferences")}{" "}
          <Link
            className="underline text-primary py-4"
            href={`/${lang === "ar" ? "" : "en/"}dashboard/settings`}
          >
            {t("linkText")}
          </Link>
        </div>,
      );
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const errorData = await subscribe({ t });
      if (!errorData) {
        setLoading(false);
        onClose();
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setIsOpen(
          !isSubscribed &&
            localStorage.getItem(
              isApp ? "hideNotificationsApp" : "hideNotifications",
            ) !== "true",
        );
      }, 500);
    }
  }, [open, isSubscribed]);
  const notificationHandler = () => {
    if (isSubscribed) {
      disableNotifications();
      toast.success(ToastMessage(t("disabledNotifications")));
    } else setIsOpen(true);
  };
  return (
    <>
      {!open && (
        <Button
          onClick={notificationHandler}
          startContent={
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
              {isSubscribed && (
                <line
                  x1="-2"
                  y1="22"
                  x2="24"
                  y2="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              )}
            </svg>
          }
          className={`px-6 gap-2 py-3 rounded-xl font-semibold ${
            isSubscribed ? "" : "gradient-to-r from-primary to-orange-500"
          }`}
        >
          {isSubscribed ? t("disableNotifications") : t("title")}
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        hideCloseButton
        classNames={{
          base: "bg-transparent shadow-none",
          backdrop: "bg-black/40 backdrop-blur-md",
        }}
      >
        <ModalContent className="overflow-hidden bg-white rounded-3xl shadow-2xl">
          {(onClose) => (
            <>
              {/* Header with Gradient */}
              <ModalHeader className="flex flex-col gap-1 p-0">
                <div className="relative bg-gradient-to-br from-primary via-orange-500 to-orange-500 p-8 overflow-hidden">
                  {/* Animated Background Pattern */}

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                      <svg
                        className="w-7 h-7 text-white"
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
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                        {t("title")}
                      </h2>
                      <p className="text-orange-50 text-sm mt-1">
                        {t("subtitle")}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalHeader>

              {/* Body */}
              {error ? (
                <EnableNotificationsGuide translate={translate} lang={lang} />
              ) : (
                <ModalBody className="p-8">
                  {/* Icon Circle */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-500 rounded-full blur-xl opacity-30" />
                      <div className="relative w-24 h-24 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-12 h-12 text-orange-600"
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
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t("dontMissOut")}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t("getInstantNotifications")}
                    </p>
                  </div>

                  {/* Benefits Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-200/50 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {t("whatYouWillGet")}
                        </h4>
                        <ul className="space-y-2">
                          {customer ? (
                            <>
                              <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">
                                  ✦
                                </span>
                                <span>{t("customer.benefit1")}</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">
                                  ✦
                                </span>
                                <span>{t("customer.benefit2")}</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">
                                  ✦
                                </span>
                                <span>{t("customer.benefit3")}</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">
                                  ✦
                                </span>
                                <span>{t("supplier.benefit1")}</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">
                                  ✦
                                </span>
                                <span>{t("supplier.benefit2")}</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">
                                  ✦
                                </span>
                                <span>{t("supplier.benefit3")}</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">
                                  ✦
                                </span>
                                <span>{t("supplier.benefit4")}</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              )}

              {/* Footer */}
              <ModalFooter className="bg-gradient-to-br from-gray-50 to-slate-50 px-8 py-6 border-t border-gray-200/50">
                <div className="flex gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-300"
                  >
                    {t("maybeLater")}
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>{t("subscribing")}</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
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
                        <span>{t("enableNow")}</span>
                      </>
                    )}
                  </button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
