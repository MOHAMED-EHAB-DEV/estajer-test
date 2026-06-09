// "use client";

// import dynamic from "next/dynamic";
// import React from "react";

// const GoogleMapComponent = dynamic(
//   () => import("../shared/GoogleMapComponent"),
//   {
//     loading: () => (
//       <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
//         <div className="text-gray-500">Loading map...</div>
//       </div>
//     ),
//     ssr: false,
//   }
// );

// export default function ProductMapWrapper(props) {
//   return <GoogleMapComponent {...props} />;
// }

"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";

// Dynamically import the map component - only loads when triggered
const GoogleMapComponent = dynamic(
  () => import("../shared/GoogleMapComponent"),
  {
    loading: () => null,
    ssr: false,
  }
);

export default function ProductMapWrapper(props) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={props.className || "md:h-[30.9rem] h-[26rem]"}
    >
      {shouldLoad ? (
        <GoogleMapComponent {...props} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-3xl flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="text-gray-500 text-sm">
              {props.lang === "ar" ? "جاري تحميل الخريطة..." : "Loading map..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
