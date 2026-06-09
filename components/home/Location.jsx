"use client";

import { useState, useCallback, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { sendGTMEvent } from "@next/third-parties/google";
import Button from "../ui/Button";

export default function Location({ lang, onLocationSelect, placeholder }) {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  // Fetch location suggestions as user types
  const fetchSuggestions = useCallback(
    async (input) => {
      if (!input) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/geocode/autocomplete?input=${encodeURIComponent(
            input,
          )}&lang=${lang}`,
        );
        const data = await response.json();
        if (data.predictions) setSuggestions(data.predictions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [lang],
  );

  // Fetch suggestions when input changes
  useEffect(() => {
    if (!autocompleteOpen) return;
    const handler = setTimeout(() => fetchSuggestions(searchValue), 300);
    return () => clearTimeout(handler);
  }, [searchValue, fetchSuggestions, autocompleteOpen]);

  const handlePlaceSelect = async (placeDescription) => {
    setIsLoading(true);
    try {
      // Use the geocode/search API to get location details
      const response = await fetch(
        `/api/geocode/search?address=${encodeURIComponent(
          placeDescription,
        )}&lang=${lang}`,
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const place = data.results[0];
        const locationData = {
          name: placeDescription,
          lat: place.geometry?.location.lat,
          lng: place.geometry?.location.lng,
        };

        setSearchValue(locationData.name);
        onLocationSelect(locationData);
        try {
          sendGTMEvent({
            event: "home_location_select",
            location_name: locationData.name,
            lat: locationData.lat,
            lng: locationData.lng,
            source: "autocomplete",
            location: "home_search_box",
            language: lang,
          });
        } catch (_) {}
      }
    } catch (error) {
      console.error("Error getting place details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get address
          try {
            const response = await fetch(
              `/api/geocode/reverse?lat=${latitude}&lng=${longitude}&lang=${lang}`,
            );
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
              // Extract city (administrative_area_level_2) from results
              let cityName = data.results[0].formatted_address;

              if (data.results[0].address_components) {
                const cityComponent = data.results[0].address_components.find(
                  (component) =>
                    component.types.includes("administrative_area_level_2"),
                );
                if (cityComponent) {
                  cityName = cityComponent.long_name;
                }
              }

              const locationData = {
                name: cityName,
                lat: latitude,
                lng: longitude,
              };

              setSearchValue(locationData.name);
              onLocationSelect(locationData);
            }
          } catch (error) {
            console.error("Error getting address:", error);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
        },
      );
    }
  };

  return (
    <div className="items-center gap-2 md:flex hidden">
      <Autocomplete
        size="sm"
        aria-label="Location"
        classNames={{
          base: "hover:md:w-40 hover:w-30 focus-within:md:w-40 w-32 transition-width duration-500",
          endContentWrapper: "absolute end-0 top-0",
        }}
        inputProps={{
          classNames: {
            inputWrapper:
              "bg-transparent shadow-none px-0 hover:pe-2 h-10 focus-within:pe-2 !transition-all !duration-300",
            input: "h-10",
          },
        }}
        inputValue={searchValue}
        onInputChange={(value) => setSearchValue(value)}
        onOpenChange={(open) => setAutocompleteOpen(open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && searchValue) handlePlaceSelect(searchValue);
        }}
        isLoading={isLoading}
        placeholder={placeholder}
        startContent={
          <Button
            size="md"
            color="transparent"
            className="px-0 ms-2 w-10 min-w-0 bg-transparent justify-end "
            onPress={getCurrentLocation}
            aria-label="Get current location"
          >
            <svg width="40" height="22" viewBox="0 0 22 22" fill="#F48A42">
              <path d="M10.0001 20.9501V19.9501C7.91672 19.7167 6.12905 18.8544 4.63705 17.3631C3.14505 15.8717 2.28272 14.0841 2.05005 12.0001H1.05005C0.766719 12.0001 0.529386 11.9041 0.338052 11.7121C0.146719 11.5201 0.0507189 11.2827 0.0500523 11.0001C0.0493856 10.7174 0.145386 10.4801 0.338052 10.2881C0.530719 10.0961 0.768052 10.0001 1.05005 10.0001H2.05005C2.28339 7.91672 3.14605 6.12905 4.63805 4.63705C6.13005 3.14505 7.91739 2.28272 10.0001 2.05005V1.05005C10.0001 0.766719 10.0961 0.529386 10.2881 0.338052C10.4801 0.146719 10.7174 0.0507189 11.0001 0.0500523C11.2827 0.0493856 11.5204 0.145386 11.7131 0.338052C11.9057 0.530719 12.0014 0.768052 12.0001 1.05005V2.05005C14.0834 2.28339 15.8711 3.14605 17.3631 4.63805C18.8551 6.13005 19.7174 7.91739 19.9501 10.0001H20.9501C21.2334 10.0001 21.4711 10.0961 21.6631 10.2881C21.8551 10.4801 21.9507 10.7174 21.9501 11.0001C21.9494 11.2827 21.8537 11.5204 21.6631 11.7131C21.4724 11.9057 21.2347 12.0014 20.9501 12.0001H19.9501C19.7167 14.0834 18.8544 15.8711 17.3631 17.3631C15.8717 18.8551 14.0841 19.7174 12.0001 19.9501V20.9501C12.0001 21.2334 11.9041 21.4711 11.7121 21.6631C11.5201 21.8551 11.2827 21.9507 11.0001 21.9501C10.7174 21.9494 10.4801 21.8537 10.2881 21.6631C10.0961 21.4724 10.0001 21.2347 10.0001 20.9501ZM11.0001 18.0001C12.9334 18.0001 14.5834 17.3167 15.9501 15.9501C17.3167 14.5834 18.0001 12.9334 18.0001 11.0001C18.0001 9.06672 17.3167 7.41672 15.9501 6.05005C14.5834 4.68339 12.9334 4.00005 11.0001 4.00005C9.06672 4.00005 7.41672 4.68339 6.05005 6.05005C4.68339 7.41672 4.00005 9.06672 4.00005 11.0001C4.00005 12.9334 4.68339 14.5834 6.05005 15.9501C7.41672 17.3167 9.06672 18.0001 11.0001 18.0001ZM11.0001 15.0001C9.90005 15.0001 8.95839 14.6084 8.17505 13.8251C7.39172 13.0417 7.00005 12.1001 7.00005 11.0001C7.00005 9.90005 7.39172 8.95839 8.17505 8.17505C8.95839 7.39172 9.90005 7.00005 11.0001 7.00005C12.1001 7.00005 13.0417 7.39172 13.8251 8.17505C14.6084 8.95839 15.0001 9.90005 15.0001 11.0001C15.0001 12.1001 14.6084 13.0417 13.8251 13.8251C13.0417 14.6084 12.1001 15.0001 11.0001 15.0001Z" />
            </svg>
          </Button>
        }
        items={suggestions}
      >
        {(suggestion) => (
          <AutocompleteItem
            key={suggestion.description}
            value={suggestion.description}
            onPress={() => handlePlaceSelect(suggestion.description)}
          >
            {suggestion.description}
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
}
