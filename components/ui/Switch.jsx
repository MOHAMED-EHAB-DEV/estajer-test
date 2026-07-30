"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

export function Switch({
  children,
  isSelected,
  defaultSelected,
  onValueChange,
  onChange,
  size = "md",
  color = "primary",
  isDisabled = false,
  className,
  classNames = {},
  startContent,
  endContent,
  thumbIcon,
  ...props
}) {
  const [internalSelected, setInternalSelected] = React.useState(defaultSelected || false);
  const checked = isSelected !== undefined ? isSelected : internalSelected;

  const handleChange = (e) => {
    if (isDisabled) return;
    const val = e.target.checked;
    if (isSelected === undefined) setInternalSelected(val);
    if (onValueChange) onValueChange(val);
    if (onChange) onChange(e);
  };

  const sizes = {
    sm: "w-10 h-6",
    md: "w-12 h-7",
    lg: "w-14 h-8",
  };

  const thumbSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const translations = {
    sm: "translate-x-5 rtl:-translate-x-5",
    md: "translate-x-6 rtl:-translate-x-6",
    lg: "translate-x-7 rtl:-translate-x-7",
  };

  const colors = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    default: "bg-default-400",
  };

  return (
    <label
      data-slot="base"
      data-selected={checked ? "true" : "false"}
      data-disabled={isDisabled ? "true" : "false"}
      className={twMerge(
        "group relative flex items-center gap-2 cursor-pointer",
        isDisabled && "opacity-50 cursor-not-allowed",
        classNames.base,
        className
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          data-slot="input"
          type="checkbox"
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          checked={checked}
          onChange={handleChange}
          disabled={isDisabled}
          {...props}
        />
        <div
          data-slot="wrapper"
          className={twMerge(
            "flex items-center rounded-full transition-colors relative",
            sizes[size] || sizes.md,
            checked ? colors[color] || colors.primary : "bg-default-200",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
            classNames.wrapper
          )}
        >
          {startContent && (
            <div className={twMerge("absolute right-1.5 text-white/70", sizes[size] === "w-10 h-6" ? "scale-75" : "")} data-slot="start-content">
              {startContent}
            </div>
          )}
          {endContent && (
            <div className={twMerge("absolute left-1.5 text-default-500", sizes[size] === "w-10 h-6" ? "scale-75" : "")} data-slot="end-content">
              {endContent}
            </div>
          )}
          <span
            data-slot="thumb"
            className={twMerge(
              "bg-white rounded-full transition-transform shadow-sm flex items-center justify-center z-10",
              thumbSizes[size] || thumbSizes.md,
              checked ? (translations[size] || translations.md) : "translate-x-1 rtl:-translate-x-1",
              classNames.thumb
            )}
          >
            {thumbIcon && (
              <span className="flex items-center justify-center text-default-500 w-full h-full p-0.5" data-slot="thumb-icon">
                {typeof thumbIcon === "function" ? thumbIcon({ isSelected: checked, className: "" }) : thumbIcon}
              </span>
            )}
          </span>
        </div>
      </div>
      {children && (
        <span data-slot="label" className={twMerge("select-none text-foreground", sizes[size] === "w-10 h-6" ? "text-sm" : "text-base", classNames.label)}>
          {children}
        </span>
      )}
    </label>
  );
}

export default Switch;
