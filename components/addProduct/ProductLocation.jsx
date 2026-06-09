"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useState, useCallback, useRef, useEffect } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
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
    const handler = setTimeout(() => fetchSuggestions(fullAddressInput), 300);
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
        setLocationPlace(result.address_components);

        const map = mapRef?.current?.map;
        if (map) map.setCenter(newPosition);
        if (map) map.setZoom(14);
      } else {
        setError(t("locationNotFound"));
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
      <div className="mb-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-grow w-full sm:w-auto">
              <Autocomplete
                inputValue={fullAddressInput}
                isRequired
                label={t("addressLabel")}
                name="address"
                labelPlacement="outside"
                placeholder={t("addressPlaceholder")}
                classNames={{
                  label: "text-lg -mt-2",
                  trigger: "bg-gray-100 h-12",
                }}
                isLoading={addressLoading}
                onOpenChange={setIsAddressOpen}
                onInputChange={setFullAddressInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePlaceSelect(fullAddressInput);
                  }
                }}
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

            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading || !fullAddressInput}
                onClick={handleSearch}
              >
                {isLoading ? t("searching") : t("search")}
              </button>
              <Button
                type="button"
                color="success"
                onPress={getCurrentLocation}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                isDisabled={isLoading}
              >
                {isLoading ? t("loading") : t("myLocation")}
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 min-h-[20px]">
            {address.country && (
              <span>{`${t("country")}: ${address.country}`}</span>
            )}
            {address.governorate && (
              <span>{`${t("governorate")}: ${address.governorate}`}</span>
            )}
            {address.city && <span>{`${t("city")}: ${address.city}`}</span>}
            {address.neighborhood && (
              <span>{`${t("neighborhood")}: ${address.neighborhood}`}</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="border border-gray-300 relative rounded-3xl overflow-hidden mt-6">
          <Map
            mapId="google-map"
            defaultCenter={center}
            defaultZoom={9}
            onClick={onMapClick}
            onIdle={onMapLoad}
            mapTypeControl={false}
            streetViewControl={false}
            style={containerStyle}
          >
            {markerPosition && markerPosition.lat && markerPosition.lng && (
              <AdvancedMarker position={markerPosition}>
                <div>
                  <img
                    width={60}
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
