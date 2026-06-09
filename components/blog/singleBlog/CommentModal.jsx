"use client";
import CustomModal from "../../ui/CustomModal";
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
    <CustomModal
      isOpen={isOpen}
      onClose={() => {
        setComment("");
        onClose();
      }}
      size="lg"
      className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-3xl max-h-[90vh] overflow-hidden flex flex-col p-4 md:p-6"
      backdropClass="bg-darkNavy/50 backdrop-blur-sm"
    >
      <div className="flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="flex gap-2 items-center text-[#F44242] font-semibold text-lg border-b border-gray-200 dark:border-gray-800 pb-3 mb-4 flex-shrink-0">
          <Review />
          <span>{title}</span>
        </div>

        {/* Close Button */}
        <Button
          onPress={() => {
            setComment("");
            onClose();
          }}
          type="button"
          radius="full"
          className="absolute top-0 end-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 shadow-sm z-50 p-2 min-w-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-6 py-2">
          <span className="font-NotoSansArabic font-bold text-lg text-darkNavy dark:text-white block">
            {label}
          </span>

          <Textarea
            placeholder={placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            minRows={4}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 flex-shrink-0">
          <Button
            isDisabled={loading}
            className="bg-primary text-white px-8 py-6 flex gap-[10px] items-center"
            onPress={handleSubmit}
          >
            {loading ? loadingText : buttonText}
            <Send size={20} />
          </Button>
          <Button
            color="transparent"
            className="text-darkNavy dark:text-gray-200 font-NotoSansArabic font-bold text-lg px-0"
            onPress={() => {
              onClose();
              setComment("");
            }}
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}
