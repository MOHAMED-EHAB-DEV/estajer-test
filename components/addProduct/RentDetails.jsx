"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useState, useEffect } from "react";
import { Input, Select, SelectItem } from "@heroui/react";
import Button from "../ui/Button";
import { Line } from "../ui/svgs/icons/LineSvg";
import { Minus } from "../ui/svgs/icons/MinusSvg";
import { Plus } from "../ui/svgs/icons/PlusSvg";
import AddService from "./AddService";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import DiscountList, { QuantityDiscountList } from "./DiscountList";
import ServiceItem from "./ServiceItem";
import {
  CityPricingList,
  PricingModelSwitcher,
  PackagesList,
} from "./PricingModel";
import { Chevron } from "../ui/svgs/icons/ChevronSvg";

/* ─── Reusable collapsible panel (same pattern as AdditionalDetails) ─── */
function CollapsiblePanel({ open, onToggle, icon, title, subtitle, children }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${open ? "border-orange-200 shadow-sm" : "border-gray-100"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors text-right ${open ? "bg-orange-50" : "bg-gray-50 hover:bg-gray-100"}`}
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            {icon}
          </span>
          <div className="text-start">
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? "bg-orange-200" : "bg-gray-200"}`}
        >
          <Chevron
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

const Counter = ({ increment, decrement }) => (
  <div className="flex bg-[#c5c5c5] rounded-lg  min-w-28 h-12 items-center">
    <Button
      type="button"
      className="min-w-14 rounded-none px-2 h-full flex items-center justify-center"
      onPress={increment}
      color="transparent"
      aria-label="Increment"
    >
      <Plus color="#0D092B" size={20} />
    </Button>
    <Line />
    <Button
      color="transparent"
      type="button"
      className="min-w-14 rounded-none px-2 h-full flex items-center justify-center"
      onPress={decrement}
      aria-label="Decrement"
    >
      <Minus color="#0D092B" size={20} />
    </Button>
  </div>
);

export const FormInput = ({ ...props }) => {
  return (
    <Input
      isRequired
      labelPlacement="outside"
      radius="sm"
      step="0.01"
      classNames={{
        mainWrapper: "mt-10",
        label: "text-lg -mt-2 flex items-center min-w-max",
        base: "max-w-full !mt-0",
        input: "text-base",
        inputWrapper: "h-12 !rounded-e-none",
        helperWrapper: "p-0",
        errorMessage: "absolute -bottom-5",
      }}
      {...props}
    />
  );
};

// --- MAIN FORM COMPONENT (UPDATED) ---
export default function RentalDetailsForm({
  lang,
  minDays,
  setMinDays,
  services,
  setServices,
  rentData,
  setRentData,
  translate,
  location,
  address,
  setDeliveryCoastModal,
  pricingModel,
  setPricingModel,
  commission,
  quantity,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.form.rentDetails.${key}`);

  // Original state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  // Collapsible panel state — auto-open when editing (data already present)
  const [openPanels, setOpenPanels] = useState({
    discounts: !!(rentData?.discountTiers?.length > 0),
    quantityDiscounts: !!(rentData?.quantityDiscountTiers?.length > 0),
    services: !!(services?.length > 0),
  });

  // Automatically open panels when data is added (e.g. by AI assist)
  useEffect(() => {
    if (rentData?.discountTiers?.length > 0) {
      setOpenPanels((prev) => ({ ...prev, discounts: true }));
    }
  }, [rentData?.discountTiers?.length]);

  useEffect(() => {
    if (rentData?.quantityDiscountTiers?.length > 0) {
      setOpenPanels((prev) => ({ ...prev, quantityDiscounts: true }));
    }
  }, [rentData?.quantityDiscountTiers?.length]);

  useEffect(() => {
    if (services?.length > 0) {
      setOpenPanels((prev) => ({ ...prev, services: true }));
    }
  }, [services?.length]);

  const togglePanel = (id) =>
    setOpenPanels((prev) => ({ ...prev, [id]: !prev[id] }));

  const deliveryOptions = [
    { key: "receive", label: t("delivery.pickup") },
    { key: "delivery", label: t("delivery.delivery") },
    // { key: "deliveryCompany", label: t("delivery.shippingCompany") },
    { key: "free", label: t("delivery.free") },
  ];

  const incrementMinDays = () => setMinDays((min) => min + 1);
  const decrementMinDays = () =>
    setMinDays((prev) => (prev > 1 ? prev - 1 : 1));

  const openModal = (service) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const removeService = (id) => {
    setServices((prev) => prev.filter((service) => service.id !== id));
  };

  const openDeliveryModal = () => {
    if (!location?.lat || !location?.lng)
      return toast.error(ToastMessage(t("noLocation")));
    setDeliveryCoastModal(true);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Pricing Model Switcher */}

        <PricingModelSwitcher
          value={pricingModel}
          onChange={setPricingModel}
          lang={lang}
          t={t}
        />

        {/* --- MODEL 1: PER DAY PRICING (Conditional) --- */}

        {pricingModel === "perDay" && (
          <div className="flex flex-col gap-6">
            <div className="grid md:grid-cols-2 gap-x-4 gap-y-8">
              <div className="flex items-end">
                <FormInput
                  label={t("rentalValue")}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={rentData.value}
                  onChange={({ target }) =>
                    setRentData((prev) => ({
                      ...prev,
                      value: +target.value || "",
                    }))
                  }
                />
                <div className="bg-[rgba(244,138,66,0.5)] h-12 min-w-16 flex items-center justify-center rounded-e-lg">
                  <span className="text-black">{t("sar")}</span>
                </div>
              </div>
              <div className="flex items-end">
                <FormInput
                  label={t("yourEarnings").replace("{commission}", commission)}
                  classNames={{
                    mainWrapper: "mt-10",
                    label: "text-lg -mt-2 flex items-center min-w-max",
                    base: "max-w-full !mt-0",
                    input: "text-base",
                    inputWrapper:
                      "h-12 !rounded-e-none !bg-[rgba(253,220,166,0.5)]",
                    helperWrapper: "p-0",
                    errorMessage: "absolute -bottom-5",
                  }}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={
                    rentData.value
                      ? +(
                          rentData.value *
                          (1 - (commission || 15) / 100)
                        ).toFixed(2)
                      : ""
                  }
                  disabled
                />
                <div className="bg-[rgba(244,138,66,0.5)] h-12 min-w-16 flex items-center justify-center rounded-e-lg">
                  <span className="text-black">{t("sar")}</span>
                </div>
              </div>
              <div className="flex items-end">
                <FormInput
                  label={t("insuranceValue")}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={rentData.insurance}
                  onChange={({ target }) =>
                    setRentData((prev) => ({
                      ...prev,
                      insurance: target.value === "" ? "" : +target.value,
                    }))
                  }
                />
                <div className="bg-[rgba(244,138,66,0.5)] h-12 min-w-16 flex items-center justify-center rounded-e-lg">
                  <span className="text-black">{t("sar")}</span>
                </div>
              </div>
              <div className="flex items-end">
                <FormInput
                  label={t("minDays")}
                  type="number"
                  placeholder="1"
                  min={1}
                  value={minDays}
                  step={1}
                  onChange={({ target: { value } }) => setMinDays(+value)}
                />
                <Counter
                  value={minDays}
                  increment={incrementMinDays}
                  decrement={decrementMinDays}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- MODEL 2: PACKAGE PRICING (Conditional) --- */}
        {pricingModel === "packages" && (
          <PackagesList
            packages={rentData.packages}
            setRentData={setRentData}
            t={t}
            commission={commission}
          />
        )}
        {/* --- MODEL 3: CITY PRICING (Conditional) --- */}
        <div className="py-4">
          <div
            className={`grid ${
              pricingModel === "perDay" ? "md:grid-cols-2" : "lg:grid-cols-3"
            } gap-x-4 gap-y-8 items-start mb-8`}
          >
            {pricingModel === "packages" && (
              <div className="flex items-end">
                <FormInput
                  label={t("insuranceValue")}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={rentData.insurance}
                  onChange={({ target }) =>
                    setRentData((prev) => ({
                      ...prev,
                      insurance: target.value === "" ? "" : +target.value,
                    }))
                  }
                />
                <div className="bg-[rgba(244,138,66,0.5)] h-12 min-w-16 flex items-center justify-center rounded-e-lg">
                  <span className="text-black">{t("sar")}</span>
                </div>
              </div>
            )}
            <Select
              disallowEmptySelection
              label={<span className="text-lg">{t("deliveryOptions")}</span>}
              isRequired
              labelPlacement="outside"
              size="lg"
              radius="sm"
              classNames={{ base: "!mt-10" }}
              aria-label={t("deliveryOptions")}
              selectedKeys={[rentData.delivery.type]}
              onChange={({ target }) =>
                setRentData((prev) => ({
                  ...prev,
                  delivery: {
                    ...prev.delivery,
                    type: target.value,
                    cost: target.value === "delivery" ? "" : 0,
                  },
                }))
              }
            >
              {deliveryOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Free Delivery Info Box */}
          {rentData.delivery.type === "free" && (
            <div className="mb-8 p-6 bg-gradient-to-r from-[#f48a42]/10 via-[#f48a42]/5 to-transparent border border-[#f48a42]/20 rounded-2xl flex items-start gap-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f48a42]/5 rounded-full blur-3xl -mr-16 -mt-16" />

              <div className="w-14 h-14 bg-gradient-to-br from-[#f48a42] to-[#ff9c5a] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#f48a42]/20 relative z-10">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="space-y-2 relative z-10">
                <h4 className="font-bold text-darkNavy text-xl">
                  {t("freeDeliveryNote.title")}
                </h4>
                <p className="text-gray-700 leading-relaxed text-[15px] md:text-base font-medium">
                  {t("freeDeliveryNote.description").replace(
                    "{governorate}",
                    address?.governorate ||
                      t("freeDeliveryNote.fallbackGovernorate"),
                  )}
                </p>
                <div className="flex items-start gap-2 bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-[#f48a42]/10 mt-2">
                  <svg
                    className="w-5 h-5 text-[#f48a42] mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-[#f48a42] text-sm font-semibold">
                    {t("freeDeliveryNote.tip")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Pricing Options */}
          {rentData.delivery.type === "delivery" && (
            <div className="space-y-8">
              {/* Pricing Model Selector */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("cityPricing.deliveryPricingModel")}
                </h3>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${
                      rentData.delivery.pricingModel === "fixedCity"
                        ? "bg-[#f48a42] text-white shadow-lg"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
                    }`}
                    onPress={() =>
                      setRentData((prev) => ({
                        ...prev,
                        delivery: {
                          ...prev.delivery,
                          pricingModel: "fixedCity",
                          cost: 0,
                          fixedCityPricing:
                            prev.delivery.fixedCityPricing || [],
                        },
                      }))
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("fixedCityPricing")}
                    </div>
                  </Button>
                  <Button
                    className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${
                      rentData.delivery.pricingModel === "perKm" ||
                      !rentData.delivery.pricingModel
                        ? "bg-[#f48a42] text-white shadow-lg"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
                    }`}
                    onPress={() =>
                      setRentData((prev) => ({
                        ...prev,
                        delivery: {
                          ...prev.delivery,
                          pricingModel: "perKm",
                          fixedCityPricing:
                            rentData.delivery.fixedCityPricing || [],
                        },
                      }))
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                      </svg>
                      {t("perKmPricing")}
                    </div>
                  </Button>
                </div>
              </div>

              {/* Per-Km Pricing */}
              {(rentData.delivery.pricingModel === "perKm" ||
                !rentData.delivery.pricingModel) && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[#f48a42]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {t("deliveryCostPerKm")}
                    </h4>
                  </div>
                  <div>
                    <div className="flex items-end">
                      <FormInput
                        label={t("deliveryCost")}
                        type="number"
                        placeholder="0"
                        min={0}
                        value={rentData.delivery.cost}
                        onChange={({ target }) =>
                          setRentData((prev) => ({
                            ...prev,
                            delivery: {
                              ...prev.delivery,
                              cost: +target.value || "",
                            },
                          }))
                        }
                        isRequired
                      />
                      <div className="bg-[rgba(244,138,66,0.5)] me-2 h-12 min-w-16 flex items-center justify-center rounded-e-lg">
                        <span className="text-black">{t("sar")}</span>
                      </div>
                    </div>
                    <div
                      onClick={openDeliveryModal}
                      className="text-[#f48a42]/80 hover:text-[#f48a42] underline cursor-pointer mt-2 font-semibold"
                    >
                      {t("deliveryCostExample")}
                    </div>
                  </div>
                </div>
              )}

              {/* Fixed City Pricing */}
              {rentData.delivery.pricingModel === "fixedCity" && (
                <CityPricingList
                  cities={rentData.delivery.fixedCityPricing || []}
                  setRentData={setRentData}
                  t={t}
                  lang={lang}
                />
              )}
            </div>
          )}
        </div>
        {pricingModel === "perDay" && (
          <div className="flex flex-col gap-3">
            {/* Collapsible: Duration Discounts */}
            <CollapsiblePanel
              open={openPanels.discounts}
              onToggle={() => togglePanel("discounts")}
              icon={
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
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              }
              title={t("discountTiers.title")}
              subtitle={t("discountTiers.subtitle")}
            >
              <DiscountList
                t={t}
                discountTiers={rentData?.discountTiers || []}
                setRentData={setRentData}
                rentPrice={rentData.value}
                lang={lang}
              />
            </CollapsiblePanel>

            {/* Collapsible: Quantity Discounts */}
            <CollapsiblePanel
              open={openPanels.quantityDiscounts}
              onToggle={() => togglePanel("quantityDiscounts")}
              icon={
                <svg
                  className="w-4 h-4 text-white"
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
              }
              title={t("quantityDiscountTiers.title")}
              subtitle={t("quantityDiscountTiers.subtitle")}
            >
              <QuantityDiscountList
                t={t}
                quantityDiscountTiers={rentData?.quantityDiscountTiers || []}
                setRentData={setRentData}
                rentPrice={rentData.value}
                quantity={quantity}
              />
            </CollapsiblePanel>
          </div>
        )}

        {/* --- ADDITIONAL SERVICES SECTION — collapsible panel --- */}
        <CollapsiblePanel
          open={openPanels.services}
          onToggle={() => togglePanel("services")}
          icon={
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          title={t("additionalServices.title")}
          subtitle={t(
            "additionalServices.subtitle",
            "Add extra services to enhance your rental",
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button
                className="bg-gradient-to-r from-[#F48A42] to-[#FF6B35] text-white rounded-xl px-5 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                onPress={() => openModal()}
                type="button"
              >
                <Plus size={18} color="white" />
                {t("additionalServices.addButton")}
              </Button>
            </div>
            {services.length > 0 ? (
              <div className="flex flex-col gap-4">
                {services.map((service, index) => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                    index={index}
                    onRemove={removeService}
                    onEdit={openModal}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-7 h-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-base text-gray-900 mb-1">
                  {t(
                    "additionalServices.emptyTitle",
                    "No additional services yet",
                  )}
                </h3>
                <p className="text-gray-500 text-sm">
                  {t(
                    "additionalServices.emptyDescription",
                    "Add services to increase your rental value",
                  )}
                </p>
              </div>
            )}
          </div>
        </CollapsiblePanel>
      </div>
      <AddService
        key={currentService?.id}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setServices={setServices}
        currentService={currentService}
        setCurrentService={setCurrentService}
        lang={lang}
        translate={translate}
      />
    </>
  );
}
