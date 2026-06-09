import { useState } from "react";
import Image from "next/image";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Message } from "@/components/ui/svgs/icons/MessageSvg";
import { Review } from "@/components/ui/svgs/icons/ReviewSvg";
import { Delete } from "@/components/ui/svgs/icons/DeleteSvg";
import Button from "@/components/ui/Button";
import CommentModal from "./CommentModal";
import { anyImgUrl } from "@/utils/ImageUrl";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { useRouter } from "next/navigation";
import { revalidateWithTag } from "@/actions/revalidateTag";
import { useUser } from "@/context/UserContext";

const Comments = ({ trans, comments, blogId }) => {
  const { user } = useUser();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);
  const [modalData, setModalData] = useState({});
  const router = useRouter();
  const t = (text) => trans(`singleBlog.comments.${text}`);
  const t2 = (text) => trans(`singleBlog.addComment.${text}`);
  const t3 = (text) => trans(`singleBlog.editComment.${text}`);

  const handleAddSubComment = (commentId) => {
    setShowCommentModal(true);
    setModalData({
      title: t2("respond.title"),
      label: t2("respond.text"),
      placeholder: t2("respond.placeholder"),
      buttonText: t2("respond.add"),
      loadingText: t2("respond.adding"),
      commentId,
    });
  };

  const handleAddComment = () => {
    setShowCommentModal(true);
    setModalData({
      title: t2("title"),
      label: t2("enterComment"),
      placeholder: t2("commentPlaceholder"),
      buttonText: t2("add"),
      loadingText: t2("adding"),
    });
  };

  const handleEditComment = async (commentId, subCommentId) => {
    setShowCommentModal(true);
    setModalData({
      isEdit: true,
      title: t3("title"),
      label: t3("enterComment"),
      placeholder: t3("commentPlaceholder"),
      buttonText: t3("save"),
      loadingText: t3("saving"),
      commentId,
      subCommentId,
      successMsg: t3("toast.success"),
      errorMsg: t3("toast.error"),
    });
  };

  const handleDeleteComment = (commentId, subCommentId) => {
    setShowDeleteCommentModal(true);
    setModalData({
      title: t("delete.title"),
      message: t("delete.message"),
      confirmText: t("delete.confirm"),
      cancelText: t("delete.cancel"),
      type: "delete",
      loading: deleteCommentLoading,
      onConfirm: async () => {
        setDeleteCommentLoading(true);
        try {
          const res = await fetch(`/api/blog/${blogId}/comment/${commentId}`, {
            method: "DELETE",
            body: JSON.stringify({ subCommentId, userId: user?._id }),
          });

          if (res.ok) {
            toast.success(ToastMessage(t("delete.success")));
            await revalidateWithTag(`blog-${blogId}`);
            router.refresh();
          } else {
            toast.error(ToastMessage(t("delete.error")));
          }
        } catch (err) {
          toast.error(ToastMessage(t("delete.error")));
        } finally {
          setDeleteCommentLoading(false);
          setShowDeleteCommentModal(false);
        }
      },
    });
  };

  return (
    <>
      <div className="flex flex-col">
        <h3 className="text-darkNavy font-semibold font-IBMPlex text-[28px]">
          {t("title")}
        </h3>

        {/* Comments */}
        <div className="flex flex-col gap-6 mt-6">
          {comments?.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div className="flex flex-col p-8 gap-2 rounded-[30px] w-full bg-[#F9FAFB]">
                  <div className="flex items-center gap-5">
                    <Image
                      src={anyImgUrl({
                        src: comment.owner.avatar,
                        size: 100,
                      })}
                      alt="Comment Profile Photo"
                      width={78}
                      height={78}
                      unoptimized
                      className="rounded-full"
                    />
                    <div className="flex flex-col justify-center w-full">
                      <h3 className="font-IBMPlex font-bold text-black text-2xl">
                        {comment.owner.fullName}
                      </h3>
                      <p className="font-NotoSansArabic text-[18px] text-[#5B5656]">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                  <div className="self-end flex gap-4 items-center">
                    {user?._id === comment.owner?._id && (
                      <div
                        className="flex gap-1 items-center cursor-pointer hover:opacity-70 p-2 rounded-full transition"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Delete />
                      </div>
                    )}
                    {user?._id === comment.owner?._id && (
                      <div
                        className="flex gap-1 items-center cursor-pointer hover:opacity-70 p-2 rounded-full transition"
                        onClick={() => handleEditComment(comment._id)}
                      >
                        <Edit />
                      </div>
                    )}
                    {user?.role === "admin" && (
                      <div
                        className="flex gap-1 items-center cursor-pointer"
                        onClick={() => handleAddSubComment(comment._id)}
                      >
                        <Message />
                        <span className="font-NotoSansArabic text-darkNavy font-medium text-medium">
                          {t("respond")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub Comments */}
                {comment.subComments?.length > 0 && (
                  <div className="flex flex-col gap-4 pr-44">
                    {comment.subComments.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex flex-col p-8 gap-2 rounded-[30px] w-full bg-[#EFF5FB]"
                      >
                        <div className="flex gap-5">
                          <Image
                            src={anyImgUrl({
                              src: sub.owner.avatar,
                              size: 100,
                            })}
                            alt="Sub Comment Profile Photo"
                            width={78}
                            height={78}
                            unoptimized
                            className="rounded-full"
                          />
                          <div className="flex flex-col justify-center w-full">
                            <h3 className="font-IBMPlex font-bold text-black text-2xl">
                              {sub.owner.fullName}
                            </h3>
                            <p className="font-NotoSansArabic text-[18px] text-[#5B5656]">
                              {sub.text}
                            </p>
                          </div>
                        </div>
                        <div className="self-end flex gap-4 items-center">
                          {user?._id === sub.owner?._id && (
                            <div
                              className="flex gap-1 items-center cursor-pointer hover:opacity-70 p-2 rounded-full transition"
                              onClick={() =>
                                handleDeleteComment(comment._id, sub._id)
                              }
                            >
                              <Delete />
                            </div>
                          )}
                          {user?._id === sub.owner?._id && (
                            <div
                              className="flex gap-1 items-center cursor-pointer hover:opacity-70 p-2 rounded-full transition"
                              onClick={() =>
                                handleEditComment(comment._id, sub._id)
                              }
                            >
                              <Edit />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">{t("noComments")}</p>
          )}
        </div>

        {user?._id && (
          <Button
            className="mt-8 bg-darkNavy py-6 px-9 shadow-[0px_17px_20px_0px_#F48A4233] flex items-center justify-center gap-[10px] rounded-full"
            onPress={handleAddComment}
          >
            <Review />
            <span className="text-[#F9FAFC] font-IBMPlex font-semibold text-[18px]">
              {t("addComment")}
            </span>
          </Button>
        )}
      </div>
      <CommentModal
        trans={trans}
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        blogId={blogId}
        owner={user?._id}
        {...modalData}
      />
      {showDeleteCommentModal && (
        <ConfirmModal
          t={t}
          isOpen={showDeleteCommentModal}
          onClose={() => setShowDeleteCommentModal(false)}
          {...modalData}
        />
      )}
    </>
  );
};

export default Comments;
