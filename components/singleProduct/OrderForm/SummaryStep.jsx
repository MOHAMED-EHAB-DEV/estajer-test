import { useMemo } from "react";
import Link from "next/link";
import { Currency } from "../../ui/svgs/icons/CurrencySvg";

export default function SummaryStep({
  t,
  quantity,
  calculatePrice,
  calculateServicesTotal,
  selectedPackage,
  daysNum,
  formatDuration,
  trans,
  lang,
  isPackages,
  calculateDiscount,
  product,
  hasTaxCode,
  taxAmount,
  totalWithTax,
  user,
  isRedirecting,
  langPrefix,
  countdown,
  setIsRedirecting,
  setCountdown,
  selectedDates,
  isDateRangeValid,
}) {
  const sortedDiscounts = useMemo(
    () =>
      [...(product?.rental?.discountTiers || [])].sort(
        (a, b) => a.minDays - b.minDays,
      ),
    [product?.rental?.discountTiers],
  );

  const nextDiscountTier = useMemo(
    () =>
      sortedDiscounts.find(
        (d) => d.minDays > daysNum && isDateRangeValid(d, selectedDates),
      ),
    [sortedDiscounts, daysNum, selectedDates, isDateRangeValid],
  );

  const sortedQtyDiscounts = useMemo(
    () =>
      [...(product?.rental?.quantityDiscountTiers || [])].sort(
        (a, b) => a.minQuantity - b.minQuantity,
      ),
    [product?.rental?.quantityDiscountTiers],
  );

  const nextQtyDiscountTier = useMemo(
    () => sortedQtyDiscounts.find((d) => d.minQuantity > quantity),
    [sortedQtyDiscounts, quantity],
  );
  return (
    <div
      id="cost-calculation"
      className="md:my-10 flex flex-col gap-2 md:gap-0"
    >
      <div className="text-darkNavy font-semibold text-sm md:text-[1.7rem] lg:text-[1.7rem] font-IBMPlex mb-2 md:mb-7 text-center md:text-start uppercase md:normal-case tracking-wider md:tracking-normal md:hidden">
        {t("cost.title")}
      </div>
      <div className="hidden md:block text-darkNavy font-semibold md:text-[1.7rem] lg:text-[1.7rem] font-IBMPlex mb-7">
        {t("cost.title")}
      </div>

      {[
        {
          label: t("quantity"),
          value: `${quantity} ${quantity === 1 ? t("piece") : t("pieces")}`,
          key: "quantity",
        },
        {
          label: t("cost.cost"),
          value: calculatePrice(true, true)?.toFixed(0),
          key: "cost",
        },
        calculateServicesTotal > 0 && {
          label: t("cost.services"),
          value: calculateServicesTotal,
          key: "services",
        },
        {
          label:
            selectedPackage?.unit === "hours"
              ? t("hoursCount")
              : t("daysCount"),
          value:
            selectedPackage?.unit === "hours"
              ? formatDuration({
                  duration: Math.round(daysNum * 24),
                  unit: "hours",
                  t: (k) => trans(`productComponent.bookingPackages.${k}`),
                  lang,
                })
              : t("bookingDaysCount").replace("{daysNum}", daysNum),
          key: "days",
        },
        !isPackages &&
          calculateDiscount(product.rental.value * daysNum * quantity) > 0 && {
            label: `${t("discount")}`,
            value: `-${calculateDiscount(product.rental.value * daysNum * quantity).toFixed(0)}`,
            green: true,
            discountPct: (
              (calculateDiscount(product.rental.value * daysNum * quantity) /
                (product.rental.value * daysNum * quantity)) *
              100
            ).toFixed(0),
            key: "discount",
          },
        hasTaxCode && {
          label: t("cost.tax"),
          value: taxAmount,
          key: "tax",
        },
      ]
        .filter(Boolean)
        .map(({ label, value, green, discountPct, key }, i) => (
          <div key={i} {...(key === "quantity" && { className: "md:hidden" })}>
            <div className="flex justify-between text-sm md:text-[1rem] md:font-semibold lg:text-[1.2rem] text-darkNavy">
              <span
                className={`flex items-center gap-2 ${green ? "text-green-600" : ""}`}
              >
                {label}
                {green && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {discountPct}%
                  </span>
                )}
              </span>
              <span
                className={`flex gap-1 items-center ${green ? "text-green-600" : ""}`}
              >
                {value}{" "}
                {key !== "days" && key !== "quantity" && /\d/.test(value) && (
                  <Currency className="h-3.5 w-3.5 md:h-6 md:w-6" />
                )}
              </span>
            </div>

            {/* Next Quantity Discount Info */}
            {key === "days" &&
              nextQtyDiscountTier &&
              product.pricingModel !== "packages" && (
                <div className="mt-2 p-3 bg-orange-50 text-orange-800 rounded-lg text-center font-medium text-xs md:text-sm">
                  {t("nextQtyDiscountInfo")
                    .replace("{quantity}", nextQtyDiscountTier.minQuantity)
                    .replace(
                      "{discount}",
                      nextQtyDiscountTier.discount.toFixed(0),
                    )}
                </div>
              )}

            {/* Next Duration Discount Info */}
            {key === "days" &&
              nextDiscountTier &&
              daysNum > 0 &&
              product.pricingModel !== "packages" && (
                <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-center font-medium text-xs md:text-sm">
                  {t("nextDiscountInfo")
                    .replace("{days}", nextDiscountTier.minDays)
                    .replace(
                      "{discount}",
                      nextDiscountTier.discount.toFixed(0),
                    )}
                </div>
              )}

            <hr className="border-0 md:border my-0 md:my-4" />
          </div>
        ))}

      <div className="border-t mt-3 md:mt-0 pt-3 md:pt-0 md:border-0 flex justify-between font-bold text-base md:text-[1.5rem] text-darkNavy">
        <span>{t("cost.total")}</span>
        <span className="flex gap-1 items-center text-primary">
          {totalWithTax} <Currency className="h-4 w-4 md:h-6 md:w-6" />
        </span>
      </div>
      <hr className="border-0 w-full md:border my-0 md:my-4" />

      {product.rental.insurance > 0 && (
        <div className="font-semibold text-xs md:text-lg text-gray-700 mt-1 md:mt-6">
          <p className="text-center">
            {t("damageWarning")
              .replace("{amount}", product.rental.insurance)
              .replace("{currency}", t("currency"))}
          </p>
        </div>
      )}

      {product.owner._id === user?._id && (
        <p className="block mt-4 text-red-600 text-[0.8rem] md:text-[1rem] p-3 bg-red-50 border border-red-200 rounded-lg text-center font-medium">
          {t("toast.cantRentOwnProduct")}
        </p>
      )}

      {isRedirecting && (
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-gray-600">
          <p>
            {t("redirectingTo")}{" "}
            <Link href={`/${langPrefix}cart`} className="text-primary">
              {t("cart")}
            </Link>{" "}
            {t("after")} {countdown} {t("seconds")}
          </p>
          <button
            onClick={() => {
              setIsRedirecting(false);
              setCountdown(2);
            }}
            className="text-red-500 underline text-xs"
          >
            {t("cancel")}
          </button>
        </div>
      )}
    </div>
  );
}
