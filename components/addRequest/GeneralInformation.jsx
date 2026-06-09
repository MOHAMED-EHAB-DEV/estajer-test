"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Input, Textarea } from "@heroui/react";

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

export default function GeneralInformation({
  lang,
  data,
  handleChange,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) =>
    trans(`addProductPage.formSteps.generalInformation.${key}`);

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-2 gap-4 w-full">
        <FormInput
          dir={lang === "ar" ? "rtl" : "ltr"}
          label={t("nameArLabel")}
          name="nameAr"
          onChange={handleChange}
          value={data.nameAr || ""}
          placeholder={t("nameArInputPlaceholder")}
          minLength={2}
          type="text"
        />
        <FormInput
          dir="ltr"
          label={t("nameEnLabel")}
          name="nameEn"
          placeholder={t("nameEnInputPlaceholder")}
          onChange={handleChange}
          value={data.nameEn || ""}
          minLength={2}
          type="text"
        />
      </div>
      <Textarea
        size="lg"
        radius="sm"
        isRequired
        label={t("descriptionArLabel")}
        labelPlacement="outside"
        name="descriptionAr"
        onChange={handleChange}
        value={data.descriptionAr || ""}
        placeholder={t("descriptionArInputPlaceholder")}
        type="text"
        dir="rtl"
        minLength={20}
        classNames={{
          input: "resize-y min-h-[150px] text-base text-right",
          label: "text-lg pb-3 flex items-center mt-4",
        }}
      />
      <Textarea
        size="lg"
        radius="sm"
        isRequired
        label={t("descriptionEnLabel")}
        labelPlacement="outside"
        name="descriptionEn"
        onChange={handleChange}
        value={data.descriptionEn || ""}
        placeholder={t("descriptionEnInputPlaceholder")}
        type="text"
        dir="ltr"
        minLength={20}
        classNames={{
          base: "mt-6",
          input: "resize-y min-h-[150px] text-base",
          label: "text-lg pb-3 flex items-center",
        }}
      />
    </div>
  );
}
