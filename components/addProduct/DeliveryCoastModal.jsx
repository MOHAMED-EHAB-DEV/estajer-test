"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useState } from "react";
import { toast } from "@/utils/toast";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import ToastMessage from "@/components/ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "../ui/Button";
import DeliveryRangeMap from "../shared/DeliveryRangeMap";
import { Money } from "../ui/svgs/OrdersSvg";
export default function DeliveryCoastModal({
  isModalOpen,
  setIsModalOpen,
  translate,
  location,
  lang,
  cost,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`singleProduct.reviews.${text}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    return toast.error(ToastMessage("يرجى تقييم جميع العناصر"));
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      hideCloseButton
      size="5xl"
      placement="center"
      classNames={{
        body: "py-6 md:px-6 px-2",
        backdrop: "bg-black/40 backdrop-blur-sm",
        base: "border-none bg-white dark:bg-gray-900 text-black dark:text-white ",
        header: "border-b-1 border-gray-200 md:px-6 px-2",
        footer: "border-t-1 border-gray-200 md:px-6 px-2",
        closeButton: "hover:bg-gray-100 active:bg-gray-200 rounded-full",
      }}
    >
      <form onSubmit={handleSubmit}>
        <ModalContent className="p-4 overflow-auto max-h-[92dvh] !my-0">
          <ModalHeader className="flex flex-col gap-1 justify-between items-center">
            <div className="w-full">
              <div className="flex gap-3 items-center">
                <Money size={40} color="#F48A42"></Money>
                <div className="flex flex-col gap-1">
                  <span className="font-IBMPlex text-xl">سعر التوصيل</span>
                  <span className="font-medium">
                    مثال للمبلغ الذي سيدفعه المستخدم حسب الموقع
                  </span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant=""
              onPress={() => setIsModalOpen(false)}
              radius="none"
              className="absolute left-4 top-2 px-4 min-w-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            <div className="space-y-4">
              <DeliveryRangeMap
                cost={cost}
                lang={lang}
                translate={translate}
                productLocation={location}
              />
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-end">
            <Button
              className="shadow-[rgba(244,138,66,0.4)] py-4 px-8 flex justify-center gap-3"
              onPress={() => setIsModalOpen(false)}
            >
              متابعة
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
