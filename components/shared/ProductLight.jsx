import { anyImgUrl } from "@/utils/ImageUrl";
import { getUrlName } from "@/lib/sitemap";
import formatDuration from "@/utils/formatDuration";
import ProductDetailsButton from "./ProductDetailsButton";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import Link from "next/link";
import { Location } from "../ui/svgs/icons/LocationSvg";
import DeliveryRow from "./DeliveryRow";

import { useTranslations } from "@/hooks/useTranslations";

export default function ProductLight({
  sm,
  lang,
  product,
  translate,
  branch,
  providerId,
  shopSlug,
}) {
  if (!product) return null;

  const trans = useTranslations(translate);
  const t = (key) => trans(`productComponent.${key}`);
  const tUi = (key) => trans(`ui.button.${key}`);

  // Pricing
  const hasDiscount =
    product?.rental?.discountTiers &&
    product.pricingModel !== "packages" &&
    product?.rental?.discountTiers?.length > 0;
  const tax = 0.15;
  const hasTaxCode = !!product?.owner?.companyDetails?.taxCode;
  const basePrice =
    product?.pricingModel === "packages"
      ? (product?.rental?.packages?.[0]?.price ?? 0)
      : (product?.rental?.value ?? 0);
  const priceWithTax = hasTaxCode
    ? Math.round(basePrice * (1 + tax))
    : basePrice;
  const discountPrice = hasDiscount
    ? product.rental.discountTiers[0].discountPrice
    : null;
  const discountPriceWithTax = hasDiscount
    ? hasTaxCode
      ? Math.round(discountPrice * (1 + tax))
      : discountPrice
    : null;

  const pricingLabel =
    product?.pricingModel === "packages" && product?.rental?.packages?.[0]
      ? `${t("per")} ${formatDuration({
          duration: product.rental.packages[0].duration,
          unit: product.rental.packages[0].unit,
          t: (key) => t(`bookingPackages.${key}`),
          lang,
        })}`
      : t("perDay");

  // URL
  const langPrefix = lang === "ar" ? "" : "en/";
  const qs =
    branch || providerId
      ? `?${new URLSearchParams({
          ...(branch && { branch }),
          ...(providerId && { providerId }),
        }).toString()}`
      : "";
  const productUrl = `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}products/${getUrlName(product.name)}_ref_${product._id}${qs}`;

  // Image
  const imgSrc = anyImgUrl({
    src: product.images[0].preview,
    size: 288,
    quality: 90,
    aspectRatio: "1:0.9",
  });
  const gradientBg =
    product?.images?.[0]?.gradientStyle ||
    "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))";
  const rating = product.rating?.average;

  const roundedCls = sm ? "rounded-xl md:rounded-3xl" : "rounded-3xl";
  const imageRoundedCls = sm
    ? "rounded-t-xl md:rounded-t-3xl"
    : "rounded-t-3xl";
  const paddingCls = sm ? "md:py-5 md:px-4 md:pt-4 p-2" : "md:py-5 md:px-4 p-4";
  const priceSizeCls = sm ? "text-lg md:text-[23px]" : "text-2xl";
  const nameSizeCls = sm
    ? "text-[15px] md:text-lg md:leading-8"
    : "text-xl leading-8";
  const gapCls = sm ? "gap-x-1 md:gap-x-2" : "gap-x-2";
  const priceLabelCls = sm ? "text-[13px] md:text-base" : "";
  const btnCls = sm
    ? "h-10 md:h-11 text-[13px] md:text-[15px] rounded-xl md:rounded-3xl"
    : "";

  return (
    <article
      className={`${roundedCls} flex flex-col bg-white shadow-lg h-full relative`}
      itemScope
      itemType="https://schema.org/Product"
      role="article"
      aria-label={`${t("product")}: ${product.name}`}
    >
      <link itemProp="image" href={product.images?.[0]?.preview} />

      {/* Image */}
      <Link
        href={productUrl}
        className={`w-full aspect-[1/.9] relative group overflow-hidden ${imageRoundedCls} select-none`}
        aria-label={
          lang === "ar"
            ? `عرض تفاصيل ${product.name}`
            : `View details of ${product.name}`
        }
        title={
          lang === "ar"
            ? `عرض تفاصيل ${product.name}`
            : `View details of ${product.name}`
        }
      >
        <div
          className="absolute inset-0 opacity-95"
          style={{ background: gradientBg }}
          aria-hidden="true"
        />
        <img
          src={imgSrc}
          alt={product.name}
          title={product.name}
          className="h-full w-full object-contain relative z-10"
          loading="lazy"
        />
        {rating > 0 && (
          <>
            <div className="absolute bottom-0 start-0 w-full h-24 bg-gradient-to-t from-[#06002CCC] to-[rgba(6,0,44,0)] mix-blend-multiply z-20" />
            <div
              className={`${sm ? "md:start-2 start-0 text-sm md:text-base" : "start-2"} absolute bottom-2 w-full z-30 md:p-4 p-2`}
            >
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, idx) => (
                  <svg
                    key={idx}
                    className={sm ? "w-4 h-4 md:w-5 md:h-5" : "w-5 h-5"}
                    viewBox="0 0 22 22"
                    fill={idx < rating ? "#F48A42" : "#E5E5E5"}
                  >
                    <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                  </svg>
                ))}
                <span className="text-white leading-3 mt-1">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          </>
        )}
      </Link>

      {/* Body */}
      <div className={`${paddingCls} flex flex-col justify-between flex-1`}>
        <div>
          <div className={`flex ${gapCls} items-center mb-2 flex-wrap`}>
            <div
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="SAR" />
              <meta
                itemProp="availability"
                content="https://schema.org/InStock"
              />
              {hasDiscount ? (
                <div className="flex items-baseline gap-2">
                  <span
                    className={`${priceSizeCls} text-primary font-bold font-IBMPlex flex items-center gap-1`}
                    itemProp="price"
                    content={discountPriceWithTax}
                  >
                    {discountPriceWithTax}{" "}
                    <Currency
                      className={sm ? "w-4 h-4 md:w-6 md:h-6" : "w-6 h-6"}
                      color="currentColor"
                    />
                  </span>
                  <span
                    className={`${sm ? "text-[15px] md:text-base" : ""} text-gray-400 line-through font-IBMPlex flex items-center`}
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
                  className={`${priceSizeCls} text-primary font-bold font-IBMPlex flex items-center gap-1`}
                  itemProp="price"
                  content={priceWithTax}
                >
                  {priceWithTax}{" "}
                  <Currency
                    className={sm ? "w-4 h-4 md:w-5 md:h-5" : "w-6 h-6"}
                    color="currentColor"
                  />
                </span>
              )}
            </div>
            <span className={`${priceLabelCls} text-black opacity-65`}>
              {pricingLabel}
            </span>
          </div>

          {/* Delivery row — replaces the old location line + badge */}
          <div className={`${sm ? "mb-2" : "mb-2.5"}`}>
            <DeliveryRow
              delivery={product.rental?.delivery}
              address={product.address}
              lang={lang}
              sm={sm}
            />
          </div>

          <div
            className={`${nameSizeCls} font-semibold text-darkNavy line-clamp-2`}
            itemProp="name"
          >
            {product.name}
          </div>
        </div>

        <div
          className={`${sm ? "md:mt-4 mt-3" : "mt-4"} md:grid md:grid-cols-2 flex justify-between gap-2 select-none`}
        >
          <Link
            href={productUrl}
            aria-label={tUi("rent") + " " + product.name}
            title={product.name + " " + tUi("rentItNow")}
            className={`${btnCls} font-semibold flex-1 bg-primary flex items-center justify-center shadow-xl text-white`}
          >
            {tUi("rentItNow")}
          </Link>
          <ProductDetailsButton
            sm={sm}
            product={product}
            lang={lang}
            translate={translate}
            branch={branch}
            providerId={providerId}
            tUiDetails={tUi("details")}
            tUiSeeDetails={tUi("seeDetails")}
          />
        </div>
      </div>
    </article>
  );
}
