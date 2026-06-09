import { Star } from "@/components/ui/svgs/icons/StarSvg";
import { Tag } from "@/components/ui/svgs/icons/TagSvg";
import { ProductsIcon } from "@/components/ui/svgs/icons/ProductsIconSvg";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import { Premium } from "@/components/ui/svgs/icons/PremiumSvg";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import ChatButton from "../chat/ChatButton";
import Button from "../ui/Button";
import Link from "next/link";
import { isArabic, removeLastWord } from "@/lib/utils";

const VerifiedShop = ({
  t,
  idx,
  Icon,
  name,
  rating,
  avatar,
  category,
  isOnline,
  lastSeen,
  pathName,
  translate,
  langPrefix,
  description,
  ordersCount,
  productsCount,
  premium,
}) => {
  return (
    <article
      className="flex justify-between shadow-[#F48A4233] overflow-hidden shadow-lg relative flex-col items-center py-6 md:py-12 px-4 md:p-12 rounded-[30px] bg-white h-full"
      itemScope
      itemType="https://schema.org/LocalBusiness"
      role="article"
      aria-labelledby={`shop-name-${idx}`}
      aria-describedby={`shop-desc-${idx}`}
    >
      <div className="absolute md:-end-2 end-0 md:-top-2 top-0 opacity-15">
        {Icon("w-28 h-28 md:w-40 md:h-40 ")}
      </div>

      {/* Changed to grid layout */}
      <div className="flex flex-wrap md:flex-row gap-4 md:gap-10 w-full items-start">
        {/* Profile Image */}
        <div className="mx-auto relative flex h-20 w-20 min-h-6 min-w-6 md:h-32 md:w-32 rounded-full overflow-hidden row-span-1 md:row-span-auto">
          <Image
            src={anyImgUrl({
              src: avatar,
              size: 128,
              aspectRatio: "1:1",
              crop: true,
            })}
            alt={`${name} profile picture`}
            title={`${name} - ${category} rental shop`}
            className="h-full w-full object-cover"
            unoptimized
            fill
            itemProp="image"
          />
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-3 md:gap-4 flex-1">
          <header className="flex w-full md:items-start items-start flex-col gap-2 md:gap-[10px]">
            <h3
              id={`shop-name-${idx}`}
              className=" flex items-center gap-2 font-bold md:text-2xl text-xl leading-[130%] text-black"
              itemProp="name"
            >
              {premium && <Premium />}
              <span dir={isArabic(name) ? "rtl" : "ltr"}>
                {premium ? name : removeLastWord(name)}
              </span>
            </h3>
            <div className="flex font-semibold text-[13px] text-darkNavy ] lg:text-lg gap-2 md:gap-6 items-center flex-wrap">
              <div
                className="flex items-center gap-1 md:gap-[10px]"
                {...(rating > 0
                  ? {
                      itemProp: "aggregateRating",
                      itemScope: true,
                      itemType: "https://schema.org/AggregateRating",
                    }
                  : {})}
                aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}
              >
                <Star
                  className="md:w-6 md:h-6 w-4 h-4"
                  filled={true}
                  aria-hidden="true"
                />
                <span
                  {...(rating > 0
                    ? { itemProp: "ratingValue", content: rating.toFixed(1) }
                    : {})}
                >
                  {+rating.toFixed(1) || t("noRating")}
                </span>
                {rating > 0 && (
                  <>
                    <meta itemProp="bestRating" content="5" />
                    <meta itemProp="worstRating" content="1" />
                    <meta itemProp="ratingCount" content={ordersCount || "1"} />
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-[10px]">
                <Tag className="md:w-8 md:h-8 w-4 h-4" aria-hidden="true" />
                <span itemProp="serviceType">{category}</span>
              </div>
            </div>
          </header>

          <p
            id={`shop-desc-${idx}`}
            className="text-darkNavy md:text-lg w-full line-clamp-2"
            itemProp="description"
          >
            {description || t("noDescription")}
          </p>

          <section
            className="flex text-sm font-semibold text-darkNavy lg:text-lg gap-1 md:gap-2 items-center"
            aria-label="Shop statistics"
          >
            <div
              className="flex justify-center gap-2"
              itemScope
              itemType="https://schema.org/QuantitativeValue"
            >
              <ProductsIcon
                className="md:w-8 md:h-8 w-5 h-5"
                aria-hidden="true"
              />
              <div className="flex flex-col font-semibold gap-[2.35px]">
                <span>{translate("home.verifiedShops.products")}</span>
                <span
                  itemProp="value"
                  aria-label={`${productsCount} products available`}
                >
                  {productsCount}
                </span>
              </div>
            </div>
            {/* <div
              className="flex justify-center gap-2"
              itemScope
              itemType="https://schema.org/QuantitativeValue"
            >
              <ProductRequests
                className="md:w-12 md:h-11 w-8 h-7"
                aria-hidden="true"
              />
              <div className="flex flex-col font-semibold gap-[2.35px]">
                <span>{translate("home.verifiedShops.productRequests")}</span>
                <span
                  itemProp="value"
                  aria-label={`${ordersCount} completed orders`}
                >
                  {ordersCount}
                </span>
              </div>
            </div> */}
          </section>
        </div>
      </div>

      <hr
        className="w-full my-4 md:my-8 bg-[#B3B3B3] h-[1px] border-0"
        role="separator"
      />

      <div className="flex flex-wrap gap-1 md:gap-y-6 items-center sm:justify-between justify-between w-full">
        <ChatButton
          product={{ owner: { avatar, fullName: name, isOnline, lastSeen } }}
          langPrefix={langPrefix}
          translate={translate()}
          home={true}
        />
        <Button
          as={Link}
          href={`/${langPrefix}profile/${pathName}/products`}
          variant="light"
          className="md:py-7 bg-primary/5 border border-primary/10 px-6 mx-auto md:mx-0 text-[0.8rem] gap-1 md:gap-3 md:text-[1.1rem] text-darkNavy font-semibold md:text-lg"
          endContent={
            <Send
              className="-rotate-45 md:w-6 md:h-6 w-4 h-4"
              color="#0d092b"
              aria-hidden="true"
            />
          }
          aria-label={`View ${name}'s profile and products`}
          title={`View ${name}'s profile and products`}
          itemProp="url"
        >
          {translate("home.verifiedShops.viewProfile")}
        </Button>
      </div>
    </article>
  );
};

export default VerifiedShop;
