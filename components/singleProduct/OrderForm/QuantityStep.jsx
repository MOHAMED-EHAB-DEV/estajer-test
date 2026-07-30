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
  trans,
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
        <div className="text-center">
          {product.saleUnit && (
            <p className="text-xs text-primary font-semibold mb-1">
              {trans("saleUnit")}: {trans(`unit.${product.saleUnit}`)}
            </p>
          )}
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {t("quantity")}
          </p>
        </div>
        <div className="flex gap-4 justify-between bg-surfaceBlue py-3 px-5 rounded-full">
          <Button
            aria-label="Decrease quantity"
            className="min-w-[4rem] h-10"
            onPress={() => handleQuantityChange(-1)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-16 text-center text-xl font-bold text-darkNavy flex items-center justify-center">
            {quantity}
          </span>
          <Button
            aria-label="Increase quantity"
            className="min-w-[4rem] h-10"
            onPress={() => handleQuantityChange(1)}
          >
            <Plus className="w-4 h-4" color="#fff" />
          </Button>
        </div>
        {quantityError && (
          <p className="text-red-500 text-sm text-center">{quantityError}</p>
        )}
      </div>

      {/* Desktop layout */}
      <div
        id="quantity-selector"
        className="hidden md:flex flex-wrap gap-2 md:pt-6 pt-4 justify-between items-center w-full"
      >
        <div className="flex flex-col text-start">
          {product.saleUnit && (
            <span className="text-xs md:text-sm text-primary font-semibold">
              {trans("saleUnit")}: {trans(`unit.${product.saleUnit}`)}
            </span>
          )}
          <span className="text-[1rem] md:text-1.35 lg:text-[1.45rem] font-IBMPlex font-semibold">
            {t("quantity")}
          </span>
        </div>
        <div className="flex gap-4 justify-center bg-surfaceBlue py-2 px-4 rounded-full w-full sm:w-72">
          <Button
            aria-label="Decrease quantity"
            className="md:min-w-[4.6rem] min-w-[4.2rem] h-11"
            onPress={() => handleQuantityChange(-1)}
          >
            <Minus className="lg:w-4 lg:h-4 w-[14px] h-[14px]" />
          </Button>
          <span className="w-full bg-transparent text-darkNavy text-1.2 md:text-1.35 font-semibold items-center flex justify-center">
            {quantity}
          </span>
          <Button
            aria-label="Increase quantity"
            className="md:min-w-[4.6rem] min-w-[4.2rem] h-11"
            onPress={() => handleQuantityChange(1)}
          >
            <Plus className="lg:w-4 lg:h-4 w-[14px] h-[14px]" color="#fff" />
          </Button>
        </div>
      </div>
    </>
  );
}
