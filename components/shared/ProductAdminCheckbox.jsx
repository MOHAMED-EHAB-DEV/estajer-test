"use client";
import { Checkbox } from "@heroui/checkbox";

export default function ProductAdminCheckbox({
  product,
  onSelect,
  isSelected,
  isFirstSelected,
}) {
  return (
    <div className="absolute top-0 start-0 z-10 p-4">
      <Checkbox
        isSelected={isSelected || false}
        onValueChange={() => onSelect(product._id)}
        color={isFirstSelected ? "warning" : "primary"}
        size="lg"
        classNames={{
          base: `bg-white md:w-[40px] md:h-[40px] w-[35px] h-[35px] rounded shadow-lg flex rounded-xl  item-center justify-center`,
          wrapper: isFirstSelected
            ? "ring-2 ring-warning-400 bg-warning-500 !mx-0"
            : "!mx-0",
        }}
      />
    </div>
  );
}
