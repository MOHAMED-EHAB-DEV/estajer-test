"use client";
import Link from "next/link";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "@/hooks/useTranslations";
// import { Chip } from "@heroui/react";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { Location } from "../ui/svgs/icons/LocationSvg";
import { useState } from "react";
import ProductImage from "./ProductImage";
import { getProductStatus } from "@/utils/getProductStatus";
import calculateDistance from "@/utils/calculateDistance";
import formatDuration from "@/utils/formatDuration";
import { getUrlName } from "@/lib/sitemap";

// Dynamic imports for conditional components
const ProductDetailModal = dynamic(() => import("./ProductDetailModal"), {
  loading: () => null,
  ssr: false,
});
const ProductOwnerActions = dynamic(() => import("./ProductOwnerActions"), {
  ssr: false,
});
const ProductFavoriteButton = dynamic(() => import("./ProductFavoriteButton"), {
  ssr: false,
});
const ProductStarToggle = dynamic(() => import("./ProductStarToggle"), {
  ssr: false,
});
const ProductOwnerCheckbox = dynamic(() => import("./ProductOwnerCheckbox"), {
  ssr: false,
});
const ProductAdminCheckbox = dynamic(() => import("./ProductAdminCheckbox"), {
  ssr: false,
});
const ProductStatusInfo = dynamic(() => import("./ProductStatusInfo"), {
  ssr: false,
});
const ConfirmModal = dynamic(() => import("../dashboard/ConfirmModal"), {
  ssr: false,
});

export default function Product({
  sm,
  lang,
  admin,
  owner,
  product,
  translate,
  onApprove,
  onReject,
  isPending,
  isSelected,
  onSelect,
  isFirstSelected,
  priority = false,
  branch,
  user,
  favoriteProducts = [],
  toggleFavorite,
  providerId,
}) {
  const distance = useMemo(() => {
    if (!user?.location || !product?.location?.coordinates) return "";
    return calculateDistance(
      product.location?.coordinates[1],
      product.location?.coordinates[0],
      user.location.lat,
      user.location.lng,
    );
  }, [product?.location?.coordinates, user?.location]);
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const t = (value) => trans(`productComponent.${value}`);
  const tUi = (value) => trans(`ui.button.${value}`);
  const [modalData, setModalData] = useState({ show: false });

  const { discountPriceWithTax, priceWithTax, hasDiscount } = useMemo(() => {
    const hasDiscount =
      product?.rental?.discountTiers &&
      product.pricingModel !== "packages" &&
      product?.rental?.discountTiers?.length > 0;
    const discountPrice = hasDiscount
      ? product.rental.discountTiers[0].discountPrice
      : null;
    const tax = 0.15;
    const hasTaxCode = !!product.owner?.companyDetails?.taxCode;
    const basePrice =
      product.pricingModel === "packages"
        ? product.rental.packages[0].price
        : product.rental.value;
    const priceWithTax = hasTaxCode
      ? Math.round(basePrice * (1 + tax))
      : basePrice;
    const discountPriceWithTax = hasDiscount
      ? hasTaxCode
        ? Math.round(discountPrice * (1 + tax))
        : discountPrice
      : null;

    return {
      discountPriceWithTax,
      priceWithTax,
      hasDiscount,
    };
  }, [product]);

  // Get current product status
  const currentStatus = useMemo(
    () => (product ? getProductStatus(product, t) : null),
    [product, lang, t],
  );
  if (!product) return null;

  return (
    <>
      <article
        className={`${
          sm ? "rounded-xl md:rounded-3xl" : "rounded-3xl"
        } flex flex-col bg-white shadow-lg overflow-hidden h-full relative`}
        itemScope
        itemType="https://schema.org/Product"
        role="article"
        aria-label={`${t("product")}: ${product.name}`}
      >
        <link itemProp="image" href={product.images?.[0].preview} />
        <ProductImage
          sm={sm}
          lang={lang}
          product={product}
          // priority={priority}
          owner={owner || admin}
          getUrlName={getUrlName}
          branch={branch}
          providerId={providerId}
          currentStatus={currentStatus}
        />

        {/* {product?.rental?.delivery?.type === "free" && (
          <div className="absolute top-0 start-0 z-10 p-2 md:p-3">
            <Chip
              size={sm ? "sm" : "md"}
              color="success"
              variant="flat"
              className="font-medium shadow-sm backdrop-blur-md bg-secondary/40 text-white"
            >
              <div className="flex gap-1 items-center justify-center">
                <div className="w-4 h-4 rounded-2xl bg-gradient-to-br from-[#f48a42] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#f48a42]/30">
                  <svg
                    className="w-2 h-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 7h-3V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1.5a2.5 2.5 0 0 0 5 0h3a2.5 2.5 0 0 0 5 0H21a1 1 0 0 0 1-1v-5a1 1 0 0 0-.293-.707L19 7zM6 8h8v2H6V8zm2.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  </svg>
                </div>
                {t("freeDelivery")}
              </div>
            </Chip>
          </div>
        )} */}
        {!owner && !admin && (
          <ProductFavoriteButton
            product={product}
            favoriteProducts={favoriteProducts}
            toggleFavorite={toggleFavorite}
          />
        )}

        {admin && <ProductStarToggle product={product} />}

        {owner && onSelect && (
          <ProductOwnerCheckbox
            product={product}
            onSelect={onSelect}
            isSelected={isSelected}
          />
        )}

        {admin && onSelect && (
          <ProductAdminCheckbox
            product={product}
            onSelect={onSelect}
            isSelected={isSelected}
            isFirstSelected={isFirstSelected}
          />
        )}

        <div
          className={`${
            sm ? "md:p-5 md:pt-4 p-2" : owner || admin ? "p-4" : "md:p-5 p-4"
          } flex flex-col justify-between flex-1`}
        >
          {(admin || owner) && (
            <ProductStatusInfo
              sm={sm}
              admin={admin}
              owner={owner}
              product={product}
              t={t}
              currentStatus={currentStatus}
            />
          )}

          <div
            className={`flex ${sm ? "gap-x-1 md:gap-x-2" : "gap-x-2"} items-center mb-2 flex-wrap`}
          >
            <div
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="SAR" />
              <meta
                itemProp="availability"
                content={"https://schema.org/InStock"}
              />
              {hasDiscount ? (
                <div className="flex items-baseline gap-2">
                  <span
                    className={`${
                      sm ? "text-lg md:text-[23px]" : "text-2xl"
                    } text-primary font-bold font-IBMPlex flex items-center gap-1`}
                    itemProp="price"
                    content={discountPriceWithTax}
                  >
                    {discountPriceWithTax}{" "}
                    <Currency
                      className={sm ? "w-4 h-4 md:w-6 md:h-6" : "w-6 h-6"}
                      color="#F48A42"
                    />
                  </span>
                  <span
                    className={`${
                      sm ? "text-[15px] md:text-base" : ""
                    } text-gray-400 line-through font-IBMPlex flex items-center`}
                  >
                    {priceWithTax}
                    <Currency
                      className={
                        sm ? "w-[13px] h-[13px] md:w-4 md:h-4" : "w-4 h-4"
                      }
                      color="#A0AEC0"
                      size={16}
                    />
                  </span>
                </div>
              ) : (
                <span
                  className={`${
                    sm ? "text-lg md:text-[23px]" : "text-2xl"
                  } text-primary font-bold font-IBMPlex flex items-center gap-1`}
                  itemProp="price"
                  content={priceWithTax}
                >
                  {priceWithTax}{" "}
                  <Currency
                    className={sm ? "w-4 h-4 md:w-5 md:h-5" : "w-6 h-6"}
                    color="#F48A42"
                  />
                </span>
              )}
            </div>
            <span
              className={`${
                sm ? "text-[13px] md:text-base" : ""
              } text-black opacity-65`}
            >
              {product.pricingModel === "packages"
                ? `${t("per")} ${formatDuration({
                    duration: product.rental.packages[0].duration,
                    unit: product.rental.packages[0].unit,
                    t: (key) => t(`bookingPackages.${key}`),
                    lang,
                  })}`
                : t("perDay")}
            </span>
          </div>
          <div
            className={`${
              sm ? "text-[13px] md:text-[15px] md:mb-2 mb-[6px]" : "mb-2"
            } font-semibold text-[#020202] flex items-center flex-wrap gap-1`}
            aria-label={
              product.address?.city +
              (lang === "ar" ? " السعودية" : " Saudi Arabia")
            }
          >
            <Location
              color="#F48A42"
              className={
                sm
                  ? "w-[14px] h-[16px] md:w-[14px] md:h-[18px]"
                  : "md:w-[16px] md:h-[20px]"
              }
            />
            {product.address?.city}
            {distance > 0 && !owner && !admin && (
              <span
                className={`${
                  sm ? "text-[11px] md:text-[13px]" : "text-sm"
                } text-gray-500`}
              >
                {t("distanceAway").replace("{distance}", distance.toFixed(1))}
              </span>
            )}
          </div>
          <div
            className={`${
              sm ? "text-[15px] md:text-lg md:leading-8" : "text-xl leading-8"
            } font-semibold text-darkNavy line-clamp-2`}
            itemProp="name"
          >
            {product.name}
          </div>
          {admin || owner ? (
            <ProductOwnerActions
              sm={sm}
              admin={admin}
              owner={owner}
              product={product}
              t={t}
              tUi={tUi}
              langPrefix={langPrefix}
              currentStatus={currentStatus}
              getUrlName={getUrlName}
              setModalData={setModalData}
              onApprove={onApprove}
              onReject={onReject}
              isPending={isPending}
            />
          ) : (
            <div
              className={`${
                sm ? "md:mt-4 mt-3" : "mt-4"
              } md:grid md:grid-cols-2 flex justify-between gap-2 select-none`}
            >
              <Link
                href={`/${langPrefix}products/${getUrlName(product.name)}_ref_${
                  product._id
                }${
                  branch || providerId
                    ? `?${new URLSearchParams({
                        ...(branch && { branch }),
                        ...(providerId && { providerId }),
                      }).toString()}`
                    : ""
                }`}
                aria-label={tUi("rent") + " " + product.name}
                title={product.name + " " + tUi("rentItNow")}
                className={`${
                  sm
                    ? "h-10 md:h-11 text-[13px] md:text-[15px] rounded-xl md:rounded-3xl"
                    : ""
                } font-semibold flex-1 bg-primary flex items-center justify-center shadow-xl text-white`}
              >
                {tUi("rentItNow")}
              </Link>

              <button
                className={`${
                  sm
                    ? "h-10 md:h-11 min-w-0 px-3 text-[13px] md:text-[15px] rounded-xl md:rounded-3xl"
                    : "flex-1"
                } font-semibold text-white bg-[#9393A1] shadow-lg shadow-[rgba(244,138,66,0.2)]`}
                aria-label={tUi("seeDetails") + " " + product.name}
                title={tUi("seeDetails") + " " + product.name}
                onClick={() => setModalData({ show: true, type: "details" })}
              >
                {sm && (
                  <svg
                    fill="#fff"
                    version="1.1"
                    viewBox="0 0 32 32"
                    className="md:hidden inline min-w-[18px] h-[18px]"
                  >
                    <path d="M16 28C9.044 28 2.79 23.43.067 16.36a1 1 0 0 1 0-.72C2.79 8.57 9.044 4 16 4s13.21 4.57 15.933 11.64c.09.232.09.488 0 .72C29.21 23.43 22.956 28 16 28M2.076 16C4.568 22.088 9.996 26 16 26s11.432-3.912 13.924-10C27.432 9.912 22.004 6 16 6S4.568 9.912 2.076 16"></path>
                    <path d="M16 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12m-2 6.219a2 2 0 1 1 0-4 2 2 0 0 1 0 4"></path>
                  </svg>
                )}
                <span className={sm ? "hidden md:inline" : ""}>
                  {tUi("details")}
                </span>
              </button>
            </div>
          )}
        </div>
      </article>
      {modalData.show && modalData.type !== "details" && (
        <ConfirmModal
          t={t}
          isOpen={modalData.show && modalData.type !== "details"}
          onClose={() => setModalData({ show: false })}
          {...modalData}
        />
      )}
      {modalData.show && modalData.type === "details" && (
        <ProductDetailModal
          isOpen={modalData.show && modalData.type === "details"}
          onClose={() => setModalData({ show: false })}
          productSummary={product}
          lang={lang}
          translate={translate}
          distance={distance}
          branch={branch}
          providerId={providerId}
        />
      )}
    </>
  );
}
