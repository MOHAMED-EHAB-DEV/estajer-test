"use client";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function ContactShowReplyModal({
  isOpen,
  onClose,
  reply,
  onPreviewImage,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" placement="center">
      <ModalContent>
        <ModalHeader>عرض الرد</ModalHeader>
        <ModalBody>
          {reply && (
            <>
              <p className="text-sm font-semibold">الرد:</p>
              <div className="p-3 bg-gray-50 rounded">
                <p>{reply.message}</p>
              </div>
              {reply.attachments?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">المرفقات:</p>
                  <div className="flex flex-wrap gap-2">
                    {reply.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 relative rounded-lg overflow-hidden border cursor-pointer"
                        onClick={() => onPreviewImage(attachment)}
                      >
                        <Image
                          src={anyImgUrl({
                            src: attachment,
                            size: 1200,
                            quality: 60,
                          })}
                          fill
                          alt={`Attachment ${index + 1}`}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            اغلاق
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
