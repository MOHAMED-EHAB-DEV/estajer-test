"use client";

import { useState } from "react";
import { Input } from "@heroui/react";
import Button from "@/components/ui/Button";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { sendGTMEvent } from "@next/third-parties/google";

export default function ConfirmAccount({ translate, lang, queryPage }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const t = (key) => trans(`confirmAccountPage.${key}`);

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendState, setResendState] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      setError(t("errorInvalidCode"));
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errorGeneral"));
      // GTM event: verify email via code submission
      sendGTMEvent({
        event: "verify_email_submit",
        code_length: code?.length || 0,
        language: lang,
        redirect_to: queryPage || `/${langPrefix}`,
      });
      // Redirect to home page or dashboard
      if (queryPage) return (window.location.href = queryPage);

      window.location.href = `/${langPrefix}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setResendState(null);

    try {
      const res = await fetch("/api/resend-code");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setResendState({ success: true, message: data.message });
      // GTM event: resend verification code
      sendGTMEvent({
        event: "verify_email_resend",
        language: lang,
      });

      // Start countdown for 60 seconds
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResendState({ error: err.message });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/user/offline", { method: "POST" });
      const res = await fetch("/api/logout");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errorGeneral"));
      toast.success(ToastMessage(t("logoutSuccess")));
      // GTM event: logout from confirm email page
      sendGTMEvent({
        event: "logout",
        source: "confirm_email_page",
        language: lang,
      });
      window.location.href = `/${langPrefix}`;
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full space-y-12 p-10 bg-white rounded-2xl shadow-lg relative">
        <Button
          onPress={handleLogout}
          className="absolute top-4 end-4 text-sm text-gray-600 hover:text-red-600"
          color="transparent"
          isLoading={isLoggingOut}
          size="sm"
        >
          {t("logout")}
        </Button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h2>
          <p className="text-gray-600">{t("instructions")}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            isRequired
            label={t("codeInputLabel")}
            labelPlacement="outside"
            size="lg"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full"
            placeholder={t("codeInputPlaceholder")}
          />

          {error && (
            <div className="p-4 mb-4 text-sm rounded-lg bg-red-50 text-red-500">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 me-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-white"
            isLoading={isLoading}
          >
            {t("submitButton")}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">{t("didNotReceiveCode")}</p>
            <Button
              color="transparent"
              onPress={handleResendCode}
              isDisabled={isResending || countdown > 0}
              className="text-primary hover:underline font-medium disabled:opacity-50"
            >
              {countdown > 0
                ? t("resendButtonCountdown").replace("{countdown}", countdown)
                : t("resendButton")}
            </Button>

            {resendState?.success && (
              <p className="mt-2 text-green-600 text-sm">
                {t("resendSuccessMessage")}
              </p>
            )}

            {resendState?.error && (
              <p className="mt-2 text-red-600 text-sm">{t("errorGeneral")}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
