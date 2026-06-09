"use client";

import clsx from "clsx";
import { useTranslations } from "@/hooks/useTranslations";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { useUser } from "@/context/UserContext";
import { useTransition } from "react";
import { UserCircle } from "@/components/ui/svgs/icons/UserCircleSvg";
import { Building } from "@/components/ui/svgs/icons/BuildingSvg";

export default function DashboardRoleSwitch({
  translate,
  initialRole,
  langPrefix,
  updateValue,
  lang,
}) {
  const [isPending, startTransition] = useTransition();
  const { setUser } = useUser();
  const trans = useTranslations(translate);
  const t = (k) => trans(`dashboard.SwitchRole.${k}`);
  const router = useRouter();
  const currentPath = usePathname();

  const onChangeRent = (e) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (
          currentPath === "/dashboard" ||
          currentPath === `/${langPrefix}dashboard` ||
          currentPath === `/${langPrefix}dashboard/renter`
        )
          router.push(
            `/${langPrefix}${
              initialRole !== "renter" ? "dashboard" : "dashboard/renter"
            }`,
          );
        await fetch("/api/users/update-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRenter: updateValue }),
        });
        setUser((prev) => ({ ...prev, isRenter: updateValue }));
      } catch (err) {
        toast.error(ToastMessage(err.message));
      }
    });
  };

  const isRenter = initialRole === "renter";
  const isLandlord = !isRenter;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 md:mb-6 mb-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute -start-10 -top-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Left side: Text & Icon */}
      <div className="flex items-center gap-4 w-full md:w-auto z-10">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-500 shrink-0 shadow-inner border border-orange-100/50">
          <svg
            className="w-6 h-6 md:w-7 md:h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <h3 className="text-gray-800 font-bold text-base md:text-lg tracking-wide">
              {t("label")}
            </h3>
          </div>
          <p className="text-gray-500 text-xs md:text-sm">
            {isRenter ? t("renterDescription") : t("landlordDescription")}
          </p>
        </div>
      </div>

      {/* Right side: Premium Segmented Control */}
      <div className="relative flex items-center bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/60 w-full md:w-auto z-10 shadow-inner">
        {/* Animated Background Pill */}
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-500 ease-out z-0"
          style={{
            transform: isRenter
              ? "translateX(0)"
              : lang === "ar"
                ? "translateX(-100%)"
                : "translateX(100%)",
            // For RTL, we need to handle the direction correctly
            left: "0.375rem", // fallback
          }}
          // RTL specific class for translation
          data-role-bg
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          [dir="rtl"] [data-role-bg] { transform: translateX(0); right: 0.375rem; left: auto; }
          [dir="rtl"] .is-landlord [data-role-bg] { transform: translateX(-100%); }
          [dir="ltr"] [data-role-bg] { transform: translateX(0); left: 0.375rem; right: auto; }
          [dir="ltr"] .is-landlord [data-role-bg] { transform: translateX(100%); }
        `,
          }}
        />

        {/* Renter Button */}
        <button
          onClick={onChangeRent}
          disabled={isRenter || isPending}
          className={clsx(
            "relative z-10 flex-1 md:w-40 py-2.5 md:py-3 flex items-center justify-center gap-2 rounded-xl text-sm md:text-base font-bold transition-all duration-300",
            isRenter
              ? "text-orange-600 cursor-default"
              : "text-gray-500 hover:text-gray-700 active:scale-95",
            isPending && !isRenter && "opacity-50 cursor-not-allowed",
          )}
        >
          <UserCircle
            className={clsx(
              "w-5 h-5",
              isRenter ? "text-orange-500" : "text-gray-400",
            )}
          />
          {t("renter")}
        </button>

        {/* Landlord Button */}
        <button
          onClick={onChangeRent}
          disabled={isLandlord || isPending}
          className={clsx(
            "relative z-10 flex-1 md:w-40 py-2.5 md:py-3 flex items-center justify-center gap-2 rounded-xl text-sm md:text-base font-bold transition-all duration-300",
            isLandlord
              ? "text-orange-600 cursor-default"
              : "text-gray-500 hover:text-gray-700 active:scale-95",
            isPending && !isLandlord && "opacity-50 cursor-not-allowed",
          )}
        >
          <Building
            className={clsx(
              "w-5 h-5",
              isLandlord ? "text-orange-500" : "text-gray-400",
            )}
          />
          {t("landlord")}
        </button>
      </div>

      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Wrapper class for the RTL trick above */}
      <div className={clsx("hidden", isLandlord ? "is-landlord" : "")} />
    </div>
  );
}
