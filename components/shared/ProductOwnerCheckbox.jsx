"use client";
import { Checkbox } from "@heroui/checkbox";

export default function ProductOwnerCheckbox({
  product,
  onSelect,
  isSelected,
}) {
  return (
    <div className="absolute top-0 start-0 z-10 md:p-4 p-2">
      <Checkbox
        isSelected={isSelected || false}
        onValueChange={() => onSelect(product._id)}
        color="warning"
        size="lg"
        classNames={{
          base: `bg-white rounded shadow-lg flex rounded-xl item-center justify-center scale-[0.85] md:scale-100 ${
            isSelected ? "ring-1 md:ring-2 ring-[#f48a42]" : ""
          }`,
          wrapper: isSelected
            ? "ring-1 md:ring-2 ring-[#f48a42] bg-[#f48a42] !mx-0"
            : "!mx-0",
        }}
      />
    </div>
  );
}
