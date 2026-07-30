"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useState, useCallback, useRef, useEffect } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Autocomplete, AutocompleteItem } from "@/components/ui/Autocomplete";
import Button from "../ui/Button";
import MapProvider from "../shared/MapProvider";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 24.8, lng: 46.7 };

export default function MapPage({
  lang,
  address,
  setAddress,
  emptyLocation,
  markerPosition,
  setMarkerPosition,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.location.${key}`);

  const initialFullAddress = [
    address?.neighborhood,
    address?.city,
    address?.governorate,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  // State for single address input
  const [fullAddressInput, setFullAddressInput] = useState(initialFullAddress);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  useEffect(() => {
    const formatted = [
      address?.neighborhood,
      address?.city,
      address?.governorate,
      address?.country,
    ]
      .filter(Boolean)
      .join(", ");
    setFullAddressInput(formatted);
  }, [
    address?.neighborhood,
    address?.city,
    address?.governorate,
    address?.country,
  ]);

  const [center, setCenter] = useState(defaultCenter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    if (markerPosition?.lat && markerPosition?.lng) {
      setCenter(markerPosition);
      const map = mapRef?.current?.map || mapRef?.current;
      if (map && typeof map.setCenter === "function") {
        map.setCenter(markerPosition);
        map.setZoom(14);
      }
    }
  }, [markerPosition?.lat, markerPosition?.lng]);

  const setLocationPlace = useCallback(
    (addressComponents) => {
      const addressUpdates = {};
      const typeToField = {
        country: "country",
        administrative_area_level_1: "governorate",
        administrative_area_level_2: "city",
        locality: "city",
        neighborhood: "neighborhood",
        sublocality_level_1: "neighborhood",
        administrative_area_level_3: "neighborhood",
      };

      addressComponents?.forEach((component) => {
        const { types, long_name } = component;
        const componentType = types.find((type) => typeToField[type]);
        if (componentType) {
          const field = typeToField[componentType];
          // Prefer more specific types if multiple are present (e.g., admin_area_2 over locality)
          if (!addressUpdates[field]) {
            addressUpdates[field] = long_name;
          }
        }
      });

      let finalCity = addressUpdates.city || "";
      if (finalCity) {
        finalCity = finalCity
          .replace(/^(إمارة منطقة|امارة منطقة|منطقة|إمارة|امارة)\s+/, "")
          .replace(/\s+(Province|Region|Governorate)$/i, "")
          .trim();
      }
      addressUpdates.city = finalCity;

      setAddress({ ...emptyLocation, ...addressUpdates });
    },
    [setAddress, emptyLocation],
  );

  const fetchSuggestions = useCallback(
    async (input) => {
      if (!input) {
        setAddressSuggestions([]);
        return;
      }
      setAddressLoading(true);
      try {
        const response = await fetch(
          `/api/geocode/autocomplete?input=${encodeURIComponent(
            input,
          )}&lang=${lang}`,
        );
        const data = await response.json();
        if (data.predictions) {
          setAddressSuggestions(data.predictions);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setAddressLoading(false);
      }
    },
    [lang],
  );

  useEffect(() => {
    if (!isAddressOpen) return;
    const handler = setTimeout(() => fetchSuggestions(fullAddressInput), 400);
    return () => clearTimeout(handler);
  }, [fullAddressInput, isAddressOpen, fetchSuggestions]);

  const getAddressFromCoordinates = useCallback(
    async (location) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/geocode/reverse?lat=${location.lat}&lng=${location.lng}&lang=${lang}`,
        );
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          const result = data.results[0];
          setFullAddressInput(result.formatted_address);
          setLocationPlace(result.address_components);
        } else {
          setAddress(emptyLocation);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setAddress(emptyLocation);
      } finally {
        setIsLoading(false);
      }
    },
    [lang, setLocationPlace, emptyLocation, setAddress],
  );

  const handlePlaceSelect = async (selectedAddress) => {
    if (!selectedAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/geocode/search?address=${encodeURIComponent(
          selectedAddress,
        )}&lang=${lang}`,
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        const newPosition = { lat: location.lat, lng: location.lng };

        setCenter(newPosition);
        setMarkerPosition(newPosition);
        const typeToField = {
          administrative_area_level_2: "city",
          locality: "city",
        };
        const hasCity = result.address_components?.some((comp) =>
          comp.types.some((type) => typeToField[type]),
        );

        if (!hasCity) {
          await getAddressFromCoordinates(newPosition);
        } else {
          setLocationPlace(result.address_components);
        }

        const map = mapRef?.current?.map;
        if (map) map.setCenter(newPosition);
        if (map) map.setZoom(14);
      } else {
        setError(t("searchError"));
      }
    } catch (err) {
      setError(t("errorSearching"));
      console.error("Geocoding error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handlePlaceSelect(fullAddressInput);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);

      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userLocation);
          setMarkerPosition(userLocation);
          const map = mapRef?.current?.map;
          if (map) map.setCenter(userLocation);
          if (map) map.setZoom(14);
          getAddressFromCoordinates(userLocation);
          setIsLoading(false);
        },
        (error) => {
          setError(t("locationError"));
          console.error("Geolocation error:", error);
          setIsLoading(false);
        },
        geoOptions,
      );
    } else {
      setError(t("browserError"));
    }
  };

  const onMapClick = useCallback(
    ({ detail: { latLng } }) => {
      const clickedLocation = { lat: latLng.lat, lng: latLng.lng };
      setMarkerPosition(clickedLocation);
      getAddressFromCoordinates(clickedLocation);
    },
    [getAddressFromCoordinates, setMarkerPosition],
  );

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  return (
    <MapProvider lang={lang}>
      <div className="mb-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-end gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <Autocomplete
                inputValue={fullAddressInput}
                isRequired
                size="sm"
                label={t("addressLabel")}
                aria-label={t("addressLabel")}
                name="address"
                labelPlacement="outside"
                placeholder={t("addressPlaceholder")}
                classNames={{
                  label: "text-xs md:text-sm font-semibold text-slate-700 mb-1 md:mb-1.5 block",
                  inputWrapper:
                    "bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:border-primary-500 focus-within:bg-white transition-all duration-200 shadow-sm !h-10 md:!h-12 rounded-xl",
                  input: "text-xs md:text-sm text-slate-800 placeholder:text-slate-400",
                }}
                isLoading={addressLoading}
                onOpenChange={setIsAddressOpen}
                onInputChange={(value) => {
                  setFullAddressInput(value);
                  if (!value) {
                    setAddress(emptyLocation);
                    setMarkerPosition(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePlaceSelect(fullAddressInput);
                  }
                }}
                defaultFilter={() => true}
                items={addressSuggestions}
              >
                {(suggestion) => (
                  <AutocompleteItem
                    key={suggestion.place_id}
                    value={suggestion.description}
                    onPress={() => handlePlaceSelect(suggestion.description)}
                  >
                    {suggestion.description}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            <div className="flex gap-2 md:gap-3 items-stretch shrink-0">
              <Button
                type="button"
                color="success"
                size="md"
                onPress={getCurrentLocation}
                className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all duration-150 shadow-md shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none text-xs md:text-sm !h-10 md:!h-12"
                isDisabled={isLoading}
                isLoading={isLoading}
                startContent={
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                <span>{isLoading ? t("loading") : t("myLocation")}</span>
              </Button>
            </div>
          </div>

          {address.country && (
            <div className="mt-2 md:mt-3 flex flex-wrap gap-1.5 md:gap-2 min-h-[24px] md:min-h-[28px]">
              {address.country && (
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-200/60 text-[10px] md:text-xs font-medium">
                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-400"></span>
                  {`${t("country")}: ${address.country}`}
                </span>
              )}
              {address.governorate && (
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] md:text-xs font-medium">
                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-500"></span>
                  {`${t("governorate")}: ${address.governorate}`}
                </span>
              )}
              {address.city && (
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-[10px] md:text-xs font-medium">
                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-indigo-500"></span>
                  {`${t("city")}: ${address.city}`}
                </span>
              )}
              {address.neighborhood && (
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] md:text-xs font-medium">
                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500"></span>
                  {`${t("neighborhood")}: ${address.neighborhood}`}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 md:mt-4 flex items-start gap-2.5 md:gap-3 p-3 md:p-4 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl md:rounded-2xl shadow-sm shadow-rose-500/5">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-rose-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="text-xs md:text-sm font-medium">{error}</div>
          </div>
        )}

        <div className="border border-slate-100 relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 mt-4 md:mt-6 ring-1 ring-slate-900/5 h-[320px] md:h-[500px]">
          {/* Map Tip Overlay */}
          <div className="absolute top-2 md:top-3 start-2 md:start-14 z-10 flex items-center gap-1 md:gap-1.5 ps-2 pe-3 py-1 md:py-2 bg-white/90 backdrop-blur-sm text-slate-600 rounded-lg border border-slate-200/80 shadow-sm pointer-events-none select-none text-[11px] md:text-[13px]">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0z"
              />
            </svg>
            <span className="font-IBMPlex leading-none">{t("mapTip")}</span>
          </div>

          <Map
            mapId="google-map"
            defaultCenter={center}
            defaultZoom={9}
            onClick={onMapClick}
            onIdle={onMapLoad}
            mapTypeControl={false}
            streetViewControl={false}
            gestureHandling="cooperative"
            style={{ width: "100%", height: "100%" }}
          >
            {markerPosition && markerPosition.lat && markerPosition.lng && (
              <AdvancedMarker position={markerPosition}>
                <div className="drop-shadow-lg transform -translate-y-4 hover:scale-105 transition-transform duration-200">
                  <img
                    className="w-9 md:w-[52px]"
                    draggable={false}
                    src={anyImgUrl({
                      src: "wmremove-transformed_lvrf62_cukmhr",
                      size: 100,
                    })}
                    alt="marker"
                  />
                </div>
              </AdvancedMarker>
            )}
          </Map>
        </div>
      </div>
    </MapProvider>
  );
}
