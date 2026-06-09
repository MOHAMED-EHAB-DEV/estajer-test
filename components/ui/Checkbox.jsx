"use client";
import { extendVariants } from "@heroui/system";
import { Checkbox as NextUiCheckbox } from "@heroui/checkbox";

const Checkbox = extendVariants(NextUiCheckbox, {
  variants: {
    size: {},
  },
  defaultVariants: {
    size: "lg",
    className: "checkbox-xl",
  },
});
export default Checkbox;
