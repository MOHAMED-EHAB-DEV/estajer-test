"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "@/hooks/useTranslations";
import { getUrlName } from "@/lib/sitemap";
import formatDuration from "@/utils/formatDuration";
import calculateDistance from "@/utils/calculateDistance";

const ProductDetailModal = dynamic(
  () => import("@/components/shared/ProductDetailModal"),
  { ssr: false, loading: () => null },
);

/**
 * Shared logic hook for all theme ProductCard components.
 * Returns computed pricing, URL, alt text, translations, modal state.
 */
export function useProductCard({
  product,
  lang,
  translate,
  branch,
  providerId,
  shopSlug,
  user,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const t = (key) => trans(`productComponent.${key}`);
  const tUi = (key) => trans(`ui.button.${key}`);
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
    const hasTaxCode = !!product?.owner?.companyDetails?.taxCode;
    const basePrice =
      product?.pricingModel === "packages"
        ? (product?.rental?.packages?.[0]?.price ?? 0)
        : (product?.rental?.value ?? 0);
    const priceWithTax = hasTaxCode
      ? Math.round(basePrice * (1 + tax))
      : basePrice;
    const discountPriceWithTax = hasDiscount
      ? hasTaxCode
        ? Math.round(discountPrice * (1 + tax))
        : discountPrice
      : null;
    return { discountPriceWithTax, priceWithTax, hasDiscount };
  }, [product]);

  const productUrl = product
    ? `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}products/${getUrlName(product.name)}_ref_${product._id}${
        branch || providerId
          ? `?${new URLSearchParams({ ...(branch && { branch }), ...(providerId && { providerId }) }).toString()}`
          : ""
      }`
    : "#";

  const altText =
    lang === "ar"
      ? `${product?.name} للإيجار | استأجر`
      : `${product?.name} for rent | Estajer`;

  const pricingLabel =
    product?.pricingModel === "packages"
      ? `${t("per")} ${formatDuration({
          duration: product.rental.packages[0].duration,
          unit: product.rental.packages[0].unit,
          t: (key) => t(`bookingPackages.${key}`),
          lang,
        })}`
      : t("perDay");

  return {
    langPrefix,
    trans,
    t,
    tUi,
    discountPriceWithTax,
    priceWithTax,
    hasDiscount,
    productUrl,
    altText,
    pricingLabel,
    modalData,
    setModalData,
  };
}

/**
 * Renders the ProductDetailModal. Place after the <article> in each card.
 */
export function ProductCardModal({
  modalData,
  setModalData,
  product,
  lang,
  translate,
  branch,
  providerId,
}) {
  if (!modalData.show || modalData.type !== "details") return null;
  return (
    <ProductDetailModal
      isOpen
      onClose={() => setModalData({ show: false })}
      productSummary={product}
      lang={lang}
      translate={translate}
      branch={branch}
      providerId={providerId}
    />
  );
}
