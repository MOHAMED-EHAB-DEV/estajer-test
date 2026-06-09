import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import Button from "../ui/Button";

export default function ClearCartModal({
  isOpen,
  onClose,
  onClear,
  message,
  t,
}) {
  return (
    <Modal
      classNames={{
        wrapper: "z-[64]",
        body: "py-6",
        base: "border-[#292f46]",
        header: "border-b-[1px]",
        footer: "border-t-[1px]",
        backdrop: "backdrop-blur-sm",
        closeButton: "text-xl hover:bg-white/5 active:bg-white/10",
      }}
      backdrop="blur"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
    >
      <ModalContent>
        <ModalHeader className="text-xl flex justify-center">
          {t("clearCartModal.title")}
        </ModalHeader>
        <ModalBody>
          <p className="text-xl text-center leading-8">{message}</p>
        </ModalBody>
        <ModalFooter className="flex gap-4 justify-center">
          <Button
            variant="solid"
            color="default"
            size="lg"
            onPress={onClose}
            className=" px-10"
            radius="md"
          >
            {t("clearCartModal.cancel")}
          </Button>
          <Button
            variant="solid"
            color="danger"
            size="lg"
            onPress={onClear}
            className=" px-10"
            radius="md"
          >
            {t("clearCartModal.clearCart")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
