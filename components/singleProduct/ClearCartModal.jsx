import CustomModal from "../ui/CustomModal";
import Button from "../ui/Button";

export default function ClearCartModal({
  isOpen,
  onClose,
  onClear,
  message,
  t,
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      className="bg-white shadow-2xl relative flex flex-col z-[101] rounded-2xl max-w-md w-[90%] p-6"
    >
      <div className="text-xl flex justify-center font-bold border-b pb-4 mb-4">
        {t("clearCartModal.title")}
      </div>
      <div className="py-6">
        <p className="text-xl text-center leading-8">{message}</p>
      </div>
      <div className="flex gap-4 justify-center border-t pt-4 mt-4">
        <Button
          variant="solid"
          color="default"
          size="lg"
          onPress={onClose}
          className="px-10"
          radius="md"
        >
          {t("clearCartModal.cancel")}
        </Button>
        <Button
          variant="solid"
          color="danger"
          size="lg"
          onPress={onClear}
          className="px-10"
          radius="md"
        >
          {t("clearCartModal.clearCart")}
        </Button>
      </div>
    </CustomModal>
  );
}
