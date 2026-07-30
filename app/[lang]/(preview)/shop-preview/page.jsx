"use client";

import { useState, useEffect, useRef } from "react";
import ShopPreview from "@/components/admin/shops/ShopPreview";

/**
 * Dedicated iframe page for the shop preview.
 * Loaded inside a sandboxed <iframe> by PreviewSidebarLayout.
 * Receives formData via window.postMessage from the parent.
 */
export default function ShopPreviewPage() {
  const [previewData, setPreviewData] = useState(null);
  const ready = useRef(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;

      if (event.data.type === "SHOP_PREVIEW_UPDATE") {
        setPreviewData(event.data.payload);
      }

      if (event.data.type === "SHOP_PREVIEW_SCROLL") {
        const sectionId = event.data.sectionId;
        const el =
          document.getElementById(`preview-section-${sectionId}`) ||
          document.getElementById(`preview-section-slider-0`) ||
          document.getElementById(`preview-section-banner-0`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    window.addEventListener("message", handleMessage);

    // Tell parent we're ready — retry until acknowledged
    const sendReady = () => {
      window.parent.postMessage({ type: "SHOP_PREVIEW_READY" }, "*");
    };
    sendReady();

    // Retry every 200ms until we get first data (parent may not be listening yet)
    const interval = setInterval(() => {
      if (!ready.current) sendReady();
      else clearInterval(interval);
    }, 200);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, []);

  // Mark ready once we receive first payload
  useEffect(() => {
    if (previewData) ready.current = true;
  }, [previewData]);

  if (!previewData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <div className="w-10 h-10 border-2 border-neutral-200 border-t-primary rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading preview…</span>
        </div>
      </div>
    );
  }

  return (
    <ShopPreview
      formData={previewData.formData}
      lang={previewData.lang}
      translate={previewData.translate}
      categoriesData={previewData.categoriesData}
      subCategoriesData={previewData.subCategoriesData}
    />
  );
}
