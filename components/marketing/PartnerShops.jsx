"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";

const PartnerShops = ({ translate, lang, shops = [] }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.partnerShops.${key}`);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!shops || shops.length === 0) return null;

  const duplicatedShops = [...shops, ...shops];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-[#fcfcfc] to-white"
    >
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(${lang === "ar" ? "50%" : "-50%"});
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
          animation-play-state: ${isInView ? "running" : "paused"};
        }
      `}</style>

      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#555 1px, transparent 1px), linear-gradient(90deg, #555 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/70" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
              {t("title")}
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/70" />
          </div>
          <p className="text-neutral-500 text-sm md:text-base max-w-md mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative">
          {/* Edge fades */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-56 bg-gradient-to-r from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-56 bg-gradient-to-l from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent z-10 pointer-events-none" />

          {/* Marquee Track Container */}
          <div className="flex overflow-hidden py-4">
            <div
              className="flex flex-nowrap items-center w-max animate-marquee"
              style={{ width: "max-content" }}
            >
              {duplicatedShops.map((shop, idx) => (
                <div
                  key={`${shop._id}-${idx}`}
                  className="flex-none mx-5 md:mx-10 group"
                >
                  <div className="relative w-28 h-16 md:w-40 md:h-20 rounded-2xl bg-white border border-neutral-100 shadow-sm flex items-center justify-center px-4 py-3 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/20 group-hover:scale-105">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-full h-full">
                      <Image
                        unoptimized
                        src={anyImgUrl({
                          src: shop.logo,
                          size: 200,
                        })}
                        alt={shop.nameAr || shop.nameEn || "Partner Shop"}
                        fill
                        className="object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        sizes="(max-width: 768px) 112px, 160px"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badge row */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {lang === "ar"
              ? "متاجر موثّقة ونشطة على المنصة"
              : "Verified & active stores on the platform"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PartnerShops;
