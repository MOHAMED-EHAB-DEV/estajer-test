import Button from "../ui/Button";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { Delete } from "../ui/svgs/icons/DeleteSvg";
import { Edit } from "../ui/svgs/icons/EditSvg";;
import { Money } from "../ui/svgs/OrdersSvg";

export default function ServiceItem({ service, index, onRemove, onEdit, t }) {
  return (
    <div className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow transition-all duration-300 hover:border-gray-200">
      {/* Service Number Badge */}
      <div className="absolute -top-3 -start-3 w-8 h-8 bg-gradient-to-br from-[#F48A42] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-sm font-bold">{index + 1}</span>
      </div>

      {/* Action Buttons */}

      <div className="flex items-start gap-4">
        {/* Service Icon */}
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-orange-600"
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
        <div className="mb-3">
          <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {service.nameAr}
          </h4>
          <p className="text-sm text-gray-500 line-clamp-1">{service.nameEn}</p>
        </div>
      </div>

      {/* Service Details */}
      <div className="md:ps-16 flex-1 min-w-0">
        {/* Service Name */}

        {/* Service Info Cards */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Price Card */}
          <div className="flex-grow flex items-center gap-1 min-w-36 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl py-2 px-3 border border-green-200">
            <div className="flex items-center gap-1">
              <Money size={16} color="#15803d" />
              <span className="text-green-700">
                {t("serviceItem.priceLabel")}
              </span>
            </div>
            <p className="text-lg font-bold text-green-800 mt-1 flex items-center gap-1">
              {service.price}
              <Currency size={16} color="#166534" />
            </p>
          </div>
          {/* Quantity Card */}
          <div className="flex-grow flex items-center gap-1 min-w-36 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl py-2 px-3 border border-blue-200">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-blue-600"
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
            <p className="text-lg font-bold text-blue-800 mt-1">
              {service.quantity}
            </p>
          </div>
          <div className="flex gap-2 transition-opacity duration-300">
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 min-w-0 shadow-xl transition-all duration-300"
              onPress={() => onEdit(service)}
            >
              <Edit color="white" size={16} />
            </Button>
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 min-w-0 shadow-lg transition-all duration-300"
              onPress={() => onRemove(service.id)}
            >
              <Delete fill="white" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
