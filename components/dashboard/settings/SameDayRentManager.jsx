"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { revalidateWithTag } from "@/actions/revalidateTag";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function SameDayRentManager({ user, setUser, t, lang }) {
  const [isLoading, setIsLoading] = useState(false);
  const isEnabled = !user.disableSameDayRent;

  const toggleSameDayRent = async (val) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disableSameDayRent: !val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating setting");
      setUser(data.data);
      toast.success(ToastMessage(t("sameDayRentManager.success")));
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const enabledPoints = [
    t("sameDayRentManager.benefit1"),
    t("sameDayRentManager.benefit2"),
    t("sameDayRentManager.benefit3"),
  ];

  const disabledPoints = [
    t("sameDayRentManager.restriction1"),
    t("sameDayRentManager.restriction2"),
    t("sameDayRentManager.restriction3"),
  ];

  return (
    <div className="md:p-10 p-4 bg-white md:mt-6 mt-4 rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isEnabled
                ? "bg-orange-100 text-primary"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <ClockIcon />
          </div>
          <div>
            <h2 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.05rem] font-semibold text-darkNavy font-IBMPlex mb-0.5">
              {t("sameDayRentManager.title")}
            </h2>
            <p className="text-sm text-gray-400">
              {t("sameDayRentManager.subtitle")}
            </p>
          </div>
        </div>

        {/* Toggle + Badge */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Switch
            isSelected={isEnabled}
            onValueChange={toggleSameDayRent}
            isDisabled={isLoading}
          />
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors duration-300 ${
              isEnabled
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isEnabled
              ? t("sameDayRentManager.enabledBadge")
              : t("sameDayRentManager.disabledBadge")}
          </span>
        </div>
      </div>

      {/* Status card */}
      <div
        className={`rounded-2xl border p-4 mb-5 transition-all duration-300 ${
          isEnabled
            ? "bg-brandCream border-primary/20"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <p
          className={`text-sm font-medium leading-relaxed ${
            isEnabled ? "text-orange-800" : "text-gray-600"
          }`}
        >
          {isEnabled
            ? t("sameDayRentManager.enabledDesc")
            : t("sameDayRentManager.disabledDesc")}
        </p>
      </div>

      {/* Two-column detail cards */}
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        {/* Enabled side */}
        <div
          className={`rounded-2xl border p-4 transition-all duration-300 ${
            isEnabled
              ? "border-primary/30 bg-orange-50/60 shadow-sm"
              : "border-gray-100 bg-gray-50 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <CheckIcon />
            </span>
            <span className="text-sm font-semibold text-darkNavy">
              {t("sameDayRentManager.whenEnabled")}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {enabledPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-600"
              >
                <span className="mt-0.5 w-4 h-4 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                  <CheckIcon />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Disabled side */}
        <div
          className={`rounded-2xl border p-4 transition-all duration-300 ${
            !isEnabled
              ? "border-gray-300 bg-gray-50 shadow-sm"
              : "border-gray-100 bg-gray-50/40 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
              <XIcon />
            </span>
            <span className="text-sm font-semibold text-darkNavy">
              {t("sameDayRentManager.whenDisabled")}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {disabledPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-600"
              >
                <span className="mt-0.5 w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                  <XIcon />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Loading indicator row */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end">
        {isLoading && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
            {lang === "ar" ? "جارٍ الحفظ…" : "Saving…"}
          </span>
        )}
      </div>
    </div>
  );
}
