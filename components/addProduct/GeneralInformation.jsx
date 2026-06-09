"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Input, Select, SelectItem, Textarea } from "@heroui/react";
import Button from "../ui/Button";
import { Line } from "../ui/svgs/icons/LineSvg";
import { Minus } from "../ui/svgs/icons/MinusSvg";
import { Plus } from "../ui/svgs/icons/PlusSvg";

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
  categories,
  handleChange,
  subCategories,
  changeCategory,
  selectedCategory,
  selectedSubCategory,
  changeSubCategory,
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
          maxLength={100}
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
          maxLength={100}
          type="text"
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4 w-full mt-6">
        <Select
          isRequired
          scrollShadowProps={{ hideScrollBar: false }}
          label={t("categoryLabel")}
          classNames={{ label: "text-lg -mt-2", base: "!mt-10" }}
          size="lg"
          onChange={changeCategory}
          required
          radius="sm"
          disallowEmptySelection
          selectedKeys={[selectedCategory]}
          labelPlacement="outside"
        >
          {categories?.map(({ label, key }) => (
            <SelectItem key={key}>{label}</SelectItem>
          ))}
        </Select>
        <Select
          isRequired
          scrollShadowProps={{ hideScrollBar: false }}
          label={t("subCategoryLabel")}
          classNames={{ label: "text-lg -mt-2", base: "!mt-10" }}
          size="lg"
          required
          radius="sm"
          disallowEmptySelection
          onChange={changeSubCategory}
          selectedKeys={
            subCategories?.length > 0
              ? [selectedSubCategory]
              : ["noSubCategory"]
          }
          labelPlacement="outside"
          {...(subCategories?.length > 0
            ? { isDisabled: false }
            : { isDisabled: true })}
        >
          {subCategories?.length > 0 ? (
            subCategories?.map(({ label, key }) => (
              <SelectItem key={key}>{label}</SelectItem>
            ))
          ) : (
            <SelectItem key={"noSubCategory"}>
              {t("noSubCategoriesText")}
            </SelectItem>
          )}
        </Select>
        <Select
          isRequired
          scrollShadowProps={{ hideScrollBar: false }}
          label={t("statusLabel")}
          classNames={{ label: "text-lg -mt-2", base: "!mt-10" }}
          size="lg"
          required
          radius="sm"
          disallowEmptySelection
          name="status"
          onChange={(e) => {
            handleChange({
              target: { name: "status", value: e.target.value },
            });
          }}
          selectedKeys={[data.status || "excellent"]}
          labelPlacement="outside"
        >
          <SelectItem key="excellent">{t("statusOptionExcellent")}</SelectItem>
          <SelectItem key="veryGood">{t("statusOptionVeryGood")}</SelectItem>
          <SelectItem key="good">{t("statusOptionGood")}</SelectItem>
        </Select>
      </div>
      <div className="grid lg:grid-cols-5 gap-4 w-full my-6">
        <div className="w-full flex items-end lg:col-span-3">
          <FormInput
            label={t("quantityLabel")}
            name="quantity"
            classNames={{
              mainWrapper: "mt-10",
              label: "text-lg -mt-2 flex items-center min-w-max",
              base: "max-w-full !mt-0",
              input: "text-base",
              inputWrapper: "bg-gray-100 h-12",
            }}
            onChange={handleChange}
            min={1}
            value={data.quantity || ""}
            type="number"
            placeholder={t("quantityPlaceholder")}
          />
          <div className="flex bg-[#c5c5c5] rounded-lg h-12 items-center">
            <Button
              onPress={() => {
                handleChange({
                  target: {
                    name: "quantity",
                    value: +data.quantity + 1,
                  },
                });
              }}
              color="transparent"
              className="min-w-14 px-2 rounded-none"
            >
              <Plus color="#0D092B" size={20} />
            </Button>
            <Line />
            <Button
              onPress={() => {
                handleChange({
                  target: {
                    name: "quantity",
                    value: data.quantity <= 1 ? 1 : +data.quantity - 1,
                  },
                });
              }}
              color="transparent"
              className="min-w-14 px-2 rounded-none"
            >
              <Minus color="#0D092B" size={30} />
            </Button>
          </div>
        </div>
        <div className="w-full lg:col-span-2">
          <FormInput
            label={t("minQuantityLabel")}
            name="minQuantity"
            onChange={handleChange}
            min={1}
            max={data.quantity || 1}
            value={data.minQuantity || ""}
            type="number"
            placeholder={t("minQuantityPlaceholder")}
          />
        </div>
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
          label: "text-lg pb-3 flex items-center",
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
