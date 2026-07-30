"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { getPricingPlans } from "@/lib/pricingPlans";

import PlanCard from "./PlanCard";
import LoginPanel from "./LoginPanel";
import RegisterPanel from "./RegisterPanel";
import PayPanel from "./PayPanel";

export default function PremiumCheckoutContainer({
  lang,
  translate,
  isModal = false,
  onClose,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trans = useTranslations(translate);
  const t = (key) => trans(`shopCheckout.${key}`);
  const tAuth = (key) => trans(`auth.${key}`);

  const allPlans = getPricingPlans(trans, { user, lang });
  const PLANS = {
    starter: {
      ...allPlans.starter,
      features: allPlans.starter.checkoutFeatures,
    },
    growth: {
      ...allPlans.growth,
      features: allPlans.growth.checkoutFeatures,
    },
  };

  // Pre-select plan from query param e.g. ?plan=growth
  const initialPlan =
    user?.shopPlan === "starter"
      ? "growth"
      : searchParams.get("plan") === "starter"
        ? "starter"
        : "growth";
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [authTab, setAuthTab] = useState("login");
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    if (user?.shopPlan === "starter") {
      setSelectedPlan("growth");
    }
  }, [user]);

  // Guard: already on a plan (redirects to my-shop if user has a shop)
  useEffect(() => {
    if (isModal) return;
    const isEffectiveGrowth =
      user?.shopPlan === "growth" || (user?.premium && !user?.shopPlan);
    if (!loading && user?.hasShop && isEffectiveGrowth) {
      router.replace(`/${langPrefix}dashboard/my-shop`);
    }
  }, [user, loading, isModal]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFBF9]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-10 h-10 text-[#F97316] animate-spin"
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
          <span className="text-xs text-neutral-400 font-bold">
            {t("loadingPage")}
          </span>
        </div>
      </div>
    );
  }

  if (isModal) {
    const isAr = lang === "ar";
    return (
      <>
        <Script
          src="https://sdk.waffyapp.com/v2/waffy-payment-display.min.js"
          strategy="afterInteractive"
          onLoad={() => setSdkLoaded(true)}
        />
        <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-[85vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-800">
                {t("upgradeToGrowth")}
              </h2>
              <p className="text-neutral-400 text-xs mt-1">
                {t("upgradeToGrowthDesc")}
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-slate-800"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Modal Split Grid */}
          <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-6 space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">
                {t("growthPlanDetails")}
              </h3>
              <PlanCard
                plan={PLANS.growth}
                selected={true}
                onSelect={() => {}}
                lang={lang}
                translate={translate}
              />
            </div>
            <div className="md:col-span-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1 mb-4">
                {t("paymentAndUpgrade")}
              </h3>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <PayPanel
                  user={user}
                  lang={lang}
                  langPrefix={langPrefix}
                  selectedPlan="growth"
                  translate={translate}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Script
        src="https://sdk.waffyapp.com/v2/waffy-payment-display.min.js"
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />
      <div className="min-h-screen py-10 md:py-20 px-4 bg-gradient-to-br from-[#FFFDFB] via-[#FFFBF9] to-[#FFF9F5]">
        <div className="max-w-[1240px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-[#FFF5EC] border border-[#FDE5D0] text-[#F97316] px-4.5 py-1.5 rounded-full text-xs font-black mb-4 shadow-sm">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1.323l3.95-1.58a1 1 0 011.24.407l1.5 2.598a1 1 0 01-.27 1.258L14.3 9.3a4.002 4.002 0 010 1.4l3.12 2.316a1 1 0 01.27 1.258l-1.5 2.598a1 1 0 01-1.24.407L11 15.677V17a1 1 0 01-2 0v-1.323l-3.95 1.58a1 1 0 01-1.24-.407l-1.5-2.598a1 1 0 01.27-1.258L6.7 10.7a4.002 4.002 0 010-1.4L3.58 6.984a1 1 0 01-.27-1.258l1.5-2.598a1 1 0 011.24-.407L9 4.677V3a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("badge")}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
              {t("title")}
            </h1>
            <p className="text-neutral-500 mt-3.5 max-w-xl mx-auto text-xs md:text-sm leading-relaxed">
              {t("desc")}
            </p>
          </div>

          {/* Core Redesigned Split Grid Layout */}
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
            {/* Right Column: Plans list selection */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center text-xs">
                  ١
                </span>
                <h2 className="text-lg font-black text-slate-800">
                  {t("step1Title")}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <PlanCard
                  plan={PLANS.starter}
                  selected={selectedPlan === "starter"}
                  onSelect={setSelectedPlan}
                  lang={lang}
                  translate={translate}
                  disabled={user?.shopPlan === "starter"}
                />
                <PlanCard
                  plan={PLANS.growth}
                  selected={selectedPlan === "growth"}
                  onSelect={setSelectedPlan}
                  lang={lang}
                  translate={translate}
                />
              </div>
            </div>

            {/* Left Column: Checkout details widget */}
            <div className="lg:col-span-5 lg:sticky lg:top-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center text-xs">
                  ٢
                </span>
                <h2 className="text-lg font-black text-slate-800">
                  {user ? t("step2TitlePay") : t("step2TitleAuth")}
                </h2>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)]">
                {user ? (
                  <>
                    {!user.isVerified ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5 border border-amber-200/50">
                          <svg
                            className="w-8 h-8 text-amber-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">
                          {t("verificationRequired")}
                        </h3>
                        <p className="text-neutral-500 text-xs md:text-sm mb-6 leading-relaxed">
                          {t("verificationDesc")}
                        </p>
                        <Link
                          href={`/${langPrefix}confirm-account?page=premium-checkout`}
                          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-extrabold px-8 py-3.5 rounded-2xl hover:opacity-95 transition-opacity shadow-md shadow-orange-500/10 text-sm w-full"
                        >
                          {t("confirmMyAccount")}
                          <svg
                            className={`w-4 h-4 ${lang === "ar" ? "" : "rotate-180"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </Link>
                      </div>
                    ) : (
                      <PayPanel
                        user={user}
                        lang={lang}
                        langPrefix={langPrefix}
                        selectedPlan={selectedPlan}
                        translate={translate}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {/* Tab Switchers */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50 mb-6">
                      <button
                        onClick={() => setAuthTab("login")}
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                          authTab === "login"
                            ? "bg-white text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-200/30"
                            : "text-neutral-400 hover:text-neutral-600"
                        }`}
                      >
                        {tAuth("login")}
                      </button>
                      <button
                        onClick={() => setAuthTab("register")}
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                          authTab === "register"
                            ? "bg-white text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-200/30"
                            : "text-neutral-400 hover:text-neutral-600"
                        }`}
                      >
                        {tAuth("register")}
                      </button>
                    </div>

                    {authTab === "login" ? (
                      <LoginPanel
                        lang={lang}
                        langPrefix={langPrefix}
                        translate={translate}
                      />
                    ) : (
                      <RegisterPanel
                        lang={lang}
                        langPrefix={langPrefix}
                        translate={translate}
                      />
                    )}

                    <p className="text-center text-xs text-neutral-400 mt-5 leading-normal">
                      {authTab === "login" ? (
                        <>
                          {tAuth("doNotHaveAccount")}
                          <button
                            onClick={() => setAuthTab("register")}
                            className="text-[#F97316] font-bold hover:underline"
                          >
                            {tAuth("createAccountNow")}
                          </button>
                        </>
                      ) : (
                        <>
                          {tAuth("alreadyHaveAccount")}
                          <button
                            onClick={() => setAuthTab("login")}
                            className="text-[#F97316] font-bold hover:underline"
                          >
                            {tAuth("loginHere")}
                          </button>
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
