"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function ProfileImageRejectionModal({
  isOpen,
  onClose,
  reason,
  t,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      classNames={{
        base: "border-2 border-red-500 bg-white dark:bg-gray-900 rounded-3xl",
        header: "p-6",
        body: "p-6",
        footer: "p-6 border-t border-gray-100",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-xl font-bold text-red-600">
          {t("profileImage.rejectedTitle")}
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            {reason}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="flat"
            onPress={onClose}
            className="font-semibold"
          >
            {t("close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
