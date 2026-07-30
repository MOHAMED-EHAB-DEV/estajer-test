"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { useFloating } from "@/hooks/use-floating";
import { twMerge } from "tailwind-merge";

const PopoverContext = createContext(null);

export function Popover({
  children,
  placement = "top",
  isOpen,
  onOpenChange,
  ...props
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const handleOpenChange = (val) => {
    if (isOpen === undefined) setInternalOpen(val);
    if (onOpenChange) onOpenChange(val);
  };

  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  // Map HeroUI placement to our align prop roughly if needed
  let align = "center";
  if (placement.includes("start")) align = "start";
  if (placement.includes("end")) align = "end";

  return (
    <PopoverContext.Provider
      value={{
        isOpen: open,
        setIsOpen: handleOpenChange,
        triggerRef,
        contentRef,
        align,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, className, ...props }) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within Popover");

  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ref: context.triggerRef,
    onClick: (e) => {
      context.setIsOpen(!context.isOpen);
      if (child.props.onClick) child.props.onClick(e);
    },
    "aria-expanded": context.isOpen,
    className: twMerge(child.props.className, className),
    ...props,
  });
}

export function PopoverContent({ children, className, ...props }) {
  const context = useContext(PopoverContext);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(context?.isOpen || false);
  const [prevIsOpen, setPrevIsOpen] = useState(context?.isOpen || false);

  if (context && context.isOpen !== prevIsOpen) {
    setPrevIsOpen(context.isOpen);
    if (context.isOpen) {
      setShouldRender(true);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const { updatePosition } = useFloating({
    isOpen: context?.isOpen || false,
    setIsOpen: context?.setIsOpen || (() => {}),
    triggerRef: context?.triggerRef,
    contentRef: context?.contentRef,
    align: context?.align || "center",
    sideOffset: 8,
  });

  useEffect(() => {
    if (!context) return;
    let timeoutId;
    if (!context.isOpen) {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, 200);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [context?.isOpen]);

  if (!context) throw new Error("PopoverContent must be used within Popover");
  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div
      ref={(node) => {
        context.contentRef.current = node;
        if (node && context.isOpen) {
          requestAnimationFrame(() => updatePosition());
        }
      }}
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
      }}
      data-state={context.isOpen ? "open" : "closed"}
      className={twMerge(
        "z-modal rounded-lg border border-border bg-popover text-popover-foreground shadow-md transition-opacity duration-200",
        context.isOpen
          ? "opacity-100 visible animate-in fade-in duration-200"
          : "opacity-0 invisible pointer-events-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}
