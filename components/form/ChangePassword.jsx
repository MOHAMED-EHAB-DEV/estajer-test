"use client";
import { useState, useEffect } from "react";
import { Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { Eye } from "../ui/svgs/icons/EyeSvg";
import { Key } from "../ui/svgs/icons/KeySvg";;
import { useTranslations } from "@/hooks/useTranslations";
import { sendGTMEvent } from "@next/third-parties/google";

export default function ChangePasswordForm({ lang, translate }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`changePasswordPage.${key}`);
  const [searchParams, setSearchParams] = useState("");
  
  useEffect(() => {
    setSearchParams(window.location.search);
  }, []);
  
  const token = new URLSearchParams(searchParams).get("token");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, lang }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t("genericError"));

      setMessage({ type: "success", content: t("successMessage") });
      // GTM event: change password submission
      sendGTMEvent({
        event: "change_password_submit",
        token_present: !!token,
        password_length: password?.length || 0,
        language: lang,
      });
      setTimeout(() => router.push(`/${langPrefix}login`), 3000);
    } catch (err) {
      setMessage({ type: "error", content: err.message });
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
        <div className="mb-8">
          <Input
            validate={(value) =>
              !value?.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) &&
              t("passwordValidation")
            }
            labelPlacement="outside"
            placeholder="*******"
            startContent={<Key />}
            isRequired
            type={isPasswordVisible ? "text" : "password"}
            label={t("newPasswordLabel")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endContent={
              <Button
                color="transparent"
                onPress={togglePasswordVisibility}
                className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
              >
                <Eye />
              </Button>
            }
            classNames={{
              mainWrapper: "mt-8",
              label: "text-lg -mt-2",
              base: "max-w-full",
              input: "text-base !ps-4",
              inputWrapper: "bg-gray-100 h-12",
            }}
          />
        </div>

        <div className="mb-8">
          <Input
            isRequired
            type={isPasswordVisible ? "text" : "password"}
            label={t("confirmPasswordLabel")}
            placeholder="*******"
            labelPlacement="outside"
            validate={(value) => password !== value && t("passwordMismatch")}
            endContent={
              <Button
                color="transparent"
                onPress={togglePasswordVisibility}
                className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
              >
                <Eye />
              </Button>
            }
            value={confirmPassword}
            startContent={<Key />}
            onChange={(e) => setConfirmPassword(e.target.value)}
            classNames={{
              mainWrapper: "mt-8",
              label: "text-lg -mt-2",
              base: "max-w-full",
              input: "text-base !ps-4",
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
