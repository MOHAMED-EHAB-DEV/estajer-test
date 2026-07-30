"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Input, Textarea } from "@/components/ui/Input";
import { Select, SelectItem } from "@/components/ui/Select";
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
        mainWrapper: "md:mt-10 mt-3",
        label: "md:text-lg text-xs flex items-center",
        base: "max-w-full !mt-0",
        input: "md:text-base text-sm",
        inputWrapper: "bg-gray-100 md:h-12 h-10",
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
      <div className="grid md:grid-cols-2 gap-3 md:gap-4 w-full">
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
      <div className="grid md:grid-cols-3 md:gap-4 w-full">
        <Select
          isRequired
          scrollShadowProps={{ hideScrollBar: false, isEnabled: true }}
          label={t("categoryLabel")}
          placeholder={t("categoryPlaceholder")}
          classNames={{
            label: "md:text-lg text-xs",
            base: "!mt-3 md:!mt-5 gap-2 md:gap-4",
            value: "text-xs md:text-sm",
            trigger: "h-10 md:h-12",
          }}
          size="lg"
          onChange={changeCategory}
          required
          radius="md"
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
          scrollShadowProps={{ hideScrollBar: false, isEnabled: true }}
          label={t("subCategoryLabel")}
          classNames={{
            label: "md:text-lg text-xs",
            base: "!mt-3 md:!mt-5 gap-2 md:gap-4",
            value: "text-xs md:text-sm",
            trigger: "h-10 md:h-12",
          }}
          size="lg"
          required
          radius="md"
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
          scrollShadowProps={{ hideScrollBar: false, isEnabled: true }}
          label={t("statusLabel")}
          classNames={{
            label: "md:text-lg text-xs",
            base: "!mt-3 md:!mt-5 gap-2 md:gap-4",
            value: "text-xs md:text-sm",
            trigger: "h-10 md:h-12",
          }}
          size="lg"
          required
          radius="md"
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
      <div className="grid lg:grid-cols-5 gap-3 md:gap-4 w-full my-3 md:my-6">
        <div className="w-full flex items-end lg:col-span-3">
          <FormInput
            label={t("quantityLabel")}
            name="quantity"
            classNames={{
              mainWrapper: "md:mt-10 mt-3",
              label: "md:text-lg text-xs md:-mt-2 -mt-1 flex items-center min-w-max",
              base: "max-w-full !mt-0 gap-2 md:gap-3",
              input: "md:text-base text-sm",
              inputWrapper: "bg-gray-100 md:h-12 h-10",
            }}
            onChange={handleChange}
            min={1}
            value={data.quantity || ""}
            type="number"
            placeholder={t("quantityPlaceholder")}
          />
          <div className="flex bg-[#c5c5c5] rounded-lg md:h-12 h-10 items-center">
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
              className="md:min-w-14 min-w-10 px-1 md:px-2 rounded-none"
            >
              <Plus color="#0D092B" className="md:w-5 w-4 md:h-5 h-4" />
            </Button>
            <Line className="min-w-0.5 md:h-[30px] h-[20px]" />
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
              className="md:min-w-14 min-w-10 px-1 md:px-2 rounded-none"
            >
              <Minus color="#0D092B" className="md:w-7 w-5 md:h-7 h-5" />
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
          input: "resize-y md:min-h-[150px] min-h-[100px] md:text-base text-sm text-right",
          label: "md:text-lg text-xs pb-1 md:pb-3 flex items-center",
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
          base: "mt-3 md:mt-6",
          input: "resize-y md:min-h-[150px] min-h-[100px] md:text-base text-sm",
          label: "md:text-lg text-xs pb-1 md:pb-3 flex items-center",
        }}
      />
    </div>
  );
}
