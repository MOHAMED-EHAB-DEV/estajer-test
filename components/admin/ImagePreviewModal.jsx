"use client";
import CustomModal from "../ui/CustomModal";
import Image from "next/image";

export default function ImagePreviewModal({ previewImage, onClose }) {
  return (
    <CustomModal
      isOpen={!!previewImage}
      onClose={onClose}
      size="full"
      className="bg-black/95 backdrop-blur-md w-full h-full flex flex-col justify-center items-center select-none"
      backdropClass="bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full h-full flex items-center justify-center" onClick={onClose}>
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute left-6 top-6 z-50 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 w-10 h-10 border border-white/30 backdrop-blur-md flex items-center justify-center transition-all"
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
      </div>
    </CustomModal>
  );
}
