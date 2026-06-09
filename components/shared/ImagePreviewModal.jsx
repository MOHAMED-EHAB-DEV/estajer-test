"use client";
import { Modal, ModalContent, ModalBody } from "@heroui/react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

const ImagePreviewModal = ({
  isOpen,
  onClose,
  imageSrc,
  alt = "Full documentation",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      backdrop="blur"
      scrollBehavior="outside"
      classNames={{
        base: "bg-transparent shadow-none",
        closeButton:
          "bg-white/20 hover:bg-white/40 text-white p-2 text-lg md:text-2xl transition-all top-5 end-5 z-50",
      }}
    >
      <ModalContent>
        {() => (
          <ModalBody className="p-0 flex items-center justify-center relative min-h-[80vh]">
            {imageSrc && (
              <div className="relative w-full h-[80vh]">
                <Image
                  src={anyImgUrl({ src: imageSrc, size: 1500 })}
                  alt={alt}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ImagePreviewModal;
