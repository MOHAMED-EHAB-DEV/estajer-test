"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Input } from "@heroui/react";
import Link from "next/link";
import Checkbox from "../ui/Checkbox";
import Button from "../ui/Button";
import { Email } from "../ui/svgs/icons/EmailSvg";;
import SocialLinks from "./SocialLinks";
import { sendGTMEvent } from "@next/third-parties/google";

export default function LoginForm({
  lang,
  translate,
  queryMessage,
  queryPage,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`login.${key}`);
  const langPrefix = lang === "ar" ? "" : "en/";
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({
    type: queryMessage === "unauthorized" ? "error" : "",
    content: queryMessage === "unauthorized" ? t("loginFirst") : "",
  });

  // Load saved credentials on component mount
  useEffect(() => {
    // remove the message from the query params

    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errorMsg"));

      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      else localStorage.removeItem("rememberedEmail");

      setMessage({ type: "success", content: t("successMsg") });
      sendGTMEvent({ event: "login", method: "email", location: "login_page" });

      if (queryPage) return (window.location.href = queryPage);
      window.location.href = `/${langPrefix}`;
    } catch (err) {
      console.error(err);
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
          {t("welcomeBack")}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
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
        {/* Email Field */}
        <div className="mb-8">
          <Input
            isRequired
            label={t("emailAddress")}
            labelPlacement="outside"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<Email />}
            placeholder={t("placeholder")}
            classNames={{
              mainWrapper: "mt-8",
              label: "text-lg -mt-2",
              base: "max-w-full",
              input: "text-base !ps-4",
              inputWrapper: "bg-gray-100 h-12",
            }}
            radius="sm"
          />
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <Input
            type={isVisible ? "text" : "password"}
            value={password}
            label={t("password")}
            labelPlacement="outside"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            classNames={{
              mainWrapper: "mt-8",
              label: "text-lg -mt-2",
              base: "max-w-full",
              input: "text-base !ps-4",
              inputWrapper: "bg-gray-100 h-14",
            }}
            endContent={
              <Button
                color="transparent"
                type="button"
                onPress={toggleVisibility}
                className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
              >
                <svg width="30" height="20" viewBox="0 0 30 20" fill="#616161">
                  <path d="M15.0001 6C16.0609 6 17.0784 6.42143 17.8285 7.17157C18.5787 7.92172 19.0001 8.93913 19.0001 10C19.0001 11.0609 18.5787 12.0783 17.8285 12.8284C17.0784 13.5786 16.0609 14 15.0001 14C13.9392 14 12.9218 13.5786 12.1717 12.8284C11.4215 12.0783 11.0001 11.0609 11.0001 10C11.0001 8.93913 11.4215 7.92172 12.1717 7.17157C12.9218 6.42143 13.9392 6 15.0001 6ZM15.0001 16.6667C16.7682 16.6667 18.4639 15.9643 19.7141 14.714C20.9644 13.4638 21.6667 11.7681 21.6667 10C21.6667 8.23189 20.9644 6.5362 19.7141 5.28595C18.4639 4.03571 16.7682 3.33333 15.0001 3.33333C13.232 3.33333 11.5363 4.03571 10.286 5.28595C9.03579 6.5362 8.33341 8.23189 8.33341 10C8.33341 11.7681 9.03579 13.4638 10.286 14.714C11.5363 15.9643 13.232 16.6667 15.0001 16.6667ZM15.0001 0C21.6667 0 27.3601 4.14667 29.6667 10C27.3601 15.8533 21.6667 20 15.0001 20C8.33341 20 2.64008 15.8533 0.333414 10C2.64008 4.14667 8.33341 0 15.0001 0Z" />
                </svg>
              </Button>
            }
            startContent={
              <svg width="30" height="16" viewBox="0 0 30 16" fill="#F48A42">
                <path d="M21.6667 12C20.5556 12 19.6112 11.6111 18.8334 10.8333C18.0556 10.0556 17.6667 9.11111 17.6667 8C17.6667 6.88889 18.0556 5.94444 18.8334 5.16667C19.6112 4.38889 20.5556 4 21.6667 4C22.7779 4 23.7223 4.38889 24.5001 5.16667C25.2779 5.94444 25.6667 6.88889 25.6667 8C25.6667 9.11111 25.2779 10.0556 24.5001 10.8333C23.7223 11.6111 22.7779 12 21.6667 12ZM21.6667 16C23.889 16 25.7779 15.2222 27.3334 13.6667C28.889 12.1111 29.6667 10.2222 29.6667 8C29.6667 5.77778 28.889 3.88889 27.3334 2.33333C25.7779 0.777778 23.889 0 21.6667 0C19.8667 0 18.2943 0.511111 16.9494 1.53333C15.6045 2.55556 14.6659 3.82222 14.1334 5.33333H2.96675L0.333414 7.96667L5.00008 13.3L8.33341 10.6667L11.0001 13.3333L13.6667 10.6667H14.1334C14.689 12.2667 15.6556 13.5556 17.0334 14.5333C18.4112 15.5111 19.9556 16 21.6667 16Z" />
              </svg>
            }
            isRequired
          />
        </div>
        <div className="flex w-full justify-between items-center mb-4">
          <div className="flex justify-end mb-6">
            <Checkbox
              isSelected={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              classNames={{
                base: "flex",
                label: "text-base font-medium ml-2",
              }}
              size="md"
            >
              {t("remember")}
            </Checkbox>
          </div>
          <div className="flex justify-start mb-6">
            <Link
              href={`/${langPrefix}forgot-password`}
              className="text-primary  hover:underline"
              onClick={() =>
                sendGTMEvent({
                  event: "navigation_click",
                  link_text: "forgot_password",
                  location: "login_page",
                })
              }
            >
              {t("forgetPassword")}
            </Link>
          </div>
        </div>

        {/* Login Button */}
        <Button
          color="secondary"
          type="submit"
          variant="solid"
          className="w-full font-semibold py-7 mb-6"
          isLoading={isLoading}
        >
          {t("login")}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center mb-10 text-lg">
          <span className="text-gray-700">{t("doNotHaveAccount")}</span>{" "}
          <Link
            href={`/${langPrefix}register${
              queryPage ? `?page=${queryPage}` : ""
            }`}
            className="text-primary hover:underline"
            onClick={() =>
              sendGTMEvent({
                event: "navigation_click",
                link_text: "new_account",
                location: "login_page",
              })
            }
          >
            {t("newAccount")}
          </Link>
        </div>
      </form>

      {/* Social Media Links */}
      <SocialLinks t={t} />
    </div>
  );
}
