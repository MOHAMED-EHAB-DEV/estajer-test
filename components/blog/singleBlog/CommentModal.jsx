"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Textarea } from "@heroui/input";
import { useState } from "react";
import { toast } from "@/utils/toast";
import Button from "../../ui/Button";
import { Review } from "@/components/ui/svgs/icons/ReviewSvg";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import ToastMessage from "@/components/ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import { revalidateWithTag } from "@/actions/revalidateTag";

export default function CommentModal({
  isOpen,
  onClose,
  blogId,
  commentId,
  trans,
  owner,
  title,
  label,
  loadingText,
  buttonText,
  placeholder,
  successMsg,
  errorMsg,
  isEdit,
  subCommentId,
}) {
  const t = (text) => trans(`singleBlog.addComment.${text}`);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (comment.length === 0) {
      toast.error(ToastMessage(t("toast.CommentMissing")));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/blog/${blogId}${isEdit ? `/comment/${commentId}` : ""}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEdit
              ? {
                  comment,
                  subCommentId,
                  owner,
                }
              : {
                  comment,
                  commentId,
                  owner,
                },
          ),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage(isEdit ? successMsg : t("toast.success")));
        onClose();
        setComment("");
        await revalidateWithTag(`blog-${blogId}`);
        router.refresh();
      } else {
        toast.error(
          ToastMessage(isEdit ? errorMsg : data.error || t("toast.error")),
        );
      }
    } catch (error) {
      toast.error(ToastMessage(isEdit ? errorMsg : t("toast.error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setComment("");
        onClose();
      }}
      size="2xl"
      placement="center"
      classNames={{
        body: "py-6",
        backdrop: "bg-darkNavy/50 backdrop-blur-sm",
        base: "border-none bg-white dark:bg-gray-900 rounded-3xl",
        header: "border-b-1 border-gray-200",
        footer: "border-t-1 border-gray-200",
      }}
    >
      <ModalContent className="p-4">
        <ModalHeader className="flex gap-2 items-center text-[#F44242]">
          <Review />
          <span>{title}</span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <span className="font-NotoSansArabic font-bold text-lg text-darkNavy">
              {label}
            </span>

            <Textarea
              placeholder={placeholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              minRows={4}
            />
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button
            isDisabled={loading}
            className="bg-primary text-white px-8 py-6 flex gap-[10px] items-center"
            onPress={handleSubmit}
          >
            {loading ? loadingText : buttonText}
            <Send size={20} />
          </Button>
          <Button
            color="transparent text-darkNavy font-NotoSansArabic font-bold text-lg"
            onPress={() => {
              onClose();
              setComment("");
            }}
          >
            {t("cancel")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
