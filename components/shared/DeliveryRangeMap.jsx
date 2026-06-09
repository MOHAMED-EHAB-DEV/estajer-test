"use client";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Currency } from "../ui/svgs/icons/CurrencySvg";;
import MapProvider from "./MapProvider";

const DeliveryRangeMap = ({ productLocation, translate, cost }) => {
  const t = useTranslations(translate);
  const deliveryRanges = [
    { distance: 5, color: "#4CAF50", label: "5 كم", price: 5 * cost },
    { distance: 10, color: "#d6c317", label: "10 كم", price: 10 * cost },
    { distance: 20, color: "#FF9800", label: "20 كم", price: 20 * cost },
    { distance: 50, color: "#FF5252", label: "50 كم", price: 50 * cost },
  ];

  const calculatePosition = (center, distanceKm, direction) => {
    const earthRadius = 6371;
    const distanceRadians = distanceKm / earthRadius;
    const lat1 = center.lat * (Math.PI / 180);
    const lng1 = center.lng * (Math.PI / 180);
    const bearing = direction * (Math.PI / 180);
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceRadians) +
        Math.cos(lat1) * Math.sin(distanceRadians) * Math.cos(bearing),
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(distanceRadians) * Math.cos(lat1),
        Math.cos(distanceRadians) - Math.sin(lat1) * Math.sin(lat2),
      );
    return { lat: lat2 * (180 / Math.PI), lng: lng2 * (180 / Math.PI) };
  };

  return (
    <MapProvider>
      <div className="w-full h-[600px] relative">
        <Map
          defaultCenter={productLocation}
          defaultZoom={11}
          mapId="delivery-range-map"
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          className="w-full h-full rounded-lg"
        >
          {/* Product marker */}
          {deliveryRanges.map((range) => (
            <AdvancedMarker
              key={range.distance}
              position={calculatePosition(productLocation, range.distance, 90)}
            >
              <div
                className="relative flex items-center gap-1 bg-white  px-4 py-2 font-IBMPlex rounded-full text-base shadow-lg cursor-pointer transition-transform hover:scale-110 -translate-y-2"
                style={{
                  borderColor: range.color,
                  color: range.color,
                  borderWidth: "2px",
                }}
              >
                {range.price} <Currency color={range.color} size={16} />
                <svg
                  className=" absolute top-full left-1/2 -translate-x-1/2"
                  viewBox="422.639 234.5 19 11"
                  width="20px"
                  height="14px"
                >
                  <path
                    d="M 422.639 233.332 L 432.139 244.332 L 441.639 233.332"
                    stroke={range.color}
                    fill="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </AdvancedMarker>
          ))}
          <AdvancedMarker position={productLocation}>
            <img
              src={anyImgUrl({
                src: "wmremove-transformed_lvrf62_cukmhr",
                size: 100,
              })}
              width={60}
              draggable={false}
              alt="marker"
            />
          </AdvancedMarker>
        </Map>

        <div className="absolute bottom-4 right-4 bg-white py-3 rounded-md shadow-md min-w-40 px-4 space-y-1">
          <div className="text-sm font-semibold mb-1">
            {"المسافة بين المنتج والمستأجر" || t("delivery_ranges")}
          </div>
          {deliveryRanges.map((range) => (
            <div
              key={range.distance}
              className="flex gap-1 items-center text-sm"
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: range.color }}
              ></div>
              <span>{range.label}</span>
            </div>
          ))}
        </div>
      </div>
    </MapProvider>
  );
};

export default DeliveryRangeMap;
