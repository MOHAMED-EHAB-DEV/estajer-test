import React from "react";
import { twMerge } from "tailwind-merge";

export function Card({ children, className, shadow = "md", radius = "lg", isHoverable, isPressable, onPress, ...props }) {
  const Component = isPressable || onPress ? "button" : "div";
  
  const shadows = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <Component
      className={twMerge(
        "flex flex-col bg-card text-card-foreground overflow-hidden box-border outline-none",
        shadows[shadow] || shadows.md,
        radiuses[radius] || radiuses.lg,
        (isHoverable || isPressable) && "transition-transform-background hover:scale-[1.02]",
        (isPressable || onPress) && "cursor-pointer active:scale-[0.97]",
        className
      )}
      onClick={onPress}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={twMerge("flex p-3 z-10 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={twMerge("flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-start overflow-y-auto subpixel-antialiased", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={twMerge("p-3 h-auto flex w-full items-center overflow-hidden color-inherit subpixel-antialiased", className)} {...props}>
      {children}
    </div>
  );
}
