"use client";
import { useTranslations } from "@/hooks/useTranslations";
import { Select, SelectItem } from "@/components/ui/Select";
import { useEffect, useState } from "react";
import Button from "../ui/Button";

export default function SelectCategory({
  translate,
  categories,
  subCategories,
  onCategoryChange,
  onSubCategoryChange,
}) {
  const t = useTranslations(translate);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.key || "",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    subCategories?.[categories[0]?.key]?.[0]?.key || "",
  );
  const changeCategory = ({ target: { value } }) => {
    setSelectedCategory(value);
    onCategoryChange?.(value);
    const firstSubCat = subCategories[value]?.[0]?.key || "";
    setSelectedSubCategory(firstSubCat);
    onSubCategoryChange?.(firstSubCat);
  };

  const changeSubCategory = ({ target: { value } }) => {
    setSelectedSubCategory(value);
    onSubCategoryChange?.(value);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    if (isOpen) {
      const handleOutsideClick = (event) => {
        if (
          !event.target.closest(".dropdown") &&
          !event.target.closest(".category-select-portal")
        )
          setIsOpen(false);
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }
  }, [isOpen]);
  return (
    <div className="dropdown relative md:block hidden">
      <Button
        size="md"
        color="transparent"
        className="md:text-lg text-base text-darkNavy bg-transparent px-0"
        onPress={toggleDropdown}
      >
        {t("home.search.category")}
      </Button>
      {isOpen && (
        <div className="absolute z-50 top-full right-0 bg-white shadow-lg rounded-lg min-w-max px-6 py-6 flex gap-6 w-full my-6">
          <Select
            scrollShadowProps={{ hideScrollBar: false, isEnabled: true }}
            label={t("home.search.category")}
            classNames={{
              label: "text-lg -mt-2 ",
              base: "!mt-10",
              value: "!min-w-[200px]",
              popover: "category-select-portal !z-drawer",
            }}
            size="lg"
            onChange={changeCategory}
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
            scrollShadowProps={{ hideScrollBar: false, isEnabled: true }}
            label={t("home.search.supCategory")}
            classNames={{
              label: "text-lg -mt-2",
              base: "!mt-10",
              value: "!min-w-[200px]",
              popover: "category-select-portal !z-drawer",
            }}
            size="lg"
            radius="md"
            disallowEmptySelection
            onChange={changeSubCategory}
            selectedKeys={
              subCategories[selectedCategory]?.length > 0
                ? [selectedSubCategory]
                : ["noSubCategory"]
            }
            labelPlacement="outside"
            {...(subCategories[selectedCategory]?.length > 0
              ? { isDisabled: false }
              : { isDisabled: true })}
          >
            {subCategories[selectedCategory]?.length > 0 ? (
              subCategories[selectedCategory]?.map(({ label, key }) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))
            ) : (
              <SelectItem key={"noSubCategory"}>
                {t("home.search.noSubCategories")}
              </SelectItem>
            )}
          </Select>
        </div>
      )}
    </div>
  );
}
