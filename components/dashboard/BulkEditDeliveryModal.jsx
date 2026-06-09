"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import Button from "@/components/ui/Button";
import { useTranslations } from "@/hooks/useTranslations";
import { FormInput } from "@/components/addProduct/RentDetails";
import { CityPricingList } from "@/components/addProduct/PricingModel";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";

export default function BulkEditDeliveryModal({
  isOpen,
  onClose,
  selectedProducts,
  onSuccess,
  translate,
  lang,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`bulkEditDelivery.${key}`);
  const tRent = (key) => trans(`addProductPage.form.rentDetails.${key}`);

  const [isLoading, setIsLoading] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    type: "delivery",
    pricingModel: "fixedCity",
    cost: 0,
    fixedCityPricing: [],
  });

  const deliveryOptions = [
    { key: "receive", label: tRent("delivery.pickup") },
    { key: "delivery", label: tRent("delivery.delivery") },
    { key: "free", label: tRent("delivery.free") },
  ];

  const handleSubmit = async () => {
    if (!selectedProducts || selectedProducts.length === 0) {
      return toast.error(ToastMessage(t("noProductsSelected")));
    }
    if (
      deliveryData.type === "delivery" &&
      deliveryData.pricingModel === "perKm" &&
      !deliveryData.cost
    ) {
      return toast.error(ToastMessage(t("noDeliveryCost")));
    }
    if (
      deliveryData.type === "delivery" &&
      deliveryData.pricingModel === "fixedCity"
    ) {
      if (deliveryData.fixedCityPricing.length === 0) {
        return toast.error(ToastMessage(t("noCityPricing")));
      }
      console.log(
        "deliveryData.fixedCityPricing: ",
        deliveryData.fixedCityPricing,
      );
      if (deliveryData.fixedCityPricing.some((city) => !city.governorateAr)) {
        return toast.error(ToastMessage(t("noCityId")));
      }
      // if (deliveryData.fixedCityPricing.some((city) => !city.price)) {
      //   return toast.error(ToastMessage(t("noCityPrice")));
      // }
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/products/bulk-update-delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProducts, deliveryData }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          ToastMessage(
            t("successMessage").replace("{count}", data.modifiedCount),
          ),
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(ToastMessage(data.error || t("errorMessage")));
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error(ToastMessage(t("errorMessage")));
    } finally {
      setIsLoading(false);
    }
  };

  // Adapter function for CityPricingList - it expects setRentData function that works with {delivery: {...}}
  const setRentData = (updater) => {
    if (typeof updater === "function") {
      setDeliveryData((prev) => {
        // Wrap prev in the structure CityPricingList expects
        const wrappedPrev = { delivery: prev };
        const result = updater(wrappedPrev);
        // Extract delivery from the result
        return result.delivery;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-sm text-gray-500 font-normal">
            {t("subtitle").replace("{count}", selectedProducts?.length || 0)}
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Delivery Type Selection */}
            <Select
              disallowEmptySelection
              label={
                <span className="text-lg">{tRent("deliveryOptions")}</span>
              }
              labelPlacement="outside"
              size="lg"
              radius="sm"
              aria-label={tRent("deliveryOptions")}
              selectedKeys={[deliveryData.type]}
              onChange={({ target }) =>
                setDeliveryData((prev) => ({
                  ...prev,
                  type: target.value,
                  cost: target.value === "delivery" ? prev.cost : 0,
                }))
              }
            >
              {deliveryOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            {/* Delivery Pricing Options */}
            {deliveryData.type === "delivery" && (
              <div className="space-y-6">
                {/* Pricing Model Selector */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {tRent("cityPricing.deliveryPricingModel")}
                  </h3>
                  <div className="flex gap-4 flex-wrap">
                    <Button
                      type="button"
                      className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${
                        deliveryData.pricingModel === "fixedCity"
                          ? "bg-[#f48a42] text-white shadow-lg"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
                      }`}
                      onPress={() =>
                        setDeliveryData((prev) => ({
                          ...prev,
                          pricingModel: "fixedCity",
                          cost: 0,
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
                        {tRent("fixedCityPricing")}
                      </div>
                    </Button>
                    <Button
                      type="button"
                      className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 ${
                        deliveryData.pricingModel === "perKm"
                          ? "bg-[#f48a42] text-white shadow-lg"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
                      }`}
                      onPress={() =>
                        setDeliveryData((prev) => ({
                          ...prev,
                          pricingModel: "perKm",
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
                        {tRent("perKmPricing")}
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Per-Km Pricing */}
                {deliveryData.pricingModel === "perKm" && (
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
                        {tRent("deliveryCostPerKm")}
                      </h4>
                    </div>
                    <div className="flex items-end">
                      <FormInput
                        label={tRent("deliveryCost")}
                        type="number"
                        placeholder="0"
                        min={0}
                        value={deliveryData.cost}
                        onChange={({ target }) =>
                          setDeliveryData((prev) => ({
                            ...prev,
                            cost: +target.value || 0,
                          }))
                        }
                        isRequired
                      />
                      <div className="bg-[rgba(244,138,66,0.5)] h-12 min-w-16 flex items-center justify-center rounded-e-lg">
                        <span className="text-black">{tRent("sar")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fixed City Pricing */}
                {deliveryData.pricingModel === "fixedCity" && (
                  <CityPricingList
                    cities={deliveryData.fixedCityPricing}
                    setRentData={setRentData}
                    t={tRent}
                    lang={lang}
                  />
                )}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="transparent"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            onPress={onClose}
          >
            {t("cancel")}
          </Button>
          <Button
            isLoading={isLoading}
            className="bg-[#f48a42] text-white"
            onPress={handleSubmit}
          >
            {t("applyToAll")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
