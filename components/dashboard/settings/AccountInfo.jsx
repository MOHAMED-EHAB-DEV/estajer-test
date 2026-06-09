"use client";
import { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/react";
import Button from "../../ui/Button";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { Email } from "../../ui/svgs/icons/EmailSvg";
import { User } from "../../ui/svgs/icons/UserSvg";
import { UserCard } from "../../ui/svgs/icons/UserCardSvg";
import { Company } from "../../ui/svgs/icons/CompanySvg";
import { Card } from "../../ui/svgs/icons/CardSvg";
import { TaxCode } from "../../ui/svgs/icons/TaxCodeSvg";
import Link from "next/link";
import UserLocation from "./UserLocation";
import { formatNumber, validateNumber } from "@/utils/formatNumber";
import { revalidateWithTag } from "@/actions/revalidateTag";

function FormInput({ ...props }) {
  return (
    <Input
      isRequired
      labelPlacement="outside"
      classNames={{
        mainWrapper: "md:mt-14 mt-10",
        label: "md:text-lg text-base -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: "md:text-base text-sm",
        inputWrapper: "bg-gray-100 h-12",
      }}
      {...props}
    />
  );
}

export default function AccountInfo({ lang, user, setUser, t }) {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    pathName: "",
    location: {},
    bioAr: "",
    bioEn: "",
    companyName: "",
    registerNumber: "",
    taxCode: "",
  });

  useEffect(() => {
    if (user) {
      setUserData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user?.address || "",
        location: user?.location || {},
        pathName: user?.pathName || "",
        bioAr: user?.bioAr || "",
        bioEn: user?.bioEn || "",
        companyName: user?.companyDetails?.companyName || "",
        registerNumber: user?.companyDetails?.registerNumber || "",
        taxCode: user?.companyDetails?.taxCode || "",
      });
    }
  }, [user]);

  const handleInputChange = ({ target: { name, value } }) =>
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

  const revalidateProducts = async () => {
    try {
      const res = await fetch(`/api/products?userId=${user._id}&fields=_id`);
      const data = await res.json();
      if (data.success) {
        await Promise.all(
          data.data.map((product) =>
            revalidateWithTag(`product-${product._id}`),
          ),
        );
      }
    } catch (error) {
      console.error("Error revalidating products:", error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: userData.fullName,
          phone: formatNumber(userData.phone),
          address: userData.address,
          pathName: userData.pathName,
          bioAr: userData.bioAr,
          bioEn: userData.bioEn,
          location: userData.location,
          companyName: userData.companyName,
          registerNumber: userData.registerNumber,
          taxCode: userData.taxCode,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || t("accountInfo.error"));
      setUser(result.data);
      toast.success(ToastMessage(t("accountInfo.updateSuccess")));
      await revalidateProducts();
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:p-10 p-4 bg-white md:mb-6 mb-4 rounded-lg">
      <h2 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.05rem] font-semibold text-darkNavy font-IBMPlex mb-1 md:mt-0 mt-1">
        {t("accountInfo.title")}
      </h2>
      <form onSubmit={updateProfile} className="mb-4">
        <div className="flex flex-col md:flex-row md:gap-4 gap-1 w-full">
          <div className="w-full md:w-1/2">
            <FormInput
              label={t("accountInfo.fullName")}
              name="fullName"
              onChange={handleInputChange}
              value={userData.fullName}
              placeholder={t("accountInfo.fullNamePlaceholder")}
              startContent={<User />}
            />
          </div>
          <div className="w-full md:w-1/2">
            <FormInput
              label={t("accountInfo.username")}
              name="pathName"
              onChange={handleInputChange}
              value={userData.pathName}
              placeholder={t("accountInfo.usernamePlaceholder")}
              startContent={<User />}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:gap-4 gap-1 w-full">
          <div className="w-full md:w-1/2">
            <FormInput
              label={t("accountInfo.email")}
              name="email"
              onChange={handleInputChange}
              value={userData.email}
              placeholder={t("accountInfo.emailPlaceholder")}
              startContent={<Email />}
              isDisabled
            />
          </div>
          <div className="w-full md:w-1/2">
            <FormInput
              label={t("accountInfo.phone")}
              name="phone"
              onChange={handleInputChange}
              value={userData.phone}
              placeholder={t("accountInfo.phonePlaceholder")}
              validate={(value) =>
                !validateNumber(value) && t("accountInfo.invalidPhoneError")
              }
              isDisabled
            />
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {t("accountInfo.contactAdminNote")}{" "}
          <Link
            href={`/${lang === "ar" ? "" : "en/"}contact`}
            className="text-primary hover:underline"
          >
            {t("accountInfo.contactForm")}
          </Link>
          .
        </div>

        {/* Company fields - only show if user account type is company */}
        {user?.accountType === "company" && (
          <>
            <div className="flex flex-col md:flex-row md:gap-4 gap-1 w-full">
              <div className="w-full md:w-1/2">
                <FormInput
                  label={t("accountInfo.companyName")}
                  name="companyName"
                  onChange={handleInputChange}
                  value={userData.companyName}
                  placeholder={t("accountInfo.companyNamePlaceholder")}
                  startContent={<Company />}
                />
              </div>
              <div className="w-full md:w-1/2">
                <FormInput
                  label={t("accountInfo.registerNumber")}
                  name="registerNumber"
                  onChange={handleInputChange}
                  value={userData.registerNumber}
                  placeholder={t("accountInfo.registerNumberPlaceholder")}
                  startContent={<Card />}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:gap-4 gap-1 w-full">
              <div className="w-full md:w-1/2">
                <FormInput
                  isRequired={false}
                  label={t("accountInfo.taxCode")}
                  name="taxCode"
                  onChange={handleInputChange}
                  value={userData.taxCode}
                  placeholder={t("accountInfo.taxCodePlaceholder")}
                  startContent={<TaxCode />}
                />
              </div>
            </div>
          </>
        )}

        <div className="w-full">
          <Textarea
            labelPlacement="outside"
            label={
              <span>
                {t("accountInfo.bio")} (العربية){" "}
                <Link className="text-primary" href={`/`}>
                  {t("accountInfo.bioLinkText")}
                </Link>
              </span>
            }
            name="bioAr"
            onChange={handleInputChange}
            value={userData.bioAr}
            placeholder={t("accountInfo.bioPlaceholder")}
            startContent={<UserCard />}
            classNames={{
              label: "text-lg -mt-2 flex items-center",
              base: "max-w-full !mt-6",
              input: "resize-y min-h-[100px] text-base",
              inputWrapper: "bg-gray-100 min-h-[100px]",
            }}
          />
        </div>
        <div className="w-full">
          <Textarea
            labelPlacement="outside"
            label={
              <span>
                {t("accountInfo.bio")} (English){" "}
                <Link className="text-primary" href={`/`}>
                  {t("accountInfo.bioLinkText")}
                </Link>
              </span>
            }
            name="bioEn"
            onChange={handleInputChange}
            value={userData.bioEn}
            placeholder={t("accountInfo.bioPlaceholder")}
            startContent={<UserCard />}
            classNames={{
              label: "text-lg -mt-2 flex items-center",
              base: "max-w-full !mt-6",
              input: "resize-y min-h-[100px] text-base",
              inputWrapper: "bg-gray-100 min-h-[100px]",
            }}
          />
        </div>
        <div className="w-full mt-4">
          <div className="md:text-lg text-base mb-2">
            {t("accountInfo.address")}
          </div>
          <UserLocation
            lang={lang}
            address={userData.address}
            setAddress={(address) =>
              setUserData((prev) => ({ ...prev, address }))
            }
            markerPosition={userData.location}
            setMarkerPosition={(location) =>
              setUserData((prev) => ({ ...prev, location }))
            }
          />
        </div>
        <div className="text-end md:mt-10 mt-4">
          <Button
            isLoading={isLoading}
            type="submit"
            className="md:py-6 py-4 min-w-52 md:text-lg text-base font-IBMPlex"
          >
            {t("accountInfo.updateButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}
