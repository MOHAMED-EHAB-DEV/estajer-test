"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Currency } from "@/components/ui/svgs/icons/CurrencySvg";
import { Location } from "@/components/ui/svgs/icons/LocationSvg";
import { anyImgUrl } from "@/utils/ImageUrl";
import {
  useProductCard,
  ProductCardModal,
} from "@/components/shop/themes/shared/useProductCard";

const ProductFavoriteButton = dynamic(
  () => import("@/components/shared/ProductFavoriteButton"),
  { ssr: false },
);

/**
 * Unified ProductCard component supporting multiple theme designs via the "theme" prop.
 * Styles supported: "classic", "bold", "minimal", and "modern".
 */
export default function ProductCard({
  product,
  lang,
  translate,
  priority = false,
  branch,
  user,
  favoriteProducts = [],
  toggleFavorite,
  providerId,
  shopSlug,
  shop,
  theme = "classic",
  brandColor: customBrandColor,
}) {
  const {
    t,
    tUi,
    distance,
    productUrl,
    altText,
    pricingLabel,
    discountPriceWithTax,
    priceWithTax,
    hasDiscount,
    modalData,
    setModalData,
  } = useProductCard({
    product,
    lang,
    translate,
    branch,
    providerId,
    shopSlug,
    user,
  });

  if (!product) return null;

  const brandColor = shop?.brandColor || customBrandColor || "#F48A42";

  const isClassic = theme === "classic";
  const isBold = theme === "bold";
  const isMinimal = theme === "minimal";
  const isModern = theme === "modern";
  const isElegant = theme === "elegant";
  const isCozy = theme === "cozy";

  // Determine card layout classes based on theme config
  let cardClass = "";
  let imageWrapperClass = "";
  let imageAspectRatio = "";
  let imageSize = 400;
  let infoClass = "";
  let nameClass = "";

  if (isCozy) {
    cardClass =
      "rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[0.6rem] rounded-bl-[0.6rem] flex flex-col bg-white border border-neutral-200/50 p-2 md:p-2.5 overflow-hidden h-full relative group/card transition-all duration-300 hover:shadow-md hover:border-[var(--brand-color)]";
    imageWrapperClass =
      "w-full aspect-[4/3] relative overflow-hidden select-none bg-neutral-50 rounded-tl-[1.8rem] rounded-br-[1.8rem] rounded-tr-[0.5rem] rounded-bl-[0.5rem]";
    imageAspectRatio = "4:3";
    imageSize = 400;
    infoClass = "pt-3 flex flex-col gap-2 flex-1";
    nameClass =
      "text-sm md:text-[15px] font-semibold text-neutral-800 line-clamp-2 leading-snug";
  } else if (isModern) {
    cardClass =
      "rounded-2xl flex flex-col bg-white border border-neutral-200/60 overflow-hidden h-full relative shadow-sm hover:shadow-md transition-all duration-300";
    imageWrapperClass =
      "w-full aspect-[4/3] relative group overflow-hidden select-none";
    imageAspectRatio = "4:3";
    imageSize = 400;
    infoClass = "p-3 md:p-4 flex flex-col gap-2 flex-1";
    nameClass =
      "text-sm md:text-[15px] font-semibold text-neutral-900 line-clamp-2 leading-snug";
  } else if (isMinimal) {
    cardClass =
      "flex flex-col bg-white border border-neutral-100 overflow-hidden h-full relative group/card";
    imageWrapperClass =
      "w-full aspect-square relative overflow-hidden select-none";
    imageAspectRatio = "1:1";
    imageSize = 400;
    infoClass =
      "p-3 md:p-4 flex flex-col gap-2 flex-1 border-t border-neutral-100";
    nameClass =
      "text-sm md:text-base font-semibold text-neutral-900 line-clamp-2 leading-snug tracking-tight";
  } else if (isElegant) {
    cardClass =
      "flex flex-col bg-white border border-neutral-200/60 p-2.5 overflow-hidden h-full relative group/card transition-all duration-500 hover:border-neutral-800 hover:shadow-md";
    imageWrapperClass =
      "w-full aspect-[3/4] relative overflow-hidden select-none bg-neutral-50";
    imageAspectRatio = "3:4";
    imageSize = 400;
    infoClass = "pt-4 flex flex-col gap-2.5 flex-1";
    nameClass =
      "text-xs md:text-sm italic text-neutral-800 line-clamp-2 leading-relaxed tracking-wide";
  } else if (isBold) {
    cardClass =
      "rounded-2xl flex flex-col bg-white overflow-hidden h-full relative border border-neutral-100 shadow-sm hover:shadow-lg transition-shadow duration-300";
    imageWrapperClass =
      "w-full aspect-square relative group overflow-hidden select-none";
    imageAspectRatio = "1:1";
    imageSize = 400;
    infoClass = "p-3 md:p-4 flex flex-col gap-2 flex-1";
    nameClass =
      "text-sm md:text-base font-bold text-darkNavy line-clamp-2 leading-tight";
  } else {
    // classic
    cardClass =
      "rounded-xl md:rounded-3xl flex flex-col bg-white shadow-lg overflow-hidden h-full relative";
    imageWrapperClass =
      "w-full aspect-[1/.9] relative group overflow-hidden rounded-t-xl md:rounded-t-3xl select-none";
    imageAspectRatio = "1:.9";
    imageSize = 358;
    infoClass =
      "md:py-5 md:px-4 md:pt-4 p-2 flex flex-col justify-between flex-1";
    nameClass =
      "text-[15px] md:text-lg md:leading-8 font-semibold text-darkNavy line-clamp-2";
  }

  // Render rating chip/overlay
  const renderRating = () => {
    if (!(product?.rating?.average > 0)) return null;

    const ratingAvg = product.rating?.average?.toFixed(1);

    if (isCozy) {
      return (
        <div className="absolute top-2 start-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-sm border px-2 py-0.5 text-[10px] rounded-full border-neutral-100 shadow-sm">
          <svg className="w-2.5 h-2.5" viewBox="0 0 22 22" fill={brandColor}>
            <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
          </svg>
          <span className="text-neutral-700 font-bold">{ratingAvg}</span>
        </div>
      );
    }

    if (isElegant) {
      return (
        <div
          className="absolute top-2 start-2 z-20 flex items-center gap-1 bg-white/95 border px-2 py-0.5 text-[10px]"
          style={{ borderColor: `${brandColor}20` }}
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 22 22" fill={brandColor}>
            <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
          </svg>
          <span className="text-neutral-700 font-semibold">{ratingAvg}</span>
        </div>
      );
    }

    if (isClassic) {
      return (
        <>
          <div className="absolute bottom-0 start-0 w-full h-24 bg-gradient-to-t from-[#06002CCC] to-transparent mix-blend-multiply z-20" />
          <div className="absolute bottom-2 start-2 w-full z-30 p-2">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, idx) => (
                <svg
                  key={idx}
                  className="w-4 h-4 md:w-5 md:h-5"
                  viewBox="0 0 22 22"
                  fill={
                    idx < (product.rating?.average || 0)
                      ? brandColor
                      : "#E5E5E5"
                  }
                >
                  <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                </svg>
              ))}
              <span className="text-white leading-3 mt-1 text-sm">
                {ratingAvg}
              </span>
            </div>
          </div>
        </>
      );
    }

    if (isMinimal) {
      return (
        <div className="absolute bottom-2 start-2 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-neutral-100">
          <svg className="w-3 h-3" viewBox="0 0 22 22" fill={brandColor}>
            <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
          </svg>
          <span className="text-[11px] font-semibold text-neutral-700">
            {ratingAvg}
          </span>
        </div>
      );
    }

    if (isModern) {
      return (
        <div className="absolute top-2 start-2 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm shadow-sm px-2 py-1 rounded-full">
          <svg
            className="w-3 h-3 text-primary"
            viewBox="0 0 22 22"
            fill="currentColor"
          >
            <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
          </svg>
          <span className="text-primary text-[11px] font-bold">
            {ratingAvg}
          </span>
        </div>
      );
    }

    // bold (top-end badge)
    return (
      <div className="absolute top-5 start-2 z-20 flex items-center gap-1 bg-black/10 backdrop-blur-sm px-2 py-1 rounded-full">
        <svg
          className="w-3 h-3 text-primary"
          viewBox="0 0 22 22"
          fill="currentColor"
        >
          <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
        </svg>
        <span className="text-primary text-[11px] font-bold">{ratingAvg}</span>
      </div>
    );
  };

  // Render Theme Location Info
  const renderLocation = () => {
    if (!product.address?.city) return null;

    if (isCozy) {
      return (
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
          <span>
            <Location color={brandColor} className="w-3 h-3 text-primary" />
          </span>
          <span>
            {product.address.city}
            {distance > 0 && ` · ${distance.toFixed(1)} km`}
          </span>
        </p>
      );
    }

    if (isClassic) {
      return (
        <div className="text-[13px] md:text-[15px] md:mb-2 mb-[6px] font-semibold text-[#020202] flex items-center flex-wrap gap-1">
          <Location
            color="currentColor"
            className="w-[14px] h-[16px] md:w-[14px] md:h-4.5 text-primary"
            style={{ color: brandColor }}
          />
          {product.address.city}
          {distance > 0 && (
            <span className="text-[11px] md:text-[13px] text-gray-500">
              {t("distanceAway").replace("{distance}", distance.toFixed(1))}
            </span>
          )}
        </div>
      );
    }

    if (isElegant) {
      return (
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          {product.address.city}
          {distance > 0 && ` · ${distance.toFixed(1)} km`}
        </p>
      );
    }

    if (isMinimal) {
      return (
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
          {product.address.city}
          {distance > 0 && ` · ${distance.toFixed(1)} km`}
        </p>
      );
    }

    if (isModern) {
      return (
        <div className="flex items-center gap-1">
          <span
            className="w-1 h-1 rounded-full shrink-0"
            style={{ backgroundColor: brandColor }}
          />
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
            {product.address.city}
            {distance > 0 && ` · ${distance.toFixed(1)} km`}
          </p>
        </div>
      );
    }

    // bold
    return (
      <div className="flex items-center gap-1 text-[12px] text-neutral-400">
        <Location color="currentColor" className="w-3 h-3.5 shrink-0" />
        {product.address.city}
        {distance > 0 && (
          <span className="text-neutral-300">
            · {t("distanceAway").replace("{distance}", distance.toFixed(1))}
          </span>
        )}
      </div>
    );
  };

  // Render Theme Pricing Info
  const renderPricing = () => {
    const iconSizeClass = isClassic ? "w-4 h-4 md:w-6 md:h-6" : "w-3.5 h-3.5";
    const strikeIconSizeClass = isClassic
      ? "w-[13px] h-[13px] md:w-4 md:h-4"
      : "w-2.5 h-2.5";
    const pricingValClass = isClassic
      ? "text-lg md:text-[23px] text-primary font-bold font-IBMPlex flex items-center gap-1"
      : isBold
        ? "text-lg font-extrabold font-IBMPlex flex items-center gap-0.5"
        : isElegant
          ? "text-base font-bold flex items-center gap-0.5"
          : isCozy
            ? "text-base md:text-lg font-bold font-IBMPlex flex items-center gap-0.5"
            : "text-base font-extrabold font-IBMPlex flex items-center gap-0.5"; // modern & minimal

    const labelClass = isClassic
      ? "text-[13px] md:text-base text-black opacity-65"
      : "text-[11px] text-neutral-400"; // bold / minimal / modern (bold has text-[12px])

    return (
      <div
        className={
          isClassic
            ? "flex gap-x-1 md:gap-x-2 items-center mb-2 flex-wrap"
            : "flex items-baseline gap-2 mt-auto"
        }
        itemProp="offers"
        itemScope
        itemType="https://schema.org/Offer"
      >
        <meta itemProp="priceCurrency" content="SAR" />
        <meta itemProp="availability" content="https://schema.org/InStock" />
        {hasDiscount ? (
          <div className="flex items-baseline gap-1.5">
            <span
              className={pricingValClass}
              style={{ color: isClassic ? "" : brandColor }}
              itemProp="price"
              content={discountPriceWithTax}
            >
              {discountPriceWithTax}{" "}
              <Currency className={iconSizeClass} color="currentColor" />
            </span>
            <span
              className={
                isClassic
                  ? "text-[15px] md:text-base text-gray-400 line-through font-IBMPlex flex items-center"
                  : "text-xs text-neutral-400 line-through font-IBMPlex flex items-center"
              }
            >
              {priceWithTax}
              <Currency className={strikeIconSizeClass} color="#A0AEC0" />
            </span>
          </div>
        ) : (
          <span
            className={pricingValClass}
            style={{ color: isClassic ? "" : brandColor }}
            itemProp="price"
            content={priceWithTax}
          >
            {priceWithTax}{" "}
            <Currency className={iconSizeClass} color="currentColor" />
          </span>
        )}
        <span className={labelClass}>{pricingLabel}</span>
      </div>
    );
  };

  // Render Theme Buttons/CTAs
  const renderActions = () => {
    let rentClass = "";
    let rentStyle = {};
    let detailsClass = "";

    if (isCozy) {
      rentClass =
        "flex-1 h-9 rounded-full text-xs font-bold flex items-center justify-center text-white transition-all duration-300 hover:scale-102 active:scale-95 shadow-sm";
      rentStyle = { backgroundColor: brandColor };
      detailsClass =
        "h-9 px-3 rounded-full text-xs font-semibold border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-all flex items-center justify-center";
    } else if (isClassic) {
      rentClass =
        "h-10 md:h-11 text-[13px] md:text-[15px] rounded-xl md:rounded-3xl font-semibold flex-1 bg-primary flex items-center justify-center shadow-xl text-white";
      rentStyle = { backgroundColor: brandColor };
      detailsClass =
        "h-10 md:h-11 min-w-0 px-3 text-[13px] md:text-[15px] rounded-xl md:rounded-3xl font-semibold text-white bg-[#9393A1] shadow-lg";
    } else if (isElegant) {
      rentClass =
        "flex-1 h-9 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center";
      rentStyle = { backgroundColor: brandColor };
      detailsClass =
        "h-9 px-3 border border-neutral-200 text-neutral-500 text-[10px] font-bold uppercase tracking-widest hover:border-neutral-800 hover:text-neutral-800 transition-all flex items-center justify-center";
    } else if (isMinimal) {
      rentClass =
        "flex-1 h-9 text-xs font-semibold flex items-center justify-center border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200";
      detailsClass =
        "h-9 w-9 flex items-center justify-center border border-neutral-200 text-neutral-500 hover:border-neutral-400 transition-all";
    } else if (isModern) {
      rentClass =
        "flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center text-white transition-all duration-200 hover:opacity-90 active:scale-95";
      rentStyle = { backgroundColor: brandColor };
      detailsClass =
        "h-9 px-3 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-all";
    } else {
      // bold
      rentClass =
        "flex-1 h-10 rounded-xl font-bold text-sm flex items-center justify-center text-white transition-all duration-200 active:scale-95";
      rentStyle = { backgroundColor: brandColor };
      detailsClass =
        "h-10 px-3 rounded-xl font-semibold text-sm border-2 border-neutral-100 text-neutral-500 hover:border-neutral-300 transition-all";
    }

    return (
      <div
        className={
          isClassic
            ? "md:mt-4 mt-3 md:grid md:grid-cols-2 flex justify-between gap-2 select-none"
            : "flex gap-2 mt-1"
        }
      >
        <Link
          href={productUrl}
          aria-label={tUi("rent") + " " + product.name}
          title={isClassic ? product.name + " " + tUi("rentItNow") : undefined}
          className={rentClass}
          style={rentStyle}
        >
          {tUi("rentItNow")}
        </Link>
        <button
          className={detailsClass}
          aria-label={tUi("seeDetails") + " " + product.name}
          onClick={() => setModalData({ show: true, type: "details" })}
        >
          {isClassic ? (
            <>
              <svg
                fill="#fff"
                version="1.1"
                viewBox="0 0 32 32"
                className="md:hidden inline min-w-4.5 h-4.5"
              >
                <path d="M16 28C9.044 28 2.79 23.43.067 16.36a1 1 0 0 1 0-.72C2.79 8.57 9.044 4 16 4s13.21 4.57 15.933 11.64c.09.232.09.488 0 .72C29.21 23.43 22.956 28 16 28M2.076 16C4.568 22.088 9.996 26 16 26s11.432-3.912 13.924-10C27.432 9.912 22.004 6 16 6S4.568 9.912 2.076 16" />
                <path d="M16 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12m-2 6.219a2 2 0 1 1 0-4 2 2 0 0 1 0 4" />
              </svg>
              <span className="hidden md:inline">{tUi("details")}</span>
            </>
          ) : isMinimal ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 8v.5M12 11v5" />
            </svg>
          ) : (
            tUi("details")
          )}
        </button>
      </div>
    );
  };

  const imageHoverClass = isClassic
    ? "h-full w-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
    : isBold
      ? "h-full w-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
      : isCozy
        ? "h-full w-full object-contain relative z-10 group-hover/card:scale-105 transition-transform duration-500"
        : isMinimal || isElegant
          ? "h-full w-full object-contain relative z-10 group-hover/card:scale-105 transition-transform duration-700"
          : "h-full w-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-500"; // modern

  const imgBgOverlayOpacity =
    isMinimal || isElegant || isCozy
      ? "group-hover/card:opacity-80"
      : "group-hover:opacity-90";
  const defaultImgBg = isModern
    ? "#F9FAFB"
    : isMinimal || isElegant || isCozy
      ? "#f5f5f5"
      : "#fff";

  return (
    <>
      <article
        className={cardClass}
        style={isCozy ? { "--brand-color": brandColor } : undefined}
        itemScope
        itemType="https://schema.org/Product"
      >
        <link itemProp="image" href={product.images?.[0]?.preview} />

        {/* Bold theme stripe */}
        {isBold && (
          <div
            className="h-1 w-full shrink-0"
            style={{ backgroundColor: brandColor }}
          />
        )}

        {/* Product Image */}
        <Link
          href={productUrl}
          className={imageWrapperClass}
          aria-label={
            lang === "ar"
              ? `عرض تفاصيل ${product.name}`
              : `View details of ${product.name}`
          }
        >
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${imgBgOverlayOpacity}`}
            style={{
              background: product?.images?.[0]?.gradientStyle || defaultImgBg,
            }}
            aria-hidden="true"
          />
          <Image
            unoptimized
            fill
            src={anyImgUrl({
              src: product.images[0].preview,
              size: imageSize,
              quality: 90,
              aspectRatio: imageAspectRatio,
            })}
            alt={altText}
            title={product.name}
            className={imageHoverClass}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
          {renderRating()}
        </Link>

        <ProductFavoriteButton
          product={product}
          favoriteProducts={favoriteProducts}
          toggleFavorite={toggleFavorite}
        />

        {/* Product Details Section */}
        <div className={infoClass}>
          {/* Location row */}
          {isModern || isMinimal || isCozy ? renderLocation() : null}

          {/* Name */}
          <div className={nameClass} itemProp="name">
            {product.name}
          </div>

          {/* Location row for classic and bold */}
          {(isClassic || isBold) && renderLocation()}

          {/* Pricing tag */}
          {renderPricing()}

          {/* CTA actions buttons */}
          {renderActions()}
        </div>
      </article>

      <ProductCardModal
        modalData={modalData}
        setModalData={setModalData}
        product={product}
        lang={lang}
        translate={translate}
        distance={distance}
        branch={branch}
        providerId={providerId}
      />
    </>
  );
}
