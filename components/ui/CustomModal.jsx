"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

/**
 * CustomModal – reusable, lightweight modal component rendering via React Portals.
 */
export default function CustomModal({
  isOpen,
  onClose,
  size = "md",
  shadow = "sm",
  placement = "center",
  backdropClass = "",
  className = "",
  classNames = {},
  disableScrollbarGutter = false,
  disableAnimation = false,
  hideCloseButton = false,
  children,
  ...props
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
    const body = document.body;
    if (isOpen) {
      if (!disableScrollbarGutter) {
        html.style.scrollbarGutter = "stable";
      }
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      html.style.scrollbarGutter = "";
      html.style.overflow = "";
      body.style.overflow = "";
    }
    return () => {
      html.style.scrollbarGutter = "";
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, [isOpen, disableScrollbarGutter]);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState(null, "");

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const onPopState = () => {
      onClose?.();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPopState);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const sizes = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "w-full h-[100dvh] max-h-[100dvh] max-w-full !rounded-none !m-0",
  };

  const responsiveSizes = {
    xs: "w-full max-w-full sm:max-w-xs",
    sm: "w-full max-w-full sm:max-w-sm",
    md: "w-full max-w-full sm:max-w-md",
    lg: "w-full max-w-full sm:max-w-lg",
    xl: "w-full max-w-full sm:max-w-xl",
    "2xl": "w-full max-w-full sm:max-w-2xl",
    "3xl": "w-full max-w-full sm:max-w-3xl",
    "4xl": "w-full max-w-full sm:max-w-4xl",
    "5xl": "w-full max-w-full sm:max-w-5xl",
    full: "w-full h-[100dvh] max-h-[100dvh] max-w-full !rounded-none !m-0",
  };

  const shadows = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const isFullScreen = size === "full";
  const isResponsive =
    placement === "responsive" || placement === "bottom-mobile";

  const sizeClass = isResponsive
    ? responsiveSizes[size] || responsiveSizes.md
    : sizes[size] || sizes.md;

  return createPortal(
    <div
      className={twMerge(
        "fixed inset-0 z-modal flex justify-center",
        isResponsive
          ? "items-end sm:items-center p-0 sm:p-4"
          : "items-center m-0 sm:m-4",
      )}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        style={disableAnimation ? {} : { transition: "opacity 200ms ease" }}
        className={twMerge(
          "fixed inset-0 bg-black/50 backdrop-blur-sm",
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
          backdropClass,
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        style={{
          ...(disableAnimation
            ? {}
            : {
                transition:
                  "transform 250ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease",
                transform: visible
                  ? "translateY(0) scale(1)"
                  : "translateY(12px) scale(0.96)",
                opacity: visible ? 1 : 0,
              }),
          paddingBottom: isResponsive
            ? "env(safe-area-inset-bottom, 0px)"
            : undefined,
        }}
        className={twMerge(
          "relative flex flex-col z-modal-content",
          "w-full bg-white text-foreground",
          !isFullScreen &&
            (isResponsive
              ? "max-h-[90vh] sm:max-h-[calc(100vh-2rem)]"
              : "m-4 sm:mx-0 max-h-[calc(100vh-2rem)]"),
          sizeClass,
          !isFullScreen &&
            (isResponsive
              ? "rounded-t-3xl rounded-b-none sm:rounded-2xl"
              : "rounded-2xl"),
          !isFullScreen && (shadows[shadow] || shadows.sm),
          classNames.base,
          className,
        )}
        {...props}
      >
        {!hideCloseButton && onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className={twMerge(
              "absolute top-4 end-4 z-50 p-2 text-default-500 hover:bg-default-100 bg-default-50 rounded-full transition-colors",
              classNames?.closeButton,
            )}
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
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onOpenChange = useCallback((open) => setIsOpen(open), []);
  return { isOpen, onOpen, onClose, onOpenChange };
}

export const ModalContext = React.createContext(null);

export function Modal({
  children,
  isOpen,
  onOpenChange,
  onClose,
  size = "md",
  className,
  classNames = {},
  placement = "center",
  backdrop = "opaque",
  hideCloseButton = false,
  scrollBehavior,
  ...props
}) {
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size={size}
      className={twMerge(
        "bg-card text-card-foreground rounded-xl",
        classNames.base,
        className,
      )}
      backdropClass={
        backdrop === "transparent"
          ? "bg-transparent"
          : backdrop === "blur"
            ? "backdrop-blur-md bg-black/30"
            : "bg-black/50"
      }
      hideCloseButton={hideCloseButton}
      {...props}
    >
      <ModalContext.Provider value={{ onClose: handleClose }}>
        {typeof children === "function" ? children(handleClose) : children}
      </ModalContext.Provider>
    </CustomModal>
  );
}

export function ModalContent({ children, className, ...props }) {
  const context = React.useContext(ModalContext);
  const onClose = context ? context.onClose : () => {};

  return (
    <div
      className={twMerge("flex flex-col relative w-full", className)}
      {...props}
    >
      {typeof children === "function" ? children(onClose) : children}
    </div>
  );
}

export function ModalHeader({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "flex py-4 px-6 justify-between items-center text-lg font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalBody({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "flex flex-1 flex-col gap-3 px-6 py-2 overflow-y-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalFooter({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "flex flex-row gap-2 px-6 py-4 justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
