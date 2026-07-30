"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { FeatureIcon } from "@/components/shop/themes/shared/FeatureIcon";

export default function FeaturesSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.features.${key}`);
  const isAr = lang === "ar";
  const features = data?.features || [];
  const brandColor = shop?.brandColor || "#111111";

  if (!features.length) return null;

  return (
    <section className="bg-white py-16 md:py-24 border-t border-neutral-100">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Why us
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            {t("title") || "Features"}
          </h2>
        </div>

        {/* List layout — not grid. Each feature is a row. Very editorial. */}
        <div className="flex flex-col">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group flex items-start gap-5 py-6 border-b border-neutral-100 hover:border-neutral-300 transition-colors last:border-0"
            >
              {/* Number */}
              <span
                className="text-[11px] font-bold tabular-nums shrink-0 mt-0.5 w-6"
                style={{ color: brandColor }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="shrink-0 text-neutral-300 group-hover:text-neutral-700 transition-colors mt-0.5">
                <FeatureIcon type={feature.iconType} className="w-5 h-5" />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-sm md:text-base font-semibold text-neutral-800 group-hover:text-neutral-900 transition-colors">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-[13px] text-neutral-400 leading-relaxed">
                  {isAr ? feature.descAr : feature.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
