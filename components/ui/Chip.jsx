import React from "react";
import { twMerge } from "tailwind-merge";

export function Chip({
  children,
  className,
  color = "default",
  size = "md",
  variant = "solid",
  radius = "full",
  startContent,
  endContent,
  onClose,
  classNames = {},
  ...props
}) {
  const sizes = {
    sm: "h-6 px-1 text-xs",
    md: "h-7 px-2 text-sm",
    lg: "h-8 px-3 text-base",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const colors = {
    default: {
      solid: "bg-default-300 text-default-foreground",
      bordered: "border-default-300 text-default-foreground border-2 bg-transparent",
      flat: "bg-default-100 text-default-foreground",
    },
    primary: {
      solid: "bg-primary text-primary-foreground",
      bordered: "border-primary text-primary border-2 bg-transparent",
      flat: "bg-primary/20 text-primary",
    },
    secondary: {
      solid: "bg-secondary text-secondary-foreground",
      bordered: "border-secondary text-secondary border-2 bg-transparent",
      flat: "bg-secondary/20 text-secondary",
    },
    success: {
      solid: "bg-success text-success-foreground",
      bordered: "border-success text-success border-2 bg-transparent",
      flat: "bg-success/20 text-success",
    },
    warning: {
      solid: "bg-warning text-warning-foreground",
      bordered: "border-warning text-warning border-2 bg-transparent",
      flat: "bg-warning/20 text-warning",
    },
    danger: {
      solid: "bg-danger text-danger-foreground",
      bordered: "border-danger text-danger border-2 bg-transparent",
      flat: "bg-danger/20 text-danger",
    },
  };

  const colorVariants = colors[color] || colors.default;
  const styleClass = colorVariants[variant] || colorVariants.solid;

  return (
    <div
      className={twMerge(
        "relative max-w-fit inline-flex items-center justify-between box-border whitespace-nowrap",
        sizes[size] || sizes.md,
        radiuses[radius] || radiuses.full,
        styleClass,
        classNames.base,
        className
      )}
      {...props}
    >
      {startContent && <span className={twMerge("mr-1 ml-1", classNames.startContent)}>{startContent}</span>}
      <span className={twMerge("flex-1 text-inherit font-normal px-1", classNames.content)}>
        {children}
      </span>
      {endContent && <span className={twMerge("ml-1 mr-1", classNames.endContent)}>{endContent}</span>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={twMerge(
            "ml-1 mr-1 flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-50 transition-opacity",
            classNames.closeButton
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
