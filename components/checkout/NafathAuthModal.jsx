"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Spinner,
} from "@heroui/react";
import Button from "../ui/Button";
import { sendGTMEvent } from "@next/third-parties/google";

export default function NafathAuthModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  user,
  trans,
}) {
  const t = (value) => trans(`nafathModal.${value}`);
  const [loading, setLoading] = useState(false);
  const [nationalId, setNationalId] = useState(user?.nationalId || "");
  const [transactionData, setTransactionData] = useState(null);
  const [status, setStatus] = useState("");

  const handleSendRequest = async () => {
    if (!nationalId) return onError?.(t("validation.nationalIdRequired"));

    setLoading(true);
    try {
      const response = await fetch("/api/auth/nafath/send-request?client=true", {
        method: "POST",
        body: JSON.stringify({ nationalId }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.success) {
        setTransactionData(data);
        setStatus("WAITING");
        startPolling(data);
        openNafathApp();
      } else {
        // GTM event: Nafath request failed
        sendGTMEvent({
          event: "nafath_request_failed",
          detail: data.message || data.detail || undefined,
        });
        onError?.(data.message || data.detail || t("errors.requestFailed"));
      }
    } catch (error) {
      // GTM event: Nafath request network error
      sendGTMEvent({ event: "nafath_request_error" });
      onError?.(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const startPolling = ({ transId, random }) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/auth/nafath/check-status?client=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nationalId, transId, random }),
        });

        const statusData = await response.json();
        setStatus(statusData.status);

        if (statusData.status === "COMPLETED") {
          clearInterval(pollInterval);
          // GTM event: Nafath verification succeeded
          sendGTMEvent({ event: "nafath_verification_success" });
          onSuccess?.(statusData);
          onClose();
        } else if (
          statusData.status === "REJECTED" ||
          statusData.status === "EXPIRED"
        ) {
          clearInterval(pollInterval);
          // GTM event: Nafath verification failed
          sendGTMEvent({
            event: "nafath_verification_failed",
            status: statusData.status,
          });
          onError?.(t(`status.${statusData.status.toLowerCase()}`));
          // Reset after 2.5s so user can resend without reloading
          setTimeout(() => {
            setTransactionData(null);
            setStatus("");
          }, 2500);
        }
      } catch (error) {
        clearInterval(pollInterval);
        // GTM event: Nafath status check error
        sendGTMEvent({ event: "nafath_status_check_error" });
        onError?.(t("errors.statusCheckFailed"));
        // Reset so user can retry
        setTimeout(() => {
          setTransactionData(null);
          setStatus("");
        }, 2500);
      }
    }, 4000); // Poll every 4 seconds

    setTimeout(() => {
      clearInterval(pollInterval);
      // GTM event: Nafath verification timeout
      sendGTMEvent({ event: "nafath_verification_timeout" });
      setStatus((prev) => {
        if (prev !== "COMPLETED") {
          onError?.(t("status.expired"));
          // Reset after 2.5s so user can resend
          setTimeout(() => {
            setTransactionData(null);
            setStatus("");
          }, 2500);
          return "EXPIRED";
        }
        return prev;
      });
    }, 180000);
  };

  const openNafathApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) window.location.href = "nafath://home";
    else if (isAndroid) window.location.href = "nic://nafath";
  };

  const getStatusConfig = () => {
    switch (status) {
      case "WAITING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: (
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          text: t("status.waiting"),
        };
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          text: t("status.completed"),
        };
      case "REJECTED":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          text: t("status.rejected"),
        };
      case "EXPIRED":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: (
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          text: t("status.expired"),
        };
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      classNames={{
        base: "bg-white",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent className="overflow-hidden">
        {(onClose) => (
          <>
            {/* Header */}
            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t("title")}</h2>
                  <p className="text-green-100 text-sm">{t("subtitle")}</p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-0">
              {!transactionData ? (
                /* Initial Form */
                <div className="p-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0V4a2 2 0 014 0v2"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("form.enterNationalIdTitle")}
                    </h3>
                    <p className="text-gray-600">
                      {t("form.enterNationalIdDescription")}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      label={t("form.nationalIdLabel")}
                      placeholder={t("form.nationalIdPlaceholder")}
                      value={nationalId}
                      onValueChange={setNationalId}
                      disabled={loading}
                      classNames={{
                        input: "text-lg",
                        inputWrapper:
                          "h-14 border-2 border-gray-200 hover:border-green-400 focus-within:border-green-500",
                      }}
                      startContent={
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0V4a2 2 0 014 0v2"
                          />
                        </svg>
                      }
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          {t("infoBox.title")}
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>{t("infoBox.point1")}</li>
                          <li>{t("infoBox.point2")}</li>
                          <li>{t("infoBox.point3")}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Verification Screen */
                <div className="p-6 space-y-6">
                  {/* Random Number Display */}
                  <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl mb-4">
                      <p className="text-sm font-medium mb-1">
                        {t("verification.randomNumberLabel")}
                      </p>
                      <p className="text-3xl font-bold tracking-wider">
                        {transactionData.random}
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {t("verification.randomNumberDescription")}
                    </p>
                  </div>
                  {/* Status Display */}
                  {status && (
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                        getStatusConfig()?.color
                      }`}
                    >
                      {getStatusConfig()?.icon}
                      <div>
                        <p className="font-medium">{getStatusConfig()?.text}</p>
                        <p className="text-sm opacity-75">Status: {status}</p>
                      </div>
                    </div>
                  )}
                  {/* Instructions */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {t("instructions.title")}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          1
                        </span>
                        <span>{t("instructions.step1")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          2
                        </span>
                        <span>
                          {t("instructions.step2")}:{" "}
                          <strong>{transactionData.random}</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          3
                        </span>
                        <span>{t("instructions.step3")}</span>
                      </div>
                    </div>
                  </div>
                  {/* Waiting State */}
                  {status === "WAITING" && (
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Spinner size="lg" color="success" />
                        </div>
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30 w-16 h-16 mx-auto"></div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {t("waitingState.message")}
                      </p>

                      <Button
                        onClick={openNafathApp}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        <svg
                          className="w-5 h-5 me-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        {t("waitingState.openAppButton")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="flex justify-between items-center w-full">
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="px-6 py-2"
                >
                  {t("buttons.cancel")}
                </Button>
                {!transactionData && (
                  <Button
                    onPress={handleSendRequest}
                    isLoading={loading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {loading ? (
                      t("buttons.sendingRequest")
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 me-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        {t("buttons.authenticate")}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
