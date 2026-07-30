"use client";

import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

const ChevronLeft = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export function Pagination({
  total = 1,
  page = 1,
  onChange,
  color = "primary",
  size = "md",
  radius = "md",
  variant = "flat",
  showControls = false,
  isCompact = false,
  siblings = 1,
  boundaries = 1,
  className,
  classNames = {},
  showShadow,
  ...props
}) {
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > total || newPage === page) return;
    if (onChange) onChange(newPage);
  };

  const visiblePages = useMemo(() => {
    // Range helper
    const range = (start, end) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };

    const totalPageNumbers = siblings * 2 + 3 + boundaries * 2;
    if (totalPageNumbers >= total) {
      return range(1, total);
    }

    const leftBoundary = boundaries;
    const rightBoundary = total - boundaries + 1;

    const showLeftEllipsis = page - siblings > leftBoundary + 1;
    const showRightEllipsis = page + siblings < rightBoundary - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = siblings * 2 + boundaries + 2;
      return [...range(1, leftItemCount), "...", ...range(rightBoundary, total)];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      const rightItemCount = boundaries + 1 + 2 * siblings;
      return [...range(1, leftBoundary), "...", ...range(total - rightItemCount + 1, total)];
    }

    return [
      ...range(1, leftBoundary),
      "...",
      ...range(page - siblings, page + siblings),
      "...",
      ...range(rightBoundary, total),
    ];
  }, [total, page, siblings, boundaries]);

  const sizes = {
    sm: "min-w-8 w-8 h-8 text-xs",
    md: "min-w-9 w-9 h-9 text-sm",
    lg: "min-w-10 w-10 h-10 text-base",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const activeColors = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  const baseItemClass = twMerge(
    "flex items-center justify-center outline-none select-none transition-colors cursor-pointer",
    sizes[size] || sizes.md,
    radiuses[radius] || radiuses.md,
    classNames.item
  );

  const getVariantClass = (isActive) => {
    if (isActive) return activeColors[color] || activeColors.primary;
    if (variant === "flat") return "bg-default-100 hover:bg-default-200 text-foreground";
    if (variant === "bordered") return "border-2 border-default-200 hover:border-default-400 text-foreground bg-transparent";
    if (variant === "light") return "bg-transparent hover:bg-default-200 text-foreground";
    return "bg-default-100 hover:bg-default-200 text-foreground"; // default
  };

  return (
    <div className={twMerge("flex flex-wrap items-center", isCompact ? "gap-0 shadow-sm rounded-md overflow-hidden" : "gap-1", classNames.base, className)} {...props}>
      {showControls && (
        <button
          type="button"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          className={twMerge(
            baseItemClass,
            isCompact && "rounded-none border-r border-default-200",
            "bg-default-100 text-foreground",
            page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-default-200",
            classNames.prev
          )}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
      )}

      {visiblePages.map((p, i) => {
        if (p === '...') {
          return (
            <div key={`ellipsis-${i}`} className={twMerge("flex items-center justify-center text-default-500", sizes[size], isCompact && "bg-default-100 border-r border-default-200", classNames.ellipsis)}>
              ...
            </div>
          );
        }

        const isActive = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => handlePageChange(p)}
            className={twMerge(
              baseItemClass, 
              getVariantClass(isActive),
              isCompact && "rounded-none border-r border-default-200 last:border-r-0",
              isActive && classNames.active
            )}
          >
            {p}
          </button>
        );
      })}

      {showControls && (
        <button
          type="button"
          disabled={page === total}
          onClick={() => handlePageChange(page + 1)}
          className={twMerge(
            baseItemClass,
            isCompact && "rounded-none",
            "bg-default-100 text-foreground",
            page === total ? "opacity-50 cursor-not-allowed" : "hover:bg-default-200",
            classNames.next
          )}
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
}
