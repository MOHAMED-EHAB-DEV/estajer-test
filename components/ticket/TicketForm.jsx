"use client";

import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import Button from "../ui/Button";
import { useState } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import ImageUploader from "@/components/addProduct/ImageUploader";
import { sendGTMEvent } from "@next/third-parties/google";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";

function FormInput({ sm, ...props }) {
  const size = sm ? "sm" : "md";
  return (
    <Input
      isRequired
      labelPlacement="outside"
      radius="sm"
      size={size}
      classNames={{
        mainWrapper: sm ? "mt-6" : "mt-10",
        label: sm
          ? "text-sm -mt-1 flex items-center"
          : "text-lg -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: sm ? "text-sm" : "text-base",
        inputWrapper: sm ? "bg-gray-100 h-10" : "bg-gray-100 h-12",
      }}
      {...props}
    />
  );
}

export default function TicketForm({ lang, t, translate, sm, data }) {
  const { user, visitorId } = useUser();
  const subjectOptions = [
    { key: "general", label: t("subjectOptions.general") },
    { key: "support", label: t("subjectOptions.support") },
    { key: "feedback", label: t("subjectOptions.feedback") },
    { key: "subscription", label: t("subjectOptions.subscription") },
    { key: "upgrade", label: t("subjectOptions.upgrade") },
    { key: "other", label: t("subjectOptions.other") },
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: data?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    subject: data?.subject || "",
    message: data?.question || "",
  });
  const [ticketImages, setTicketImages] = useState([]);

  const handleChange = ({ target: { name, value } }) =>
    setFormData({
      ...formData,
      [name]: value,
    });

  const handleSubjectChange = ({ target: { value } }) =>
    setFormData({
      ...formData,
      subject: value,
    });

  const submitForm = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang,
        ...formData,
        subject: subjectOptions.find(
          (option) => option.key === formData.subject,
        ).key,
        ticketImages,
        visitorId,
      }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success(ToastMessage(t("success")));
          sendGTMEvent({
            event: "form_submission",
            form_name: "contact_form",
            subject:
              subjectOptions.find((option) => option.key === formData.subject)
                ?.label || "",
            has_images: ticketImages.length > 0,
          });
          setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
          });
          if (user) redirect("/dashboard/tickets");
        } else toast.error(ToastMessage(t("error")));
      })
      .catch((err) => {
        console.error(err);
        toast.error(ToastMessage(t("error")));
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="w-full">
      <form onSubmit={submitForm}>
        <div
          className={`grid ${sm ? "gap-2" : "gap-4  md:grid-cols-3"} w-full`}
        >
          <FormInput
            label={t("name")}
            name="name"
            onChange={handleChange}
            value={formData.name}
            placeholder={t("namePlaceholder")}
            minLength={2}
            type="text"
            sm={sm}
          />
          <FormInput
            dir={lang === "ar" ? "rtl" : "ltr"}
            label={t("phone")}
            name="phone"
            onChange={handleChange}
            value={formData.phone}
            placeholder={t("phonePlaceholder")}
            type="tel"
            sm={sm}
          />
          <FormInput
            label={t("email")}
            name="email"
            placeholder={t("emailPlaceholder")}
            onChange={handleChange}
            value={formData.email}
            type="email"
            sm={sm}
          />
        </div>

        <div className={`w-full ${sm ? "mt-10" : "mt-14"}`}>
          <Select
            label={t("subject")}
            classNames={{ label: sm ? "text-sm -mt-1" : "text-lg -mt-2" }}
            size={sm ? "sm" : "lg"}
            isRequired
            radius="sm"
            selectedKeys={formData.subject ? [formData.subject] : []}
            disallowEmptySelection
            onChange={handleSubjectChange}
            labelPlacement="outside"
            placeholder={t("subject")}
          >
            {subjectOptions.map((option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            ))}
          </Select>
        </div>

        <Textarea
          size={sm ? "sm" : "lg"}
          radius="sm"
          isRequired
          label={t("message")}
          labelPlacement="outside"
          name="message"
          onChange={handleChange}
          value={formData.message}
          placeholder={t("messagePlaceholder")}
          type="text"
          dir={lang === "ar" ? "rtl" : "ltr"}
          minLength={20}
          classNames={{
            base: "mt-6",
            input: sm
              ? "resize-y min-h-[110px] text-sm"
              : "resize-y min-h-[150px] text-base",
            label: sm
              ? "text-sm pb-2 flex items-center"
              : "text-lg pb-3 flex items-center",
          }}
        />

        <div
          className={`w-full flex flex-col ${
            sm ? "gap-3 mt-8" : "gap-4 mt-14"
          }`}
        >
          <label
            className={`${sm ? "text-sm" : "text-lg"} font-NotoSansArabic`}
          >
            {t("image")}
          </label>
          <ImageUploader
            lang={lang}
            files={ticketImages}
            setFiles={setTicketImages}
            translate={translate}
            proposal={true}
            isThumbnail={true}
            sm={sm}
          />
        </div>

        <div className={`${sm ? "mt-8" : "my-10"} text-center`}>
          <Button
            isLoading={isLoading}
            type="submit"
            className={`${
              sm ? "py-4 min-w-48 text-base" : "py-7 min-w-60 text-xl"
            } font-IBMPlex`}
          >
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
