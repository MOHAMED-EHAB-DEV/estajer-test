"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import Button from "../ui/Button";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import { Delete } from "@/components/ui/svgs/icons/DeleteSvg";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";;
import ConfirmModal from "@/components/dashboard/ConfirmModal";

const RequestedProduct = ({ lang, translate, owner, buttonsText, request }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalData, setModalData] = useState({ show: false });
  const itemRef = useRef(null);
  const trans = useTranslations(translate);
  const t = (value) => trans(`productComponent.${value}`);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), 250);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "-100px 0px" }
    );

    if (itemRef.current) observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDelete = (requestId) => {
    setModalData({
      show: true,
      title: t("confirmDeleteTitle"),
      message: t("confirmDeleteMessage"),
      confirmText: t("delete"),
      cancelText: t("cancel"),
      type: "delete",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/requests/${requestId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            router.refresh();
            await revalidate("/");
            await revalidateWithTag(`product-${requestId}`);
            setModalData({ show: false });
          }
        } catch (error) {
          console.error(t("deleteFailed"), error);
          setModalData({ show: false });
        }
      },
    });
  };

  // Use the first image from the request or a placeholder if none exists
  const imageUrl =
    request?.images?.length > 0
      ? request.images[0]
      : "https://www.furnitureandchoice.com.my/cdn/shop/files/FS6000101_01_0c5a2724-7962-488b-b3d3-06494282acbb.jpg";

  const langPrefix = lang === "ar" ? "" : "en/";
  const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${langPrefix}requests/preview/${request?._id}`;
  const detailUrl = `/${langPrefix}request/${request?._id}`;

  return (
    <>
      <article
        ref={itemRef}
        className={`[box-shadow:_0px_4px_10px_0px_rgba(14,14,14,0.1)] md:rounded-3xl rounded-lg bg-white flex items-center overflow-hidden transition-all duration-600 ease-out transform
        ${isVisible ? "opacity-100 translate-x-0 " : "opacity-0 translate-x-6"}
      `}
        itemScope
        itemType="https://schema.org/Demand"
      >
        <Link
          href={detailUrl}
          className="w-52 max-w-[35%] aspect-[1/1] relative h-full"
          aria-label={`View details for ${request?.name}`}
        >
          <Image
            fill
            alt={`${request?.name} - requested product image`}
            title={request?.name}
            className="h-full w-full object-cover"
            src={anyImgUrl({ src: imageUrl, size: 500 })}
          />
        </Link>
        <div className="md:p-6 md:pl-3 p-4 flex-1 flex flex-col justify-around h-full">
          {request.approved && owner && (
            <div
              className="bg-[#4FD658] text-white py-1 px-4 rounded-md w-max text-[13px] mb-2 font-IBMPlex"
              role="status"
              aria-label="Request approved"
            >
              {t("approved")}
            </div>
          )}
          {request.rejected && owner && (
            <div
              className="bg-[#F44242] py-1 px-4 text-white rounded-md w-max text-[13px] mb-2 font-IBMPlex"
              role="status"
              aria-label="Request rejected"
            >
              {t("rejected")}
            </div>
          )}
          {request.rejected === false &&
            request.approved === false &&
            owner && (
              <div
                className="bg-[#F48A42] py-1 px-4 rounded-md text-white w-max text-[13px] mb-2 font-IBMPlex"
                role="status"
                aria-label="Request pending approval"
              >
                {t("pendingApproval")}
              </div>
            )}
          <header>
            <h3
              className="text-darkNavy lg:text-[1.35rem] md:text-[1.25rem] text-[1.1rem] font-semibold line-clamp-2 capitalize"
              itemProp="name"
            >
              {request?.name}
            </h3>
          </header>
          <div
            className={`md:gap-4 sm:gap-2 gap-1 md:mt-6 mt-4 ${
              owner ? "flex flex-row justify-between" : "grid grid-cols-2"
            }`}
          >
            {!owner && (
              <Button
                as={Link}
                href={detailUrl}
                className="h-9 text-sm md:text-base md:h-12 font-semibold"
                aria-label={`Own this item: ${request?.name}`}
              >
                {buttonsText?.ownIt || "امتلكه"}
              </Button>
            )}
            <Button
              as={Link}
              href={owner ? previewUrl : detailUrl}
              className="h-9 text-sm md:text-base md:h-12 font-semibold text-white bg-[#9393A1] shadow-[rgba(244,138,66,0.2)]"
              aria-label={`View details for: ${request?.name}`}
            >
              {buttonsText?.details || "تفاصيل"}
            </Button>
            {owner && (
              <div className="flex items-center justify-center flex-row gap-2">
                <Button
                  as={Link}
                  href={`/edit-request-product/${request?._id}`}
                  className="min-w-0 w-fit p-4 bg-[#EAEEF3] rounded-full"
                  color="transparent"
                  aria-label={`Edit request: ${request?.name}`}
                  title={`Edit request: ${request?.name}`}
                >
                  <Edit size={18} aria-hidden="true" />
                </Button>
                <Button
                  className="min-w-0 w-fit p-4 bg-[#EAEEF3] rounded-full"
                  color="transparent"
                  onClick={() => handleDelete(request?._id)}
                  aria-label={`Delete request: ${request?.name}`}
                  title={`Delete request: ${request?.name}`}
                >
                  <Delete size={18} aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </article>
      {modalData.show && modalData.type === "delete" && (
        <ConfirmModal
          t={t}
          isOpen={modalData.show && modalData.type === "delete"}
          onClose={() => setModalData({ show: false })}
          {...modalData}
        />
      )}
    </>
  );
};

export default RequestedProduct;
