"use client";

import { useState, useCallback, useRef, useEffect, Fragment } from "react";
import { Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { useDebounce } from "use-debounce";
import { anyImgUrl } from "@/utils/ImageUrl";
import Product from "./Product";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import MapProvider from "./MapProvider";
import { useUser } from "@/context/UserContext";

export default function GoogleMapComponent({
  translate,
  initialProducts = [],
  lang = "ar",
  className = "md:h-[45rem] h-[30rem]",
  zoom = 10,
  center = { lat: 24.8, lng: 46.7 },
  showProducts = true,
  category,
  subCategory,
  search,
  name,
  refetch,
  providerId,
}) {
  const { user, favoriteProducts, toggleFavorite } = useUser();
  const mapRef = useRef(null);
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [drag, setDrag] = useState();
  const [debounce] = useDebounce(drag, 700);

  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    if (!mapRef.current?.map || !showProducts) return;
    const bounds = mapRef.current.map.getBounds();
    if (!bounds) return;
    setLoading(true);

    // Cancel any ongoing requests
    if (abortControllerRef.current) abortControllerRef.current.abort();
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const boundsParam = {
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      };

      const params = new URLSearchParams({
        bounds: JSON.stringify(boundsParam),
        ...(name && { name }),
        ...(subCategory && { subCategory }),
        ...(category && {
          category: search
            ? category
            : category
                .split("-")
                .map(
                  (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                )
                .join(""),
        }),
        lang,
        limit: 40,
        compressed: true,
        fields: `location,rental,rating,images,pricingModel,location,${
          lang === "ar" ? "addressAr" : "addressEn"
        },${lang === "ar" ? "nameAr" : "nameEn"}`,
        ...(providerId && { providerId }),
      });

      const response = await fetch(`/api/products?${params}`, {
        signal: abortControllerRef.current.signal,
      });
      const { data } = await response.json();

      // Transform coordinates to lat/lng format for markers
      const transformedProducts = data.map((product) => ({
        ...product,
        lat: product.location.coordinates[1],
        lng: product.location.coordinates[0],
      }));

      setProducts(transformedProducts);
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, showProducts, name, providerId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef?.current?.map;
    if (map) map.setCenter(center);
  }, [center]);

  useEffect(() => {
    fetchProducts();
  }, [refetch, debounce]);

  // Set up initial products
  useEffect(() => {
    if (initialProducts?.length > 0) {
      const transformedProducts = initialProducts.map((product) => ({
        ...product,
        lat: product.location.coordinates[1],
        lng: product.location.coordinates[0],
      }));
      setProducts(transformedProducts);
    }
  }, [initialProducts]);

  const handleMapIdle = useCallback(
    (event) => {
      if (!mapRef.current) {
        mapRef.current = event;
        fetchProducts();
      }
    },
    [fetchProducts],
  );

  return (
    <MapProvider lang={lang}>
      <div className="relative rounded-3xl overflow-hidden">
        <Map
          mapTypeControl={false}
          streetViewControl={false}
          mapId="google-map"
          defaultCenter={center}
          defaultZoom={zoom}
          onIdle={handleMapIdle}
          onClick={() => setSelectedProduct(null)}
          onDragStart={() => setSelectedProduct(null)}
          onDragend={(e) => setDrag(e)}
          onZoomChanged={(e) => setDrag(e)}
          style={{ width: "100%" }}
          className={className}
        >
          {products.map((product) => (
            <Fragment key={product._id}>
              {showProducts ? (
                <AdvancedMarker
                  position={{ lat: product.lat, lng: product.lng }}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="bg-white text-primary flex items-center gap-1 w-max px-4 py-2 font-IBMPlex rounded-full text-lg shadow-[0px_0px_8px_2px_rgba(0,0,0,0.25)] cursor-pointer transition-transform hover:scale-110">
                    {product.rental.value}{" "}
                    <Currency color="#f48a42" size={18} />
                  </div>
                </AdvancedMarker>
              ) : (
                <AdvancedMarker
                  position={{ lat: product.lat, lng: product.lng }}
                >
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
              )}

              {selectedProduct && selectedProduct._id === product._id && (
                <InfoWindow
                  position={{ lat: product.lat, lng: product.lng }}
                  onClose={() => setSelectedProduct(null)}
                >
                  <Product
                    product={selectedProduct}
                    translate={translate}
                    lang={lang}
                    toggleFavorite={toggleFavorite}
                    user={user}
                    favoriteProducts={favoriteProducts}
                    providerId={providerId}
                  />
                </InfoWindow>
              )}
            </Fragment>
          ))}
        </Map>
        {loading && (
          <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
            Loading...
          </div>
        )}
      </div>
    </MapProvider>
  );
}
