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
  const handleService = useCallback(({ value, service }) => {
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
  }, [setSelectedServices]);
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
              <div className="flex gap-2 bg-[#EAEEF3] py-1.5 px-2 rounded-full shrink-0">
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
        <div id="additional-services" className="pb-8 hidden md:block">
          <div className="text-darkNavy font-semibold text-[1rem] md:text-[1.7rem] lg:text-[1.7rem] font-IBMPlex mb-7">
            {t("additionalServices")}
          </div>
          {product.services.map((service, idx) => (
            <div
              key={service.id}
              className={`w-full flex items-end justify-between flex-wrap md:gap-4 gap-3 ${idx > 0 ? "md:mt-6 mt-4" : ""}`}
            >
              <span className="flex md:flex-col flex-wrap items-center md:items-start gap-2 md:gap-1 text-[0.8rem] md:text-[1.2rem] font-semibold text-gray-600">
                <span className="text-gray-800">{service.name}</span>
                <span className="text-primary text-[0.8rem] lg:text-[1rem]">
                  + {service.price} {t("currency")}
                </span>
              </span>
              <div className="flex ms-auto w-full md:gap-4 gap-2 bg-[#EAEEF3] py-2 md:px-3 px-2 rounded-full sm:w-60">
                <Button
                  onPress={() => handleService({ value: 1, service })}
                  className="min-w-14 px-0 md:w-16 md:h-11 w-12 h-8"
                >
                  <Plus className="md:w-5 md:h-5 w-[14px] h-[14px]" color="#fff" />
                </Button>
                <span className="w-full bg-transparent text-lg font-semibold items-center flex justify-center">
                  {selectedServices.find(({ id }) => id === service.id)
                    ?.quantity || 0}
                </span>
                <Button
                  onPress={() => handleService({ value: -1, service })}
                  className="min-w-14 px-0 md:w-16 md:h-11 w-12 h-8"
                >
                  <Minus className="md:w-5 md:h-5 w-[14px] h-[14px]" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <hr className="border md:mb-12 hidden md:block" />
      </>
    </>
  );
}
