"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * CustomDrawer – dynamic, lightweight modal/drawer component.
 *
 * Props:
 *   isOpen          {boolean}   – controlled open state
 *   onClose         {Function}  – triggers when backdrop clicked or Escape key pressed
 *   placement       {"bottom" | "left" | "right"} – drawer opening direction (default: "bottom")
 *   size            {"sm" | "md" | "lg" | "full"} – width/height bounds (default: "sm")
 *   backdrop        {"opaque" | "transparent"} – overlay visual style (default: "opaque")
 *   hideCloseButton {boolean}   – hides the top-right × button (default: false)
 *   showGrabHandle  {boolean}   – shows top grab handle for bottom placement (default: false)
 *   children        {ReactNode}
 *   className       {string}    – additional classes on the drawer panel
 */
export default function CustomDrawer({
  isOpen,
  onClose,
  placement = "bottom",
  size = "sm",
  backdrop = "opaque",
  hideCloseButton = false,
  showGrabHandle = false,
  children,
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const html = document.documentElement;
    if (isOpen) {
      html.style.scrollbarGutter = "stable";
      html.style.overflow = "hidden";
    } else {
      html.style.scrollbarGutter = "";
      html.style.overflow = "";
    }
    return () => {
      html.style.scrollbarGutter = "";
      html.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  // Placement styles & transitions
  let transformStyle = "";
  if (placement === "bottom") {
    transformStyle = visible ? "translateY(0)" : "translateY(100%)";
  } else if (placement === "left") {
    transformStyle = visible ? "translateX(0)" : "translateX(-100%)";
  } else if (placement === "right") {
    transformStyle = visible ? "translateX(0)" : "translateX(100%)";
  }

  // Size styling classes mapping
  let sizeClass = "";
  if (placement === "bottom") {
    if (size === "full") {
      sizeClass = "h-full w-full rounded-none";
    } else {
      sizeClass = "w-full rounded-t-3xl";
    }
  } else {
    // left or right placement
    if (size === "full") {
      sizeClass = "w-full h-full";
    } else if (size === "sm") {
      sizeClass = "w-[300px] h-full";
    } else if (size === "md") {
      sizeClass = "w-[450px] h-full";
    } else if (size === "lg") {
      sizeClass = "w-[500px] h-full";
    }
  }

  // Placement container classes
  let placementClass = "";
  if (placement === "bottom") {
    placementClass = "bottom-0 left-0 right-0";
  } else if (placement === "left") {
    placementClass = "top-0 bottom-0 left-0";
  } else if (placement === "right") {
    placementClass = "top-0 bottom-0 right-0";
  }

  // Backdrop backdrop-blur or transparency style
  const backdropClass =
    backdrop === "transparent"
      ? "bg-transparent"
      : "bg-black/40 backdrop-blur-[2px]";

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ transition: "opacity 300ms ease" }}
        className={[
          "fixed inset-0 z-[60]",
          backdropClass,
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
          transform: transformStyle,
        }}
        className={[
          "fixed z-[61] bg-white shadow-2xl flex flex-col",
          placementClass,
          sizeClass,
          className,
        ].join(" ")}
      >
        {/* Top grab handle bar for bottom sheets that are not full size */}
        {placement === "bottom" && size !== "full" && showGrabHandle && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0 select-none">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
        )}

        {/* Optional built-in Close Button */}
        {!hideCloseButton && (
          <div className="flex justify-end px-4 pt-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
