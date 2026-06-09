"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * CustomModal – reusable, lightweight modal component rendering via React Portals.
 *
 * Props:
 *   isOpen          {boolean} – controlled open state
 *   onClose         {Function} – callback when backdrop or close button is clicked, or Escape is pressed
 *   size            {"sm" | "md" | "lg" | "full"} – width/height bounds (default: "md")
 *   backdropClass   {string} – optional custom CSS class for the backdrop overlay
 *   className       {string} – optional custom CSS class for the modal container/panel. Overrides default bg-white/shadow.
 *   children        {ReactNode}
 */
export default function CustomModal({
  isOpen,
  onClose,
  size = "md",
  backdropClass = "",
  className = "",
  children,
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
      const t = setTimeout(() => setMounted(false), 200);
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

  // Determine size classes
  let sizeClass = "";
  if (size === "full") {
    sizeClass = "w-full h-full rounded-none";
  } else if (size === "sm") {
    sizeClass = "max-w-sm w-[90%] rounded-2xl max-h-[90vh]";
  } else if (size === "lg") {
    sizeClass = "max-w-lg w-[90%] rounded-2xl max-h-[90vh]";
  } else if (size === "xl") {
    sizeClass = "max-w-xl w-[90%] rounded-[24px] max-h-[90vh]";
  } else if (size === "4xl") {
    sizeClass = "max-w-4xl w-[95%] md:w-[90%] rounded-2xl max-h-[90vh]";
  } else {
    sizeClass = "max-w-md w-[90%] rounded-2xl max-h-[90vh]"; // md (default)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ transition: "opacity 200ms ease" }}
        className={[
          "fixed inset-0 bg-black/50 backdrop-blur-sm",
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
          backdropClass,
        ].join(" ")}
      />

      {/* Modal Content Panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          transition: "transform 200ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease",
          transform: visible ? "scale(1)" : "scale(0.95)",
          opacity: visible ? 1 : 0,
        }}
        className={[
          "relative flex flex-col z-[101]",
          sizeClass,
          className ? className : "bg-white shadow-2xl",
        ].join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
