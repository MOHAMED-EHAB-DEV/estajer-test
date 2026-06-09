"use client";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/utils/toast";
import dynamic from "next/dynamic";
import { sendGTMEvent } from "@next/third-parties/google";

import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import ToastMessage from "../ui/ToastMessage";
import Button from "../ui/Button";
import { Send } from "../ui/svgs/icons/SendSvg";
import ClearCartModal from "./ClearCartModal";
import formatDuration from "@/utils/formatDuration";

// Form Sections
import QuantityStep from "./OrderForm/QuantityStep";
import PackagesStep from "./OrderForm/PackagesStep";
import DatesStep from "./OrderForm/DatesStep";
import ServicesStep from "./OrderForm/ServicesStep";
import SummaryStep from "./OrderForm/SummaryStep";
import { X } from "../ui/svgs/icons/XSvg";

// Dynamic imports
const DeliverySelect = dynamic(() => import("./DeliverySelect"), {
  ssr: false,
  loading: () => <div className="h-14 bg-gray-100 rounded-xl animate-pulse" />,
});

function StepDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2 my-4 md:hidden">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-primary"
              : i < current
                ? "w-2 bg-orange-300"
                : "w-2 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function OrderForm({ product, lang, translate }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const t = (key) => trans(`singleProduct.order.${key}`);
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get("providerId");
  const { user } = useUser();

  // ── Shared State ──
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  const [selectedDates, setSelectedDates] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [daysNum, setDaysCount] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(
    product.rental?.packages?.[0] || {},
  );
  const [deliveryType, setDeliveryType] = useState(
    product.rental?.delivery?.type || "receive",
  );
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [clearCartMessage, setClearCartMessage] = useState(false);
  const [quantityError, setQuantityError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(2);

  // ── Reset on close (Mobile only) ──
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setQuantity(product.minQuantity || 1);
      setSelectedDates(null);
      setSelectedServices([]);
      setDaysCount(0);
      setSelectedPackage(product.rental?.packages?.[0] || {});
      setIsRedirecting(false);
      setCountdown(2);
    }
  }, [isOpen, product.rental?.packages]);

  // ── Global Listener for Mobile Trigger ──
  useEffect(() => {
    const handleOpen = (e) => {
      const idx = e?.detail?.packageIndex ?? 0;
      const pkg =
        product.rental?.packages?.[idx] || product.rental?.packages?.[0] || {};
      setSelectedPackage(pkg);
      setIsOpen(true);
    };
    window.addEventListener("open-rent-drawer", handleOpen);
    return () => window.removeEventListener("open-rent-drawer", handleOpen);
  }, [product.rental?.packages]);

  // ── Lock body scroll when drawer is open ──
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  // ── Fetch Bookings ──
  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem("cart") || "[]"));
    fetch(`/api/bookings/${product._id}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.data || []))
      .catch(() => {});
  }, [product._id]);

  // ── Redirect Countdown ──
  useEffect(() => {
    if (!isRedirecting) return;
    if (countdown === 0) {
      router.push(`/${langPrefix}cart`);
      return;
    }
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [isRedirecting, countdown, router, langPrefix]);

  // ── Layout Helpers ──
  const hasServices = product.services?.length > 0;
  const hasBranches =
    product.owner?.hasBranches && product.owner?.branches?.length > 0;
  const isPackages = product.pricingModel === "packages";

  const steps = useMemo(() => {
    const s = [];
    if (product.quantity > 1) s.push("quantity");
    if (isPackages) s.push("packages");
    s.push("dates");
    if (hasServices) s.push("services");
    if (hasBranches) s.push("delivery");
    s.push("summary");
    return s;
  }, [hasServices, hasBranches, product.quantity, isPackages]);

  const { discountPrice, basePrice, hasDiscount } = useMemo(() => {
    const discountTier = product?.rental?.discountTiers?.find(
      (tier) => tier.minDays === 1,
    );
    const hasDiscount = !!discountTier && product.pricingModel !== "packages";
    const discountPrice = hasDiscount ? discountTier.discountPrice : null;
    const basePrice =
      product.pricingModel === "packages"
        ? product.rental?.packages?.[0]?.price || 0
        : product.rental?.value || 0;

    return { discountPrice, basePrice, hasDiscount };
  }, [product]);

  const totalSteps = steps.length;
  const currentStepKey = steps[step];

  // ── Pricing Logic ──
  const isDateRangeValid = useCallback((tier, rentalDates) => {
    if (!rentalDates?.from || !rentalDates?.to) return false;
    if (!tier.dateRanges || tier.dateRanges.length === 0) return true;
    const rentalStart = new Date(rentalDates.from);
    const rentalEnd = new Date(rentalDates.to);
    return tier.dateRanges.some((range) => {
      if (!range.from || !range.to) return false;
      return (
        rentalStart >= new Date(range.from) && rentalEnd <= new Date(range.to)
      );
    });
  }, []);

  const calculateDiscount = useCallback(
    (price) => {
      if (!product?.rental?.discountTiers?.length || isPackages) return 0;
      const sorted = [...product.rental.discountTiers].sort(
        (a, b) => b.minDays - a.minDays,
      );
      for (const tier of sorted) {
        if (daysNum >= tier.minDays && isDateRangeValid(tier, selectedDates))
          return price * (tier.discount / 100);
      }
      return 0;
    },
    [
      product?.rental?.discountTiers,
      isPackages,
      daysNum,
      selectedDates,
      isDateRangeValid,
    ],
  );

  const calculateQuantityDiscount = useCallback(() => {
    if (!product?.rental?.quantityDiscountTiers?.length || isPackages) return 0;
    const sorted = [...product.rental.quantityDiscountTiers].sort(
      (a, b) => b.minQuantity - a.minQuantity,
    );
    for (const tier of sorted) {
      if (quantity >= tier.minQuantity) return tier.discount / 100;
    }
    return 0;
  }, [product?.rental?.quantityDiscountTiers, isPackages, quantity]);

  const calculateServicesTotal = useMemo(
    () =>
      selectedServices.reduce((acc, s) => {
        const line = s.price * s.quantity;
        return acc + (s.pricingType === "fixed" ? line : line * daysNum);
      }, 0),
    [selectedServices, daysNum],
  );

  const calculatePrice = useCallback(
    (noDiscount, noServices) => {
      if (!selectedDates) return 0;
      const base =
        (isPackages
          ? selectedPackage.price / selectedPackage.daysNumber
          : product.rental.value) *
        daysNum *
        quantity;
      const services = noServices ? 0 : calculateServicesTotal;
      const durationDsc = noDiscount ? 0 : calculateDiscount(base);
      const qtyMult = noDiscount ? 0 : calculateQuantityDiscount();
      return (base - durationDsc) * (1 - qtyMult) + services;
    },
    [
      selectedDates,
      isPackages,
      selectedPackage,
      product.rental.value,
      daysNum,
      quantity,
      calculateServicesTotal,
      calculateDiscount,
      calculateQuantityDiscount,
    ],
  );

  const handleBooking = useCallback(async () => {
    if (!selectedDates)
      return toast.error(ToastMessage(t("toast.selectRentalPeriod")));
    if (product.owner._id === user?._id)
      return toast.error(ToastMessage(t("toast.cantRentOwnProduct")));
    const min = product.minQuantity || 1;
    if (quantity < min)
      return toast.error(ToastMessage(t("minQuantity").replace("{min}", min)));
    if (cartItems.some((item) => item?.ownerId !== product.owner._id))
      return setClearCartMessage(t("clearCartModal.message"));
    if (
      cartItems.length > 0 &&
      (new Date(selectedDates?.from).toString() !==
        new Date(cartItems[0]?.startDate).toString() ||
        new Date(selectedDates?.to).toString() !==
          new Date(cartItems[0]?.endDate).toString())
    )
      return setClearCartMessage(t("clearCartModal.mixedDates"));

    setIsLoading(true);
    try {
      const hasTaxCode = !!product.owner?.companyDetails?.taxCode;
      const cartItem = {
        id: Date.now(),
        product: {
          _id: product._id,
          name: product.name,
          image: product.images[0],
          rental: product.rental,
          location: product.location,
          discount: (() => {
            const base = product.rental.value * daysNum * quantity;
            const dur = calculateDiscount(base);
            const qty = calculateQuantityDiscount();
            return dur + (base - dur) * qty;
          })(),
          city: product.address?.city,
          category: product.category,
          subCategory: product.subCategory,
          pricingModel: product.pricingModel,
          hasTaxCode,
        },
        selectedPackage,
        ownerId: product.owner._id,
        startDate: selectedDates.from,
        endDate: selectedDates.to,
        quantity,
        selectedServices,
        deliveryType,
        selectedBranch,
        totalPrice: calculatePrice(true),
        hasTaxCode,
        providerId,
      };
      const existing = JSON.parse(localStorage.getItem("cart") || "[]");
      localStorage.setItem("cart", JSON.stringify([...existing, cartItem]));
      toast.success(ToastMessage(t("toast.addedToCart")));
      sendGTMEvent({
        event: "add_to_cart",
        value: +(
          calculatePrice() +
          calculatePrice() * (hasTaxCode ? 0.15 : 0)
        ).toFixed(0),
        items: [
          {
            item_id: product._id,
            item_name: product.name,
            price: cartItem.totalPrice,
            quantity,
            days: daysNum,
            currency: "SAR",
            item_category: product.category,
          },
        ],
      });
      setIsRedirecting(true);
    } catch {
      toast.error(ToastMessage(t("toast.error")));
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedDates,
    product,
    user,
    quantity,
    cartItems,
    t,
    lang,
    selectedPackage,
    selectedServices,
    deliveryType,
    selectedBranch,
    calculateDiscount,
    calculateQuantityDiscount,
    daysNum,
    calculatePrice,
    providerId,
  ]);

  const handleClearCart = useCallback(() => {
    localStorage.setItem("cart", "[]");
    setCartItems([]);
    setClearCartMessage(false);
  }, []);

  const canAdvance = useMemo(() => {
    if (quantity < (product.minQuantity || 1)) return false;
    if (currentStepKey === "quantity") return true;
    if (currentStepKey === "packages") return !!selectedPackage?.id;
    if (currentStepKey === "dates") return !!selectedDates;
    if (currentStepKey === "services") return true;
    if (currentStepKey === "delivery") return true;
    return false;
  }, [
    currentStepKey,
    selectedDates,
    product.minQuantity,
    quantity,
    selectedPackage?.id,
  ]);

  const hasTaxCode = !!product.owner?.companyDetails?.taxCode;
  const taxAmount = hasTaxCode ? +(calculatePrice() * 0.15).toFixed(0) : 0;
  const totalWithTax = +(calculatePrice() + taxAmount).toFixed(0);

  return (
    <>
      <ClearCartModal
        isOpen={clearCartMessage}
        onClose={() => setClearCartMessage(false)}
        onClear={handleClearCart}
        message={clearCartMessage}
        t={t}
      />

      {/* Backdrop (Mobile only) */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Unified Container */}
      <div
        className={`max-h-[85dvh] md:static md:translate-y-0 md:bg-[#EAEEF34D] md:p-0 md:shadow-none md:max-h-none md:rounded-none md:block
        fixed bottom-0 start-0 end-0 z-[61] bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"}
      `}
      >
        {/* Desktop Price Header */}
        <div className="hidden md:flex md:flex-wrap gap-4 md:py-9 py-4 justify-center items-center bg-[#EAEEF3] text-darkNavy font-semibold text-[1rem] md:text-[1.8rem] lg:text-[1.9rem] rounded-t-2xl border-b border-gray-200">
          {hasDiscount ? (
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-primary font-IBMPlex font-semibold text-[1.2rem] md:text-[1.7rem] lg:text-[2.3rem]">
                {discountPrice} {t("currency")}
              </span>
              <span className="text-gray-400 line-through font-IBMPlex text-[1rem] md:text-[1.4rem] lg:text-[1.6rem]">
                {basePrice} {t("currency")}
              </span>
            </div>
          ) : (
            <span className="text-primary font-IBMPlex font-semibold text-[1.2rem] md:text-[1.9rem] lg:text-[2.5rem]">
              {basePrice} {t("currency")}
            </span>
          )}
          {product.pricingModel === "packages"
            ? `${trans("productComponent.per")} ${formatDuration({
                duration: product.rental.packages[0].duration,
                unit: product.rental.packages[0].unit,
                t: (key) => trans(`productComponent.bookingPackages.${key}`),
                lang,
              })}`
            : trans("productComponent.perDay")}
        </div>

        {/* Handle & Header (Mobile Drawer only) */}
        <div className="md:hidden shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          <div className="flex items-center justify-between px-5 pt-1 pb-3 border-b border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 text-2xl leading-none"
            >
              <X className="text-gray-400 w-4 h-4" />
            </button>
            <h2 className="font-bold text-darkNavy text-base">
              {t("rentNow")}
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              {step + 1}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto md:overflow-visible flex-1 md:p-0 p-4 md:space-y-0 space-y-6 bg-transparent xl:px-0 md:px-0">
          <div className="md:bg-transparent xl:px-12 md:p-6 p-0">
            {/* Quantity */}
            <div
              className={currentStepKey === "quantity" ? "" : "hidden md:block"}
            >
              <QuantityStep
                quantity={quantity}
                setQuantity={setQuantity}
                product={product}
                quantityError={quantityError}
                setQuantityError={setQuantityError}
                t={t}
                lang={lang}
              />
            </div>

            <hr className="border md:my-12 my-0 hidden md:block" />

            {/* Services */}
            {hasServices && (
              <div
                {...(currentStepKey !== "services" && {
                  className: "hidden md:block",
                })}
              >
                <ServicesStep
                  product={product}
                  selectedServices={selectedServices}
                  setSelectedServices={setSelectedServices}
                  t={t}
                />
              </div>
            )}

            {/* Packages*/}
            {isPackages && (
              <div
                className={
                  currentStepKey === "packages" ? "" : "hidden md:block"
                }
              >
                <PackagesStep
                  product={product}
                  selectedPackage={selectedPackage}
                  setSelectedPackage={setSelectedPackage}
                  setDaysCount={setDaysCount}
                  setSelectedDates={setSelectedDates}
                  trans={trans}
                  lang={lang}
                  t={t}
                />
              </div>
            )}

            {/* Dates */}
            <div
              id="date-selector"
              className={currentStepKey === "dates" ? "" : "hidden md:block"}
            >
              <DatesStep
                isPackages={isPackages}
                selectedPackage={selectedPackage}
                setDaysCount={setDaysCount}
                onSelect={setSelectedDates}
                trans={trans}
                lang={lang}
                selectedServices={selectedServices}
                bookings={bookings}
                product={product}
                quantity={quantity}
                cartItems={cartItems}
                translate={translate}
                t={t}
                ownerHolidayPeriods={product.owner?.holidayPeriods || []}
              />
            </div>

            {/* Delivery */}
            {hasBranches && (
              <>
                <hr className="border md:my-12 hidden md:block" />
                <div
                  id="delivery-selector"
                  className={
                    currentStepKey === "delivery" ? "" : "hidden md:block"
                  }
                >
                  <p className="text-sm font-semibold text-gray-500 mb-4 text-center uppercase tracking-wider md:hidden">
                    {t("deliveryPickup")}
                  </p>
                  <DeliverySelect
                    t={t}
                    selectedBranch={selectedBranch}
                    deliveryType={deliveryType}
                    product={product}
                    setDeliveryType={setDeliveryType}
                    setSelectedBranch={setSelectedBranch}
                  />
                </div>
              </>
            )}

            {/* Summary */}
            <div
              className={currentStepKey === "summary" ? "" : "hidden md:block"}
            >
              <SummaryStep
                t={t}
                quantity={quantity}
                calculatePrice={calculatePrice}
                calculateServicesTotal={calculateServicesTotal}
                selectedPackage={selectedPackage}
                daysNum={daysNum}
                formatDuration={formatDuration}
                trans={trans}
                lang={lang}
                isPackages={isPackages}
                calculateDiscount={calculateDiscount}
                product={product}
                hasTaxCode={hasTaxCode}
                taxAmount={taxAmount}
                totalWithTax={totalWithTax}
                user={user}
                isRedirecting={isRedirecting}
                langPrefix={langPrefix}
                countdown={countdown}
                setIsRedirecting={setIsRedirecting}
                setCountdown={setCountdown}
                selectedDates={selectedDates}
                isDateRangeValid={isDateRangeValid}
              />
            </div>

            {/* Desktop booking button */}
            <div id="booking-button" className="w-full mb-4 hidden md:block">
              <Button
                className="shadow-[rgba(244,138,66,0.4)] md:py-[2.3rem] py-[1.4rem] w-full md:px[3rem] px-[1.5rem] text-[0.8rem] md:text-[1.1rem] xl:text-[1.2rem] flex justify-center gap-3"
                onPress={handleBooking}
                isLoading={isLoading}
                isDisabled={product.owner._id === user?._id || isRedirecting}
              >
                {t("sendBookingRequest")}
                <span className={lang === "ar" ? "" : "rotate-90"}>
                  <Send className="lg:w-6 lg:h-6 w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile Step Dots */}
        <StepDots total={totalSteps} current={step} />
        {/* Footer (Mobile Drawer only) */}
        <div className="shrink-0 md:hidden pt-4 pb-4 px-4 border-t border-gray-100">
          {/* Mobile Navigation */}
          <div
            className="flex gap-3"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 h-12 rounded-full border-2 border-gray-200 font-semibold text-gray-600"
              >
                {t("back")}
              </button>
            )}
            {currentStepKey !== "summary" ? (
              <button
                disabled={!canAdvance}
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 h-12 rounded-full font-bold text-white bg-primary disabled:opacity-40 shadow-lg"
              >
                {t("next")}
              </button>
            ) : (
              <Button
                className="flex-1 h-12 rounded-full font-bold"
                onPress={handleBooking}
                isLoading={isLoading}
                isDisabled={product.owner._id === user?._id || isRedirecting}
              >
                {t("sendBookingRequest")}
                <span className={lang === "ar" ? "" : "rotate-90"}>
                  <Send className="w-4 h-4" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(OrderForm);
