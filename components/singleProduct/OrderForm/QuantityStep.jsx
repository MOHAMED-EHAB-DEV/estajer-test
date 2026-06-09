import { useCallback } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import Button from "../../ui/Button";
import { Minus } from "../../ui/svgs/icons/MinusSvg";
import { Plus } from "../../ui/svgs/icons/PlusSvg";

export default function QuantityStep({
  quantity,
  setQuantity,
  product,
  quantityError,
  setQuantityError,
  t,
  lang,
}) {
  const handleQuantityChange = useCallback(
    (val) => {
      const next = quantity + val;
      const min = product.minQuantity || 1;
      if (next > product.quantity)
        return toast.warning(
          ToastMessage(
            t("toast.maxQuantity").replace("{quantity}", product.quantity),
          ),
        );
      setQuantityError(
        next < min ? t("minQuantity").replace("{min}", min) : "",
      );
      if (next >= 1 && next <= product.quantity) setQuantity(next);
    },
    [quantity, product, t, lang, setQuantity, setQuantityError],
  );
  return (
    <>
      {/* Mobile layout */}
      <div className="space-y-4 md:hidden">
        <p className="text-sm font-semibold text-gray-500 text-center uppercase tracking-wider">
          {t("quantity")}
        </p>
        <div className="flex gap-4 justify-between bg-[#EAEEF3] py-3 px-5 rounded-full">
          <Button
            aria-label="+"
            className="min-w-[4rem] h-10"
            onPress={() => handleQuantityChange(1)}
          >
            <Plus className="w-4 h-4" color="#fff" />
          </Button>
          <span className="w-16 text-center text-xl font-bold text-darkNavy flex items-center justify-center">
            {quantity}
          </span>
          <Button
            aria-label="-"
            className="min-w-[4rem] h-10"
            onPress={() => handleQuantityChange(-1)}
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
        {quantityError && (
          <p className="text-red-500 text-sm text-center">{quantityError}</p>
        )}
      </div>

      {/* Desktop layout */}
      <div
        id="quantity-selector"
        className="hidden md:flex flex-wrap gap-2 md:pt-8 pt-4 justify-between items-center w-full"
      >
        <span className="text-[1rem] md:text-[1.5rem] lg:text-[1.6rem] font-IBMPlex font-semibold">
          {t("quantity")}
        </span>
        <div className="flex gap-4 justify-center bg-[#EAEEF3] py-2 px-4 rounded-full w-full sm:w-80">
          <Button
            aria-label="Increase quantity"
            className="md:min-w-[5rem] min-w-[4.2rem] h-10 md:h-12"
            onPress={() => handleQuantityChange(1)}
          >
            <Plus className="lg:w-5 lg:h-5 w-[14px] h-[14px]" color="#fff" />
          </Button>
          <span className="w-full bg-transparent text-darkNavy text-[1.2rem] md:text-[1.5rem] font-semibold items-center flex justify-center">
            {quantity}
          </span>
          <Button
            aria-label="Decrease quantity"
            className="md:min-w-[5rem] min-w-[4.2rem] h-10 md:h-12"
            onPress={() => handleQuantityChange(-1)}
          >
            <Minus className="lg:w-5 lg:h-5 w-[14px] h-[14px]" />
          </Button>
        </div>
      </div>
    </>
  );
}
