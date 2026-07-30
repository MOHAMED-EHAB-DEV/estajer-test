import { useCallback } from "react";
import Button from "../../ui/Button";
import { Minus } from "../../ui/svgs/icons/MinusSvg";
import { Plus } from "../../ui/svgs/icons/PlusSvg";

export default function ServicesStep({
  product,
  selectedServices,
  setSelectedServices,
  t,
}) {
  const handleService = useCallback(
    ({ value, service }) => {
      setSelectedServices((prev) => {
        const existing = prev.find((s) => s.id === service.id);
        return existing
          ? [
              ...prev.filter((s) => s.id !== service.id),
              ...(existing.quantity + value < 1
                ? []
                : [{ ...service, quantity: existing.quantity + value }]),
            ]
          : [...prev, ...(value < 1 ? [] : [{ ...service, quantity: 1 }])];
      });
    },
    [setSelectedServices],
  );
  return (
    <>
      {/* Mobile layout */}
      <div className="space-y-4 md:hidden">
        <p className="text-sm font-semibold text-gray-500 text-center uppercase tracking-wider">
          {t("additionalServices")}
        </p>
        <div className="flex flex-col gap-4">
          {product.services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex flex-col text-sm font-semibold text-gray-700">
                <span>{service.name}</span>
                <span className="text-primary text-xs">
                  + {service.price} {t("currency")}
                </span>
              </span>
              <div className="flex gap-2 bg-surfaceBlue py-1.5 px-2 rounded-full shrink-0">
                <Button
                  onPress={() => handleService({ value: 1, service })}
                  className="min-w-10 h-8 px-0"
                >
                  <Plus className="w-3.5 h-3.5" color="#fff" />
                </Button>
                <span className="w-8 text-center font-semibold flex items-center justify-center text-sm">
                  {selectedServices.find(({ id }) => id === service.id)
                    ?.quantity || 0}
                </span>
                <Button
                  onPress={() => handleService({ value: -1, service })}
                  className="min-w-10 h-8 px-0"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop layout */}
      <>
        <div id="additional-services" className="pb-6 hidden md:block">
          <div className="text-darkNavy font-semibold text-0.95 md:text-[1.4rem] lg:text-[1.5rem] font-IBMPlex mb-5">
            {t("additionalServices")}
          </div>
          {product.services.map((service, idx) => (
            <div
              key={service.id}
              className={`w-full flex items-end justify-between flex-wrap md:gap-3 gap-3 ${idx > 0 ? "md:mt-5 mt-4" : ""}`}
            >
              <span className="flex md:flex-col flex-wrap items-center md:items-start gap-2 md:gap-1 text-0.8 md:text-1.1 font-semibold text-gray-600">
                <span className="text-gray-800">{service.name}</span>
                <span className="text-primary text-0.8 lg:text-0.95">
                  + {service.price} {t("currency")}
                </span>
              </span>
              <div className="flex ms-auto w-full md:gap-3 gap-2 bg-surfaceBlue py-1.5 md:px-2.5 px-2 rounded-full sm:w-56">
                <Button
                  onPress={() => handleService({ value: 1, service })}
                  className="min-w-10 px-0 md:w-14 md:h-10 w-12 h-8"
                >
                  <Plus
                    className="md:w-4 md:h-4 w-[14px] h-[14px]"
                    color="#fff"
                  />
                </Button>
                <span className="w-full bg-transparent text-base md:text-1.1 font-semibold items-center flex justify-center">
                  {selectedServices.find(({ id }) => id === service.id)
                    ?.quantity || 0}
                </span>
                <Button
                  onPress={() => handleService({ value: -1, service })}
                  className="min-w-10 px-0 md:w-14 md:h-10 w-12 h-8"
                >
                  <Minus className="md:w-4 md:h-4 w-[14px] h-[14px]" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <hr className="border md:mb-8 hidden md:block" />
      </>
    </>
  );
}
