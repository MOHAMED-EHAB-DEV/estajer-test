"use client";

import { useEffect, useState, useRef } from "react";
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

  // Direct DOM references for 60FPS zero-rerender dragging on low-end hardware
  const panelRef = useRef(null);
  const dragStartY = useRef(0);
  const currentDragY = useRef(0);
  const rafId = useRef(null);

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

  // Touch drag handlers (direct DOM manipulation, 0 React re-renders)
  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
    currentDragY.current = 0;
    if (panelRef.current) {
      panelRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e) => {
    if (!dragStartY.current) return;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY > 0) {
      currentDragY.current = deltaY;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (panelRef.current) {
          panelRef.current.style.transform = `translate3d(0, ${deltaY}px, 0)`;
        }
      });
    }
  };

  const handleTouchEnd = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (panelRef.current) {
      panelRef.current.style.transition =
        "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)";
    }
    if (currentDragY.current > 80) {
      onClose?.();
    } else {
      if (panelRef.current) {
        panelRef.current.style.transform = "translate3d(0, 0, 0)";
      }
    }
    dragStartY.current = 0;
    currentDragY.current = 0;
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    dragStartY.current = e.clientY;
    currentDragY.current = 0;
    if (panelRef.current) {
      panelRef.current.style.transition = "none";
    }

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - dragStartY.current;
      if (deltaY > 0) {
        currentDragY.current = deltaY;
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          if (panelRef.current) {
            panelRef.current.style.transform = `translate3d(0, ${deltaY}px, 0)`;
          }
        });
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (panelRef.current) {
        panelRef.current.style.transition =
          "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)";
      }
      if (currentDragY.current > 80) {
        onClose?.();
      } else {
        if (panelRef.current) {
          panelRef.current.style.transform = "translate3d(0, 0, 0)";
        }
      }
      dragStartY.current = 0;
      currentDragY.current = 0;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  if (!mounted) return null;

  // Placement styles & transitions
  let transformStyle = "";
  if (placement === "bottom") {
    transformStyle = visible ? "translate3d(0, 0, 0)" : "translate3d(0, 100%, 0)";
  } else if (placement === "left") {
    transformStyle = visible ? "translate3d(0, 0, 0)" : "translate3d(-100%, 0, 0)";
  } else if (placement === "right") {
    transformStyle = visible ? "translate3d(0, 0, 0)" : "translate3d(100%, 0, 0)";
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
          "fixed inset-0 z-drawer",
          backdropClass,
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        style={{
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
          transform: transformStyle,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          willChange: "transform",
        }}
        className={[
          "fixed z-drawer-content bg-white shadow-2xl flex flex-col",
          placementClass,
          sizeClass,
          className,
        ].join(" ")}
      >
        {/* Top grab handle bar for bottom sheets that are not full size */}
        {placement === "bottom" && size !== "full" && showGrabHandle && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className="flex justify-center pt-3 pb-2 flex-shrink-0 select-none cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-12 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors" />
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
