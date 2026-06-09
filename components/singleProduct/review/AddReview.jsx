"use client";
import CustomModal from "../../ui/CustomModal";
import { Textarea, Input } from "@heroui/input";
import { useState } from "react";
import { toast } from "@/utils/toast";
import Button from "../../ui/Button";
import ImageUploader from "@/components/addProduct/ImageUploader";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import { Star } from "@/components/ui/svgs/icons/StarSvg";
import ToastMessage from "@/components/ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import { useUser } from "@/context/UserContext";
import { resizeImage } from "@/utils/ImageResizer";

export default function AddReview({
  isModalOpen,
  setIsModalOpen,
  product,
  lang,
  translate,
  // FormInput,
}) {
  const { user } = useUser();
  const isAdmin = user?.accountType === "admin";
  const trans = useTranslations(translate);
  const t = (text) => trans(`singleProduct.reviews.${text}`);
  const [rating, setRating] = useState({
    quality: 0,
    price: 0,
    communication: 0,
    experience: 0,
  });
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUserImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImage(file, {
          maxWidth: 500,
          quality: 0.8,
        });
        setUserImage(resized.preview);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !rating.quality ||
      !rating.price ||
      !rating.communication ||
      !rating.experience
    )
      return toast.error(ToastMessage(t("toast.ratingError")));

    setLoading(true);
    fetch(`/api/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product,
        rating: {
          ...rating,
          overall:
            (rating.quality +
              rating.price +
              rating.communication +
              rating.experience) /
            4,
        },
        comment,
        userName: isAdmin ? userName : undefined,
        userImage: isAdmin ? userImage : undefined,
        reviewImages: images.map((img) => img.preview),
      }),
    })
      .then((res) => {
        res.json().then(async (data) => {
          if (data.success) {
            await revalidate(`/`);
            await revalidateWithTag(`product-${product}`);
            toast.success(ToastMessage(t("toast.success")));
            setIsModalOpen(false);
          } else {
            toast.error(ToastMessage(data.error || t("toast.error")));
          }
        });
      })
      .catch((err) => {
        toast.error(ToastMessage(trans("toast.error")));
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const ratingTypes = [
    { type: "quality", name: t("quality") },
    { type: "price", name: t("price") },
    { type: "communication", name: t("communication") },
    { type: "experience", name: t("experience") },
  ];
  return (
    <CustomModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      size="4xl"
      className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-3xl max-h-[92dvh] overflow-hidden flex flex-col"
      backdropClass="bg-black/40 backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden p-4">
          <div className="flex flex-col gap-1 justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3 mb-3 flex-shrink-0 relative">
            <div className="w-full">
              <div className="flex gap-4 items-center">
                <svg width="35" height="35" viewBox="0 0 50 50" fill="#F48A42">
                  <path d="M0 50V5C0 3.625 0.49 2.44833 1.47 1.47C2.45 0.491667 3.62667 0.00166667 5 0H45C46.375 0 47.5525 0.49 48.5325 1.47C49.5125 2.45 50.0017 3.62667 50 5V35C50 36.375 49.5108 37.5525 48.5325 38.5325C47.5542 39.5125 46.3767 40.0017 45 40H10L0 50ZM17.6875 30.625L25 26.1875L32.3125 30.625L30.375 22.3125L36.875 16.6875L28.3125 16L25 8.125L21.6875 16L13.125 16.6875L19.625 22.3125L17.6875 30.625Z" />
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="font-IBMPlex text-xl">
                    {t("reviewProduct")}
                  </span>
                  <span className="font-medium">{t("rateExperience")}</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              onPress={() => setIsModalOpen(false)}
              radius="none"
              color="transparent"
              size="md"
              className="absolute start-4 top-8 px-4 min-w-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            <div className="grid md:grid-cols-2 gap-4">
              {ratingTypes.map(({ type, name }, idx) => (
                <div
                  className="bg-[rgba(253,220,166,0.2)] fix rounded-md p-4 flex justify-between items-center"
                  key={idx}
                >
                  <span className="text-lg font-semibold">{name}</span>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((star, idx) => (
                      <button
                        key={type + idx}
                        type="button"
                        onClick={() =>
                          setRating((prev) => ({
                            ...prev,
                            [type]: star,
                          }))
                        }
                        className="text-2xl"
                      >
                        <Star filled={rating[type] >= star} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Textarea
              size="lg"
              radius="sm"
              isRequired
              label={t("leaveComment")}
              labelPlacement="outside"
              name="review"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              type="text"
              classNames={{
                input: "resize-y min-h-[140px] text-base text-right",
                label: "text-lg pb-3 flex items-center",
              }}
              minLength={3}
            />

            {isAdmin && (
              <div className="grid md:grid-cols-2 gap-4 border-t border-gray-100 py-4">
                <Input
                  label={t("userName")}
                  placeholder={t("userNamePlaceholder")}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  labelPlacement="outside-top"
                  size="lg"
                  classNames={{
                    label: "text-lg pb-3 flex items-center",
                    inputWrapper: "  h-full",
                  }}
                />
                <div className="flex flex-col gap-3">
                  <label className="text-lg pb-0 flex items-center">
                    {t("userImage")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUserImageChange}
                    className="hidden"
                    id="user-image-upload"
                  />
                  <label
                    htmlFor="user-image-upload"
                    className="cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-2 flex items-center justify-center h-[56px] hover:border-[#F48A42] transition-colors bg-gray-50 dark:bg-gray-800"
                  >
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="User Preview"
                        className="h-full rounded-full aspect-square object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">
                        {t("uploadUserImage")}
                      </span>
                    )}
                  </label>
                </div>
              </div>
            )}

            <ImageUploader
              review={true}
              lang={lang}
              files={images}
              setFiles={setImages}
              translate={translate}
            />
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-3 mt-3 flex-shrink-0">
            <Button
              type="submit"
              isDisabled={loading}
              className="shadow-[rgba(244,138,66,0.4)] py-4 px-8 flex justify-center gap-3"
            >
              {loading ? t("saving") : t("addReview")}
              <Send size={18} />
            </Button>
            <Button
              className="text-black dark:text-white px-0"
              color="transparent"
              onPress={() => setIsModalOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </form>
    </CustomModal>
  );
}
