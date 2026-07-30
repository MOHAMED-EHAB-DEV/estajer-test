import React from "react";
import { twMerge } from "tailwind-merge";

export function Avatar({
  src,
  name,
  icon,
  size = "md",
  color = "default",
  radius = "full",
  isBordered = false,
  className,
  classNames = {},
  ...props
}) {
  const [imgFailed, setImgFailed] = React.useState(false);

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const colors = {
    default: "bg-default-300 text-default-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  const ringColors = {
    default: "ring-default-300",
    primary: "ring-primary",
    secondary: "ring-secondary",
    success: "ring-success",
    warning: "ring-warning",
    danger: "ring-danger",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <div
      className={twMerge(
        "relative flex justify-center items-center overflow-hidden shrink-0 align-middle box-border",
        sizes[size] || sizes.md,
        radiuses[radius] || radiuses.full,
        colors[color] || colors.default,
        isBordered && `ring-2 ring-offset-2 ring-offset-background ${ringColors[color] || ringColors.default}`,
        classNames.base,
        className
      )}
      {...props}
    >
      {src && !imgFailed ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className={twMerge("w-full h-full object-cover", classNames.img)}
          onError={() => setImgFailed(true)}
        />
      ) : icon ? (
        <span className={twMerge("flex items-center justify-center", classNames.icon)}>{icon}</span>
      ) : (
        <span className={twMerge("font-normal", classNames.name)}>{initials}</span>
      )}
    </div>
  );
}
