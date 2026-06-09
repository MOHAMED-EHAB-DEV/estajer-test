import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { sendGTMEvent } from "@next/third-parties/google";

export default function PaymentError({ langPrefix, paymentUrl, translate }) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`payment.paymentError.${text}`);
  const [paymentLink, setPaymentLink] = useState("");
  const [userToken, setUserToken] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user token on component mount
  useEffect(() => {
    const fetchUserToken = async () => {
      try {
        const response = await fetch("/api/user-token");
        const result = await response.json();
        if (result.success) {
          setUserToken(result.data.userToken);
          setPaymentLink(`${paymentUrl}&userTokenUrl=${result.data.userToken}`);
        }
      } catch (error) {
        console.error("Error fetching user token:", error);
      }
    };
    if (paymentUrl) fetchUserToken();
  }, [paymentUrl]);

  // Handle payment redirection with WaffyPaymentDisplay
  const handlePaymentRedirect = async () => {
    if (!paymentUrl)
      return toast.error(ToastMessage("Payment URL not available"));
    setLoading(true);
    try {
      // Track retry intent
      try {
        const host = new URL(paymentUrl).hostname;
        sendGTMEvent({
          event: "payment_retry_click",
          location: "payment_status",
          payment_host: host,
          has_user_token: Boolean(userToken),
        });
      } catch {}
      // Try to use WaffyPaymentDisplay if available
      if (window.WaffyPaymentDisplay && userToken) {
        const displayInstance = new window.WaffyPaymentDisplay({
          debug: false,
        });
        displayInstance.display({
          paymentUrl: paymentUrl,
          userToken: userToken,
          mode: "redirect",
        });
      } else {
        // Fallback to direct link navigation
        window.location.href = paymentLink;
      }
    } catch (error) {
      console.error("WaffyPaymentDisplay error:", error);
      toast.error(
        ToastMessage("Payment display error, redirecting to payment page"),
      );
      // Fallback to direct link navigation
      window.location.href = paymentLink;
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="w-[34rem] max-w-full md:p-0 md:pe-20 p-8">
        <Image
          src={anyImgUrl({
            src: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1746696733/945477a5-7551-48da-9392-df921aa9f1d9.webp",
            size: 800,
            quality: 60,
          })}
          width={500}
          height={600}
          alt="Payment Failed"
          className="w-full h-full object-cover"
          unoptimized
          priority
        />
      </div>
      <div className="flex-1">
        <h1 className="md:text-5xl text-3xl font-IBMPlex font-semibold text-red-500 md:mb-8 mb-4">
          {t("title")}
        </h1>
        <p className="md:text-3xl text-xl text-darkNavy md:leading-10">
          {t("description")}
        </p>
        <div className="md:mt-8 my-4 flex flex-col md:flex-row md:gap-6 gap-4">
          <Button
            onClick={handlePaymentRedirect}
            isDisabled={loading || !paymentUrl}
            className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
          >
            {loading ? t("loading") : t("openPaymentBtn")}
          </Button>
          <Button
            as={Link}
            color="warning"
            variant="bordered"
            href={`/${langPrefix}contact`}
            onClick={() => {
              try {
                sendGTMEvent({
                  event: "support_click",
                  location: "payment_status",
                  link_text: t("callSupportBtn"),
                });
              } catch {}
            }}
            className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-IBMPlex"
          >
            {t("callSupportBtn")}
          </Button>
        </div>
      </div>
    </>
  );
}
