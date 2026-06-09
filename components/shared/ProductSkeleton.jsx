"use client";

export default function ProductSkeleton() {
  return (
    <div className="flex flex-col rounded-3xl bg-white shadow-lg overflow-hidden h-full animate-pulse">
      {/* Image skeleton */}
      <div className="relative md:aspect-[1/1.015] aspect-[1.2/1] bg-gray-200">
        <div className="absolute top-4 end-4 w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-5 flex flex-col justify-between">
        {/* Price skeleton */}
        <div className="flex gap-2 items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>

        {/* Location skeleton */}
        <div className="flex items-center gap-1 mb-4">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>

        {/* Buttons skeleton */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="h-10 bg-gray-200 rounded-3xl"></div>
          <div className="h-10 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    </div>
  );
}