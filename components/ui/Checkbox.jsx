"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

const CheckboxContext = React.createContext(null);

export function CheckboxGroup({
  children,
  value,
  defaultValue,
  onValueChange,
  onChange,
  orientation = "vertical",
  isDisabled = false,
  label,
  className,
  classNames = {},
  ...props
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || []);
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (val, isChecked) => {
    let newSet = new Set(currentValue);
    if (isChecked) {
      newSet.add(val);
    } else {
      newSet.delete(val);
    }
    const newArray = Array.from(newSet);
    if (value === undefined) setInternalValue(newArray);
    if (onValueChange) onValueChange(newArray);
    if (onChange) onChange({ target: { value: newArray } });
  };

  return (
    <CheckboxContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, isDisabled }}>
      <div className={twMerge("flex flex-col gap-2", classNames.base, className)} {...props}>
        {label && <label className={twMerge("text-sm font-medium", classNames.label)}>{label}</label>}
        <div
          className={twMerge(
            "flex",
            orientation === "horizontal" ? "flex-row flex-wrap gap-4" : "flex-col gap-2",
            classNames.wrapper
          )}
        >
          {children}
        </div>
      </div>
    </CheckboxContext.Provider>
  );
}

const CheckIcon = ({ className }) => (
  <svg
    className={twMerge("w-4 h-4 text-white", className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function Checkbox({
  children,
  isSelected,
  checked: checkedProp,
  defaultSelected,
  onValueChange,
  onChange,
  value,
  size = "md",
  color = "primary",
  radius = "md",
  isDisabled: localIsDisabled = false,
  className,
  classNames = {},
  isRequired,
  ...props
}) {
  const context = React.useContext(CheckboxContext);
  const isDisabled = localIsDisabled || context?.isDisabled || false;

  const [internalSelected, setInternalSelected] = React.useState(defaultSelected || false);
  
  // Determine if checked from context or local props
  let checked = false;
  if (context && value !== undefined) {
    checked = context.value.includes(value);
  } else {
    const activeSelected = isSelected !== undefined ? isSelected : checkedProp;
    checked = activeSelected !== undefined ? activeSelected : internalSelected;
  }

  const handleChange = (e) => {
    if (isDisabled) return;
    const val = e.target.checked;
    
    if (context && value !== undefined) {
      context.onValueChange(value, val);
    } else {
      if (isSelected === undefined && checkedProp === undefined) setInternalSelected(val);
      if (onValueChange) onValueChange(val);
    }
    if (onChange) onChange(e);
  };

  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const colors = {
    primary: "bg-primary border-primary",
    secondary: "bg-secondary border-secondary",
    success: "bg-success border-success",
    warning: "bg-warning border-warning",
    danger: "bg-danger border-danger",
    default: "bg-default-400 border-default-400",
  };

  return (
    <label
      className={twMerge(
        "group relative flex items-center gap-2 cursor-pointer",
        isDisabled && "opacity-50 cursor-not-allowed",
        classNames.base,
        className
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          checked={checked}
          onChange={handleChange}
          disabled={isDisabled}
          value={value !== undefined ? value : ""}
          required={isRequired}
          {...props}
        />
        <div
          className={twMerge(
            "flex items-center justify-center border-2 transition-all",
            sizes[size] || sizes.md,
            radiuses[radius] || radiuses.md,
            checked ? colors[color] || colors.primary : "border-default-300 bg-transparent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
            classNames.wrapper
          )}
        >
          {checked && (
            <CheckIcon
              className={twMerge(
                size === "sm" ? "w-3 h-3" : "w-4 h-4",
                classNames.icon
              )}
            />
          )}
        </div>
      </div>
      {children && (
        <span className={twMerge("select-none text-foreground", sizes[size] === "w-4 h-4" ? "text-sm" : "text-base", classNames.label)}>
          {children}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
