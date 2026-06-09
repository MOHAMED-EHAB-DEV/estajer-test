"use client";
import { useState } from "react";
import { Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { Email } from "../ui/svgs/icons/EmailSvg";;
import { useTranslations } from "@/hooks/useTranslations";
import { sendGTMEvent } from "@next/third-parties/google";

export default function ForgotPasswordForm({ lang, translate }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`forgotPasswordPage.${key}`);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data?.error) throw new Error(data.error);

      setMessage({ type: "success", content: t("successMessage") });
      // GTM event: forgot password request
      const domain = (email.split("@")[1] || "").toLowerCase();
      sendGTMEvent({
        event: "reset_password_request",
        email_domain: domain,
        language: lang,
      });
      setTimeout(() => router.push(`/${langPrefix}login`), 3000);
    } catch (err) {
      setMessage({ type: "error", content: err.message || t("genericError") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[650px] max-w-full">
      <div className="text-center mb-14">
        <h1 className="lg:text-[2.2rem] md:text-[1.9rem] text-[1.6rem] font-semibold mb-2 text-darkNavy">
          {t("title")}
        </h1>
        <p className="lg:text-[1.2rem] text-[1rem] text-darkNavy">
          {t("subtitle")}
        </p>
      </div>

      {message.content && (
        <div
          className={`mb-4 p-4 text-center rounded ${
            message.type === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.content}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-10">
          <Input
            isRequired
            startContent={<Email />}
            label={t("emailLabel")}
            labelPlacement="outside"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="!mt-0"
            classNames={{
              mainWrapper: "mt-10",
              label: "text-lg -mt-2 flex items-center",
              base: "max-w-full",
              input: "text-base !ps-4 text-right",
              inputWrapper: "bg-gray-100 h-12",
            }}
          />
        </div>

        <Button
          color="secondary"
          type="submit"
          variant="solid"
          className="w-full font-semibold py-7 mb-6"
          isLoading={isLoading}
        >
          {t("submitButton")}
        </Button>
      </form>
    </div>
  );
}
