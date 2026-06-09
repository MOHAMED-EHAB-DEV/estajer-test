"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import Button from "../ui/Button";
import Link from "next/link";
import ImagesContainer from "../singleProduct/ImagesContainer";
import { Location } from "../ui/svgs/icons/LocationSvg";
import { Star2 } from "../ui/svgs/icons/Star2Svg";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Order } from "../ui/svgs/OrdersSvg";
import { getUrlName } from "@/lib/sitemap";

export default function ProductDetailModal({
  isOpen,
  onClose,
  productSummary,
  lang,
  distance,
  translate,
  branch,
  providerId,
}) {
  const trans = useTranslations(translate);
  const [product, setProduct] = useState(productSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const langPrefix = lang === "ar" ? "" : "en/";
  const t = (value) => trans(`productComponent.${value}`);
  const tUi = (value) => trans(`ui.button.${value}`);

  useEffect(() => {
    if (isOpen && productSummary?._id) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const productRes = await fetch(
            `/api/products/${productSummary._id}?lang=${lang}`,
          );

          const productData = await productRes.json();

          if (productData.success) {
            setProduct(productData.data);
          } else {
            setError(productData.error || "Failed to fetch product details.");
          }
        } catch (err) {
          setError("An error occurred.");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setProduct(null);
    }
  }, [isOpen, productSummary, lang]);

  const averageRating = product?.rating?.average ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      hideCloseButton
      classNames={{
        body: "md:py-6 py-3 md:px-6 px-3",
        backdrop: "bg-black/40 backdrop-blur-sm",
        base: "border-none bg-white dark:bg-gray-900 text-black dark:text-white",
        header: "border-b-1 border-gray-200 md:px-6 px-4 md:py-4 py-2",
        footer: "border-t-1 border-gray-200 md:px-6 px-4 md:py-4 py-2",
        closeButton: "hover:bg-gray-100 active:bg-gray-200 rounded-full",
      }}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 justify-between items-center">
              <div className="w-full">
                <div className="flex gap-2 items-center py-1">
                  <Order className="md:w-[18px] md:h-[18px] w-4 h-4" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-IBMPlex md:text-xl text-base font-semibold">
                      {t("productDetails")}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="light"
                onPress={() => onClose(false)}
                radius="full"
                className="absolute end-2 top-2 px-4 min-w-0"
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
            </ModalHeader>

            <ModalBody>
              {loading && (
                <div className="flex justify-center items-center h-96">
                  <Spinner label={tUi("loading")} />
                </div>
              )}
              {error && <p>Error: {error}</p>}
              {product && (
                <>
                  <ImagesContainer product={product} isModel={true} />
                  <div className="p-2">
                    <div className="flex justify-between items-center mt-4">
                      <h1 className="font-IBMPlex md:text-[1.8rem] text-[1.2rem] font-semibold">
                        {product.name}
                      </h1>
                      {averageRating > 0 && (
                        <div className="flex gap-2 items-center">
                          {[...Array(5)].map((_, idx) => (
                            <Star2 key={idx} filled={idx < averageRating} />
                          ))}
                          <span className="text-darkNavy text-[0.85rem] md:text-[1.5rem] opacity-65 font-semibold">
                            {averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 items-center mb-1 mt-2 text-sm md:text-base">
                      <Location
                        color="#F48A42"
                        className="md:w-[16px] md:h-[20px] w-3.5 h-4"
                      />
                      {product.address?.city}
                      {distance && (
                        <span className="text-sm text-gray-500">
                          {t("distanceAway").replace(
                            "{distance}",
                            distance.toFixed(1),
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-[#5B5656] md:text-[1.1rem] text-[0.95rem] whitespace-pre-line mt-4">
                      {product.description}
                    </p>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className="md:text-base text-[13px] h-auto md:py-4 py-3"
              >
                {tUi("close")}
              </Button>
              <Button
                as={Link}
                href={`/${langPrefix}products/${getUrlName(
                  productSummary.name,
                )}_ref_${productSummary._id}${
                  branch || providerId
                    ? `?${new URLSearchParams({
                        ...(branch && { branch }),
                        ...(providerId && { providerId }),
                      }).toString()}`
                    : ""
                }`}
                className="font-semibold md:text-base text-[13px] h-auto md:py-4 py-3 md:px-8 px-6"
                isDisabled={!product}
              >
                {tUi("rentItNow")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
