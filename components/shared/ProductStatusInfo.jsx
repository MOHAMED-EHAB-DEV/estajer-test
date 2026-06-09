"use client";

import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useDisclosure } from "@heroui/react";

const ProductRejectionModal = dynamic(() => import("./ProductRejectionModal"), {
  ssr: false,
});

export default function ProductStatusInfo({
  sm,
  admin,
  owner,
  product,
  t,
  currentStatus,
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  if (!admin && !owner) return null;

  const CurrentStatus = () => {
    return (
      <div
        className={`${currentStatus.className} ${
          sm
            ? "py-0.5 px-2 text-[10px] md:text-[13px]"
            : "py-1 px-4 text-[13px]"
        } rounded-md w-max font-IBMPlex text-white`}
      >
        {currentStatus.label}
      </div>
    );
  };

  return (
    <>
      {(owner || admin) && (
        <div
          className={
            admin
              ? `flex justify-between items-center ${
                  sm ? "gap-1 mb-1.5 pb-1.5" : "gap-2 mb-3 pb-3"
                } border-b border-gray-100`
              : sm
                ? "mb-1"
                : "mb-2"
          }
        >
          {admin && product.owner && (
            <div className={`flex items-center ${sm ? "gap-1" : "gap-2"}`}>
              <Image
                unoptimized
                width={100}
                height={100}
                src={anyImgUrl({
                  src: product.owner.avatar,
                  size: 100,
                })}
                alt={product.owner.fullName}
                className={`${
                  sm ? "w-6 h-6" : "w-8 h-8"
                } rounded-full object-cover border border-gray-200`}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className={`${
                    sm ? "text-xs md:text-[13px]" : "text-xs md:text-sm"
                  } font-semibold text-darkNavy truncate max-w-[50px] md:max-w-none`}
                >
                  {product.owner.fullName}
                </span>
                <span className="text-[10px] text-gray-500">
                  {product.owner.phone}
                </span>
              </div>
            </div>
          )}
          <CurrentStatus />
        </div>
      )}
      {/* Rejection Message */}
      {product.rejected && product.rejectMessage && (
        <>
          <div
            onClick={onOpen}
            className="group flex flex-col gap-1 cursor-pointer bg-red-50 hover:bg-red-100 transition-colors p-2 rounded-lg border border-red-100 mb-3"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 px-1">
              {t("rejectionReason")}
            </span>
            <p className="text-xs text-red-700 line-clamp-1 px-1">
              {product.rejectMessage || t("cannotAcceptRequest")}
            </p>
          </div>

          {isOpen && (
            <ProductRejectionModal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              rejectMessage={product.rejectMessage}
              t={t}
            />
          )}
        </>
      )}
    </>
  );
}
