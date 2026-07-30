import Button from "../ui/Button";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { Delete } from "../ui/svgs/icons/DeleteSvg";
import { Edit } from "../ui/svgs/icons/EditSvg";;
import { Money } from "../ui/svgs/OrdersSvg";

export default function ServiceItem({ service, index, onRemove, onEdit, t }) {
  return (
    <div className="group relative bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm hover:shadow transition-all duration-300 hover:border-gray-200">
      {/* Service Number Badge */}
      <div className="absolute -top-2.5 -start-2.5 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-xs md:text-sm font-bold">{index + 1}</span>
      </div>

      {/* Action Buttons */}

      <div className="flex items-start gap-2.5 md:gap-4">
        {/* Service Icon */}
        <div className="w-9 h-9 md:w-12 md:h-12 bg-orange-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 md:w-6 md:h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <div className="mb-2 md:mb-3">
          <h4 className="text-sm md:text-lg font-semibold text-gray-900 line-clamp-1">
            {service.nameAr}
          </h4>
          <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{service.nameEn}</p>
        </div>
      </div>

      {/* Service Details */}
      <div className="md:ps-16 flex-1 min-w-0">
        {/* Service Info Cards */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Price Card */}
          <div className="flex-grow flex items-center gap-1 min-w-28 md:min-w-36 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl py-1.5 md:py-2 px-2.5 md:px-3 border border-green-200">
            <div className="flex items-center gap-1 text-xs md:text-sm">
              <Money className="w-3.5 h-3.5 md:w-4 md:h-4" color="#15803d" />
              <span className="text-green-700">
                {t("serviceItem.priceLabel")}
              </span>
            </div>
            <p className="text-sm md:text-lg font-bold text-green-800 mt-0.5 md:mt-1 flex items-center gap-1">
              {service.price}
              <Currency className="w-3.5 h-3.5 md:w-4 md:h-4" color="#166534" />
            </p>
          </div>
          {/* Quantity Card */}
          <div className="flex-grow flex items-center gap-1 min-w-28 md:min-w-36 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl py-1.5 md:py-2 px-2.5 md:px-3 border border-blue-200">
            <div className="flex items-center gap-1 text-xs md:text-sm">
              <svg
                className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
              <span className="text-blue-700">
                {t("serviceItem.quantityLabel")}
              </span>
            </div>
            <p className="text-sm md:text-lg font-bold text-blue-800 mt-0.5 md:mt-1">
              {service.quantity}
            </p>
          </div>
          <div className="flex gap-1.5 md:gap-2 transition-opacity duration-300">
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-3 md:px-6 min-w-0 shadow-xl transition-all duration-300 text-xs md:text-sm"
              onPress={() => onEdit(service)}
            >
              <Edit color="white" className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 md:px-6 min-w-0 shadow-lg transition-all duration-300 text-xs md:text-sm"
              onPress={() => onRemove(service.id)}
            >
              <Delete fill="white" className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
