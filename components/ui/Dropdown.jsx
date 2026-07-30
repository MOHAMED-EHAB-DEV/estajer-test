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
import Button from "@/components/ui/Button";

const DropdownContext = createContext(null);

export function Dropdown({ children, items, disabledKeys = [], ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find((child) => child.type === DropdownTrigger);
  const menu = childrenArray.find((child) => child.type === DropdownMenu);

  const onAction = (key) => {
    if (props.onAction) props.onAction(key);
  };

  const mountedMenu = (menuChildren, className) => {
    if (!menu) return null;
    return React.cloneElement(menu, { children: menuChildren, className });
  };

  const menuChildren = menu?.props.children;
  const classNames = menu?.props.className;

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        setIsOpen,
        triggerRef,
        contentRef,
        focusedIndex,
        setFocusedIndex,
        onAction,
        disabledKeys,
      }}
    >
      {trigger}
      {mountedMenu(
        Array.isArray(items) && typeof menuChildren === "function"
          ? items.map(menuChildren)
          : menuChildren,
        classNames,
      )}
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({ children, className, ...props }) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("DropdownTrigger must be used within Dropdown");

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!context.isOpen) {
        context.setIsOpen(true);
        context.setFocusedIndex(0);
      } else {
        context.setFocusedIndex((prev) => prev + 1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (context.isOpen) {
        context.setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      if (!context.isOpen) {
        e.preventDefault();
        context.setIsOpen(true);
        context.setFocusedIndex(0);
      }
    } else if (e.key === "Escape") {
      context.setIsOpen(false);
    }
  };

  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ref: context.triggerRef,
    onClick: (e) => {
      context.setIsOpen(!context.isOpen);
      if (child.props.onClick) child.props.onClick(e);
    },
    onKeyDown: (e) => {
      handleKeyDown(e);
      if (child.props.onKeyDown) child.props.onKeyDown(e);
    },
    "aria-expanded": context.isOpen,
    className: twMerge(child.props.className, className),
    ...props,
  });
}

export function DropdownMenu({
  children,
  className,
  variant = "flat",
  disabledKeys: _disabledKeys,
  ...props
}) {
  const context = useContext(DropdownContext);
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
  });

  if (!context) throw new Error("DropdownMenu must be used within Dropdown");

  const itemsArray = React.Children.toArray(children).filter(Boolean);

  useEffect(() => {
    if (context.focusedIndex >= itemsArray.length) {
      context.setFocusedIndex(itemsArray.length - 1);
    }
  }, [context.focusedIndex, itemsArray.length, context]);

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

  useEffect(() => {
    if (!context.isOpen) return;
    const handleGlobalKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (
          context.focusedIndex >= 0 &&
          context.focusedIndex < itemsArray.length
        ) {
          const focusedItem = itemsArray[context.focusedIndex];
          if (focusedItem.props.onClick) {
            focusedItem.props.onClick({ target: {} });
          }
          if (focusedItem.props.key) context.onAction(focusedItem.props.key);
          context.setIsOpen(false);
        }
      }
    };

    const onKey = (e) => {
      if (
        context.triggerRef.current?.contains(document.activeElement) ||
        context.contentRef.current?.contains(document.activeElement)
      ) {
        handleGlobalKeyDown(e);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [context.isOpen, context.focusedIndex, itemsArray, context]);

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
        "z-50 min-w-32 overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground p-2 shadow-md transition-opacity duration-200",
        context.isOpen
          ? "opacity-100 visible animate-in fade-in duration-200"
          : "opacity-0 invisible pointer-events-none",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col w-full">
        {itemsArray.map((child, index) => {
          return React.cloneElement(child, { index });
        })}
      </div>
    </div>,
    document.body,
  );
}

export function DropdownItem({
  children,
  className,
  color = "default",
  onClick,
  index,
  key: itemKey,
  value,
  startContent,
  endContent,
  description,
  isDisabled,
  ...props
}) {
  const context = useContext(DropdownContext);

  const isFocused = context?.focusedIndex === index;

  const isItemDisabled =
    isDisabled ||
    (itemKey && context?.disabledKeys && Array.isArray(context.disabledKeys)
      ? context.disabledKeys.includes(itemKey)
      : context?.disabledKeys instanceof Set &&
        context.disabledKeys.has(itemKey));

  const colors = {
    default: "text-foreground",
    primary: "text-primary hover:text-primary",
    danger: "text-danger hover:text-danger",
    currentColor: "",
  };

  const focusColors = {
    default: "bg-default-100",
    primary: "bg-primary/20",
    danger: "bg-danger/20",
    currentColor: "bg-default-100",
  };

  return (
    <Button
      variant="light"
      color="default"
      radius="md"
      isDisabled={isItemDisabled}
      className={twMerge(
        "flex w-full items-center gap-2 py-2 px-3 text-sm outline-none select-none transition-colors justify-start h-auto font-normal",
        colors[color] || colors.default,
        isFocused && !isItemDisabled
          ? focusColors[color] || focusColors.default
          : !isItemDisabled && "hover:bg-default-100",
        className,
      )}
      onClick={(e) => {
        if (isItemDisabled) return;
        if (onClick) onClick(e);
        if (itemKey) context?.onAction(itemKey);
        if (context) context.setIsOpen(false);
      }}
      onMouseEnter={() => {
        if (!isItemDisabled) context?.setFocusedIndex(index);
      }}
      {...props}
    >
      <div className="flex items-center gap-2 w-full">
        {startContent && <div className="flex-shrink-0">{startContent}</div>}
        <div className="flex flex-col flex-grow text-start truncate">
          <span className="truncate">{children}</span>
          {description && (
            <span className="text-xs text-default-400 truncate">
              {description}
            </span>
          )}
        </div>
        {endContent && <div className="flex-shrink-0">{endContent}</div>}
      </div>
    </Button>
  );
}
