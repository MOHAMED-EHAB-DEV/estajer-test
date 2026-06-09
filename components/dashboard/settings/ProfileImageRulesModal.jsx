"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function ProfileImageRulesModal({
  isOpen,
  onClose,
  onConfirm,
  t,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      classNames={{
        base: "border-none bg-white dark:bg-gray-900 rounded-3xl",
        header: "border-b-[1.5px] border-gray-200 p-6",
        body: "p-6",
        footer: "p-6 border-t-[1.5px] border-gray-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-xl font-bold">
          {t("profileImage.rulesTitle")}
        </ModalHeader>
        <ModalBody>
          <ul className="list-disc ps-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li>{t("profileImage.rule1")}</li>
            <li>{t("profileImage.rule2")}</li>
            <li>{t("profileImage.rule3")}</li>
            <li>{t("profileImage.rule4")}</li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} className="font-medium">
            {t("cancel")}
          </Button>
          <Button
            color="primary"
            onPress={onConfirm}
            className="font-semibold text-white px-6"
          >
            {t("agreeAndUpload")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
