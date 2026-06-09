'use client';
import { useRouter } from "next/navigation";
import React from "react";

export default function MarkAll() {
  const router = useRouter();
  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      const data = await res.json();
      if (data.success) router.refresh();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  return (
    <button className="underline font-medium md:font-semibold md:text-base text-sm" onClick={markAllAsRead}>
      اعتبار جميع الاشعارات
    </button>
  );
}
