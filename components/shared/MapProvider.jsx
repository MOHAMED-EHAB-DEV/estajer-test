"use client";
import dynamic from "next/dynamic";
import { Suspense, memo } from "react";

// Dynamically import APIProvider to avoid loading Google Maps on pages that don't need it
const APIProviderLazy = dynamic(
  () => import("@vis.gl/react-google-maps").then((mod) => mod.APIProvider),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * MapProvider - A lazy-loaded wrapper for Google Maps APIProvider
 * Use this component to wrap any component that needs Google Maps functionality
 * This prevents the Google Maps API from loading on pages that don't use maps
 */
function MapProvider({ children, lang = "en", loadingComponent = null }) {
  return (
    <Suspense fallback={loadingComponent}>
      <APIProviderLazy
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        language={lang}
        libraries={["places"]}
      >
        {children}
      </APIProviderLazy>
    </Suspense>
  );
}

export default memo(MapProvider);
