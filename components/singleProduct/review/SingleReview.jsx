import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import { useState } from "react";
import { useOverflowDetection } from "@/hooks/useOverflowDetection";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { Delete } from "@/components/ui/svgs/icons/DeleteSvg";
import Button from "@/components/ui/Button";
import { revalidateWithTag } from "@/actions/revalidateTag";
import Link from "next/link";
import { getUrlName } from "@/lib/sitemap";

export default function SingleRate({
  t,
  user,
  review,
  isOwner,
  onDelete,
  pathName,
  productName,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use custom hook for efficient overflow detection
  const { ref: commentRef, isOverflowing } = useOverflowDetection(
    [review.comment],
    6,
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/review/${review._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        await revalidateWithTag(`product-${review.product}`);
        onDelete(review._id);
        toast.success(ToastMessage("تم حذف التقييم بنجاح"));
      } else throw new Error(data.error || "Failed to delete review");
    } catch (error) {
      toast.error(ToastMessage(error.message));
      console.error("Error deleting review:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };
  return (
    <>
      <article
        className="bg-[#F9FAFB] p-3 md:p-4 rounded-xl md:rounded-2xl"
        role="article"
        aria-label={`Review by ${review?.userName || user?.fullName}`}
      >
        <header className="flex gap-3 md:gap-6 justify-between">
          <div className="flex gap-2.5 md:gap-6 items-center">
            <div className="w-10 h-10 md:w-16 md:h-16 relative overflow-hidden rounded-full border-2 border-white shadow-sm">
              <Image
                src={anyImgUrl({
                  src:
                    review?.userImage ||
                    user?.avatar ||
                    "https://s3-alpha-sig.figma.com/img/c70e/72ef/fc9ec05904daa1d3b05868a6bcddc2e8?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=IAS0iHKg0TxZimSlTTV77DfAYCcUJXGEDIBZHfthTfGnp6VNhrgVoTKtcxHMoXadloyiGzS3Fv2w0flqzLzVgIZIbZ8g6QYBtp3mcITj-AKraISr6RGKO2sxgx6gyrGbQfIwO1G-rpR7-i195CF2Ri5sCbN~elbrMj6mw1TWRIAf8vCJZGHF3JemsofRBMy8dzRcJauQrrQFvQZotbA0xY7-r3lB~~MtB54d-I-H3XBbV-av6wg9YhGb5Jbmxja-OPK-Sm8qtUx1ig8vb5Mwvbyw7Z8-vVvo5qvj44IDUtHbsqS~GoEUWgJFyqkFaDuyCKYlhw4ahAs1zz9bVLwAPw__",
                  size: 500,
                })}
                alt={`${review?.userName || user?.fullName} profile picture`}
                title={review?.userName || user?.fullName}
                className="h-full w-full object-cover"
                unoptimized
                fill
              />
            </div>
            <div>
              <div className="text-darkNavy font-semibold text-base md:text-xl lg:text-2xl font-IBMPlex mb-0.5 md:mb-1">
                {review?.userName || user?.fullName}
              </div>
              {pathName ? (
                <div className="text-darkNavy font-semibold text-xs md:text-base font-IBMPlex mb-1 md:mb-2">
                  تقييم لمنتج
                  <Link
                    href={`/products/${getUrlName(review.product?.name)}_ref_${review.product?._id}`}
                    className="text-primary"
                  >
                    <span>{` ( ${review.product?.name} )`}</span>
                  </Link>
                </div>
              ) : null}
              <div className="flex gap-1 md:gap-2 items-center">
                <div className="flex gap-0.5 md:gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <svg
                      key={idx}
                      className="w-3.5 h-3.5 md:w-5 md:h-5"
                      viewBox="0 0 22 22"
                      fill={
                        idx < review.rating?.overall ? "#F48A42" : "#E5E5E5"
                      }
                      aria-hidden="true"
                    >
                      <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                    </svg>
                  ))}
                </div>
                <span className="text-darkNavy text-sm md:text-xl opacity-65 font-semibold">
                  {review.rating?.overall.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          {isOwner && (
            <Button
              color="danger"
              className="min-w-0 rounded-xl p-2.5 md:p-3"
              size="sm"
              onPress={() => setShowConfirm(true)}
              isDisabled={isDeleting}
            >
              <Delete fill="#fff" size={14} className="md:w-5 md:h-5 w-3.5 h-3.5" />
            </Button>
          )}
        </header>
        <div className="mt-3 md:ps-[5.5rem]">
          <div className="mt-1 md:mt-2 lg:mt-0">
            <p
              ref={commentRef}
              className={`text-[#5B5656] text-xs md:text-lg whitespace-pre-line line-clamp-6 ${
                !isExpanded ? "" : "line-clamp-none"
              }`}
            >
              {review.comment?.trim()}
            </p>
          </div>
          {isOverflowing && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-primary text-xs md:text-sm font-bold mt-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label={t("readMore") || "Read More"}
            >
              {t("readMore") || "اقرأ المزيد"}
            </button>
          )}
          {review.images?.length > 0 && (
            <div
              className="grid grid-cols-[repeat(auto-fill,_minmax(80px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(110px,_1fr))] gap-2 md:gap-3 mt-4 md:mt-6"
              role="list"
              aria-label="Review images"
            >
              {review.images.map((image, idx) => (
                <div
                  className="aspect-[1/.85] relative overflow-hidden rounded-lg"
                  key={idx}
                  role="listitem"
                >
                  <Image
                    src={image}
                    alt={`Review image ${idx + 1} for ${
                      review.product?.name || "product"
                    }`}
                    title={`Review image ${idx + 1} for ${
                      review.product?.name || "product"
                    }`}
                    className="h-full w-full object-cover"
                    unoptimized
                    fill
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="حذف التقييم"
          message="هل أنت متأكد من حذف هذا التقييم؟"
          confirmText="حذف"
          cancelText="إلغاء"
          type="delete"
          loading={isDeleting}
          t={t}
        />
      )}
    </>
  );
}
