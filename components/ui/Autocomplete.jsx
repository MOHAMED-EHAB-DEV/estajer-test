"use client";

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useDeferredValue,
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

const AutocompleteContext = createContext(null);

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

const CloseIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export function Autocomplete({
  label,
  children,
  classNames = {},
  size = "md",
  radius = "md",
  isRequired,
  selectedKey,
  onSelectionChange,
  onInputChange,
  placeholder,
  labelPlacement = "inside",
  variant = "flat",
  className,
  isClearable = true,
  inputProps,
  inputValue: externalInputValue,
  isLoading,
  onOpenChange,
  startContent,
  endContent,
  isDisabled,
  scrollShadowProps,
  disableAnimation,
  disableSelectorIconRotation,
  defaultSelectedKey,
  allowsCustomValue,
  menuTrigger,
  clearButtonProps,
  onPress,
  disabledKeys,
  defaultFilter,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalKey, setInternalKey] = useState(
    defaultSelectedKey !== undefined ? defaultSelectedKey : null,
  );
  const [inputValue, setInputValue] = useState(externalInputValue || "");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const deferredInputValue = useDeferredValue(inputValue);
  const valueKey = selectedKey !== undefined ? selectedKey : internalKey;
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const inputRef = useRef(null);

  const [lastPropagatedValue, setLastPropagatedValue] = useState(externalInputValue || "");

  // Sync with external controlled values
  useEffect(() => {
    if (externalInputValue !== undefined && externalInputValue !== lastPropagatedValue) {
      setInputValue(externalInputValue);
      setLastPropagatedValue(externalInputValue);
    }
  }, [externalInputValue]);

  // Use deferred value to prevent multiple events during rapid typing
  useEffect(() => {
    if (onInputChange && deferredInputValue !== externalInputValue) {
      setLastPropagatedValue(deferredInputValue);
      onInputChange(deferredInputValue);
    }
  }, [deferredInputValue]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  const parsedItems =
    Array.isArray(props.items) && typeof children === "function"
      ? props.items.map((item) => children(item))
      : flattenChildren(children).filter(
          (c) =>
            c?.type?.name === "AutocompleteItem" ||
            c?.type?.displayName === "AutocompleteItem",
        );

  // Sync input value with selected key when not typing
  useEffect(() => {
    if (valueKey !== null) {
      const selectedItem = parsedItems.find((item) => {
        const itemK =
          item.props.value !== undefined
            ? item.props.value
            : sanitizeKey(item.key);
        return itemK === valueKey;
      });
      if (selectedItem) {
        const text =
          selectedItem.props.textValue ||
          (typeof selectedItem.props.children === "string"
            ? selectedItem.props.children
            : valueKey);
        setInputValue(text);
      }
    }
  }, [valueKey]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val); // Instantly update internal state for responsive typing
    handleOpenChange(true);
    setFocusedIndex(-1); // reset focus on type
  };

  const handleSelection = (key, text) => {
    if (selectedKey === undefined) setInternalKey(key);
    setInputValue(text);
    handleOpenChange(false);
    if (onSelectionChange) onSelectionChange(key);
  };

  const handleClear = () => {
    setInputValue("");
    if (selectedKey === undefined) setInternalKey(null);
    if (onSelectionChange) onSelectionChange(null);
    inputRef.current?.focus();
  };

  const filteredItems = parsedItems.filter((item) => {
    if (defaultFilter) return defaultFilter(item.props.textValue || item.props.children || "");
    const text = item.props.children;
    // Handle complex children or simple strings
    const textToMatch =
      typeof text === "string" ? text : item.props.textValue || "";
    return textToMatch.toLowerCase().includes(deferredInputValue.toLowerCase());
  });

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        handleOpenChange(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) {
        handleOpenChange(true);
      } else if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
        const item = filteredItems[focusedIndex];
        const val =
          item.props.value !== undefined
            ? item.props.value
            : sanitizeKey(item.key);
        const text =
          item.props.textValue ||
          (typeof item.props.children === "string"
            ? item.props.children
            : item.key);
        handleSelection(val, text);
        if (item.props.onPress)
          item.props.onPress({ type: "keyboard", key: "Enter" });
        if (item.props.onClick)
          item.props.onClick({ type: "keyboard", key: "Enter" });
      }
    } else if (e.key === "Escape") {
      handleOpenChange(false);
    }
  };

  const sizes = {
    sm: "h-12 text-sm",
    md: "h-14 text-sm",
    lg: "h-16 text-base",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  };

  const variants = {
    flat: "bg-default-100 border-transparent hover:bg-default-200 focus-within:bg-default-100",
    bordered:
      "bg-transparent border-default-200 border-2 group-data-[focus=true]:border-primary hover:border-default-400",
  };

  const isOutside = labelPlacement === "outside";

  return (
    <AutocompleteContext.Provider
      value={{
        isOpen,
        setIsOpen: handleOpenChange,
        handleSelection,
        valueKey,
        triggerRef,
        contentRef,
        focusedIndex,
        isLoading,
      }}
    >
      <div
        data-slot="base"
        ref={triggerRef}
        className={twMerge(
          "w-full group outline-none flex flex-col gap-3",
          isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
          className,
        )}
        data-focus={isOpen || focusedIndex >= 0 ? "true" : "false"}
        data-open={isOpen ? "true" : "false"}
        data-invalid={props.isInvalid ? "true" : "false"}
        data-disabled={isDisabled ? "true" : "false"}
      >
        {label && isOutside && (
          <label
            className={twMerge(
              "text-sm font-medium",
              isRequired
                ? "after:content-['*'] after:text-danger after:ms-0.5"
                : "",
              props.isInvalid ? "text-danger" : "",
              classNames.label,
            )}
          >
            {label}
          </label>
        )}
        <div
          className={twMerge(
            "relative flex items-center gap-2 px-3.5 transition-all duration-200 bg-slate-50/50 border border-slate-200/80 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-500/5",
            sizes[size] || sizes.md,
            radiuses[radius] || radiuses.md,
            variants[variant] || variants.flat,
            isDisabled && "opacity-60 cursor-not-allowed",
            props.isInvalid &&
              "border-danger text-danger focus-within:border-danger hover:border-danger",
            classNames.inputWrapper,
            inputProps?.classNames?.inputWrapper,
          )}
          onClick={() => triggerRef.current?.querySelector("input")?.focus()}
        >
          {startContent && <div className="flex-shrink-0">{startContent}</div>}
          <div className="flex flex-col flex-grow w-full h-full justify-center">
            {label && !isOutside && (
              <label
                className={twMerge(
                  "text-xs text-default-500 origin-top-left transition-all",
                  inputValue ? "scale-100 translateY-0" : "scale-100",
                  isRequired
                    ? "after:content-['*'] after:text-danger after:ms-0.5 text-danger"
                    : "",
                  classNames.label,
                )}
              >
                {label}
              </label>
            )}
            <input
              type="text"
              className={twMerge(
                "w-full bg-transparent outline-none placeholder:text-default-500 disabled:cursor-not-allowed",
                label && !isOutside ? "text-sm" : "text-base",
                classNames.input,
                inputProps?.classNames?.input,
              )}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => handleOpenChange(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              required={isRequired}
              ref={inputRef}
              {...(() => {
                if (!inputProps) return {};
                const { classNames, ...rest } = inputProps;
                return rest;
              })()}
            />
          </div>
          {isClearable && !isLoading && inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-default-400 hover:text-default-500 transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
          <div data-slot="end-content" className="flex items-center gap-1">
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 text-default-400"
                xmlns="http://www.w3.org/2000/svg"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {endContent}
            <button
              type="button"
              data-slot="selector-button"
              data-open={isOpen ? "true" : "false"}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenChange(!isOpen);
              }}
              className={twMerge("outline-none p-1", classNames.selectorButton)}
              tabIndex={-1}
            >
              <ChevronDown
                className={twMerge(
                  "w-4 h-4 text-default-500 transition-transform",
                  isOpen ? "rotate-180" : "",
                )}
              />
            </button>
          </div>
        </div>
        {mountedSelectMenu(filteredItems, classNames)}
      </div>
    </AutocompleteContext.Provider>
  );
}

function mountedSelectMenu(filteredItems, classNames) {
  return (
    <AutocompleteMenu classNames={classNames}>{filteredItems}</AutocompleteMenu>
  );
}

function AutocompleteMenu({ children, classNames }) {
  const context = useContext(AutocompleteContext);
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

  if (!context) return null;
  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div
      ref={(node) => {
        context.contentRef.current = node;
        if (node && context.isOpen) {
          updatePosition();
        }
      }}
      style={{ position: "absolute", top: 0, left: 0 }}
      data-state={context.isOpen ? "open" : "closed"}
      className={twMerge(
        "z-30 min-w-32 overflow-x-hidden overflow-y-auto rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md text-slate-800 p-1.5 shadow-xl shadow-slate-200/80 ring-1 ring-black/5 transition-[opacity,transform,visibility] duration-200",
        context.isOpen
          ? "opacity-100 visible translate-y-0 animate-in fade-in slide-in-from-top-1 duration-200"
          : "opacity-0 invisible pointer-events-none translate-y-1",
        classNames?.popoverContent || classNames?.popover,
      )}
    >
      <div
        data-slot="listbox-wrapper"
        className={twMerge(
          "flex flex-col w-full",
          classNames?.listboxWrapper || classNames?.list,
        )}
      >
        <div data-slot="listbox" className="flex flex-col w-full">
          {children.length > 0 ? (
            children.map((child, index) => {
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
            })
          ) : context?.isLoading ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-start whitespace-nowrap flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-400 text-start whitespace-nowrap">
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AutocompleteItem({
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
  const context = useContext(AutocompleteContext);
  if (!context)
    throw new Error("AutocompleteItem must be used within Autocomplete");

  const itemVal = itemKey !== undefined ? itemKey : value;
  const isSelected = context.valueKey === itemVal;
  const isFocused = context.focusedIndex === index;

  return (
    <div
      data-slot="item"
      data-selected={isSelected ? "true" : "false"}
      data-focus={isFocused ? "true" : "false"}
      className={twMerge(
        "flex w-full items-center justify-between gap-2 rounded-xl py-2 px-3 text-sm outline-none select-none transition-all duration-150",
        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "cursor-pointer",
        isSelected || isFocused
          ? "bg-slate-200 text-slate-900 font-medium"
          : "text-slate-600",
        !isDisabled &&
          !(isSelected || isFocused) &&
          "hover:bg-slate-200 hover:text-slate-900",
        className,
      )}
      onClick={(e) => {
        if (isDisabled) return;
        context.handleSelection(
          itemVal,
          textValue || (typeof children === "string" ? children : itemVal),
        );
        if (onPress) onPress(e);
        if (onClick) onClick(e);
      }}
      data-disabled={isDisabled ? "true" : "false"}
      {...props}
    >
      <div className="flex items-center gap-2 flex-grow truncate">
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
      </div>
      {endContent && (
        <div className="flex-shrink-0" data-slot="end-content">
          {endContent}
        </div>
      )}
      {isSelected && (
        <svg
          className="w-4 h-4 flex-shrink-0 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}
