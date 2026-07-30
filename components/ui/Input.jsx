"use client";

import React, { useRef, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

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

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  size = "md",
  radius = "md",
  variant = "flat",
  labelPlacement = "inside",
  isRequired,
  isDisabled,
  isInvalid,
  errorMessage,
  classNames = {},
  startContent,
  endContent,
  className,
  inputProps,
  inputValue,
  isLoading,
  onOpenChange,
  isClearable,
  onClear,
  onValueChange,
  defaultValue,
  validate,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const [nativeError, setNativeError] = useState(null);
  const [isTouched, setIsTouched] = useState(false);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (
      currentValue === "" ||
      currentValue === undefined ||
      currentValue === null
    ) {
      setIsTouched(false);
    }
  }, [currentValue]);

  const textLength = currentValue ? String(currentValue).length : 0;
  const isMinError =
    isTouched &&
    props.minLength &&
    textLength > 0 &&
    textLength < props.minLength;
  const isMaxError =
    isTouched && props.maxLength && textLength > props.maxLength;
  const customError = isTouched && validate ? validate(currentValue) : null;
  const computedIsInvalid =
    isInvalid || isMinError || isMaxError || !!nativeError || !!customError;

  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    if (customError) return customError;
    if (nativeError) return nativeError;
    const isRtl = props.dir === "rtl";
    if (isMinError)
      return isRtl
        ? `يجب أن يتكون من ${props.minLength} أحرف على الأقل`
        : `Must be at least ${props.minLength} characters`;
    if (isMaxError)
      return isRtl
        ? `يجب ألا يتجاوز ${props.maxLength} حرفًا`
        : `Cannot exceed ${props.maxLength} characters`;
    return null;
  };
  const computedErrorMessage = getErrorMessage();

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    if (onClear) onClear();
    if (onValueChange) onValueChange("");
    if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  const handleChange = (e) => {
    setNativeError(null);
    if (!isControlled) setInternalValue(e.target.value);
    if (onChange) onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  const handleInvalid = (e) => {
    e.preventDefault();
    setIsTouched(true);
    const validity = e.target.validity;

    let msg = "";
    if (validity.valueMissing) {
      msg = "This field is required";
    } else if (validity.tooShort) {
      msg = `Must be at least ${props.minLength} characters`;
    } else if (validity.tooLong) {
      msg = `Cannot exceed ${props.maxLength} characters`;
    } else if (validity.typeMismatch) {
      msg = "Invalid format";
    } else {
      msg = e.target.validationMessage;
    }
    setNativeError(msg);

    const form = e.target.form;
    if (form) {
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid === e.target) {
        e.target.scrollIntoView({ block: "center" });
        e.target.focus({ preventScroll: true });
      }
    }
  };

  const sizes = {
    sm: "h-12 text-sm", // container height
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
    flat: "bg-default-100 border-transparent focus-within:bg-default-200",
    bordered:
      "bg-transparent border-default-200 border-2 group-data-[focus=true]:border-primary hover:border-default-400",
  };

  const isOutside = labelPlacement === "outside";

  return (
    <div
      className={twMerge(
        "flex flex-col gap-3 w-full group",
        isDisabled && "opacity-60 cursor-not-allowed",
        classNames.base,
        className,
      )}
      data-focus={isFocused ? "true" : "false"}
    >
      {label && isOutside && (
        <label
          className={twMerge(
            "text-sm font-medium",
            isRequired
              ? "after:content-['*'] after:text-danger after:ms-0.5"
              : "",
            nativeError || isMinError || isMaxError ? "text-danger" : "",
            classNames.label,
          )}
        >
          {label}
        </label>
      )}
      <div
        className={twMerge(
          "relative flex items-center gap-3 px-3 transition-colors",
          sizes[size] || sizes.md,
          radiuses[radius] || radiuses.md,
          variants[variant] || variants.flat,
          computedIsInvalid &&
            "border-danger text-danger focus-within:border-danger hover:border-danger",
          classNames.inputWrapper,
          nativeError || isMinError || isMaxError ? "bg-danger-50" : "",
        )}
      >
        {startContent && <div className="flex-shrink-0">{startContent}</div>}
        <div className="flex flex-col flex-grow w-full h-full justify-center">
          {label && !isOutside && (
            <label
              className={twMerge(
                "text-xs text-default-500 origin-top-left transition-all",
                value ? "scale-100 translateY-0" : "scale-100",
                isRequired
                  ? "after:content-['*'] after:text-danger after:ms-0.5 text-danger"
                  : "",
                classNames.label,
              )}
            >
              {label} {isRequired && <span className="text-danger">*</span>}
            </label>
          )}
          <input
            type={type}
            value={currentValue}
            onChange={handleChange}
            onInvalid={handleInvalid}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setIsTouched(true);
              props.onBlur?.(e);
            }}
            disabled={isDisabled}
            required={isRequired}
            placeholder={placeholder}
            className={twMerge(
              "w-full bg-transparent outline-none placeholder:text-default-500",
              label && !isOutside ? "h-5" : "h-full",
              classNames.input,
            )}
            {...props}
          />
        </div>
        {isClearable && currentValue && (
          <button
            type="button"
            className="flex-shrink-0 outline-none text-default-400 hover:text-default-600 focus-visible:text-default-600 transition-colors"
            onClick={handleClear}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
        {endContent && <div className="flex-shrink-0">{endContent}</div>}
      </div>
      {computedIsInvalid && computedErrorMessage && (
        <div
          className={twMerge(
            "text-xs text-danger px-1 -mt-2",
            classNames.errorMessage,
          )}
        >
          {computedErrorMessage}
        </div>
      )}
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  size = "md",
  radius = "md",
  variant = "flat",
  labelPlacement = "inside",
  isRequired,
  isDisabled,
  isInvalid,
  errorMessage,
  classNames = {},
  className,
  inputProps,
  inputValue,
  isLoading,
  onOpenChange,
  startContent,
  endContent,
  isClearable,
  onClear,
  onValueChange,
  defaultValue,
  minRows = 1,
  maxRows = 10,
  validate,
  ...props
}) {
  const textareaRef = useRef(null);
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const [nativeError, setNativeError] = useState(null);
  const [numOfRows, setNumOfRows] = useState(minRows);
  const [isTouched, setIsTouched] = useState(false);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    const text = String(currentValue || "");
    const currentLineCount = (text.match(/\n/g) || []).length + 1;
    let nextRows = currentLineCount;
    if (nextRows < minRows) nextRows = minRows;
    if (nextRows > maxRows) nextRows = maxRows;
    setNumOfRows(nextRows);
  }, [currentValue, minRows, maxRows]);

  useEffect(() => {
    if (
      currentValue === "" ||
      currentValue === undefined ||
      currentValue === null
    ) {
      setIsTouched(false);
    }
  }, [currentValue]);

  const textLength = currentValue ? String(currentValue).length : 0;
  const isMinError =
    isTouched &&
    props.minLength &&
    textLength > 0 &&
    textLength < props.minLength;
  const isMaxError =
    isTouched && props.maxLength && textLength > props.maxLength;
  const customError = isTouched && validate ? validate(currentValue) : null;
  const computedIsInvalid =
    isInvalid || isMinError || isMaxError || !!nativeError || !!customError;

  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    if (customError) return customError;
    if (nativeError) return nativeError;
    const isRtl = props.dir === "rtl";
    if (isMinError)
      return isRtl
        ? `يجب أن يتكون من ${props.minLength} أحرف على الأقل`
        : `Must be at least ${props.minLength} characters`;
    if (isMaxError)
      return isRtl
        ? `يجب ألا يتجاوز ${props.maxLength} حرفًا`
        : `Cannot exceed ${props.maxLength} characters`;
    return null;
  };
  const computedErrorMessage = getErrorMessage();

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    if (onClear) onClear();
    if (onValueChange) onValueChange("");
    if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  const handleChange = (e) => {
    setNativeError(null);
    const text = e.target.value;
    const currentLineCount = (text.match(/\n/g) || []).length + 1;
    let nextRows = currentLineCount;
    if (nextRows < minRows) nextRows = minRows;
    if (nextRows > maxRows) nextRows = maxRows;
    setNumOfRows(nextRows);
    if (!isControlled) setInternalValue(text);
    if (onChange) onChange(e);
    if (onValueChange) onValueChange(text);
  };

  const handleInvalid = (e) => {
    e.preventDefault();
    setIsTouched(true);
    const isRtl = props.dir === "rtl";
    const validity = e.target.validity;

    let msg = "";
    if (validity.valueMissing) {
      msg = "This field is required";
    } else if (validity.tooShort) {
      msg = `Must be at least ${props.minLength} characters`;
    } else if (validity.tooLong) {
      msg = `Cannot exceed ${props.maxLength} characters`;
    } else if (validity.typeMismatch) {
      msg = "Invalid format";
    } else {
      msg = e.target.validationMessage;
    }
    setNativeError(msg);

    const form = e.target.form;
    if (form) {
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid === e.target) {
        e.target.scrollIntoView({ block: "center" });
        e.target.focus({ preventScroll: true });
      }
    }
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  };

  const variants = {
    flat: "bg-default-100 border-transparent focus-within:bg-default-200",
    bordered:
      "bg-transparent border-default-200 border-2 group-data-[focus=true]:border-primary hover:border-default-400",
  };

  const isOutside = labelPlacement === "outside";

  return (
    <div
      className={twMerge(
        "flex flex-col gap-1 w-full group",
        isDisabled && "opacity-60 cursor-not-allowed",
        classNames.base,
        className,
      )}
      data-focus={isFocused ? "true" : "false"}
    >
      {label && isOutside && (
        <label
          className={twMerge(
            "text-sm font-medium",
            isRequired
              ? "after:content-['*'] after:text-danger after:ms-0.5"
              : "",
            nativeError || isMinError || isMaxError ? "text-danger" : "",
            classNames.label,
          )}
        >
          {label}
        </label>
      )}
      <div
        className={twMerge(
          "relative flex flex-col px-3 py-2 transition-colors bg-[#f4f4f5]",
          radiuses[radius] || radiuses.md,
          variants[variant] || variants.flat,
          computedIsInvalid &&
            "border-danger focus-within:border-danger hover:border-danger",
          classNames.inputWrapper,
          nativeError || isMinError || isMaxError ? "bg-danger-50" : "",
        )}
      >
        {label && !isOutside && (
          <label
            className={twMerge(
              "text-xs text-default-500 mb-1",
              isRequired
                ? "after:content-['*'] after:text-danger after:ms-0.5"
                : "",
              classNames.label,
              nativeError || isMinError || isMaxError ? "text-danger" : "",
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          style={{ height: `${numOfRows * 1.6}rem` }}
          value={currentValue}
          onChange={handleChange}
          onInvalid={handleInvalid}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setIsTouched(true);
            props.onBlur?.(e);
          }}
          disabled={isDisabled}
          required={isRequired}
          placeholder={placeholder}
          className={twMerge(
            "w-full bg-transparent outline-none resize-none placeholder:text-default-500 transition-all duration-200 ease-in-out",
            size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm",
            classNames.input,
            maxRows <= 7 ? "overflow-y-hidden" : "",
          )}
          {...props}
        />
        {isClearable && currentValue && (
          <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              className="p-1 outline-none text-default-400 hover:text-default-600 transition-colors"
              onClick={handleClear}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {computedIsInvalid && computedErrorMessage && (
        <div
          className={twMerge(
            "text-xs text-danger px-1",
            classNames.errorMessage,
          )}
        >
          {computedErrorMessage}
        </div>
      )}
    </div>
  );
}
