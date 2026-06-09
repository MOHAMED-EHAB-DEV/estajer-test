"use client";
import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Input } from "@heroui/input";
import Link from "next/link";
import Checkbox from "../ui/Checkbox";
import Button from "../ui/Button";
import { Email } from "../ui/svgs/icons/EmailSvg";
import { Eye } from "../ui/svgs/icons/EyeSvg";
import { Key } from "../ui/svgs/icons/KeySvg";
import { User } from "../ui/svgs/icons/UserSvg";
import { UserCircle } from "../ui/svgs/icons/UserCircleSvg";
import { Building } from "../ui/svgs/icons/BuildingSvg";
import { Company } from "../ui/svgs/icons/CompanySvg";
import { Card } from "../ui/svgs/icons/CardSvg";
import { TaxCode } from "../ui/svgs/icons/TaxCodeSvg";
import { formatNumber, validateNumber } from "@/utils/formatNumber";
import SocialLinks from "./SocialLinks";
import { sendGTMEvent } from "@next/third-parties/google";
import {
  checkFreelanceCertificate,
  validateNationalId,
  validateCertificateNumber,
  isCertificateActive,
} from "@/lib/freelance";

function FormInput({ ...props }) {
  return (
    <Input
      isRequired
      labelPlacement="outside"
      className="!mt-0"
      classNames={{
        mainWrapper: "mt-10",
        label: "text-lg -mt-2 flex items-center",
        base: "max-w-full",
        input: "text-base !ps-4 text-right",
        inputWrapper: "bg-gray-100 h-12",
      }}
      {...props}
    />
  );
}

export default function RegisterForm({ lang, translate, queryPage }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const t = (key) => trans(`register.${key}`);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState("personal");
  const [isRenter, setIsRenter] = useState("true");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [freelanceVerification, setFreelanceVerification] = useState(null);
  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const handleInputChange = ({ target: { name, value } }) =>
    setData((prevData) => ({ ...prevData, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms)
      return setMessage({
        type: "error",
        content: t("agreeToTermsError"),
      });

    setIsLoading(true);
    setMessage({ type: "", content: "" });
    setFreelanceVerification(null);

    try {
      const phone = formatNumber(data.phone);

      // Freelance certificate verification
      let freelanceResult = null;
      if (accountType === "freelanceDocument" && data.documentCode) {
        // Client-side validation
        if (!data.nationalId || !validateNationalId(data.nationalId)) {
          setMessage({
            type: "error",
            content: t("invalidNationalIdError"),
          });
          return setIsLoading(false);
        }

        if (!validateCertificateNumber(data.documentCode)) {
          setMessage({ type: "error", content: t("invalidDocumentCodeError") });
          return setIsLoading(false);
        }

        try {
          freelanceResult = await checkFreelanceCertificate({
            nationalId: data.nationalId,
            certificateNumber: data.documentCode,
          });

          setFreelanceVerification(freelanceResult);

          if (!isCertificateActive(freelanceResult.status)) {
            setMessage({
              type: "error",
              content: t("certificateNotActive"),
            });
            return setIsLoading(false);
          }
        } catch (certError) {
          setMessage({
            type: "error",
            content: certError.message || t("certificateVerificationFailed"),
          });
          return setIsLoading(false);
        }
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          ...data,
          isRenter: isRenter === "true",
          phone,
          accountType:
            accountType === "freelanceDocument" ? "personal" : accountType,
          ...(accountType === "freelanceDocument" && data.documentCode
            ? {
                documentCode: data.documentCode,
                nationalId: data.nationalId,
                freelanceCertificate: freelanceResult,
              }
            : {}),
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || t("errorMsg"));

      setMessage({ type: "success", content: t("accountCreatedSuccess") });
      sendGTMEvent({
        event: "sign_up",
        account_type: accountType,
        location: "register_page",
      });
      window.location.href = `/${langPrefix}confirm-account${
        queryPage ? `?page=${queryPage}` : ""
      }`;
    } catch (err) {
      setMessage({ type: "error", content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[650px] max-w-full md:py-10 py-8">
      <div className="text-center mb-8  ">
        <h1 className="lg:text-[2.2rem] md:text-[1.9rem] text-[1.6rem] font-semibold mb-2 text-darkNavy">
          {t("title")}
        </h1>
        <p className="lg:text-[1.1rem] text-[1rem] text-darkNavy">
          {t("welcomeMessage")}
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
        {/* Account Type Selection */}
        <div className="mb-8 flex flex-wrap md:gap-8 gap-4">
          <Checkbox
            isSelected={accountType === "personal" ? true : false}
            onChange={(e) => setAccountType(e.target.value)}
            value="personal"
            radius="full"
            disabled={isLoading}
            classNames={
              accountType === "personal"
                ? {
                    base: "bg-primary rounded-xl transition-colors md:px-5 px-4 md:py-3 py-2",
                    icon: "text-primary bg-white h-full w-full p-0.5",
                    wrapper: "bg-white",
                    label: "text-white",
                  }
                : {
                    base: "bg-white rounded-xl transition-colors md:px-5 px-4 md:py-3 py-2",
                  }
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{t("accountTypePersonal")}</span>
            </div>
          </Checkbox>
          <Checkbox
            isSelected={accountType === "company" ? true : false}
            onChange={(e) => setAccountType(e.target.value)}
            value="company"
            radius="full"
            disabled={isLoading}
            classNames={
              accountType === "company"
                ? {
                    base: "bg-primary rounded-xl transition-colors md:px-5 px-4 md:py-3 py-2",
                    icon: "text-primary bg-white h-full w-full p-0.5",
                    wrapper: "bg-white",
                    label: "text-white",
                  }
                : {
                    base: "bg-white rounded-xl transition-colors md:px-5 px-4 md:py-3 py-2",
                  }
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{t("accountTypeCompany")}</span>
            </div>
          </Checkbox>
          <Checkbox
            isSelected={accountType === "freelanceDocument" ? true : false}
            onChange={(e) => setAccountType(e.target.value)}
            value="freelanceDocument"
            radius="full"
            disabled={isLoading}
            classNames={
              accountType === "freelanceDocument"
                ? {
                    base: "bg-primary rounded-xl transition-colors md:px-5 px-4 md:py-3 py-2",
                    icon: "text-primary bg-white h-full w-full p-0.5",
                    wrapper: "bg-white",
                    label: "text-white",
                  }
                : {
                    base: "bg-white rounded-xl transition-colors md:px-5 px-4 md:py-3 py-2",
                  }
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {t("accountTypeFreelanceDocument")}
              </span>
            </div>
          </Checkbox>
        </div>

        {accountType === "company" && (
          <>
            <div className="mb-6">
              <FormInput
                type="text"
                value={data.companyName || ""}
                name="companyName"
                label={t("companyNameLabel")}
                placeholder={t("companyNamePlaceholder")}
                startContent={<Company />}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            <div className="mb-6 flex flex-wrap gap-6">
              <FormInput
                type="text"
                value={data.registerNumber || ""}
                name="registerNumber"
                label={t("registerNumberLabel")}
                placeholder="xxxxxxxxx"
                startContent={<Card />}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <FormInput
                isRequired={false}
                type="text"
                value={data.taxCode || ""}
                name="taxCode"
                label={t("taxCodeLabel")}
                placeholder="xxxxxxxxxx"
                startContent={<TaxCode />}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {accountType === "freelanceDocument" && (
          <>
            <div className="mb-6">
              <FormInput
                type="text"
                value={data.nationalId || ""}
                name="nationalId"
                label={t("nationalIdLabel")}
                placeholder={t("nationalIdPlaceholder")}
                startContent={<Card />}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={10}
                validate={(value) =>
                  value &&
                  !validateNationalId(value) &&
                  t("invalidNationalIdError")
                }
              />
            </div>
            <div className="mb-6">
              <FormInput
                type="text"
                value={data.documentCode || ""}
                name="documentCode"
                label={t("documentCodeLabel")}
                placeholder={t("documentCodePlaceholder")}
                startContent={<Key />}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={12}
                validate={(value) =>
                  value &&
                  !validateCertificateNumber(value) &&
                  t("invalidDocumentCodeError")
                }
              />
            </div>
            {freelanceVerification && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
                  isCertificateActive(freelanceVerification.status)
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <span className="text-lg">
                  {isCertificateActive(freelanceVerification.status)
                    ? "✅"
                    : "❌"}
                </span>
                <div>
                  <p className="font-medium">
                    {t("certificateStatus")}: {freelanceVerification.status}
                  </p>
                  {freelanceVerification.expiryDate && (
                    <p className="text-xs mt-1">
                      {t("certificateExpiry")}:{" "}
                      {freelanceVerification.expiryDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {/* Full Name Field */}
        <div className="mb-6">
          <FormInput
            label={t("fullNameLabel")}
            type="text"
            value={data.fullName || ""}
            name="fullName"
            onChange={handleInputChange}
            placeholder={t("fullNamePlaceholder")}
            startContent={<User color="#F48A42" />}
            disabled={isLoading}
          />
        </div>
        {/* Email Field */}
        <div className="mb-6 flex flex-wrap gap-6">
          <FormInput
            label={t("emailLabel")}
            validate={(value) =>
              !value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i) &&
              t("invalidEmailError")
            }
            type="email"
            value={data.email || ""}
            name="email"
            onChange={handleInputChange}
            placeholder={t("emailPlaceholder")}
            startContent={<Email />}
            disabled={isLoading}
          />
          <FormInput
            label={t("phoneLabel")}
            type="tel"
            value={data.phone || ""}
            onChange={handleInputChange}
            name="phone"
            placeholder="05xxxxxxxxx"
            disabled={isLoading}
            validate={(value) =>
              !validateNumber(value) && t("invalidPhoneError")
            }
          />
          <div className="flex items-center gap-1.5 -mt-4 text-xs px-2 text-gray-500">
            <svg
              className="w-3.5 h-3.5 text-primary flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p>{t("whatsappVerificationNotice")}</p>
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-4 flex flex-wrap gap-6">
          <FormInput
            validate={(value) =>
              !value?.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) &&
              t("passwordValidationError")
            }
            label={t("passwordLabel")}
            type={isPasswordVisible ? "text" : "password"}
            value={data.password || ""}
            name="password"
            onChange={handleInputChange}
            placeholder="*******"
            disabled={isLoading}
            endContent={
              <Button
                color="transparent"
                onPress={togglePasswordVisibility}
                className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
              >
                <Eye />
              </Button>
            }
            startContent={<Key />}
          />
          <FormInput
            label={t("confirmPasswordLabel")}
            errorMessage={t("passwordsDoNotMatchError")}
            validate={(value) =>
              data.password !== value && t("passwordsDoNotMatchError")
            }
            name="confirmPassword"
            type={isPasswordVisible ? "text" : "password"}
            value={data.confirmPassword || ""}
            onChange={handleInputChange}
            placeholder="*******"
            disabled={isLoading}
            endContent={
              <Button
                color="transparent"
                onPress={togglePasswordVisibility}
                className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
              >
                <Eye />
              </Button>
            }
            startContent={<Key />}
          />
        </div>
        {/* Role Selection */}
        <div className="mb-8">
          <label className="text-lg font-medium mb-3 block">
            {t("roleLabel")}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsRenter("true")}
              className={`relative md:p-3 p-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${
                isRenter === "true"
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                  : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRenter === "true"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <UserCircle />
              </div>
              <span
                className={`font-semibold transition-colors ${
                  isRenter === "true" ? "text-primary" : "text-gray-700"
                }`}
              >
                {t("renter")}
              </span>
              {isRenter === "true" && (
                <div className="absolute top-2 end-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="white"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsRenter("false")}
              className={`flex items-center gap-2 relative md:p-3 p-3 rounded-xl border-2 transition-all duration-300 ${
                isRenter === "false"
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                  : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRenter === "false"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Building />
              </div>
              <span
                className={`font-semibold transition-colors ${
                  isRenter === "false" ? "text-primary" : "text-gray-700"
                }`}
              >
                {t("landlord")}
              </span>
              {isRenter === "false" && (
                <div className="absolute top-2 end-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="white"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex flex-wrap items-center mb-8">
          <Checkbox
            checked={agreeToTerms}
            onChange={() => setAgreeToTerms(!agreeToTerms)}
            classNames={{
              base: "flex",
              label: "text-base font-medium mr-2",
            }}
            size="md"
            isRequired
            disabled={isLoading}
          >
            {t("agreeToTermsCheckbox")}{" "}
          </Checkbox>
          <Link
            href={`/${langPrefix}terms-of-use`}
            className="text-primary hover:underline p-2"
            onClick={() =>
              sendGTMEvent({
                event: "navigation_click",
                link_text: "terms_of_use",
                location: "register_page",
              })
            }
          >
            {t("termsOfUseLink")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            href={`/${langPrefix}privacy`}
            className="text-primary hover:underline p-2"
            onClick={() =>
              sendGTMEvent({
                event: "navigation_click",
                link_text: "privacy_policy",
                location: "register_page",
              })
            }
          >
            {t("privacyPolicyLink")}
          </Link>
        </div>

        {/* Register Button */}
        <Button
          color="secondary"
          variant="solid"
          type="submit"
          className="w-full font-semibold py-7 mb-8 bg-darkNavy"
          isLoading={isLoading}
        >
          {t("createAccountButton")}
        </Button>

        {/* Login Link */}
        <div className="text-center mb-10 text-lg">
          <span className="text-gray-700">{t("alreadyHaveAccount")}</span>{" "}
          <Link
            className="text-primary hover:underline"
            href={`/${langPrefix}login${queryPage ? `?page=${queryPage}` : ""}`}
            onClick={() =>
              sendGTMEvent({
                event: "navigation_click",
                link_text: "login",
                location: "register_page",
              })
            }
          >
            {t("loginLink")}
          </Link>
        </div>
      </form>
      {/* Social Media Links */}
      <SocialLinks t={t} />
    </div>
  );
}
