"use client";

import { Input, Textarea } from "@heroui/react";
import Button from "../ui/Button";
import { useState } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import ImageUploader from "@/components/addProduct/ImageUploader";
import { sendGTMEvent } from "@next/third-parties/google";

function FormInput({ ...props }) {
  return (
    <Input
      isRequired
      labelPlacement="outside"
      radius="sm"
      classNames={{
        mainWrapper: "mt-10",
        label: "text-lg -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: "text-base",
        inputWrapper: "bg-gray-100 h-12",
      }}
      {...props}
    />
  );
}

export default function ProposalForm({ lang, t, translate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    phone: "",
    email: "",
    description: "",
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
          try {
            sendGTMEvent({
              event: "form_submission",
              form_name: "proposal_form",
              has_images: proposalImages.length > 0,
              has_pdf_link: !!formData.pdfLink,
              budget: Number(formData.budget) || 0,
              title_length: (formData.title || "").length,
              location: "proposal_page",
            });
          } catch (_) {}
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
        <div className="grid md:grid-cols-3 gap-4 w-full">
          <FormInput
            label={t("name")}
            name="name"
            onChange={handleChange}
            value={formData.name}
            placeholder={t("namePlaceholder")}
            minLength={2}
            type="text"
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
          />
          <FormInput
            dir="ltr"
            label={t("email")}
            name="email"
            placeholder={t("emailPlaceholder")}
            onChange={handleChange}
            value={formData.email}
            type="email"
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
          />
        </div>

        <Textarea
          size="lg"
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
            input: "resize-y min-h-[150px] text-base",
            label: "text-lg pb-3 flex items-center",
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
          />
        </div>

        <div className="w-full flex flex-col gap-4 mt-14">
          <label className="text-lg font-NotoSansArabic">{t("imgLabel")}</label>
          <ImageUploader
            lang={lang}
            files={proposalImages}
            setFiles={setProposalImages}
            translate={translate}
            proposal={true}
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
          />
        </div>

        <div className="mt-10 mb-10 text-center">
          <Button
            isLoading={isLoading}
            type="submit"
            className="py-7 min-w-60 text-xl font-IBMPlex"
          >
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
