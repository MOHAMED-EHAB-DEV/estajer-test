"use client";
import CustomModal from "../ui/CustomModal";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

const ImagePreviewModal = ({
  isOpen,
  onClose,
  imageSrc,
  alt = "Full documentation",
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      className="bg-transparent shadow-none border-none rounded-none max-h-none overflow-visible flex flex-col w-full"
      backdropClass="bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full h-[80vh] flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 end-5 z-50 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition-all w-10 h-10 flex items-center justify-center"
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
        </button>

        {imageSrc && (
          <div className="relative w-full h-full">
            <Image
              src={anyImgUrl({ src: imageSrc, size: 1500 })}
              alt={alt}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default ImagePreviewModal;
