"use client";

import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";

export function Tooltip({
  content,
  children,
  color,
  placement = "top",
  delay = 400,
  className,
}) {
  const [visible, setVisible] = useState(false);
  const [computedPlacement, setComputedPlacement] = useState(
    placement === "auto" ? "top" : placement
  );
  const timerRef = useRef(null);
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    if (placement === "auto") {
      setComputedPlacement("top");
    }
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (visible && placement === "auto" && wrapperRef.current && tooltipRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const spaces = {
        top: wrapperRect.top,
        bottom: window.innerHeight - wrapperRect.bottom,
        left: wrapperRect.left,
        right: window.innerWidth - wrapperRect.right,
      };

      const margin = 10;
      let bestPlacement = "top";

      if (spaces.top > tooltipRect.height + margin) {
        bestPlacement = "top";
      } else if (spaces.bottom > tooltipRect.height + margin) {
        bestPlacement = "bottom";
      } else if (spaces.left > tooltipRect.width + margin) {
        bestPlacement = "left";
      } else if (spaces.right > tooltipRect.width + margin) {
        bestPlacement = "right";
      } else {
        const maxSpace = Math.max(spaces.top, spaces.bottom, spaces.left, spaces.right);
        bestPlacement = Object.keys(spaces).find(key => spaces[key] === maxSpace) || "top";
      }

      setComputedPlacement(bestPlacement);
    } else if (placement !== "auto") {
      setComputedPlacement(placement);
    }
  }, [visible, placement, content]);

  const colorStyles = {
    danger: "bg-danger text-white",
    primary: "bg-primary text-white",
    warning: "bg-warning text-white",
    success: "bg-success text-white",
  };

  const placementStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 me-2",
    right: "left-full top-1/2 -translate-y-1/2 ms-2",
    auto: "bottom-full left-1/2 -translate-x-1/2 mb-2", // fallback
  };

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={twMerge(
            "absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none shadow-md animate-in fade-in zoom-in-95 duration-150",
            colorStyles[color] || "bg-gray-800 text-white",
            placementStyles[computedPlacement] || placementStyles.top,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
