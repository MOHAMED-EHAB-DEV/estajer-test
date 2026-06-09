"use client";
import { Modal, ModalContent, ModalBody } from "@heroui/react";
import Image from "next/image";

export default function ImagePreviewModal({ previewImage, onClose }) {
  return (
    <Modal
      isOpen={!!previewImage}
      onClose={onClose}
      size="full"
      placement="center"
      className="bg-black/95 backdrop-blur-md"
      classNames={{
        closeButton:
          "left-6 top-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 w-10 h-10 border border-white/30 backdrop-blur-md",
      }}
      motionProps={{
        variants: { enter: { opacity: 1 }, exit: { opacity: 0 } },
      }}
    >
      <ModalContent>
        <ModalBody
          className="flex justify-center items-center h-screen p-0 overflow-hidden relative"
          onClick={onClose}
        >
          {previewImage && (
            <Image
              src={previewImage}
              alt="Preview"
              width={1200}
              height={800}
              unoptimized
              className="object-contain max-w-full max-h-[90vh] sm:max-h-[95vh] rounded-lg"
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
