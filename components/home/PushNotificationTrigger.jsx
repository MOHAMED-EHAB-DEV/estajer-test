"use client";
import { useSearchParams } from "next/navigation";
import PushNotificationModal from "../shared/PushNotificationModal";
import { useEffect, useState, Suspense } from "react";

function PushNotificationTriggerContent({ lang, translate }) {
  const searchParams = useSearchParams();
  const [shouldShow, setShouldShow] = useState(false);
  const isApp = searchParams.get("isApp") === "true";

  useEffect(() => {
    if (isApp) return setShouldShow(true);
    try {
      const visitCount = parseInt(
        localStorage.getItem("siteVisitCount") || "0",
      );
      const isNewSession = !sessionStorage.getItem("sessionActive");
      if (isNewSession) {
        const newCount = visitCount + 1;
        localStorage.setItem("siteVisitCount", newCount.toString());
        sessionStorage.setItem("sessionActive", "true");

        if (newCount > 2) setShouldShow(true);
      } else if (visitCount > 2) {
        setShouldShow(true);
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
  }, [isApp]);

  if (!shouldShow) return null;

  return (
    <PushNotificationModal
      lang={lang}
      isApp={isApp}
      open={true}
      translate={translate}
      customer={true}
    />
  );
}

export default function PushNotificationTrigger(props) {
  return (
    <Suspense fallback={null}>
      <PushNotificationTriggerContent {...props} />
    </Suspense>
  );
}
