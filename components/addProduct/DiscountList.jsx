"use client";

import { toast } from "@/utils/toast";
import Button from "../ui/Button";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { Plus } from "../ui/svgs/icons/PlusSvg";
import { X } from "../ui/svgs/icons/XSvg";
import { CalendarIcon } from "../ui/svgs/icons/CalendarIconSvg";
import { FormInput } from "./RentDetails";
import ToastMessage from "../ui/ToastMessage";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

export default function DiscountList({
  t,
  discountTiers,
  setRentData,
  rentPrice,
  lang,
}) {
  const addDiscountTier = () => {
    if (!rentPrice)
      return toast.error(ToastMessage(t("discountTiers.rentPriceRequired")));
    setRentData((prev) => ({
      ...prev,
      discountTiers: [
        ...prev.discountTiers,
        {
          id: Date.now(),
          minDays: "",
          discount: "",
          discountPrice: "",
          discountType: "percentage",
          dateRanges: [], // A tier can now have multiple date ranges
        },
      ],
    }));
  };
  const removeDiscountTier = (id) => {
    setRentData((prev) => ({
      ...prev,
      discountTiers: prev.discountTiers.filter((tier) => tier.id !== id),
    }));
  };

  const updateDiscountTier = (id, field, value) => {
    setRentData((prev) => ({
      ...prev,
      discountTiers: prev.discountTiers.map((tier) => {
        if (tier.id === id) {
          const updatedTier = { ...tier, [field]: value };

          // --- Recalculation logic (unchanged) ---
          if (field === "discountPrice" && value && tier.minDays && rentPrice) {
            const totalOriginalPrice = rentPrice * tier.minDays;
            const discountAmount = totalOriginalPrice - parseFloat(value);
            const discountPercentage =
              (discountAmount / totalOriginalPrice) * 100;
            updatedTier.discount = Math.max(
              0,
              Math.min(100, discountPercentage),
            );
          }
          if (field === "discount" && value && tier.minDays && rentPrice) {
            const totalOriginalPrice = rentPrice * tier.minDays;
            const discountAmount =
              (totalOriginalPrice * parseFloat(value)) / 100;
            updatedTier.discountPrice = totalOriginalPrice - discountAmount;
          }
          if (field === "minDays" && value && rentPrice) {
            const totalOriginalPrice = rentPrice * parseFloat(value);
            if (tier.discountType === "percentage" && tier.discount) {
              const discountAmount =
                (totalOriginalPrice * parseFloat(tier.discount)) / 100;
              updatedTier.discountPrice = totalOriginalPrice - discountAmount;
            } else if (tier.discountType === "price" && tier.discountPrice) {
              const discountAmount =
                totalOriginalPrice - parseFloat(tier.discountPrice);
              updatedTier.discount = Math.max(
                0,
                Math.min(100, (discountAmount / totalOriginalPrice) * 100),
              );
            }
          }
          // --- End of Recalculation logic ---

          return updatedTier;
        }
        return tier;
      }),
    }));
  };

  const addDateRange = (tierId) => {
    console.log("tierId: ", tierId);
    setRentData((prev) => ({
      ...prev,
      discountTiers: prev.discountTiers.map((tier) =>
        tier.id === tierId
          ? {
              ...tier,
              dateRanges: [
                ...(tier.dateRanges || []),
                { id: Date.now(), from: null, to: null },
              ],
            }
          : tier,
      ),
    }));
  };

  const updateDateRange = (tierId, dateRangeId, newRange) => {
    const range = { from: newRange?.from, to: newRange?.to || newRange?.from };

    setRentData((prev) => ({
      ...prev,
      discountTiers: prev.discountTiers.map((tier) =>
        tier.id === tierId
          ? {
              ...tier,
              dateRanges: tier.dateRanges?.map((dr) =>
                dr.id === dateRangeId ? { ...dr, ...range } : dr,
              ),
            }
          : tier,
      ),
    }));
  };

  const removeDateRange = (tierId, dateRangeId) => {
    setRentData((prev) => ({
      ...prev,
      discountTiers: prev.discountTiers.map((tier) =>
        tier.id === tierId
          ? {
              ...tier,
              dateRanges: tier.dateRanges.filter((dr) => dr.id !== dateRangeId),
            }
          : tier,
      ),
    }));
  };

  const calculateDiscountedPrice = (tier) => {
    if (!tier.minDays || !rentPrice) return 0;
    const totalOriginalPrice = rentPrice * tier.minDays;
    if (tier.discountType === "percentage" && tier.discount) {
      const discountAmount =
        (totalOriginalPrice * parseFloat(tier.discount)) / 100;
      return totalOriginalPrice - discountAmount;
    } else if (tier.discountType === "price" && tier.discountPrice) {
      return parseFloat(tier.discountPrice);
    }
    return totalOriginalPrice;
  };

  const getDiscountPercentage = (tier) => {
    if (!tier.minDays || !rentPrice) return 0;
    const totalOriginalPrice = rentPrice * tier.minDays;
    if (tier.discountType === "percentage" && tier.discount) {
      return parseFloat(tier.discount);
    } else if (tier.discountType === "price" && tier.discountPrice) {
      const discountAmount =
        totalOriginalPrice - parseFloat(tier.discountPrice);
      return (discountAmount / totalOriginalPrice) * 100;
    }
    return 0;
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) return "";
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("ar", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    if (dateRange.from && dateRange.to)
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
    if (dateRange.from)
      return `${t("discountTiers.from")} ${formatDate(dateRange.from)}`;
    return "";
  };

  return (
    <div>
      {/* Header Section (Unchanged) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg">
            <Currency color="white" size={17} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t("discountTiers.title")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("discountTiers.subtitle")}
            </p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-[#F48A42] to-[#FF6B35] text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onPress={addDiscountTier}
          type="button"
        >
          <Plus size={20} color="white" />
          {t("discountTiers.addButton")}
        </Button>
      </div>

      {/* Discount Tiers List */}
      {discountTiers.length > 0 && (
        <div className="space-y-4 mb-6">
          {discountTiers.map((tier, index) => (
            <div
              key={tier.id}
              className="relative bg-white border-2 border-gray-100 rounded-2xl md:p-6 p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              {/* Tier Number & Remove Button (Unchanged) */}
              <div className="absolute -top-3 -start-3 w-8 h-8 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {index + 1}
                </span>
              </div>
              <div className="absolute -top-3 -end-3">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full min-w-0 p-2 shadow-lg"
                  onPress={() => removeDiscountTier(tier.id)}
                  type="button"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Main Inputs (Unchanged) */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Minimum Days Input */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-[#F48A42]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {t("discountTiers.minDays")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FormInput
                      classNames={{
                        input: "text-base ps-4 pe-12",
                        inputWrapper: "h-12",
                      }}
                      type="number"
                      step="1"
                      min={1}
                      placeholder={t("discountTiers.minDaysPlaceholder")}
                      value={tier.minDays}
                      onChange={({ target }) =>
                        updateDiscountTier(
                          tier.id,
                          "minDays",
                          target.value < 1 ? "" : +target.value,
                        )
                      }
                    />
                    <div className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {t("discountTiers.daysUnit")}
                    </div>
                  </div>
                </div>

                {/* Discount Type Toggle */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-[#F48A42]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    {t("discountTiers.discountType")}
                  </label>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    <Button
                      variant="light"
                      className={`rounded-none outline-none flex-1 px-3 py-2 transition-all duration-200 ${
                        tier.discountType === "percentage"
                          ? "bg-gradient-to-r from-[#F48A42] to-[#FF6B35] text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      onPress={() =>
                        updateDiscountTier(
                          tier.id,
                          "discountType",
                          "percentage",
                        )
                      }
                    >
                      {t("discountTiers.percentage")}
                    </Button>
                    <Button
                      variant="light"
                      className={`rounded-none outline-none flex-1 px-3 py-2 transition-all duration-200 ${
                        tier.discountType === "price"
                          ? "bg-gradient-to-r from-[#F48A42] to-[#FF6B35] text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      onPress={() =>
                        updateDiscountTier(tier.id, "discountType", "price")
                      }
                    >
                      {t("discountTiers.price")}
                    </Button>
                  </div>
                </div>

                {/* Discount Input (Percentage or Price) */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-[#F48A42]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    {tier.discountType === "percentage"
                      ? t("discountTiers.discount")
                      : t("discountTiers.totalPrice")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-stretch">
                    <FormInput
                      classNames={{
                        input: "text-base ps-4 ",
                        inputWrapper: "h-12 rounded-e-none",
                      }}
                      type="number"
                      min={0}
                      max={
                        tier.discountType === "percentage"
                          ? 100
                          : rentPrice * tier.minDays
                      }
                      placeholder={
                        tier.discountType === "percentage"
                          ? t("discountTiers.discountPlaceholder")
                          : t("discountTiers.totalPricePlaceholder")
                      }
                      value={
                        tier.discountType === "percentage"
                          ? tier.discount
                          : tier.discountPrice
                      }
                      onChange={({ target }) => {
                        if (tier.discountType === "percentage") {
                          updateDiscountTier(
                            tier.id,
                            "discount",
                            target.value <= 0
                              ? ""
                              : target.value > 100
                                ? 100
                                : +target.value,
                          );
                        } else {
                          updateDiscountTier(
                            tier.id,
                            "discountPrice",
                            target.value < 0
                              ? ""
                              : target.value > rentPrice * tier.minDays
                                ? rentPrice * tier.minDays - 1
                                : +target.value,
                          );
                        }
                      }}
                    />
                    <div className="bg-gradient-to-r from-[#F48A42] to-[#FF6B35] h-12 min-w-16 flex items-center justify-center rounded-e-xl shadow-sm">
                      <span className="text-white font-bold text-lg">
                        {tier.discountType === "percentage" ? (
                          "%"
                        ) : (
                          <Currency color="white" size={18} />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- NEW Date Range Section --- */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-lg flex items-center justify-center shadow-sm">
                    <CalendarIcon className="w-4 h-4" color="white" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-semibold">
                      {t("discountTiers.availabilityTitle")}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {t("discountTiers.availabilityDesc")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(tier.dateRanges?.length === 0 || !tier.dateRanges) && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-green-800 font-medium">
                          {t(
                            "discountTiers.alwaysAvailable",
                            "This discount is always available.",
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {tier.dateRanges?.map((dateRange) => (
                    <div key={dateRange.id} className="flex items-center gap-2">
                      <Popover placement="bottom-start" offset={10} shadow="lg">
                        <PopoverTrigger>
                          <Button
                            className="flex-1 w-full bg-white border-2 border-gray-200 hover:border-[#F48A42] rounded-xl justify-start p-3 text-left"
                            variant="light"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <CalendarIcon
                                className="w-4 h-4"
                                color="#F48A42"
                              />
                              <span
                                className={`font-medium max-w-1 ${
                                  formatDateRange(dateRange)
                                    ? "text-gray-700"
                                    : "text-gray-400"
                                }`}
                              >
                                {formatDateRange(dateRange) ||
                                  t("discountTiers.selectDateRange")}
                              </span>
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-96 max-w-full">
                          <Calendar
                            required
                            lang={lang}
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) =>
                              updateDateRange(tier.id, dateRange.id, range)
                            }
                            disabled={{ before: new Date() }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="text-red-500 hover:bg-red-100 rounded-full"
                        onPress={() => removeDateRange(tier.id, dateRange.id)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="light"
                  className="mt-4 text-[#F48A42] font-semibold hover:bg-orange-50"
                  onPress={() => addDateRange(tier.id)}
                  type="button"
                >
                  <Plus size={16} />
                  {t("discountTiers.addDateRange")}
                </Button>
              </div>

              {/* Tier Preview (Updated for multiple dates) */}
              {tier.minDays &&
                ((tier.discountType === "percentage" && tier.discount) ||
                  (tier.discountType === "price" &&
                    tier.discountPrice > 0)) && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-green-800">
                        {t("discountTiers.tierPreview")
                          .replace("{days}", tier.minDays)
                          .replace(
                            "{discount}",
                            getDiscountPercentage(tier).toFixed(1),
                          )}
                      </span>
                    </div>

                    {tier.dateRanges?.map(
                      (dr) =>
                        formatDateRange(dr) && (
                          <div
                            key={dr.id}
                            className="flex items-center gap-2 mt-1 ps-6"
                          >
                            <CalendarIcon className="w-3 h-3" color="#1d4ed8" />
                            <span className="text-xs text-blue-700">
                              {formatDateRange(dr)}
                            </span>
                          </div>
                        ),
                    )}

                    <div className="mt-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-0.5">
                        {t("discountTiers.originalPrice")}:{" "}
                        {(rentPrice * tier.minDays).toFixed(0)}
                        <Currency size={14} color="#4b5563" />
                      </span>
                      <span className="inline-block mx-2">
                        {t("discountTiers.arrow")}
                      </span>
                      <span className="font-bold text-green-600 inline-flex items-center gap-0.5">
                        {t("discountTiers.finalPrice")}:{" "}
                        {calculateDiscountedPrice(tier).toFixed(0)}
                        <Currency size={14} color="#16a34a" />
                      </span>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State (Unchanged) */}
      {discountTiers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Currency color="#6b7280" size={22} />
          </div>
          <h3 className="text-lg text-gray-900 mb-2">
            {t("discountTiers.emptyTitle")}
          </h3>
          <p className="text-gray-500 mb-4">
            {t("discountTiers.emptyDescription")}
          </p>
        </div>
      )}

      {/* Summary Preview (Updated for multiple dates) */}
      {discountTiers.length > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#f48a42] rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-orange-800">
              {t("discountTiers.summary")}
            </h4>
          </div>

          <div className="grid gap-3">
            {discountTiers
              .filter(
                (tier) =>
                  tier.minDays &&
                  ((tier.discountType === "percentage" && tier.discount) ||
                    (tier.discountType === "price" && tier.discountPrice)),
              )
              .sort((a, b) => a.minDays - b.minDays)
              .map((tier, index) => {
                const originalPrice = rentPrice * tier.minDays;
                const finalPrice = calculateDiscountedPrice(tier);
                const discountPercentage = getDiscountPercentage(tier);

                return (
                  <div
                    key={tier.id}
                    className="p-4 bg-white rounded-xl shadow-sm border border-orange-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-[#f48a42] text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          {tier.minDays}+ {t("discountTiers.daysUnit")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#f48a42]">
                          {discountPercentage.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500">
                          {t("discountTiers.discountUnit")}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      {tier.dateRanges?.length > 0 ? (
                        tier.dateRanges?.map(
                          (dr) =>
                            formatDateRange(dr) && (
                              <div
                                key={dr.id}
                                className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-700 font-medium mr-1 mb-1"
                              >
                                <CalendarIcon
                                  className="w-3 h-3"
                                  color="#1d4ed8"
                                />
                                {formatDateRange(dr)}
                              </div>
                            ),
                        )
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-full text-xs text-green-700 font-medium">
                          <svg
                            className="w-3 h-3 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {t("discountTiers.yearRound")}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {t("discountTiers.originalPrice")}:
                        </span>
                        <span className="font-medium text-gray-700 line-through flex items-center gap-1">
                          {originalPrice.toFixed(0)}
                          <Currency size={12} color="#374151 " />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {t("discountTiers.finalPrice")}:
                        </span>
                        <span className="font-bold text-green-600 text-lg flex items-center gap-1">
                          {finalPrice.toFixed(0)}{" "}
                          <Currency size={16} color="#16a34a  " />
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-flex items-center gap-1">
                        {t("discountTiers.savings")}:{" "}
                        {(originalPrice - finalPrice).toFixed(0)}
                        <Currency size={14} color="#166534" />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuantityDiscountList({
  t,
  quantityDiscountTiers,
  setRentData,
  rentPrice,
  quantity,
}) {
  const addTier = () => {
    setRentData((prev) => ({
      ...prev,
      quantityDiscountTiers: [
        ...(prev.quantityDiscountTiers || []),
        { id: Date.now(), minQuantity: "", discount: "" },
      ],
    }));
  };

  const removeTier = (id) => {
    setRentData((prev) => ({
      ...prev,
      quantityDiscountTiers: prev.quantityDiscountTiers.filter(
        (tier) => tier.id !== id,
      ),
    }));
  };

  const updateTier = (id, field, value) => {
    setRentData((prev) => ({
      ...prev,
      quantityDiscountTiers: prev.quantityDiscountTiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier,
      ),
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-[17px] h-[17px]"
              fill="none"
              stroke="white"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t("quantityDiscountTiers.title")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("quantityDiscountTiers.subtitle")}
            </p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-[#F48A42] to-[#FF6B35] text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onPress={addTier}
          type="button"
        >
          <Plus size={20} color="white" />
          {t("quantityDiscountTiers.addButton")}
        </Button>
      </div>

      {/* Tiers list */}
      {quantityDiscountTiers.length > 0 && (
        <div className="space-y-4 mb-6">
          {quantityDiscountTiers.map((tier, index) => (
            <div
              key={tier.id}
              className="relative bg-white border-2 border-gray-100 rounded-2xl md:p-6 p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Index badge */}
              <div className="absolute -top-3 -start-3 w-8 h-8 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {index + 1}
                </span>
              </div>
              {/* Remove button */}
              <div className="absolute -top-3 -end-3">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full min-w-0 p-2 shadow-lg"
                  onPress={() => removeTier(tier.id)}
                  type="button"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Min Quantity */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-[#f48a42]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    {t("quantityDiscountTiers.minQuantity")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FormInput
                      classNames={{
                        input: "text-base ps-4 pe-12",
                        inputWrapper: "h-12",
                      }}
                      type="number"
                      step="1"
                      min={1}
                      // if the number is higher than the quantity, show an error message that says "يجب أن يكون أقل من الكمية المتاحة"
                      errorMessage={t("quantityDiscountTiers.minQuantityError")}
                      max={quantity}
                      placeholder={t(
                        "quantityDiscountTiers.minQuantityPlaceholder",
                      )}
                      value={tier.minQuantity}
                      onChange={({ target }) =>
                        updateTier(
                          tier.id,
                          "minQuantity",
                          target.value < 1 ? "" : +target.value,
                        )
                      }
                    />

                    <div className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      {t("quantityDiscountTiers.piecesUnit")}
                    </div>
                  </div>
                </div>

                {/* Discount % */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-[#f48a42]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    {t("quantityDiscountTiers.discount")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-stretch">
                    <FormInput
                      classNames={{
                        input: "text-base ps-4",
                        inputWrapper: "h-12 rounded-e-none",
                      }}
                      type="number"
                      min={0}
                      max={100}
                      placeholder={t(
                        "quantityDiscountTiers.discountPlaceholder",
                      )}
                      value={tier.discount}
                      onChange={({ target }) =>
                        updateTier(
                          tier.id,
                          "discount",
                          target.value <= 0
                            ? ""
                            : target.value > 100
                              ? 100
                              : +target.value,
                        )
                      }
                    />
                    <div className="bg-gradient-to-r from-[#F48A42] to-[#FF6B35] h-12 min-w-16 flex items-center justify-center rounded-e-xl shadow-sm">
                      <span className="text-white font-bold text-lg">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {tier.minQuantity && tier.discount && (
                <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-orange-800 font-medium">
                      {t(
                        "quantityDiscountTiers.tierPreview",
                        "Rent {qty}+ pieces → {discount}% off",
                      )
                        .replace("{qty}", tier.minQuantity)
                        .replace("{discount}", tier.discount)}
                    </span>
                    {rentPrice && tier.minQuantity && tier.discount && (
                      <span className="text-xs text-orange-600 ms-2">
                        ({t("quantityDiscountTiers.saving")}{" "}
                        {(
                          rentPrice *
                          tier.minQuantity *
                          (tier.discount / 100)
                        ).toFixed(0)}{" "}
                        {t("quantityDiscountTiers.perDay")})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {quantityDiscountTiers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg text-gray-900 mb-2">
            {t("quantityDiscountTiers.emptyTitle")}
          </h3>
          <p className="text-gray-500 mb-4">
            {t("quantityDiscountTiers.emptyDescription")}
          </p>
        </div>
      )}

      {/* Summary */}
      {quantityDiscountTiers.length > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#f48a42] rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-orange-800">
              {t("quantityDiscountTiers.summary")}
            </h4>
          </div>
          <div className="grid gap-3">
            {quantityDiscountTiers
              .filter((tier) => tier.minQuantity && tier.discount)
              .sort((a, b) => a.minQuantity - b.minQuantity)
              .map((tier, index) => (
                <div
                  key={tier.id}
                  className="p-4 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {tier.minQuantity}+{" "}
                      {t("quantityDiscountTiers.piecesUnit")}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-[#f48a42]">
                    {tier.discount}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
