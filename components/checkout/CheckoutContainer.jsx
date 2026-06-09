"use client";
import { useEffect, useState } from "react";
import { CalendarIcon } from "../ui/svgs/icons/CalendarIconSvg";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { Send } from "../ui/svgs/icons/SendSvg";
import { useTranslations } from "@/hooks/useTranslations";
import PageTitle from "../shared/PageTitle";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Input, Textarea } from "@heroui/input";
import { useDisclosure } from "@heroui/use-disclosure";
import Button from "../ui/Button";
import { useUser } from "@/context/UserContext";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import UserLocation from "../dashboard/settings/UserLocation";
import calculateDistance from "@/utils/calculateDistance";
import NafathAuthModal from "./NafathAuthModal";
import { differenceInDays } from "date-fns";
import formatDuration from "@/utils/formatDuration";
import { sendGTMEvent } from "@next/third-parties/google";
import { CheckCircle } from "../ui/svgs/Admin";

// Helper function to calculate delivery cost based on pricing model
const calculateDeliveryCost = (product, userLocation, userAddressData) => {
  if (!product?.rental?.delivery || product.rental.delivery.type !== "delivery")
    return 0;

  const delivery = product.rental.delivery;

  // Per-kilometer pricing (default)
  if (!delivery.pricingModel || delivery.pricingModel === "perKm") {
    const productLocation = {
      lng: product.location?.coordinates[0],
      lat: product.location?.coordinates[1],
    };
    const distance = calculateDistance(
      productLocation.lat,
      productLocation.lng,
      userLocation.lat,
      userLocation.lng,
    );
    return distance * (delivery.cost || 0);
  }

  // Fixed city pricing
  if (delivery.pricingModel === "fixedCity" && delivery.fixedCityPricing) {
    // Extract city from user address (this is a simple approach)
    const cityLower = userAddressData?.city?.toLowerCase() || "";

    // First, try to find exact city match
    const matchingCity = delivery.fixedCityPricing.find((cityPricing) => {
      if (cityPricing.isGovernorate) return false;
      const cityArLower = cityPricing.cityAr?.toLowerCase() || "";
      const cityEnLower = cityPricing.cityEn?.toLowerCase() || "";

      return cityLower.includes(cityArLower) || cityLower.includes(cityEnLower);
    });

    if (matchingCity) return matchingCity.price || 0;
    const governorateLower = userAddressData?.governorate?.toLowerCase() || "";
    // If no city match, try to find governorate match
    const matchingGovernorate = delivery.fixedCityPricing.find(
      (cityPricing) => {
        if (!cityPricing.isGovernorate) return false;
        const governorateArLower =
          cityPricing.governorateAr?.toLowerCase() || "";
        const governorateEnLower =
          cityPricing.governorateEn?.toLowerCase() || "";

        return (
          governorateLower.includes(governorateArLower) ||
          governorateLower.includes(governorateEnLower)
        );
      },
    );

    if (matchingGovernorate) return matchingGovernorate.price || 0;

    // If no matching city or governorate found, delivery is not available
    return -1; // Special value to indicate delivery not available
  }
  return 0;
};

function FormInput({ ...props }) {
  return (
    <Input
      isRequired
      labelPlacement="outside"
      type="text"
      radius="sm"
      classNames={{
        mainWrapper: "mt-10",
        label:
          "text-[1rem] md:text-[1.2rem] lg:text-[1.2rem] -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: " text-[0.9rem] md:text-[1.2rem] lg:text-base",
        inputWrapper: "bg-gray-100 h-8 md:h-12",
      }}
      {...props}
    />
  );
}

export default function CheckoutContainer({ translate, lang }) {
  const trans = useTranslations(translate);
  const t = (value) => trans(`cart.${value}`);
  const t2 = (value) => trans(`checkout.${value}`);
  const { user, setUser } = useUser();
  const [searchParams, setSearchParams] = useState("");

  useEffect(() => {
    setSearchParams(window.location.search);
  }, []);

  const preOrderId = new URLSearchParams(searchParams).get("preOrderId");
  const [cartItems, setCartItems] = useState([]);
  const [preOrderData, setPreOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [data, setData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    location: {},
    notes: "",
    addressData: {},
  });

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  useEffect(() => {
    if (preOrderId) fetchPreOrderData();
  }, [preOrderId]);
  const getLocationData = async () => {
    const response = await fetch(
      `/api/geocode/search?address=${encodeURIComponent(
        user.address,
      )}&lang=${lang}`,
    );
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      const place = data.results[0];
      const addressComponents = place.address_components;
      let city = "",
        governorate = "";
      addressComponents.forEach((component) => {
        const types = component.types;
        if (types.includes("administrative_area_level_1"))
          governorate = component.long_name;
        else if (types.includes("administrative_area_level_2"))
          city = component.long_name;
      });
      setData((prev) => ({ ...prev, addressData: { city, governorate } }));
    }
  };
  useEffect(() => {
    if (!user) return;
    if (user.address && !data?.addressData?.governorate) getLocationData();
    setData((prev) => ({
      ...prev,
      id: user?._id,
      fullName: user?.fullName,
      email: user?.email,
      phone: user?.phone,
      address: user?.address || "",
      location: user?.location || [],
    }));
  }, [user]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + item.product.discount,
    0,
  );
  const totalInsurance = cartItems.reduce(
    (sum, item) => sum + item.product.rental.insurance,
    0,
  );

  // Calculate delivery cost and track unavailable products
  const deliveryInfo = cartItems.reduce(
    (acc, item) => {
      if (item.deliveryType === "receive") return acc;

      const itemDeliveryCost = calculateDeliveryCost(
        item.product,
        data.location,
        data.addressData,
      );

      if (itemDeliveryCost === -1) {
        // Product not available for delivery
        acc.unavailableProducts.push(item.product.name);
        return acc;
      }

      acc.totalCost += itemDeliveryCost;
      acc.availableCount++;
      return acc;
    },
    { totalCost: 0, unavailableProducts: [], availableCount: 0 },
  );

  const deliveryCost = deliveryInfo.totalCost;
  const unavailableProducts = deliveryInfo.unavailableProducts;
  const hasDeliveryItems = cartItems.some(
    (item) => item.deliveryType !== "receive",
  );

  // Check if delivery is available
  const isDeliveryAvailable = hasDeliveryItems
    ? unavailableProducts.length === 0
    : true;
  const finalDeliveryCost = isDeliveryAvailable ? deliveryCost : 0;

  // Calculate tax: sum of (item price - discount) * 0.15 for items with taxCode
  const totalTax =
    cartItems.reduce((sum, item) => {
      if (!item.hasTaxCode) return sum;
      return sum + (item.totalPrice - item.product.discount) * 0.15;
    }, 0) +
    (isDeliveryAvailable && cartItems.length > 0 && cartItems[0].hasTaxCode
      ? deliveryCost * 0.15
      : 0);

  const fetchPreOrderData = async () => {
    try {
      const res = await fetch(
        `/api/bookings/pre-order/${preOrderId}?client=true`,
      );
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const allItemsMatch = cart.every(
        (cartItem, idx) => result.data.cartItems[idx].id === cartItem.id,
      );
      setPreOrderData(allItemsMatch ? result.data : null);
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleChange = ({ target: { name, value } }) =>
    setData((prev) => ({ ...prev, [name]: value }));

  const checkout = async (e) => {
    e.preventDefault();

    if (
      user &&
      !user.nafathVerified &&
      user.accountType !== "admin" &&
      user.accountType !== "company"
    )
      return onOpen();

    if (!data.location.lat || !data.location.lng || !data.address) {
      return toast.error(ToastMessage(t2("locationRequired")));
    }
    if (cartItems.length === 0) return toast.error(ToastMessage(t("empty")));

    // Check if delivery is available for the selected location
    if (
      cartItems[0].product?.rental?.delivery?.type === "delivery" &&
      !isDeliveryAvailable
    ) {
      return toast.error(ToastMessage(t2("deliveryNotAvailable")));
    }
    setLoading(true);
    try {
      // Track begin checkout from Checkout page
      try {
        const items = cartItems.map((item) => ({
          item_id: item.product?._id || item.id,
          item_name: item.product?.name,
          price:
            item.product?.pricingModel === "packages"
              ? +item.selectedPackage.price?.toFixed(0)
              : +item.product?.rental?.value?.toFixed(0),
          quantity: item.quantity,
          item_category: item.product?.category,
          item_category2: item.product?.subCategory,
          days: differenceInDays(item.endDate, item.startDate) + 1,
          services_count: item.selectedServices.length,
          city: item.product?.city,
          currency: "SAR",
        }));
        const totalAmount = +(
          totalPrice +
          finalDeliveryCost +
          totalTax -
          totalDiscount
        ).toFixed(0);
        sendGTMEvent({
          event: "added_payment_info",
          location: "checkout",
          items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          value: totalAmount,
          delivery_type:
            cartItems[0]?.product?.rental?.delivery?.type || "none",
          shipping: +finalDeliveryCost.toFixed(0),
          discount: +totalDiscount.toFixed(0),
          customer: {
            name: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
          },
          items,
        });
      } catch (_) {}

      let id = preOrderId;
      // Create new pre-order if none exists
      if (!preOrderData?.cartItems) {
        const createPreOrder = await fetch(
          "/api/bookings/pre-order?client=true",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItems }),
          },
        );
        const preOrderResult = await createPreOrder.json();
        if (!preOrderResult.success) throw new Error(preOrderResult.error);
        id = preOrderResult.data.preOrderId;
      }
      // Process checkout with pre-order ID
      const res = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData: data, preOrderId: id }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      // Use Waffy SDK for payment
      if (window.WaffyPaymentDisplay) {
        const displayInstance = new window.WaffyPaymentDisplay({
          debug: false,
        });
        displayInstance.display({
          paymentUrl: result.data.paymentUrl,
          userToken: result.customerToken,
          mode: "redirect",
        });
        localStorage.removeItem("cart");
        setCartItems([]);
        toast.success(ToastMessage(t2("success")));
      } else {
        localStorage.removeItem("cart");
        setCartItems([]);
        toast.success(ToastMessage(t2("success")));
        window.location.href = `${result.data.paymentUrl}&userTokenUrl=${result.customerToken}`;
      }
    } catch (error) {
      toast.error(ToastMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNafathSuccess = () => {
    setUser({ ...user, nafathVerified: true });
    toast.success(ToastMessage("Verification successful!"));
    onClose();
    checkout();
  };

  const handleNafathError = (error) => toast.error(ToastMessage(error));

  return (
    <div>
      <NafathAuthModal
        trans={trans}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleNafathSuccess}
        onError={handleNafathError}
        user={user}
      />
      <PageTitle
        lang={lang}
        title={t("title")}
        description={t("description")}
      />
      <div className="max-w-screen-2xl mx-auto  py-4 md:py-12 border-t">
        <div className="flex w-full gap-8 mb-4 md:mb-12">
          <div className="grid lg:grid-cols-2 gap-6 w-full ">
            {cartItems.map((item) => {
              const daysNumber =
                differenceInDays(item.endDate, item.startDate) + 1;
              const productTotalPrice =
                item.product?.pricingModel === "packages"
                  ? item.selectedPackage.price * item.quantity
                  : item.product.rental.value * item.quantity * daysNumber;
              const servicesTotalPrice =
                item.selectedServices.reduce(
                  (sum, service) => sum + service.price * service.quantity,
                  0,
                ) * daysNumber;

              const tax = item.hasTaxCode
                ? Math.round(
                    (productTotalPrice -
                      item.product.discount +
                      servicesTotalPrice) *
                      15,
                  ) / 100
                : 0;
              return (
                <div
                  className="bg-[#F9FAFC] rounded-3xl p-4 mx-2 my-2 relative flex flex-wrap items-center md:gap-6 gap-4"
                  key={item.id}
                >
                  <div className="sm:flex-1 flex-grow flex gap-6 items-center flex-wrap sm:flex-nowrap justify-center sm:justify-normal">
                    <div className="min-w-28 relative rounded-3xl overflow-hidden group">
                      <div
                        className="absolute inset-0 opacity-95 group-hover:opacity-90 transition-opacity duration-300"
                        style={{
                          background:
                            item.product.image?.gradientStyle ||
                            "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
                        }}
                      />
                      <img
                        src={anyImgUrl({
                          size: 100,
                          src:
                            item.product.image.preview ||
                            "https://www.furnitureandchoice.com.my/cdn/shop/files/FS6000101_01_0c5a2724-7962-488b-b3d3-06494282acbb.jpg",
                        })}
                        alt={item.product.nameEn}
                        className="relative w-28 aspect-[1/.9] object-contain z-20"
                      />
                    </div>
                    <div className="sm:flex-1 flex-grow">
                      <div className=" flex items-center gap-2">
                        <span className="text-primary  font-semibold">
                          {item.product.pricingModel === "packages"
                            ? +item.selectedPackage.price?.toFixed(0)
                            : +item.product.rental.value?.toFixed(0)}
                          {t("currency")}
                        </span>
                        <span className="text-gray-500 text-base">
                          {t("in")}{" "}
                          {item.product.pricingModel === "packages"
                            ? formatDuration({
                                duration: item.selectedPackage.duration,
                                unit: item.selectedPackage.unit,
                                t: (key) =>
                                  trans(
                                    `productComponent.bookingPackages.${key}`,
                                  ),
                                lang,
                              })
                            : `${daysNumber} ${t("days")}`}
                        </span>
                      </div>
                      <h2 className=" font-semibold font-IBMPlex ">
                        {item.product.name}
                      </h2>
                      <div className="mt-2 space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <CalendarIcon />
                          {new Date(item.startDate).toLocaleDateString(
                            lang === "ar" ? "ar" : "fr",
                          )}
                          {" ~ "}
                          {new Date(item.endDate).toLocaleDateString(
                            lang === "ar" ? "ar" : "fr",
                          )}
                          {item.product.pricingModel === "packages" &&
                            item.selectedPackage.unit === "hours" && (
                              <span>
                                {" "}
                                ({" "}
                                {formatDuration({
                                  duration: item.selectedPackage.duration,
                                  unit: item.selectedPackage.unit,
                                  t: (key) =>
                                    trans(
                                      `productComponent.bookingPackages.${key}`,
                                    ),
                                  lang,
                                })}{" "}
                                )
                              </span>
                            )}
                        </p>
                        <p>
                          {t("quantity")}: {item.quantity}
                        </p>
                        {item.deliveryType && (
                          <p>
                            {t("deliveryOptions")}:{" "}
                            {item.selectedBranch
                              ? `${t("pickupFrom")} ${item.selectedBranch.name}`
                              : t(item.deliveryType)}
                          </p>
                        )}
                      </div>
                      {item?.selectedServices?.length > 0 && (
                        <div className="mt-2 text-sm">
                          <span>خدمات اضافية:</span>
                          <div className="flex flex-wrap justify-between mt-1 gap-x-6 gap-y-1">
                            {item?.selectedServices?.map((service, idx) => (
                              <div
                                className="flex items-center gap-1"
                                key={idx}
                              >
                                <CheckCircle color="#0D092B" />
                                <span className="text-darkNavy">
                                  {service.name} - عدد {service.quantity} -{" "}
                                  {service.price} ر.س
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:border-s-2 ps-4 pe-2 font-semibold text-sm">
                    <div className="flex justify-between mb-2">
                      {t("subtotal")}
                      <span className="flex gap-1 items-center">
                        {productTotalPrice} <Currency size={15} />
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      {t("discount")}
                      <span className="flex gap-1 items-center text-green-600">
                        - {item.product.discount.toFixed(0)}{" "}
                        <Currency size={18} color="#16a34a" />
                      </span>
                    </div>
                    {servicesTotalPrice > 0 && (
                      <div className="flex justify-between mb-2">
                        {t("additionalServices")}
                        <span className="flex gap-1 items-center">
                          {servicesTotalPrice.toFixed(0)} <Currency size={18} />
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mb-2 md:gap-x-14">
                      {t("tax")}
                      <span className="flex gap-1 items-center">
                        {tax} <Currency size={18} />
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      {t("total")}{" "}
                      <span className="text-primary flex gap-1 items-center">
                        {(
                          item.totalPrice +
                          tax -
                          item.product.discount
                        ).toFixed(0)}{" "}
                        <Currency size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <form onSubmit={checkout} className="w-full">
          {/* Header */}
          <div className="p-2 rounded-t-lg shadow-sm bg-[#EAEEF3] md:p-6  mx-2 my-2 ">
            <h1 className="text-[1.2rem] font-bold md:text-xl">
              {t2("completePayment")}
            </h1>
          </div>

          <div className="mt-2 md:mt-6 p-4 shadow-sm mb-2 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 md:gap-4 md:mb-4 ">
              <FormInput
                name="fullName"
                label={t2("fullName")}
                placeholder={t2("fullNamePlaceholder")}
                value={data.fullName}
                onChange={handleChange}
              />
              <FormInput
                label={t2("email")}
                type="email"
                placeholder={t2("emailPlaceholder")}
                name="email"
                value={data.email}
                onChange={handleChange}
              />
              <FormInput
                label={t2("phone")}
                placeholder={t2("phonePlaceholder")}
                name="phone"
                type="tel"
                value={data.phone}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Textarea
                name="notes"
                placeholder={t2("notesPlaceholder")}
                label={t2("notes")}
                labelPlacement="outside"
                classNames={{
                  label: "text-lg flex items-center",
                  base: "max-w-full !mt-6",
                  input: "text-base",
                }}
                value={data.notes}
                onChange={handleChange}
              />
              <div className="flex items-center gap-1 mt-2">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  {t2("notesHint")}
                </p>
              </div>
            </div>
            <div className="mb-2">
              <div className="md:text-lg text-base mb-2">
                {t2("address")} <span className="text-red-500">*</span>
              </div>
              <UserLocation
                errorMessage={t2("locationRequired")}
                lang={lang}
                address={data.address}
                setAddress={(address) =>
                  setData((prev) => ({ ...prev, address }))
                }
                setAddressData={(addressData) =>
                  setData((prev) => ({ ...prev, addressData }))
                }
                markerPosition={data.location}
                setMarkerPosition={(location) =>
                  setData((prev) => ({ ...prev, location }))
                }
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="py-2 md:py-6">
            <div className="flex flex-col mx-3 my-3 md:flex-row justify-between items-start md:items-center gap-8">
              <div className="bg-[#f2f3f5] p-6 rounded-3xl shadow md:shadow-none w-full md:w-[30rem]">
                <div className="flex justify-between md:gap-14 gap-6 md:text-lg text-base mb-2">
                  <span>{t2("subtotal")}</span>
                  <span className="flex gap-1 items-center">
                    {+totalPrice.toFixed(0)} <Currency size={18} />
                  </span>
                </div>
                <div className="flex justify-between md:gap-14 gap-6 md:text-lg text-base mb-2">
                  <span>{t2("discount")}</span>
                  <span className="flex gap-1 items-center">
                    {+totalDiscount.toFixed(0)} <Currency size={18} />
                  </span>
                </div>
                <div className="flex justify-between md:gap-14 gap-6 md:text-lg text-base mb-2">
                  <span>{t2("delivery")}</span>
                  <span className="flex gap-1 items-center">
                    {isDeliveryAvailable ? +finalDeliveryCost.toFixed(0) : 0}{" "}
                    <Currency size={18} />
                  </span>
                </div>
                {!isDeliveryAvailable && unavailableProducts.length > 0 && (
                  <div className="text-red-500 text-sm mb-2">
                    {unavailableProducts.length ===
                    cartItems.filter((item) => item.deliveryType !== "receive")
                      .length ? (
                      // All delivery products are unavailable
                      t2("deliveryNotAvailable")
                    ) : (
                      // Some products are unavailable
                      <div>
                        <div className="font-semibold mb-1">
                          {lang === "ar"
                            ? "المنتجات التالية غير متوفرة للتوصيل في هذا الموقع:"
                            : "The following products are not available for delivery to this location:"}
                        </div>
                        <ul className="list-disc list-inside">
                          {unavailableProducts.map((productName, index) => (
                            <li key={index}>{productName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between md:gap-14 gap-6 md:text-lg text-base mb-2">
                  <span>{t2("tax")}</span>
                  <span className="flex gap-1 items-center">
                    {+totalTax.toFixed(0)} <Currency size={18} />
                  </span>
                </div>
                <div className="flex justify-between md:gap-14 gap-6 text-lg font-bold">
                  <span>{t2("total")}</span>
                  <span className="flex gap-1 items-center">
                    {
                      +(
                        totalPrice +
                        totalTax +
                        finalDeliveryCost -
                        totalDiscount
                      ).toFixed(0)
                    }{" "}
                    <Currency size={18} />
                  </span>
                </div>
                {totalInsurance > 0 && (
                  <div className="font-semibold text-gray-700 mt-6 flex flex-wrap gap-1 justify-center text-center">
                    {t("warnMsg")}
                    <div className="flex gap-1 items-center justify-center">
                      <span className="text-primary ">{totalInsurance}</span>{" "}
                      <Currency size={20} />
                      {t("extra")}
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                isLoading={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[1rem] lg:text-lg  rounded-full px-10 py-7 flex items-center gap-2 w-full md:w-auto"
              >
                <span className="text-[1rem] lg:text-lg  ">
                  {t2("completePayment")}{" "}
                  {
                    +(
                      totalPrice +
                      totalTax +
                      finalDeliveryCost -
                      totalDiscount
                    ).toFixed(0)
                  }{" "}
                  {t("currency")}
                </span>
                <span
                  className={lang === "ar" ? "-rotate-45" : "rotate-[135deg]"}
                >
                  <Send className="lg:w-6 lg:h-6 w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
