"use client";

import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { useState, useEffect } from "react";

export default function RevertImpersonation({ lang }) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkCookie = () => {
      const match = document.cookie.match(
        new RegExp("(^| )isImpersonating=([^;]+)"),
      );
      if (match && match[2] === "true") {
        setActive(true);
      } else {
        setActive(false);
      }
    };
    checkCookie();
  }, []);

  if (!active) return null;

  const handleRevert = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/revert-impersonate", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to revert impersonation");

      toast.success(
        ToastMessage(
          lang === "ar"
            ? "تمت العودة لحساب المسؤول بنجاح"
            : "Successfully reverted back to admin account",
        ),
      );

      // Redirect back to admin users list
      window.location.href = "/admin/users";
    } catch (error) {
      toast.error(ToastMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      className="fixed end-6 z-50 flex items-center bg-white/95 text-darkNavy rounded-full shadow-xl shadow-black/10 border border-black/5 backdrop-blur-md transition-all duration-500 ease-in-out group overflow-hidden max-w-[50px] hover:max-w-md h-12 p-1.5 select-none font-IBMPlex"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-[#f48a42]/30 flex items-center justify-center cursor-pointer">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f48a42"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 20v-1.5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v1.5" />
          <circle cx="8" cy="8" r="3" />
          <path d="M20 16l-4-4 4-4" />
          <path d="M16 12h6" />
        </svg>
      </div>
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden ps-3 pe-3 gap-3">
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-bold text-darkNavy">
            {lang === "ar" ? "وضع التقمص نشط" : "Impersonation Active"}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-none">
            {lang === "ar"
              ? "أنت تتصفح المنصة حالياً بحساب عميل"
              : "You are browsing as a client"}
          </p>
        </div>
        <button
          onClick={handleRevert}
          disabled={loading}
          className="flex-shrink-0 px-3.5 py-1.5 text-xs font-bold bg-primary hover:bg-[#e07530] active:scale-95 disabled:bg-primary/60 text-white rounded-xl shadow-md transition-all duration-200"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : lang === "ar" ? (
            "العودة للمسؤول"
          ) : (
            "Revert to Admin"
          )}
        </button>
      </div>
    </div>
  );
}
