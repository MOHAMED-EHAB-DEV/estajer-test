"use client";

import { useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Input,
  Checkbox,
} from "@heroui/react";
import Button from "@/components/ui/Button";
import { toast } from "@/utils/toast";
import { useEffect } from "react";
import ToastMessage from "@/components/ui/ToastMessage";
import { anyImgUrl } from "@/utils/ImageUrl";
import { CityPricingList } from "@/components/addProduct/PricingModel";
import { FormInput } from "@/components/addProduct/RentDetails";
import { useTranslations } from "@/hooks/useTranslations";

// ─── Step 1: Edit Form ────────────────────────────────────────────────────────

function EditFormStep({
  formData,
  setFormData,
  categories,
  subCategories,
  lang,
  translate,
  onNext,
  onClose,
  selectedCount,
}) {
  const trans = useTranslations(translate);
  const tRent = (key) => trans(`addProductPage.form.rentDetails.${key}`);
  const t = (text) => trans(`bulkEditAdmin.${text}`);

  const [enabledFields, setEnabledFields] = useState({
    delivery: false,
  });

  const toggleField = (field) => {
    setEnabledFields((prev) => ({ ...prev, [field]: !prev[field] }));
    if (enabledFields[field]) {
      if (field === "delivery") {
        setFormData((prev) => ({
          ...prev,
          delivery: {
            type: "delivery",
            pricingModel: "fixedCity",
            cost: 0,
            fixedCityPricing: [],
          },
        }));
      }
    }
  };

  const selectedCategoryKey = formData.category;
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryKey || !subCategories) return [];
    return subCategories[selectedCategoryKey] || [];
  }, [selectedCategoryKey, subCategories]);

  const hasAnyEnabled = useMemo(() => {
    const hasGeneral =
      formData.category ||
      formData.quantity ||
      formData.minQuantity ||
      formData.status;
    return hasGeneral || enabledFields.delivery;
  }, [formData, enabledFields.delivery]);

  const deliveryOptions = [
    { key: "receive", label: t("deliveryOptions.receive") },
    { key: "delivery", label: t("deliveryOptions.delivery") },
    { key: "free", label: t("deliveryOptions.free") },
  ];

  const statusOptions = [
    { key: "excellent", label: t("status.excellent") },
    { key: "veryGood", label: t("status.veryGood") },
    { key: "good", label: t("status.good") },
  ];

  const setDeliveryData = (updater) => {
    if (typeof updater === "function") {
      setFormData((prev) => {
        const wrappedPrev = { delivery: prev.delivery };
        const result = updater(wrappedPrev);
        return { ...prev, delivery: result.delivery };
      });
    }
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        <p className="text-sm text-gray-500 font-normal">
          {t("subtitle").replace("{count}", selectedCount)}
        </p>
      </ModalHeader>

      <ModalBody className="py-3 md:py-6 space-y-3 md:space-y-5">
        <p className="text-[10px] md:text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 md:px-3 py-1.5 md:py-2">
          {t("instruction")}
        </p>

        {/* General Information Group */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/20">
          <div className="bg-gray-50 px-3 md:px-4 py-1.5 md:py-2 border-b border-gray-200">
            <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("generalInfo")}
            </h3>
          </div>
          <div className="p-4 space-y-6">
            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                size="sm"
                radius="sm"
                label={t("category")}
                labelPlacement="outside"
                selectedKeys={formData.category ? [formData.category] : []}
                onChange={({ target }) => {
                  const newCatKey = target.value;
                  const subs = subCategories?.[newCatKey] || [];
                  setFormData((prev) => ({
                    ...prev,
                    category: newCatKey,
                    subCategory: subs.length > 0 ? subs[0].key : "",
                  }));
                }}
                aria-label="Category"
                placeholder={t("selectCategory")}
              >
                {(categories || []).map(({ key, label }) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>

              <Select
                size="sm"
                radius="sm"
                label={t("subcategory")}
                labelPlacement="outside"
                isDisabled={
                  !formData.category || filteredSubCategories.length === 0
                }
                selectedKeys={
                  formData.subCategory ? [formData.subCategory] : []
                }
                onChange={({ target }) =>
                  setFormData((prev) => ({
                    ...prev,
                    subCategory: target.value,
                  }))
                }
                aria-label="Sub Category"
                placeholder={t("selectSubCategory")}
              >
                {filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map(({ key, label }) => (
                    <SelectItem key={key}>{label}</SelectItem>
                  ))
                ) : (
                  <SelectItem key="none" isDisabled>
                    {t("noSubcategories")}
                  </SelectItem>
                )}
              </Select>
            </div>

            {/* Quantity Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                min={1}
                size="sm"
                radius="sm"
                label={t("quantity")}
                labelPlacement="outside"
                value={formData.quantity}
                onChange={({ target }) =>
                  setFormData((prev) => ({ ...prev, quantity: target.value }))
                }
                placeholder="1"
              />
              <Input
                type="number"
                min={1}
                size="sm"
                radius="sm"
                label={t("minQuantity")}
                labelPlacement="outside"
                value={formData.minQuantity}
                onChange={({ target }) =>
                  setFormData((prev) => ({
                    ...prev,
                    minQuantity: target.value,
                  }))
                }
                placeholder="1"
              />
            </div>

            {/* Status */}
            <Select
              size="sm"
              radius="sm"
              label={t("productCondition")}
              labelPlacement="outside"
              selectedKeys={formData.status ? [formData.status] : []}
              onChange={({ target }) =>
                setFormData((prev) => ({ ...prev, status: target.value }))
              }
              aria-label="Product Condition"
              placeholder={t("changeStatusTo")}
            >
              {statusOptions.map(({ key, label }) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Delivery */}
        <FieldWrapper
          label={t("delivery")}
          enabled={enabledFields.delivery}
          onToggle={() => toggleField("delivery")}
        >
          <div className="space-y-4 pt-1">
            <Select
              size="sm"
              radius="sm"
              label={t("deliveryType")}
              labelPlacement="outside"
              disallowEmptySelection
              selectedKeys={[formData.delivery.type]}
              onChange={({ target }) =>
                setFormData((prev) => ({
                  ...prev,
                  delivery: {
                    ...prev.delivery,
                    type: target.value,
                    cost: target.value === "delivery" ? prev.delivery.cost : 0,
                  },
                }))
              }
              aria-label="Delivery Type"
            >
              {deliveryOptions.map(({ key, label }) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))}
            </Select>

            {formData.delivery.type === "delivery" && (
              <div className="space-y-3">
                {/* Pricing Model Tabs */}
                <div className="flex gap-2">
                  {Object.keys(trans("bulkEditAdmin.pricingModels")).map(
                    (model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            delivery: {
                              ...prev.delivery,
                              pricingModel: model,
                              cost: 0,
                            },
                          }))
                        }
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          formData.delivery.pricingModel === model
                            ? "bg-[#f48a42] text-white shadow"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {t(`pricingModels.${model}`)}
                      </button>
                    ),
                  )}
                </div>

                {formData.delivery.pricingModel === "perKm" && (
                  <div className="flex items-end gap-0">
                    <FormInput
                      label={t("deliveryCostPerKm")}
                      type="number"
                      placeholder="0"
                      min={0}
                      value={formData.delivery.cost}
                      onChange={({ target }) =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery: {
                            ...prev.delivery,
                            cost: +target.value || 0,
                          },
                        }))
                      }
                      isRequired
                    />
                    <div className="bg-[rgba(244,138,66,0.5)] h-12 min-w-14 flex items-center justify-center rounded-e-lg">
                      <span className="text-black text-sm">{t("sar")}</span>
                    </div>
                  </div>
                )}

                {formData.delivery.pricingModel === "fixedCity" && (
                  <CityPricingList
                    cities={formData.delivery.fixedCityPricing}
                    setRentData={setDeliveryData}
                    t={tRent}
                    lang={lang}
                  />
                )}
              </div>
            )}
          </div>
        </FieldWrapper>
      </ModalBody>

      <ModalFooter className="border-t border-gray-100 pt-4">
        <Button
          color="transparent"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onPress={onClose}
        >
          {t("back")}
        </Button>
        <Button
          className="bg-[#f48a42] text-white"
          isDisabled={!hasAnyEnabled}
          onPress={() => onNext(enabledFields)}
        >
          {t("previewChanges")}
        </Button>
      </ModalFooter>
    </>
  );
}

// ─── Field Wrapper with Toggle ─────────────────────────────────────────────────

function FieldWrapper({
  label,
  enabled,
  onToggle,
  children,
  disabled = false,
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        enabled
          ? "border-[#f48a42] bg-orange-50/40"
          : "border-gray-200 bg-gray-50/40"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={disabled ? undefined : onToggle}
      >
        <span
          className={`text-sm font-semibold ${enabled ? "text-[#f48a42]" : "text-gray-700"}`}
        >
          {label}
        </span>
        <div
          className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
            enabled ? "bg-[#f48a42]" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
              enabled ? "start-5" : "start-1"
            }`}
          />
        </div>
      </div>
      {enabled && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── Step 2: Confirm Modal ─────────────────────────────────────────────────────

function ConfirmStep({
  selectedProducts,
  enabledFields,
  formData,
  categories,
  subCategories,
  lang,
  translate,
  onConfirm,
  onBack,
  onRemoveProduct,
  isLoading,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`bulkEditAdmin.${text}`);

  const getCategoryLabel = (key) => {
    const cat = (categories || []).find((c) => c.key === key);
    return cat ? cat.label : key;
  };

  const getSubCategoryLabel = (catKey, subKey) => {
    const subs = (subCategories || {})[catKey] || [];
    const sub = subs.find((s) => s.key === subKey);
    return sub ? sub.label : subKey;
  };

  const statusLabels = {
    excellent: lang === "ar" ? "ممتاز" : "Excellent",
    veryGood: lang === "ar" ? "جيد جداً" : "Very Good",
    good: lang === "ar" ? "جيد" : "Good",
  };

  const deliveryTypeLabels = useMemo(
    () => trans("bulkEditAdmin.deliveryOptions"),
    [trans],
  );

  const pricingModelLabels = useMemo(
    () => trans("bulkEditAdmin.pricingModels"),
    [trans],
  );

  const f = (text) => t(`fieldLabels.${text}`);

  const buildChanges = (product) => {
    const changes = [];

    if (formData.category) {
      const currentLabel = getCategoryLabel(product.category);
      const newLabel = getCategoryLabel(formData.category);
      changes.push({
        field: f("category"),
        from: currentLabel || product.category || "—",
        to: newLabel,
      });

      if (formData.subCategory) {
        const currentSubLabel = getSubCategoryLabel(
          product.category,
          product.subCategory,
        );
        const newSubLabel = getSubCategoryLabel(
          formData.category,
          formData.subCategory,
        );
        changes.push({
          field: f("subcategory"),
          from: currentSubLabel || product.subCategory || "—",
          to: newSubLabel,
        });
      }
    }

    if (formData.quantity) {
      changes.push({
        field: f("quantity"),
        from: product.quantity ?? "—",
        to: formData.quantity,
      });
    }

    if (formData.minQuantity) {
      changes.push({
        field: f("minQuantity"),
        from: product.minQuantity ?? "—",
        to: formData.minQuantity,
      });
    }

    if (formData.status) {
      changes.push({
        field: f("condition"),
        from:
          trans(`bulkEditAdmin.status.${product.status}`) ||
          product.status ||
          "—",
        to: trans(`bulkEditAdmin.status.${formData.status}`),
      });
    }

    if (enabledFields.delivery && formData.delivery) {
      const currentType = product.rental?.delivery?.type;
      const newType = formData.delivery.type;
      changes.push({
        field: f("deliveryType"),
        from: deliveryTypeLabels[currentType] || currentType || "—",
        to: deliveryTypeLabels[newType] || newType,
      });

      if (newType === "delivery") {
        const currentModel = product.rental?.delivery?.pricingModel;
        changes.push({
          field: f("pricingModel"),
          from: pricingModelLabels[currentModel] || currentModel || "—",
          to: pricingModelLabels[formData.delivery.pricingModel],
        });

        if (formData.delivery.pricingModel === "perKm") {
          changes.push({
            field: f("deliveryCost"),
            from: product.rental?.delivery?.cost ?? "—",
            to: `${formData.delivery.cost} ${t("sarPerKm")}`,
          });
        }
      }
    }

    return changes;
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t("confirmChanges")}
        </h2>
        <p className="text-sm text-gray-500 font-normal">
          {t("reviewChanges").replace("{count}", selectedProducts.length)}
        </p>
      </ModalHeader>

      <ModalBody className="py-4 grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
        {selectedProducts.map((product) => {
          const changes = buildChanges(product);
          const image = product.images?.[0]?.preview;
          const name = product.nameAr || product.nameEn || product.name;
          const ownerName = product.owner?.fullName;
          const ownerEmail = product.owner?.email;
          const ownerAvatar = product.owner?.avatar;

          return (
            <div
              key={product._id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Product header */}
              <div className="flex items-center lg:items-start flex-col lg:flex-row gap-2 lg:gap-3 p-2 lg:p-3 bg-gray-50/60 border-b border-gray-100">
                {image && (
                  <img
                    src={anyImgUrl({ src: image, size: 80 })}
                    alt={name}
                    className="w-full lg:w-12 h-24 lg:h-12 rounded-xl object-cover shrink-0 border border-gray-200"
                  />
                )}
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-xs lg:text-sm font-bold text-gray-900 truncate">
                    {name}
                  </p>
                  {ownerName && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {ownerAvatar && (
                        <img
                          src={anyImgUrl({ src: ownerAvatar, size: 32 })}
                          alt={ownerName}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      <span className="text-[10px] lg:text-xs text-gray-500 truncate max-w-[80px]">
                        {ownerName}
                      </span>
                      {ownerEmail && (
                        <span className="text-[10px] lg:text-xs text-gray-400 truncate hidden lg:inline">
                          · {ownerEmail}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-gray-400 hover:text-red-500 -me-1 absolute top-1 end-1 lg:static"
                  onPress={() => onRemoveProduct(product._id)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              {/* Changes */}
              {changes.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {changes.map((change, i) => (
                    <div
                      key={i}
                      className="flex items-center lg:gap-2 gap-1 px-2 lg:px-3 py-1 lg:py-2 flex-wrap"
                    >
                      <span className="text-[10px] lg:text-xs font-semibold text-gray-500 min-w-[70px] lg:min-w-[90px]">
                        {change.field}
                      </span>
                      <span className="text-[9px] lg:text-xs bg-red-50 text-red-600 px-1.5 lg:px-2 py-0.5 rounded-full border border-red-100 line-through">
                        {String(change.from)}
                      </span>
                      <span className="text-[9px] lg:text-xs text-gray-400">→</span>
                      <span className="text-[9px] lg:text-xs bg-green-50 text-green-700 px-1.5 lg:px-2 py-0.5 rounded-full border border-green-100 font-medium">
                        {String(change.to)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-400 italic">
                  {t("noChanges")}
                </div>
              )}
            </div>
          );
        })}
      </ModalBody>

      <ModalFooter className="border-t border-gray-100 pt-4 gap-2">
        <Button
          color="transparent"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onPress={onBack}
          isDisabled={isLoading}
        >
          {t("back")}
        </Button>
        <Button
          className="bg-[#f48a42] text-white font-semibold"
          isLoading={isLoading}
          onPress={onConfirm}
        >
          {t("confirmApply")}
        </Button>
      </ModalFooter>
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminBulkEditModal({
  isOpen,
  onClose,
  selectedProductIds,
  products, // full product objects for the selected IDs
  onSuccess,
  lang,
  translate,
  categories,
  subCategories,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`bulkEditAdmin.${text}`);

  const [step, setStep] = useState(1); // 1 = form, 2 = confirm
  const [activeProductIds, setActiveProductIds] = useState(selectedProductIds);

  useEffect(() => {
    setActiveProductIds(selectedProductIds);
  }, [selectedProductIds]);

  const [isLoading, setIsLoading] = useState(false);
  const [enabledFields, setEnabledFields] = useState({});

  const defaultDelivery = {
    type: "delivery",
    pricingModel: "fixedCity",
    cost: 0,
    fixedCityPricing: [],
  };

  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    quantity: "",
    minQuantity: "",
    status: "",
    delivery: defaultDelivery,
  });

  const selectedProducts = useMemo(
    () => products.filter((p) => activeProductIds.includes(p._id)),
    [products, activeProductIds],
  );

  const handleNext = (fields) => {
    setEnabledFields(fields);
    setStep(2);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const updates = {};
      if (formData.category) {
        updates.category = formData.category;
        updates.subCategory = formData.subCategory || "";
      }
      if (formData.quantity) updates.quantity = Number(formData.quantity);
      if (formData.minQuantity)
        updates.minQuantity = Number(formData.minQuantity);
      if (formData.status) updates.status = formData.status;
      if (enabledFields.delivery) updates.delivery = formData.delivery;

      const res = await fetch("/api/products/bulk-update-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: activeProductIds, updates }),
      });
      const data = await res.json();

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
    } catch (err) {
      console.error(err);
      toast.error(ToastMessage(t("errorMessage")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      category: "",
      subCategory: "",
      quantity: "",
      minQuantity: "",
      status: "excellent",
      delivery: defaultDelivery,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{ base: "max-h-[88vh]", body: "py-4" }}
    >
      <ModalContent>
        {step === 1 ? (
          <EditFormStep
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            subCategories={subCategories}
            lang={lang}
            translate={translate}
            onNext={handleNext}
            onClose={handleClose}
            selectedCount={selectedProductIds.length}
          />
        ) : (
          <ConfirmStep
            selectedProducts={selectedProducts}
            enabledFields={enabledFields}
            formData={formData}
            categories={categories}
            subCategories={subCategories}
            lang={lang}
            translate={translate}
            onNext={handleNext}
            onConfirm={handleConfirm}
            onBack={() => setStep(1)}
            onRemoveProduct={(id) => {
              setActiveProductIds((prev) => {
                const updated = prev.filter((pId) => pId !== id);
                if (updated.length === 0) setStep(1);
                return updated;
              });
            }}
            isLoading={isLoading}
          />
        )}
      </ModalContent>
    </Modal>
  );
}
