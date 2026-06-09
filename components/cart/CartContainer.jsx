"use client";
import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { CalendarIcon } from "../ui/svgs/icons/CalendarIconSvg";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { Send } from "../ui/svgs/icons/SendSvg";
import { X } from "../ui/svgs/icons/XSvg";
import { Share } from "../ui/svgs/icons/ShareSvg";
import { useTranslations } from "@/hooks/useTranslations";
import PageTitle from "../shared/PageTitle";
import { anyImgUrl } from "@/utils/ImageUrl";
import Button from "../ui/Button";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { differenceInDays } from "date-fns";
import formatDuration from "@/utils/formatDuration";
import { sendGTMEvent } from "@next/third-parties/google";

export default function CartContainer({ translate, lang, cart, shareId }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const { user } = useUser();
  const trans = useTranslations(translate);
  const t = (value) => trans(`cart.${value}`);
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router.pathname]);

  useEffect(() => {
    const loadCart = async () => {
      if (shareId) {
        try {
          const res = await fetch(`/api/cart?id=${shareId}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.cartItems)) {
            setCartItems(data.cartItems);
            localStorage.setItem("cart", JSON.stringify(data.cartItems));
            toast.success(ToastMessage(t("cartLoaded")));
            router.replace(`/${langPrefix}cart`);
          } else {
            throw new Error("Invalid cart data");
          }
        } catch (error) {
          console.error("Failed to load shared cart", error);
          toast.error(ToastMessage(t("invalidSharedCart")));
        }
      } else if (cart) {
        try {
          const parsedCart = JSON.parse(cart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
            localStorage.setItem("cart", JSON.stringify(parsedCart));
            toast.success(ToastMessage(t("cartLoaded")));
            router.replace(`/${langPrefix}cart`);
          }
        } catch (error) {
          console.error("Failed to parse shared cart", error);
          toast.error(ToastMessage(t("invalidSharedCart")));
        }
      } else {
        setCartItems(JSON.parse(localStorage.getItem("cart") || "[]"));
      }
    };
    loadCart();
  }, [lang, cart, shareId]);

  const handleShareCart = async () => {
    if (cartItems.length === 0) return toast.error(ToastMessage(t("empty")));
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const url = `${window.location.origin}/${langPrefix}cart?id=${data.id}`;
      navigator.clipboard.writeText(url);
      toast.success(ToastMessage(t("shareCartSuccess")));
    } catch (error) {
      console.error("Failed to share cart", error);
      toast.error(ToastMessage("Failed to share cart"));
    }
  };

  const removeItem = (itemId) => {
    // Identify the removed item for analytics before mutating state
    const removedItem = cartItems.find((item) => item.id === itemId);
    const newItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));

    // Track remove_from_cart event
    try {
      if (removedItem) {
        const unitPrice =
          removedItem.product?.pricingModel === "packages"
            ? +removedItem.selectedPackage.price?.toFixed(0)
            : +removedItem.product?.rental?.value?.toFixed(0);
        sendGTMEvent({
          event: "remove_from_cart",
          location: "cart",
          item_id: removedItem.product?._id || removedItem.id,
          item_name: removedItem.product?.name,
          price: unitPrice,
          quantity: removedItem.quantity,
        });
      }
    } catch (_) {}

    toast.success(ToastMessage(t("itemRemoved")));
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + item.product.discount,
    0,
  );
  const totalInsurance = cartItems.reduce(
    (sum, item) => sum + item.product.rental.insurance,
    0,
  );
  const totalTax = cartItems.reduce((sum, item) => {
    if (!item.hasTaxCode) return sum;
    const itemPrice = item.totalPrice;
    const itemDiscount = item.product.discount;
    return sum + (itemPrice - itemDiscount) * 0.15;
  }, 0);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/${langPrefix}register?page=/${langPrefix}cart`);
      toast.error(ToastMessage(t("loginFirst")));
      return;
    }
    if (cartItems.length === 0) return toast.error(ToastMessage(t("empty")));

    // Track begin checkout from Cart page
    try {
      const items = cartItems.map((item) => ({
        item_id: item.product?._id || item.id,
        item_name: item.product?.name,
        price:
          item.product?.pricingModel === "packages"
            ? +item.selectedPackage.price?.toFixed(0)
            : +item.product?.rental?.value?.toFixed(0),
        quantity: item.quantity,
        days: differenceInDays(item.endDate, item.startDate) + 1,
        services_count: item.selectedServices.length,
        item_category: item.product?.category,
        item_category2: item.product?.subCategory,
        city: item.product?.city,
        currency: "SAR",
      }));
      sendGTMEvent({
        event: "begin_checkout",
        location: "cart",
        items_count: totalQuantity,
        value: +(totalPrice + totalTax - totalDiscount).toFixed(0),
        items,
      });
    } catch (_) {}

    setLoading(true);
    try {
      const res = await fetch("/api/bookings/pre-order?client=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      // Navigate to checkout with pre-order ID
      router.push(
        `/${langPrefix}checkout?preOrderId=${result.data.preOrderId}`,
      );
    } catch (error) {
      toast.error(ToastMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        lang={lang}
        title={t("title")}
        description={t("description")}
      />
      <div className="max-w-screen-2xl mx-auto px-4 md:py-8 pb-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">{t("empty")}</p>
          </div>
        ) : (
          <div className="flex flex-wrap w-full gap-4 md:gap-6 justify-between">
            <div className="flex sm:flex-1 flex-grow flex-col gap-6 ">
              {cartItems.map((item) => {
                const daysNumber =
                  differenceInDays(item.endDate, item.startDate) + 1;
                const productTotalPrice =
                  item.product.pricingModel === "packages"
                    ? item.selectedPackage.price * item.quantity
                    : item.product.rental.value * item.quantity * daysNumber;
                const servicesTotalPrice = item.selectedServices.reduce(
                  (sum, service) => {
                    const lineTotal = service.price * service.quantity;
                    return (
                      sum +
                      (service.pricingType === "fixed"
                        ? lineTotal
                        : lineTotal * daysNumber)
                    );
                  },
                  0,
                );

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
                    key={item.id}
                    className="bg-[#F9FAFC] rounded-3xl md:p-6 p-4 relative flex items-center md:gap-6 gap-2"
                  >
                    <div className="flex sm:flex-1 flex-grow flex-wrap justify-between items-center gap-6">
                      <div className="sm:flex-1 flex-grow flex gap-6 items-center flex-wrap sm:flex-nowrap justify-center sm:justify-normal">
                        <div className="min-w-36 relative rounded-3xl overflow-hidden group">
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
                            alt={item.product.name}
                            className="relative w-36 aspect-[1/.9] object-contain z-20"
                          />
                        </div>
                        <div className="sm:flex-1 flex-grow">
                          <div className=" flex items-center gap-2">
                            <span className="text-primary text-lg font-semibold flex items-center gap-1">
                              {item.product.pricingModel === "packages"
                                ? +item.selectedPackage.price?.toFixed(0)
                                : +item.product.rental.value?.toFixed(0)}
                              <Currency className="lg:w-6 lg:h-6 w-5 h-5" />
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
                                : `${daysNumber} ${t("days")}`}{" "}
                            </span>
                          </div>
                          <h2 className="text-[1.1rem] max-w-full md:text-[1.2rem] line-clamp-1 lg:text-[1.3rem] text-darkNavy font-semibold font-IBMPlex">
                            {item.product.name}
                          </h2>
                          <div className="mt-2 space-y-2">
                            <p
                              className="flex items-center gap-2
                            
                            text-[1rem]  md:text-[1.1rem] lg:text-[1rem]"
                            >
                              <CalendarIcon className="lg:w-5 lg:h-5 w-4 h-4" />
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
                                  ? `${t("pickupFrom")} ${
                                      item.selectedBranch.name
                                    }`
                                  : t(item.deliveryType)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto sm:border-s-2 ps-6">
                        <div className="flex justify-between mb-2">
                          {t("price")}
                          <span className="flex gap-1 items-center">
                            {productTotalPrice} <Currency size={18} />
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          {t("discount")}
                          <span className="flex gap-1 items-center text-green-600">
                            - {+item.product.discount.toFixed(0)}{" "}
                            <Currency size={18} color="#16a34a" />
                          </span>
                        </div>
                        {servicesTotalPrice > 0 && (
                          <div className="flex justify-between mb-2">
                            {t("additionalServices")}
                            <span className="flex gap-1 items-center">
                              {servicesTotalPrice.toFixed(0)}{" "}
                              <Currency size={18} />
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between mb-2 md:gap-x-14">
                          {t("tax")}
                          <span className="flex gap-1 items-center">
                            {tax} <Currency size={18} />
                          </span>
                        </div>
                        <div className="flex justify-between mb-2 font-semibold ">
                          {t("total")}{" "}
                          <span className="flex gap-1 items-center text-primary">
                            {
                              +(
                                item.totalPrice +
                                tax -
                                item.product.discount
                              ).toFixed(0)
                            }{" "}
                            <Currency size={18} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="md:bg-transparent md:shadow-none bg-red-500 bg-opacity-85 hover:bg-opacity-100 shadow-lg rounded-2xl sm:relative sm:top-0 sm:start-0 absolute top-2 start-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-3"
                      >
                        <X
                          size={16}
                          className="md:text-red-500 text-white md:w-5 md:h-5 h-5 w-4"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="xl:w-[500px] w-full">
              <div className="bg-[#EAEEF3] rounded-3xl md:py-10 py-6 md:px-8 px-4  sm:min-w-[350px]">
                <div className="flex justify-between text-[1.1rem]  lg:text-xl md:text-[1.2rem]  mb-6">
                  <span>{t("piecesCount")}</span>
                  <span>
                    {totalQuantity} {t("pieces")}
                  </span>
                </div>
                <div className="flex justify-between md:text-xl sm:text-[1.3rem] md:mb-6 mb-2">
                  <span>{t("subtotal")}</span>
                  <span className="flex gap-1 items-center">
                    {+totalPrice} <Currency />
                  </span>
                </div>
                <div className="flex justify-between md:text-xl sm:text-[1.3rem] md:mb-6 mb-2">
                  <span>{t("discount")}</span>
                  <span className="flex gap-1 items-center">
                    {+totalDiscount.toFixed(0)} <Currency />
                  </span>
                </div>
                <div className="flex justify-between md:text-xl sm:text-[1.3rem]  md:mb-6 mb-2">
                  <span>{t("tax")}</span>
                  <span className="flex gap-1 items-center">
                    {+totalTax.toFixed(0)} <Currency />
                  </span>
                </div>
                <div className="flex justify-between md:text-xl sm:text-[1.3rem] font-semibold mb-4 mt-4 md:mb-6">
                  <span>{t("totalAmount")}</span>
                  <span className="flex gap-1 items-center">
                    {+(totalPrice + totalTax - totalDiscount).toFixed(0)}{" "}
                    <Currency />
                  </span>
                </div>
                {totalInsurance > 0 && (
                  <div className="font-semibold text-gray-700 my-6 flex flex-wrap gap-1 justify-center text-center">
                    {t("warnMsg")}
                    <div className="flex gap-1 items-center justify-center">
                      <span className="text-primary ">{totalInsurance}</span>{" "}
                      <Currency size={20} />
                      {t("extra")}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-between text-[1rem]  lg:text-[1.5rem] md:text-[1.4rem] font-semibold">
                  <button
                    onClick={handleShareCart}
                    className="py-2 px-4 md:py-4 flex items-center justify-center gap-2 text-primary border border-primary rounded-full font-semibold hover:bg-white/30 transition-colors"
                    title={t("shareCart")}
                  >
                    <Share className="w-5 h-5" color="#f48a42" />
                  </button>{" "}
                  <Button
                    onPress={handleCheckout}
                    className="w-full py-2 md:py-7"
                    isLoading={loading}
                    isDisabled={cartItems.length === 0}
                  >
                    {t("completePayment")}
                    <span
                      className={
                        lang === "ar" ? "-rotate-45" : "rotate-[135deg]"
                      }
                    >
                      <Send className="lg:w-6 lg:h-6 w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
