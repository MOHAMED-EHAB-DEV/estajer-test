"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ProductDetailModal = dynamic(
  () => import("@/components/shared/ProductDetailModal"),
  { ssr: false, loading: () => null },
);

export default function ProductDetailsButton({
  sm,
  product,
  lang,
  translate,
  branch,
  providerId,
  tUiDetails,
  tUiSeeDetails,
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  return (
    <>
      <button
        className={`${
          sm
            ? "h-10 md:h-11 min-w-0 px-3 text-[13px] md:text-[15px] rounded-xl md:rounded-3xl"
            : "flex-1"
        } font-semibold text-white bg-[#9393A1] shadow-lg shadow-[rgba(244,138,66,0.2)]`}
        aria-label={`${tUiSeeDetails} ${product?.name || ""}`}
        title={`${tUiSeeDetails} ${product?.name || ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDetailsModal(true);
        }}
      >
        {sm && (
          <svg
            fill="#fff"
            version="1.1"
            viewBox="0 0 32 32"
            className="md:hidden inline min-w-4.5 h-4.5"
          >
            <path d="M16 28C9.044 28 2.79 23.43.067 16.36a1 1 0 0 1 0-.72C2.79 8.57 9.044 4 16 4s13.21 4.57 15.933 11.64c.09.232.09.488 0 .72C29.21 23.43 22.956 28 16 28M2.076 16C4.568 22.088 9.996 26 16 26s11.432-3.912 13.924-10C27.432 9.912 22.004 6 16 6S4.568 9.912 2.076 16"></path>
            <path d="M16 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12m-2 6.219a2 2 0 1 1 0-4 2 2 0 0 1 0 4"></path>
          </svg>
        )}
        <span className={sm ? "hidden md:inline" : ""}>{tUiDetails}</span>
      </button>

      {showDetailsModal && (
        <ProductDetailModal
          isOpen
          onClose={() => setShowDetailsModal(false)}
          productSummary={product}
          lang={lang}
          translate={translate}
          distance={0}
          branch={branch}
          providerId={providerId}
        />
      )}
    </>
  );
}
