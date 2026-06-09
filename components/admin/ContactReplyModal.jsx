"use client";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@heroui/react";
import ImageUploader from "@/components/addProduct/ImageUploader";

export default function ContactReplyModal({
  isOpen,
  onClose,
  contact,
  replyMessage,
  setReplyMessage,
  replyImages,
  setReplyImages,
  onReply,
  isPending,
  translate,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          الرد على الرسالة
        </ModalHeader>
        <ModalBody>
          {contact && (
            <div className="mb-1">
              <p className="text-sm">
                <span className="font-semibold">من:</span> {contact.name} (
                {contact.email})
              </p>
              <p className="text-sm">
                <span className="font-semibold">الموضوع:</span>{" "}
                {contact.subject}
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <p>{contact.message}</p>
              </div>
            </div>
          )}
          <Textarea
            label="رسالة الرد"
            placeholder="اكتب رسالة الرد هنا..."
            value={replyMessage}
            onValueChange={setReplyMessage}
            minRows={5}
            isRequired
          />
          <ImageUploader
            files={replyImages}
            setFiles={setReplyImages}
            translate={translate}
            sm={true}
            proposal={true}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            إلغاء
          </Button>
          <Button
            color="success"
            onPress={onReply}
            isDisabled={!replyMessage || isPending}
            isLoading={isPending}
          >
            إرسال الرد
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
