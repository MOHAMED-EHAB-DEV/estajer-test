"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/CustomModal";
import Button from "../ui/Button";
import { useEffect, useState } from "react";
import { FormInput } from "./RentDetails";
import { useTranslations } from "@/hooks/useTranslations";

export default function AddService({
  isModalOpen,
  setIsModalOpen,
  setServices,
  currentService,
  translate,
  lang,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.addService.${key}`);

  const initialData = {
    nameAr: "",
    nameEn: "",
    price: 0,
    quantity: 1,
    pricingType: "perDay",
  };
  const [data, setData] = useState(currentService || initialData);
  // useEffect(() => {
  //   setData(currentService || initialData);
  // }, [currentService]);

  const handelChange = ({ target: { name, value, type } }) =>
    setData({ ...data, [name]: type === "number" ? +value : value });

  // Save new service
  const saveNewService = () => {
    if (currentService) {
      setServices((services) =>
        services.map((service) =>
          service.id === currentService.id
            ? { id: service.id, ...data }
            : service,
        ),
      );
      setIsModalOpen(false);
    } else if (data.nameAr && data.nameEn) {
      setServices((services) => [...services, { id: Date.now(), ...data }]);
      setData(initialData);
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      hideCloseButton
      size="2xl"
      placement="center"
      classNames={{
        body: "py-3 md:py-6",
        backdrop: "bg-black/40 backdrop-blur-sm",
        base: "border-none bg-white dark:bg-gray-900 text-black dark:text-white",
        header: "border-b-1 border-gray-200",
        footer: "border-t-1 border-gray-200",
        closeButton: "hover:bg-gray-100 active:bg-gray-200 rounded-full",
      }}
    >
      <ModalContent className="p-2 md:p-4">
        <ModalHeader className="flex flex-col gap-1 justify-between items-center text-sm md:text-base">
          <div className="w-full">
            {currentService ? t("editTitle") : t("title")}
          </div>
          <Button
            type="button"
            variant=""
            onPress={() => setIsModalOpen(false)}
            radius="none"
            className="absolute left-4 top-2 px-2 md:px-4 min-w-0"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3 md:gap-4">
            <FormInput
              type="text"
              label={t("nameAr")}
              value={data.nameAr}
              onChange={handelChange}
              placeholder={t("nameArPlaceholder")}
              name="nameAr"
            />
            <FormInput
              type="text"
              label={t("nameEn")}
              onChange={handelChange}
              name="nameEn"
              value={data.nameEn}
              placeholder={t("nameEnPlaceholder")}
            />
            <FormInput
              type="number"
              label={t("quantity")}
              min="1"
              placeholder="1"
              step="1"
              onChange={handelChange}
              name="quantity"
              value={data.quantity}
            />
            {/* Pricing type toggle */}
            <div className="flex flex-col gap-1.5 md:gap-2">
              <span className="text-xs md:text-lg font-medium">
                {t("pricingType")}
              </span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({ ...prev, pricingType: "perDay" }))
                  }
                  className={`flex-1 py-1.5 md:py-2.5 px-2 md:px-4 text-xs md:text-sm font-medium transition-colors ${
                    data.pricingType !== "fixed"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t("perDay")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({ ...prev, pricingType: "fixed" }))
                  }
                  className={`flex-1 py-1.5 md:py-2.5 px-2 md:px-4 text-xs md:text-sm font-medium transition-colors ${
                    data.pricingType === "fixed"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t("fixed")}
                </button>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500">
                {data.pricingType === "fixed"
                  ? t("fixedHint")
                  : t("perDayHint")}
              </p>
            </div>
            <div className="flex items-end">
              <FormInput
                label={t("price")}
                min="0"
                type="number"
                onChange={handelChange}
                value={data.price || ""}
                name="price"
                placeholder="0"
              />
              <div className="bg-[rgba(244,138,66,0.5)] md:h-12 h-10 min-w-12 md:min-w-16 flex items-center justify-center rounded-e-lg">
                <span className="text-black text-xs md:text-base">
                  {t("currency")}
                </span>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button
            className="bg-gray-200 text-black text-xs md:text-sm"
            color="transparent"
            onPress={() => setIsModalOpen(false)}
          >
            {t("cancelButton")}
          </Button>
          <Button
            className="bg-[#F2994A] text-white text-xs md:text-sm"
            onPress={saveNewService}
          >
            {currentService ? t("editButton") : t("addButton")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
