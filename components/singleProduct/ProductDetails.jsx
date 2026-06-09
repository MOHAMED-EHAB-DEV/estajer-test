import DeliveryInfo from "./DeliveryInfo";
import { getTranslations } from "@/hooks/getTranslations";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Premium } from "../ui/svgs/icons/PremiumSvg";
import { Star2 } from "../ui/svgs/icons/Star2Svg";
import ChatButton from "../chat/ChatButton";
import Link from "next/link";
import ProductTitle from "./ProductTitle";
import ProductInfoTabs from "./ProductInfoTabs";
import { isArabic, removeLastWord } from "@/lib/utils";
import { Suspense } from "react";
import BranchAddress from "./BranchAddress";
import DeliveryInfoWrapper from "./DeliveryInfoWrapper";
import OwnerProfileBranchLink from "./OwnerProfileBranchLink";
import { Location as LocationIcon } from "../ui/svgs/icons/LocationSvg";
import { format } from "date-fns";
// import { ar, enUS } from "date-fns/locale";

export default async function ProductDetails({
  lang,
  product,
  rating,
  requested,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";

  const translate = await getTranslations(lang);
  const t = (value) => translate(`product.details.${value}`);

  const averageRating = rating?.average ?? 0;

  return (
    <>
      <div className="order-1">
        <ProductTitle product={product} requested={requested} lang={lang} />
        {/* ratings + delivery + location + certified */}
        <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-4">
          {/* rating */}
          {!requested && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 border border-gray-200/60 rounded-xl">
              <svg
                className={`w-4 h-4 ${averageRating > 0 ? "text-amber-500 fill-amber-500" : "text-gray-400 fill-current"}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                {averageRating > 0 ? averageRating.toFixed(1) : t("noReviews")}
                <span className="text-[13px] font-normal text-gray-500">
                  ({product?.rating?.count})
                </span>
              </span>
            </div>
          )}

          {/* delivery */}
          {!requested && product.rental?.delivery?.type && (
            <div
              id="delivery-options"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 border border-gray-200/60 rounded-xl"
            >
              {product.rental.delivery.type !== "receive" ? (
                <svg className="w-4 h-4 fill-primary" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1.5a2.5 2.5 0 0 0 5 0h3a2.5 2.5 0 0 0 5 0H21a1 1 0 0 0 1-1v-5a1 1 0 0 0-.293-.707L19 7zM6 8h8v2H6V8zm2.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-[#2B689F]" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
              <span className="text-sm font-medium text-gray-700">
                {product.rental.delivery.type !== "receive"
                  ? lang === "ar"
                    ? "توصيل لموقعك"
                    : "Delivery"
                  : lang === "ar"
                    ? "استلام من المؤجر"
                    : "Pickup"}
              </span>
            </div>
          )}

          {/* location */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 border border-gray-200/60 rounded-xl">
            <LocationIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              <Suspense
                fallback={
                  requested
                    ? typeof product.address === "string"
                      ? product.address
                      : product.address?.city
                    : product.address?.city
                }
              >
                <BranchAddress
                  lang={lang}
                  product={product}
                  requested={requested}
                />
              </Suspense>
            </span>
          </div>

          {product.owner?.hasShop && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <svg className="w-4 h-4 fill-emerald-500" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <span className="text-sm font-bold text-emerald-700">
                {lang === "ar" ? "منتج معتمد" : "Verified"}
              </span>
            </div>
          )}
        </div>
        <ProductInfoTabs
          lang={lang}
          translate={translate()}
          description={product.description}
          useCases={product.useCases}
          specs={product.specs}
          features={product.features}
          status={product.status}
          quantity={product.quantity}
        />
      </div>
      <div className="order-3 mt-8">
        <Suspense
          fallback={
            <DeliveryInfo
              product={product}
              lang={lang}
              translate={translate()}
              displayLocation={product.location}
            />
          }
        >
          <DeliveryInfoWrapper
            product={product}
            lang={lang}
            translate={translate()}
          />
        </Suspense>
        <div
          id="owner-info"
          className="bg-[rgba(234,238,243,0.3)] rounded-xl mt-10 overflow-hidden"
        >
          <div className="bg-[#eaeef3] p-4 md:p-6 flex gap-2 items-center text-darkNavy font-semibold text-[1rem] md:text-[1.55rem] lg:text-[1.7rem]">
            <svg
              className="lg:w-8 lg:h-8 w-6 h-6"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="#F48A42"
            >
              <path d="M16.0003 13.3334C18.9458 13.3334 21.3337 10.9455 21.3337 8.00002C21.3337 5.0545 18.9458 2.66669 16.0003 2.66669C13.0548 2.66669 10.667 5.0545 10.667 8.00002C10.667 10.9455 13.0548 13.3334 16.0003 13.3334Z" />
              <path d="M26.6663 23.3333C26.6663 26.6466 26.6663 29.3333 15.9997 29.3333C5.33301 29.3333 5.33301 26.6466 5.33301 23.3333C5.33301 20.02 10.109 17.3333 15.9997 17.3333C21.8903 17.3333 26.6663 20.02 26.6663 23.3333Z" />
            </svg>

            <span>{requested ? t("meetLessee") : t("meetOwner")}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-normal p-6 gap-5">
            <Suspense
              fallback={
                <Link
                  href={`/${langPrefix}profile/${product.owner.pathName}/products`}
                  className="w-[5rem] md:w-[9rem] aspect-square relative overflow-hidden rounded-full"
                >
                  <Image
                    src={anyImgUrl({
                      src:
                        product.owner.avatar ||
                        "https://wac-cdn.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg?cdnVersion=2612",
                      size: 500,
                    })}
                    alt={product.owner.fullName}
                    title={product.owner.fullName}
                    className="h-full w-full object-cover"
                    unoptimized
                    fill
                  />
                </Link>
              }
            >
              <OwnerProfileBranchLink
                langPrefix={langPrefix}
                pathName={product.owner.pathName}
                className="w-[5rem] md:w-[9rem] aspect-square relative overflow-hidden rounded-full"
              >
                <Image
                  src={anyImgUrl({
                    src:
                      product.owner.avatar ||
                      "https://wac-cdn.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg?cdnVersion=2612",
                    size: 500,
                  })}
                  alt={product.owner.fullName}
                  title={product.owner.fullName}
                  className="h-full w-full object-cover"
                  unoptimized
                  fill
                />
              </OwnerProfileBranchLink>
            </Suspense>
            <div className="text-center md:text-start w-full md:w-auto">
              <div className="flex flex-col 2xl:max-w-80 md:max-w-64 md:flex-row flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <Suspense
                  fallback={
                    <Link
                      dir={isArabic(product.owner.fullName) ? "rtl" : "ltr"}
                      href={`/${langPrefix}profile/${product.owner.pathName}/products`}
                      className="flex items-center gap-1 text-darkNavy font-semibold text-[1rem] md:text-[1.5rem] lg:text-[1.7rem] font-IBMPlex"
                    >
                      {product.owner.premium && <Premium />}
                      {product.owner.premium
                        ? product.owner.fullName
                        : removeLastWord(product.owner.fullName)}
                    </Link>
                  }
                >
                  <OwnerProfileBranchLink
                    langPrefix={langPrefix}
                    pathName={product.owner.pathName}
                    dir={isArabic(product.owner.fullName) ? "rtl" : "ltr"}
                    className="flex items-center gap-1 text-darkNavy font-semibold text-[1rem] md:text-[1.5rem] lg:text-[1.7rem] font-IBMPlex"
                  >
                    {product.owner.premium && <Premium />}
                    {product.owner.premium
                      ? product.owner.fullName
                      : removeLastWord(product.owner.fullName)}
                  </OwnerProfileBranchLink>
                </Suspense>
                {product.owner.accountType === "company" ? (
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                    </svg>
                    {t(`company`)}
                  </span>
                ) : product.owner?.documentCode ? (
                  <span className="bg-gradient-to-r from-orange-500 to-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    {t(`freelance`)}
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-orange-500 to-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    {t(`personal`)}
                  </span>
                )}
              </div>
              <div className="text-[1rem] md:text-[1.2rem] lg:text-[1.4rem] mt-2 mb-3">
                {`${t("joinedEstajer")} ${format(
                  new Date(product.owner.createdAt),
                  "yyyy/MM/dd",
                )}`}
              </div>
              {product.owner.rating?.average > 0 ? (
                <div className="flex gap-2">
                  {new Array(5).fill(0).map((_, idx) => (
                    <Star2
                      key={idx}
                      filled={idx < product.owner.rating?.average}
                    />
                  ))}
                  <span className="text-darkNavy text-xl opacity-65 font-semibold">
                    {product.owner?.rating?.average?.toFixed(1) || ""}
                  </span>
                </div>
              ) : (
                t("noReviews")
              )}
            </div>
            <ChatButton
              product={product}
              translate={translate()}
              langPrefix={langPrefix}
              initialProduct={product}
            />
          </div>
        </div>
      </div>
    </>
  );
}
