"use client";
import { useState, useRef } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import { Camera } from "@/components/ui/svgs/icons/CameraSvg";
import { Premium } from "@/components/ui/svgs/icons/PremiumSvg";
import ConfirmModal from "../ConfirmModal";
import PushNotificationModal from "@/components/shared/PushNotificationModal";
import ProfileImageRulesModal from "./ProfileImageRulesModal";
import ProfileImageRejectionModal from "./ProfileImageRejectionModal";
import { revalidateWithTag } from "@/actions/revalidateTag";

export default function ProfileImage({ translate, user, setUser, t, lang }) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const revalidateProducts = async () => {
    try {
      const res = await fetch(`/api/products?userId=${user._id}&fields=_id`);
      const data = await res.json();
      if (data.success) {
        await Promise.all(
          data.data.map((product) =>
            revalidateWithTag(`product-${product._id}`),
          ),
        );
      }
    } catch (error) {
      console.error("Error revalidating products:", error);
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        const img = new window.Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          let width = img.width;
          let height = img.height;

          // Make the image square by using the smaller dimension
          const size = Math.min(width, height);
          const x = (width - size) / 2;
          const y = (height - size) / 2;

          // Set canvas dimensions to be square
          canvas.width = 1000;
          canvas.height = 1000;

          // Draw and resize image on canvas
          ctx?.drawImage(img, x, y, size, size, 0, 0, 1000, 1000);

          // Convert to WebP format with base64
          const resizedBase64 = canvas.toDataURL("image/webp");
          resolve(resizedBase64);
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
    });
  };

  const handleImageClick = () => {
    if (user?.premium) {
      fileInputRef.current?.click();
    } else {
      setIsRulesModalOpen(true);
    }
  };

  const handleRulesConfirm = () => {
    setIsRulesModalOpen(false);
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(ToastMessage(t("profileImage.uploadError")));
      return;
    }

    setIsLoading(true);
    try {
      // Resize image before preview and upload
      const resizedImage = await resizeImage(file);
      setPreviewImage(resizedImage);

      const res = await fetch("/api/users/profile-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileImage: resizedImage, lang }),
      });

      const result = await res.json();
      console.log("updatedUser", result.data);
      console.log("User", user);
      if (!result.success) {
        if (result.rejectionReason) {
          setRejectionReason(result.rejectionReason);
          setIsRejectionModalOpen(true);
          setPreviewImage(null);
          return setUser(result.data);
        } else {
          throw new Error(
            result.error || result.rejectionReason || t("profileImage.error"),
          );
        }
      }

      setUser(result.data);
      toast.success(ToastMessage(t("profileImage.updateSuccess")));
      await revalidateProducts();
    } catch (err) {
      toast.error(ToastMessage(err.message));
      setPreviewImage(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/profile-image", { method: "DELETE" });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || t("profileImage.error"));

      setPreviewImage(null);
      setUser(result.data);
      setIsDeleteModalOpen(false);
      toast.success(ToastMessage(t("profileImage.deleteSuccess")));
      await revalidateProducts();
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/profile-image/review", {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        toast.success(ToastMessage(t("profileImage.reviewRequested")));
        setUser(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(ToastMessage(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className={`md:w-48 md:h-48 w-24 h-24 rounded-full overflow-hidden bg-gray-200 cursor-pointer relative ${
              user?.profileImageStatus === "rejected"
                ? "border-4 border-red-500"
                : ""
            }`}
            onClick={handleImageClick}
          >
            <Image
              src={
                user?.profileImageStatus === "rejected"
                  ? anyImgUrl({ src: user?.rejectedImage, size: 500 })
                  : previewImage
                    ? previewImage
                    : user?.avatar
                      ? anyImgUrl({ src: user?.avatar, size: 500 })
                      : anyImgUrl({ src: "download_z9xvlw", size: 500 })
              }
              alt={`${user?.fullName} profile picture`}
              className="h-full w-full object-cover rounded-full"
              unoptimized
              fill
            />
            {user?.profileImageStatus === "rejected" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm text-center px-2">
                  {t("profileImage.rejected")}
                </span>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={handleImageClick}
            className="absolute bottom-0 end-0 bg-primary text-white rounded-full md:p-3 p-2 transition-colors"
          >
            <Camera className="md:w-5 md:h-5 w-4 h-4" />
          </button>
        </div>

        {user?.profileImageStatus === "rejected" && (
          <div className="mt-5 w-full max-w-sm">
            {/* Rejection Reason */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-600 text-sm font-semibold leading-relaxed">
                    {user.rejectionReason}
                  </p>
                  <div className="mt-2">
                    {!user.reviewRequested ? (
                      <button
                        onClick={handleRequestReview}
                        disabled={isLoading}
                        className="text-sm font-semibold text-primary hover:text-orange-600 underline underline-offset-2 hover:no-underline disabled:opacity-50"
                      >
                        {t("profileImage.requestReview")}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {t("profileImage.reviewPending")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Upgrade Card */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-orange-200/60 rounded-2xl overflow-hidden shadow-sm">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary to-orange-500 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Premium className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      {t("profileImage.premiumUpgrade.title")}
                    </h3>
                    <p className="text-orange-100 text-[11px] leading-tight mt-0.5">
                      {t("profileImage.premiumUpgrade.subtitle")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <div className="p-4">
                <ul className="space-y-2.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-gradient-to-br from-primary to-orange-500 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm leading-snug">
                        {t(`profileImage.premiumUpgrade.benefit${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href={`/${lang === "ar" ? "" : "en/"}contact`}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md hover:shadow-lg"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {t("profileImage.premiumUpgrade.cta")}
                </a>
              </div>
            </div>
          </div>
        )}

        <button
          disabled={isLoading}
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-center text-base md:text-lg md:my-4 my-2 text-red-500 font-semibold 2xl:w-60"
        >
          {t("profileImage.deleteButton")}
        </button>
        <PushNotificationModal
          translate={translate}
          customer={true}
          lang={lang}
        />
      </div>

      <ProfileImageRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onConfirm={handleRulesConfirm}
        t={t}
      />

      <ProfileImageRejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        reason={rejectionReason}
        t={t}
      />

      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteImage}
          title={t("profileImage.deleteTitle")}
          message={t("profileImage.deleteMessage")}
          confirmText={t("profileImage.deleteConfirm")}
          type="cancel"
          loading={isLoading}
          t={t}
        />
      )}
    </>
  );
}
