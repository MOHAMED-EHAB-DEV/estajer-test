"use client";
import { useTranslations } from "@/hooks/useTranslations";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
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
    try {
      sendGTMEvent({
        event: "home_category_select",
        category: value || "",
        sub_category: firstSubCat || "",
        location: "home_search_box",
      });
    } catch (_) {}
  };

  const changeSubCategory = ({ target: { value } }) => {
    setSelectedSubCategory(value);
    onSubCategoryChange?.(value);
    try {
      sendGTMEvent({
        event: "home_subcategory_select",
        category: selectedCategory || "",
        sub_category: value || "",
        location: "home_search_box",
      });
    } catch (_) {}
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    if (isOpen) {
      const handleOutsideClick = (event) => {
        if (!event.target.closest(".dropdown")) setIsOpen(false);
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
            scrollShadowProps={{ hideScrollBar: false }}
            label={t("home.search.category")}
            classNames={{
              label: "text-lg -mt-2 ",
              base: "!mt-10",
              value: "!min-w-[200px]",
            }}
            size="lg"
            onChange={changeCategory}
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
            scrollShadowProps={{ hideScrollBar: false }}
            label={t("home.search.supCategory")}
            classNames={{
              label: "text-lg -mt-2",
              base: "!mt-10",
              value: "!min-w-[200px]",
            }}
            size="lg"
            radius="sm"
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
