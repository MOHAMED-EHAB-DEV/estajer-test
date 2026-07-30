"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useTranslations } from "@/hooks/useTranslations";
import PaymentSusses from "../ui/svgs/PaymentSussesSvg";
import PaymentProcessingSvg from "../ui/svgs/PaymentProcessingSvg";
import Button from "../ui/Button";
import { anyImgUrl } from "@/utils/ImageUrl";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";

export default function PremiumPaidSection({ milestoneId, lang, translate }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);

  const [status, setStatus] = useState("loading"); // loading | paid | processing | not-paid | error
  const [plan, setPlan] = useState(""); // starter | growth
  const [paymentUrl, setPaymentUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const pollRef = useRef(null);

  const [paymentLink, setPaymentLink] = useState("");
  const [userToken, setUserToken] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);

  const t = (key) => trans(`shopCheckout.${key}`);

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
    setLoadingUrl(true);
    try {
      if (window.WaffyPaymentDisplay && userToken) {
        const displayInstance = new window.WaffyPaymentDisplay({
          debug: false,
        });
        console.log('displayInstance: ', displayInstance);
        displayInstance.display({
          paymentUrl: paymentUrl,
          userToken: userToken,
          mode: "redirect",
        });
      } else {
        window.location.href = paymentLink || paymentUrl;
      }
    } catch (error) {
      console.error("WaffyPaymentDisplay error:", error);
      toast.error(
        ToastMessage("Payment display error, redirecting to payment page"),
      );
      window.location.href = paymentLink || paymentUrl;
    } finally {
      setLoadingUrl(false);
    }
  };

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // poll up to 20 times (every 3s = 60s)

    const poll = async () => {
      try {
        const res = await fetch(`/api/premium/status?id=${milestoneId}`);
        const data = await res.json();
        if (!data.success) {
          setErrorMsg(data.error || data.message || "");
          setStatus("error");
          return;
        }
        if (data.status === "paid") {
          setPlan(data.plan || "starter");
          setStatus("paid");
          return;
        }
        if (data.status === "not-paid") {
          setPaymentUrl(data.paymentUrl || "");
          setStatus("not-paid");
          return;
        }
        // processing — keep polling
        setStatus("processing");
        attempts++;
        if (attempts < maxAttempts) {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch (err) {
        setErrorMsg(err.message || String(err));
        setStatus("error");
      }
    };

    poll();
    return () => clearTimeout(pollRef.current);
  }, [milestoneId, retryCount]);

  if (status === "loading") {
    return (
      <div className="h-[75vh] w-full flex items-center justify-center text-3xl">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-12 h-12 text-[#F97316] animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
               cx="12"
               cy="12"
               r="10"
               stroke="currentColor"
               strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  const isGrowth = plan === "growth";
  const starterFeatures = trans("shopCheckout.plans.starter.features");
  const growthFeatures = trans("shopCheckout.plans.growth.features");

  const featuresList = isGrowth
    ? Array.isArray(growthFeatures)
      ? growthFeatures
      : []
    : Array.isArray(starterFeatures)
      ? starterFeatures
      : [];

  const isAr = lang === "ar";

  return (
    <>
      <Script
        src="https://sdk.waffyapp.com/v2/waffy-payment-display.min.js"
        strategy="afterInteractive"
      />
      <div className="max-w-screen-xl md:gap-10 mx-auto px-8 py-16 md:min-h-[85vh] flex flex-wrap items-center justify-center">
        {/* status === "paid" */}
        {status === "paid" && (
          <>
            <PaymentSusses />
            <div className="flex-1">
              <h1 className="md:text-5xl text-3xl font-IBMPlex font-semibold text-[#F97316] md:mb-8 mb-4">
                {isGrowth ? t("welcomeGrowth") : t("welcomeStarter")}
              </h1>
              <p className="md:text-3xl text-xl text-darkNavy md:leading-10">
                {isGrowth ? t("activatedGrowth") : t("activatedStarter")}
              </p>
              {/* Features list */}
              <div className="bg-gradient-to-br from-[#fff8f3] to-white border border-[#F97316]/15 rounded-2xl p-6 w-full shadow-sm md:my-8 my-4">
                <p className="text-xs font-bold text-[#F97316] mb-4 text-start">
                  {t("unlockedFeatures")}
                </p>
                <ul className="space-y-3.5 text-start">
                  {featuresList.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-xs md:text-sm text-slate-700 font-bold">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:mt-8 my-4 flex flex-col sm:flex-row gap-4 items-center">
                <Button
                  as={Link}
                  href={`/${langPrefix}dashboard/my-shop`}
                  className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
                >
                  {t("createShopNow")}
                </Button>
                <Link
                  href={`/${langPrefix}dashboard`}
                  className="text-neutral-500 font-bold hover:text-slate-800 transition-colors text-xs"
                >
                  {t("goToDashboard")}
                </Link>
              </div>
            </div>
          </>
        )}

        {/* status === "processing" */}
        {status === "processing" && (
          <>
            <PaymentProcessingSvg />
            <div className="flex-1">
              <h1 className="md:text-[2.5rem] text-3xl font-IBMPlex font-semibold text-[#F97316] md:mb-8 mb-4">
                {t("verifyingPayment")}
              </h1>
              <p className="md:text-2xl text-lg text-darkNavy md:leading-10 mb-4">
                {t("verifyingDesc")}
              </p>
              <div className="bg-blue-50 border-s-4 border-blue-400 p-4 rounded-e-lg mb-6 text-start">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
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
                  <div>
                    <p className="text-blue-800 font-medium md:text-lg text-base">
                      {t("activatingStoreSubscription")}
                    </p>
                    <p className="text-blue-700 md:text-base text-sm mt-1 leading-relaxed">
                      {t("verifyingPaymentDesc")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:mt-8 my-4">
                <Button
                  as={Link}
                  href={`/${langPrefix}dashboard`}
                  className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
                >
                  {t("goToDashboard")}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* status === "not-paid" */}
        {status === "not-paid" && (
          <>
            <div className="w-[34rem] max-w-full md:p-0 md:pe-20 p-8 flex-shrink-0">
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
                {t("paymentNotConfirmed")}
              </h1>
              <p className="md:text-3xl text-xl text-darkNavy md:leading-10">
                {t("paymentNotCompleted")}
              </p>
              <div className="md:mt-8 my-4 flex flex-col md:flex-row md:gap-6 gap-4">
                {paymentUrl && (
                  <Button
                    onClick={handlePaymentRedirect}
                    isDisabled={loadingUrl}
                    className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
                  >
                    {loadingUrl ? t("loading") : t("retryPayment")}
                  </Button>
                )}
                <Button
                  as={Link}
                  color="warning"
                  variant="bordered"
                  href={`/${langPrefix}pricing`}
                  className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-IBMPlex"
                >
                  {t("backToPlans")}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* status === "error" */}
        {status === "error" && (
          <>
            <div className="w-[34rem] max-w-full md:p-0 md:pe-20 p-8 flex-shrink-0">
              <Image
                src={anyImgUrl({
                  src: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1746696733/945477a5-7551-48da-9392-df921aa9f1d9.webp",
                  size: 800,
                  quality: 60,
                })}
                width={500}
                height={600}
                alt="Payment Error"
                className="w-full h-full object-cover"
                unoptimized
                priority
              />
            </div>
            <div className="flex-1 text-start">
              <h1 className="md:text-5xl text-3xl font-IBMPlex font-semibold text-red-500 md:mb-8 mb-4">
                {t("verificationError")}
              </h1>
              <p className="md:text-3xl text-xl text-darkNavy md:leading-10 mb-4">
                {t("verificationFailed")}
              </p>
              <div className="bg-red-50/50 border border-red-100/80 rounded-2xl p-4 w-full mb-6">
                <p className="text-[11px] text-red-600 font-black uppercase tracking-wider mb-1.5">
                  {t("errorDetails")}
                </p>
                <p className="text-xs text-neutral-600 font-bold leading-relaxed break-words">
                  {errorMsg || t("unexpectedError")}
                </p>
              </div>
              <div className="md:mt-8 my-4 flex flex-col md:flex-row md:gap-6 gap-4">
                <Button
                  onClick={() => {
                    setErrorMsg("");
                    setStatus("loading");
                    setRetryCount((prev) => prev + 1);
                  }}
                  className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
                >
                  {t("retryVerification")}
                </Button>
                <Button
                  as={Link}
                  color="warning"
                  variant="bordered"
                  href={`/${langPrefix}pricing`}
                  className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-IBMPlex"
                >
                  {t("backToPlans")}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
