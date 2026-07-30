import React from "react";
import { twMerge } from "tailwind-merge";

export function Spinner({
  size = "md",
  color = "primary",
  labelColor = "foreground",
  label,
  className,
  classNames = {},
  ...props
}) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const colors = {
    current: "text-current",
    white: "text-white",
    default: "text-default-500",
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  const labelColors = {
    foreground: "text-foreground",
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  return (
    <div className={twMerge("relative inline-flex flex-col gap-2 items-center justify-center", className, classNames.base)} {...props}>
      <svg
        className={twMerge("animate-spin", sizes[size] || sizes.md, colors[color] || colors.primary, classNames.wrapper)}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className={twMerge("text-sm", labelColors[labelColor] || labelColors.foreground, classNames.label)}>{label}</span>}
    </div>
  );
}
