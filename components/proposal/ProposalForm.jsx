"use client";

import { Input, Textarea } from "@/components/ui/Input";
import Button from "../ui/Button";
import { useState } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import ImageUploader from "@/components/addProduct/ImageUploader";
import { useUser } from "@/context/UserContext";

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

export default function ProposalForm({ lang, t, translate, sm, data }) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: data?.name || user?.fullName || "",
    title: data?.title || "",
    phone: user?.phone || "",
    email: user?.email || "",
    description: data?.description || "",
    pdfLink: "",
    budget: 0,
  });
  const [proposalImages, setProposalImages] = useState([]);

  const handleChange = ({ target: { name, value } }) =>
    setFormData({
      ...formData,
      [name]: value,
    });

  const submitForm = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch("/api/proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        proposalImages,
      }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success(ToastMessage(t("success")));
          // Track proposal form submission
          setFormData({
            name: "",
            phone: "",
            email: "",
            description: "",
            pdfLink: "",
            budget: 0,
            title: "",
          });
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
      <form onSubmit={submitForm} className="flex flex-col gap-4">
        <div className={`grid ${sm ? "gap-2" : "gap-4 md:grid-cols-3"} w-full`}>
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
            label={t("phone")}
            name="phone"
            onChange={handleChange}
            value={formData.phone}
            placeholder={t("phonePlaceholder")}
            minLength={2}
            type="text"
            dir="ltr"
            sm={sm}
          />
          <FormInput
            dir="ltr"
            label={t("email")}
            name="email"
            placeholder={t("emailPlaceholder")}
            onChange={handleChange}
            value={formData.email}
            type="email"
            sm={sm}
          />
        </div>

        <div className="w-full">
          <FormInput
            label={t("titleInput")}
            name="title"
            placeholder={t("titlePlaceholder")}
            onChange={handleChange}
            value={formData.title}
            type="text"
            sm={sm}
          />
        </div>

        <Textarea
          size={sm ? "sm" : "lg"}
          radius="sm"
          isRequired
          label={t("descriptionOfProposal")}
          labelPlacement="outside"
          name="description"
          onChange={handleChange}
          value={formData.description}
          placeholder={t("descriptionOfProposalPlaceholder")}
          type="text"
          minLength={20}
          classNames={{
            input: sm
              ? "resize-y min-h-[110px] text-sm"
              : "resize-y min-h-[150px] text-base",
            label: sm
              ? "text-sm pb-2 flex items-center"
              : "text-lg pb-3 flex items-center",
          }}
        />

        <div className="w-full">
          <FormInput
            label={t("budget")}
            name="budget"
            placeholder={t("budgetPlaceholder")}
            onChange={handleChange}
            value={formData.budget}
            type="number"
            min={0}
            isRequired={false}
            sm={sm}
          />
        </div>

        <div className={`w-full flex flex-col gap-4 ${sm ? "mt-8" : "mt-14"}`}>
          <label
            className={`${sm ? "text-sm" : "text-lg"} font-NotoSansArabic`}
          >
            {t("imgLabel")}
          </label>
          <ImageUploader
            lang={lang}
            files={proposalImages}
            setFiles={setProposalImages}
            translate={translate}
            proposal={true}
            sm={sm}
          />
        </div>

        <div className="w-full">
          <FormInput
            dir="ltr"
            label={t("pdfLink")}
            name="pdfLink"
            placeholder={t("pdfPlaceholder")}
            onChange={handleChange}
            value={formData.pdfLink}
            type="url"
            isRequired={false}
            sm={sm}
          />
        </div>

        <div className={`${sm ? "mt-8" : "mt-10 mb-10"} text-center`}>
          <Button
            isLoading={isLoading}
            type="submit"
            className={`${sm ? "py-4 min-w-48 text-base" : "py-7 min-w-60 text-xl"} font-IBMPlex`}
          >
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
