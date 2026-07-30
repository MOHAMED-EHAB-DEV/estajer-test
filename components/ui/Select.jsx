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

const flattenChildren = (children) => {
  const result = [];
  const traverse = (child) => {
    if (Array.isArray(child)) {
      child.forEach(traverse);
    } else if (React.isValidElement(child)) {
      if (child.type === React.Fragment) {
        traverse(child.props.children);
      } else {
        result.push(child);
      }
    }
  };
  traverse(children);
  return result;
};

const sanitizeKey = (key) => {
  if (typeof key !== "string") return key;
  let sanitized = key;
  if (sanitized.startsWith(".")) {
    const dollarIndex = sanitized.indexOf("$");
    if (dollarIndex !== -1) {
      sanitized = sanitized.slice(dollarIndex + 1);
    }
  }
  return sanitized.replace(/=2/g, ":").replace(/=0/g, "=");
};

const SelectContext = createContext(null);

const ChevronDown = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function Select({
  label,
  children,
  classNames = {},
  size = "md",
  radius = "md",
  isRequired,
  selectedKeys,
  onChange,
  onSelectionChange,
  placeholder,
  labelPlacement = "inside",
  variant = "flat",
  className,
  disallowEmptySelection,
  selectionMode = "single",
  inputProps,
  inputValue,
  isLoading,
  onOpenChange,
  startContent,
  endContent,
  isDisabled,
  scrollShadowProps,
  disableAnimation,
  disableSelectorIconRotation,
  defaultSelectedKeys,
  allowsCustomValue,
  menuTrigger,
  clearButtonProps,
  onPress,
  disabledKeys,
  name,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultSelectedKeys === "all"
      ? "all"
      : defaultSelectedKeys !== undefined
        ? new Set(defaultSelectedKeys)
        : new Set(),
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const value =
    selectedKeys === "all"
      ? "all"
      : selectedKeys !== undefined
        ? new Set(selectedKeys)
        : internalValue;
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const itemsArray =
    Array.isArray(props.items) && typeof children === "function"
      ? props.items.map((item) => children(item))
      : flattenChildren(children);

  const handleValueChange = (newValue) => {
    let newSet;
    if (selectionMode === "multiple") {
      newSet = new Set(value);
      if (newSet.has(newValue)) {
        if (!disallowEmptySelection || newSet.size > 1) {
          newSet.delete(newValue);
        }
      } else {
        newSet.add(newValue);
      }
    } else {
      if (value === "all" || (value instanceof Set && value.has(newValue))) {
        if (disallowEmptySelection) return;
        newSet = new Set();
      } else {
        newSet = new Set([newValue]);
      }
    }

    if (selectedKeys === undefined) {
      setInternalValue(newSet);
    }
    if (onSelectionChange) onSelectionChange(newSet);
    if (onChange) {
      onChange({ target: { name, value: Array.from(newSet).join(",") } });
    }
    if (selectionMode !== "multiple") {
      setIsOpen(false);
    }
  };

  let displayValue = [];
  itemsArray.forEach((child) => {
    const childValue =
      child.props.value !== undefined
        ? child.props.value
        : sanitizeKey(child.key);
    const childValueStr = String(childValue);

    if (
      value === "all" ||
      (value instanceof Set &&
        (value.has(childValue) || value.has(childValueStr)))
    ) {
      displayValue.push(child.props.children);
    }
  });
  const displayString = displayValue.join(", ");

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => Math.min(prev + 1, itemsArray.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else if (focusedIndex >= 0 && focusedIndex < itemsArray.length) {
        const item = itemsArray[focusedIndex];
        const val =
          item.props.value !== undefined
            ? item.props.value
            : sanitizeKey(item.key);
        handleValueChange(val);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const sizes = {
    sm: "h-8 min-h-8 px-2 text-sm",
    md: "h-10 min-h-10 px-3 text-sm",
    lg: "h-12 min-h-12 px-3 text-base",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const variants = {
    flat: "bg-default-100 border-transparent hover:bg-default-200 focus-within:bg-default-100",
    bordered:
      "bg-transparent border-default-200 border-2 hover:border-default-400 focus-within:border-foreground",
  };

  return (
    <SelectContext.Provider
      value={{
        isOpen,
        setIsOpen,
        value,
        onValueChange: handleValueChange,
        triggerRef,
        contentRef,
        focusedIndex,
        selectionMode,
      }}
    >
      <div
        data-slot="base"
        data-open={isOpen ? "true" : "false"}
        data-focus={isOpen ? "true" : "false"}
        className={twMerge(
          "flex flex-col gap-1 outline-none group",
          classNames.base,
          className,
        )}
        {...props}
      >
        {label && labelPlacement === "outside" && (
          <label
            data-slot="label"
            className={twMerge(
              "text-sm font-medium tracking-[0.125rem]",
              isRequired
                ? "after:content-['*'] after:text-danger after:ms-0.5"
                : "",
              classNames.label,
            )}
          >
            {label}
          </label>
        )}
        <div
          data-slot="trigger"
          data-open={isOpen ? "true" : "false"}
          data-focus={isOpen ? "true" : "false"}
          ref={triggerRef}
          tabIndex={isDisabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={props["aria-label"] || label || "Select"}
          onKeyDown={(e) => {
            if (!isDisabled) handleKeyDown(e);
          }}
          onClick={() => {
            if (!isDisabled) setIsOpen(!isOpen);
          }}
          className={twMerge(
            "relative flex items-center justify-between gap-2 px-3 outline-none transition-colors",
            isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            sizes[size] || sizes.md,
            radiuses[radius] || radiuses.md,
            variants[variant] || variants.flat,
            classNames.trigger,
          )}
        >
          {startContent && (
            <div className="flex-shrink-0" data-slot="start-content">
              {startContent}
            </div>
          )}
          <div
            data-slot="inner-wrapper"
            className={twMerge(
              "w-full h-full flex flex-col items-start justify-center flex-grow truncate gap-0.5",
              classNames.innerWrapper,
            )}
          >
            {label && labelPlacement === "inside" && (
              <span
                data-slot="label"
                className={twMerge(
                  "text-xs text-default-500 origin-top-left transition-all",
                  displayString || isOpen
                    ? "scale-100 translateY-0"
                    : "scale-100",
                  classNames.label,
                )}
              >
                {label} {isRequired && <span className="text-danger">*</span>}
              </span>
            )}
            <span
              data-slot="value"
              className={twMerge(
                "truncate",
                !displayString && "text-default-500",
                label &&
                  labelPlacement === "inside" &&
                  !displayString &&
                  !isOpen
                  ? "opacity-0"
                  : "opacity-100",
                classNames.value,
              )}
            >
              {displayString || placeholder}
            </span>
          </div>
          {endContent && (
            <div className="flex-shrink-0 z-10" data-slot="end-content">
              {endContent}
            </div>
          )}
          <ChevronDown
            data-slot="selector-icon"
            className={twMerge(
              "w-4 h-4 text-default-500 transition-transform hover:bg-default/40",
              classNames.selectorIcon,
              isOpen && "rotate-180",
            )}
          />
        </div>
        {mountedSelectMenu(itemsArray, classNames, scrollShadowProps)}
      </div>
    </SelectContext.Provider>
  );
}

function mountedSelectMenu(children, classNames, scrollShadowProps) {
  return (
    <SelectMenu classNames={classNames} scrollShadowProps={scrollShadowProps}>
      {children}
    </SelectMenu>
  );
}

function SelectMenu({ children, classNames, scrollShadowProps }) {
  const context = useContext(SelectContext);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(context?.isOpen || false);
  const [prevIsOpen, setPrevIsOpen] = useState(context?.isOpen || false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const scrollRef = useRef(null);

  if (context && context.isOpen !== prevIsOpen) {
    setPrevIsOpen(context.isOpen);
    if (context.isOpen) {
      setShouldRender(true);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setIsScrolledToBottom(
        Math.ceil(scrollTop + clientHeight) >= scrollHeight - 1,
      );
      setIsScrolledToTop(scrollTop <= 1);
    }
  };

  useEffect(() => {
    if (context?.isOpen && scrollRef.current) {
      handleScroll();

      const observer = new ResizeObserver(() => handleScroll());
      observer.observe(scrollRef.current);
      if (scrollRef.current.firstElementChild) {
        observer.observe(scrollRef.current.firstElementChild);
      }

      return () => observer.disconnect();
    }
  }, [context?.isOpen, children]);

  const { updatePosition } = useFloating({
    isOpen: context?.isOpen || false,
    setIsOpen: context?.setIsOpen || (() => {}),
    triggerRef: context?.triggerRef,
    contentRef: context?.contentRef,
  });

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

  const getMaskStyle = () => {
    if (!scrollShadowProps?.isEnabled) return {};

    let mask = "";
    if (!isScrolledToTop && !isScrolledToBottom) {
      mask =
        "linear-gradient(to bottom, transparent, #000 40px, #000 calc(100% - 40px), transparent)";
    } else if (!isScrolledToTop) {
      mask = "linear-gradient(to bottom, transparent, #000 40px, #000)";
    } else if (!isScrolledToBottom) {
      mask =
        "linear-gradient(to bottom, #000 0%, #000 calc(100% - 40px), transparent)";
    }

    if (!mask) return {};

    return {
      maskImage: mask,
      WebkitMaskImage: mask,
    };
  };

  if (!context) return null;
  if (!mounted || !shouldRender) return null;

  const style = getMaskStyle();

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
        "z-20 min-w-32 rounded-xl border border-border bg-popover text-popover-foreground p-1 shadow-md transition-opacity duration-200",
        context.isOpen
          ? "opacity-100 visible animate-in fade-in duration-200"
          : "opacity-0 invisible pointer-events-none",
        classNames?.popoverContent || classNames?.popover,
      )}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        data-slot="listbox-wrapper"
        style={getMaskStyle()}
        className={twMerge(
          "flex flex-col w-full !max-h-72 overflow-x-hidden overflow-y-auto",
          classNames?.listboxWrapper,
        )}
      >
        <div
          data-slot="listbox"
          role="listbox"
          className={twMerge("flex flex-col w-full", classNames?.list)}
        >
          {children.map((child, index) => {
            if (!React.isValidElement(child)) return child;
            const itemKey =
              child.props.value !== undefined
                ? child.props.value
                : sanitizeKey(child.key);
            return React.cloneElement(child, {
              index,
              itemKey,
              key: itemKey || index,
            });
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function SelectItem({
  children,
  className,
  value,
  index,
  startContent,
  endContent,
  description,
  textValue,
  itemKey,
  onPress,
  onClick,
  isDisabled,
  ...props
}) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const itemValue =
    itemKey !== undefined ? itemKey : value !== undefined ? value : props.key;
  const isSelected =
    context.value === "all" ||
    (context.value instanceof Set &&
      (context.value.has(itemValue) || context.value.has(String(itemValue))));
  const isFocused = context.focusedIndex === index;

  return (
    <div
      data-slot="item"
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected ? "true" : "false"}
      data-focus={isFocused ? "true" : "false"}
      className={twMerge(
        "flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-sm outline-none select-none transition-colors",
        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "cursor-pointer",
        isSelected ? "bg-default-200 text-foreground" : "text-foreground",
        isFocused && !isSelected && !isDisabled
          ? "bg-default-200"
          : !isDisabled && "hover:bg-default-100",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (isDisabled) return;
        context.onValueChange(itemValue);
        if (onPress) onPress(e);
        if (onClick) onClick(e);
      }}
      data-disabled={isDisabled ? "true" : "false"}
      {...props}
    >
      {startContent && (
        <div className="flex-shrink-0" data-slot="start-content">
          {startContent}
        </div>
      )}
      <div
        className="flex flex-col flex-grow truncate"
        data-slot="item-content"
      >
        <span className="truncate">{children}</span>
        {description && (
          <span
            className="text-xs text-default-400 truncate"
            data-slot="description"
          >
            {description}
          </span>
        )}
      </div>
      {endContent && (
        <div className="flex-shrink-0" data-slot="end-content">
          {endContent}
        </div>
      )}
      {isSelected && (
        <svg
          className="w-4 h-4 text-foreground shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}
