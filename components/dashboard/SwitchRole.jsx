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

export default function SwitchRole({
  translate,
  initialRole,
  className = "",
  langPrefix,
  updateValue,
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
          body: JSON.stringify({
            isRenter: updateValue,
          }),
        });
        setUser((prev) => ({ ...prev, isRenter: updateValue }));
      } catch (err) {
        toast.error(ToastMessage(err.message));
      }
    });
  };

  const isRenter = initialRole === "renter";
  const isLandlord = initialRole === "landlord";

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center md:gap-3 gap-2 select-none",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
        </span>
        <p className="text-[13px] text-gray-500 font-semibold tracking-wide uppercase">
          {t("label")}
        </p>
      </div>
      <div className="relative w-full max-w-[300px]">
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-1.5 shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 opacity-50" />
          <div className="relative flex items-center">
            <div
              className={clsx(
                "absolute h-[calc(100%)] w-1/2 rounded-xl transition-all duration-500 ease-out",
                "bg-gradient-to-br from-[#F48A42] to-[#e67330] shadow-lg",
                "before:absolute before:inset-0 before:rounded-xl before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
                isRenter ? "start-0" : "start-1/2",
              )}
              style={{
                boxShadow:
                  "0 4px 15px rgba(244, 138, 66, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            />
            <button
              onClick={onChangeRent}
              disabled={isRenter || isPending}
              className={clsx(
                "relative z-10 flex-1 flex items-center justify-center gap-2 md:py-3.5 md:px-4 py-2.5 px-2 rounded-xl transition-all duration-300",
                isRenter
                  ? "text-white font-semibold"
                  : "text-gray-600 hover:text-gray-800 cursor-pointer",
                isPending && !isRenter && "opacity-50",
              )}
              aria-pressed={isRenter}
            >
              <UserCircle
                className={clsx(
                  "transition-all duration-300 md:size-[18px] size-[16px]",
                  isRenter ? "opacity-100" : "opacity-60",
                )}
              />
              <span className="md:text-sm text-xs font-medium whitespace-nowrap">
                {t("renter")}
              </span>
            </button>

            {/* Landlord button */}
            <button
              onClick={onChangeRent}
              disabled={isLandlord || isPending}
              className={clsx(
                "relative z-10 flex-1 flex items-center justify-center md:gap-2 gap-1 px-4 py-3.5 rounded-xl transition-all duration-300",
                isLandlord
                  ? "text-white font-semibold"
                  : "text-gray-600 hover:text-gray-800 cursor-pointer",
                isPending && !isLandlord && "opacity-50",
              )}
              aria-pressed={isLandlord}
            >
              <Building
                className={clsx(
                  "transition-all duration-300 md:size-[18px] size-[16px]",
                  isLandlord ? "opacity-100" : "opacity-60",
                )}
              />
              <span className="md:text-sm text-xs font-medium whitespace-nowrap">
                {t("landlord")}
              </span>
            </button>
          </div>
        </div>

        {/* Decorative glow effect */}
        <div
          className={clsx(
            "absolute -bottom-2 h-4 w-1/3 rounded-full blur-xl transition-all duration-500 opacity-30",
            "bg-gradient-to-r from-[#F48A42] to-[#e67330]",
            isRenter ? "start-[8%]" : "start-[58%]",
          )}
        />
      </div>
    </div>
  );
}
