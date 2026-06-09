"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-current"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function Button({
  as,
  children,
  className = "",
  variant = "shadow",
  color = "primary",
  size = "lg",
  radius = "full",
  startContent,
  endContent,
  spinner,
  spinnerPlacement = "start",
  fullWidth = false,
  isIconOnly = false,
  isDisabled = false,
  isLoading = false,
  onPress,
  onClick,
  type = "button",
  ...props
}) {
  const Component = as || "button";

  const handleClick = (e) => {
    if (isDisabled || isLoading) return;
    if (onPress) onPress(e);
    if (onClick) onClick(e);
  };

  const baseClasses =
    "z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu outline-none transition-all active:scale-[0.97]";

  // ALL HeroUI Sizes
  const sizes = {
    sm: "px-3 min-w-16 h-8 text-small gap-2 text-[13px]",
    md: "px-4 min-w-20 h-10 text-medium gap-2 text-sm",
    lg: "px-6 min-w-24 h-12 text-medium gap-3 text-base",
  };

  // ALL HeroUI Radiuses
  const radiuses = {
    none: "rounded-none",
    sm: "rounded-small",
    md: "rounded-medium",
    lg: "rounded-large",
    full: "rounded-full",
  };

  const getThemeClasses = (c, v) => {
    if (c === "transparent") return "bg-transparent text-current";

    const styles = {
      primary: {
        solid: "bg-primary text-primary-foreground",
        bordered: "border-2 border-primary text-primary bg-transparent",
        light: "bg-transparent text-primary hover:bg-primary/20",
        flat: "bg-primary/20 text-primary",
        faded: "border-2 border-gray-200 bg-gray-100 text-primary",
        shadow:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/40",
        ghost:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
      },
      secondary: {
        solid: "bg-secondary text-secondary-foreground",
        bordered: "border-2 border-secondary text-secondary bg-transparent",
        light: "bg-transparent text-secondary hover:bg-secondary/20",
        flat: "bg-secondary/20 text-secondary",
        faded: "border-2 border-gray-200 bg-gray-100 text-secondary",
        shadow:
          "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/40",
        ghost:
          "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground",
      },
      success: {
        solid: "bg-success text-success-foreground",
        bordered: "border-2 border-success text-success bg-transparent",
        light: "bg-transparent text-success hover:bg-success/20",
        flat: "bg-success/20 text-success",
        faded: "border-2 border-gray-200 bg-gray-100 text-success",
        shadow:
          "bg-success text-success-foreground shadow-lg shadow-success/40",
        ghost:
          "border-2 border-success text-success bg-transparent hover:bg-success hover:text-success-foreground",
      },
      warning: {
        solid: "bg-warning text-warning-foreground",
        bordered: "border-2 border-warning text-warning bg-transparent",
        light: "bg-transparent text-warning hover:bg-warning/20",
        flat: "bg-warning/20 text-warning",
        faded: "border-2 border-gray-200 bg-gray-100 text-warning",
        shadow:
          "bg-warning text-warning-foreground shadow-lg shadow-warning/40",
        ghost:
          "border-2 border-warning text-warning bg-transparent hover:bg-warning hover:text-warning-foreground",
      },
      danger: {
        solid: "bg-danger text-danger-foreground",
        bordered: "border-2 border-danger text-danger bg-transparent",
        light: "bg-transparent text-danger hover:bg-danger/20",
        flat: "bg-danger/20 text-danger",
        faded: "border-2 border-gray-200 bg-gray-100 text-danger",
        shadow: "bg-danger text-danger-foreground shadow-lg shadow-danger/40",
        ghost:
          "border-2 border-danger text-danger bg-transparent hover:bg-danger hover:text-danger-foreground",
      },
      default: {
        solid: "bg-default text-default-foreground",
        bordered: "border-2 border-default text-foreground bg-transparent",
        light: "bg-transparent text-foreground hover:bg-default/40",
        flat: "bg-default/40 text-foreground",
        faded: "border-2 border-default-200 bg-default-100 text-foreground",
        shadow:
          "bg-default text-default-foreground shadow-lg shadow-default/40",
        ghost:
          "border-2 border-default text-foreground bg-transparent hover:bg-default hover:text-default-foreground",
      },
    };

    // Fallback to 'default' color if passed color is weird, and 'solid' if variant is weird
    const colorMap = styles[c] || styles.default;
    return colorMap[v] || colorMap.solid;
  };

  const buttonClasses = twMerge(
    baseClasses,
    sizes[size] || sizes.md, // Fallback to md
    radiuses[radius] || radiuses.md, // Fallback to md
    getThemeClasses(color, variant),
    fullWidth ? "w-full" : "",
    isIconOnly ? "px-0 !min-w-10 !w-10" : "",
    isDisabled || isLoading
      ? "opacity-50 cursor-not-allowed"
      : "hover:opacity-90 cursor-pointer",
    className,
  );

  const isButtonTag =
    typeof Component === "string" && Component.toLowerCase() === "button";

  return (
    <Component
      {...(isButtonTag ? { type } : {})}
      className={buttonClasses}
      onClick={handleClick}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading && spinnerPlacement === "start" && (spinner || <Spinner />)}
      {!isLoading && startContent}

      {children}

      {!isLoading && endContent}
      {isLoading && spinnerPlacement === "end" && (spinner || <Spinner />)}
    </Component>
  );
}
