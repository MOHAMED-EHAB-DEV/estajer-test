"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import ProductMapWrapper from "@/components/singleProduct/ProductMapWrapper";

export default function ContactSection({ data, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.contact.${key}`);
  const isAr = lang === "ar";
  const title = isAr ? data?.titleAr : data?.titleEn;
  const address = isAr ? data?.addressAr : data?.addressEn;
  const phone = data?.phone;
  const email = data?.email;
  const mapUrl = data?.mapUrl;
  const location = data?.location;
  const showGoogleMap =
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number";
  const workingHours = isAr ? data?.workingHoursAr : data?.workingHoursEn;

  const items = [
    address && { label: t("address"), value: address, href: null },
    phone && {
      label: t("phone"),
      value: phone,
      href: phone ? `tel:${phone}` : null,
    },
    email && {
      label: t("email"),
      value: email,
      href: email ? `mailto:${email}` : null,
    },
    workingHours && {
      label: isAr ? "أوقات العمل" : "Working Hours",
      value: workingHours,
      href: null,
    },
  ].filter(Boolean);

  return (
    <section
      id="contact"
      className="bg-white py-16 md:py-24 border-t border-neutral-100"
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        {data.showMap !== false ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            {/* Left: info */}
            <div className="md:col-span-5 flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Contact
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                  {title || t("title")}
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 pb-6 border-b border-neutral-100 last:border-0 last:pb-0"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-300">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-neutral-700">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: map */}
            <div className="md:col-span-7 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 min-h-[280px] md:min-h-[360px] relative">
              {showGoogleMap ? (
                <ProductMapWrapper
                  translate={translate}
                  lang={lang}
                  initialProducts={[
                    {
                      _id: "shop-location",
                      location: {
                        type: "Point",
                        coordinates: [location.lng, location.lat],
                      },
                    },
                  ]}
                  className="absolute inset-0 w-full h-full"
                  zoom={14}
                  center={{
                    lat: location.lat,
                    lng: location.lng,
                  }}
                  showProducts={false}
                />
              ) : mapUrl ? (
                <iframe
                  src={mapUrl}
                  className="w-full h-full min-h-[280px] md:min-h-[360px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 text-neutral-200">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <p className="text-xs text-neutral-300">
                    {t("mapPlaceholder") || "Map"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-1 text-center mb-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Contact
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                {title || t("title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-fr gap-8 divide-y md:divide-y-0 md:divide-x divide-neutral-200/60 rtl:md:divide-x-reverse max-w-6xl mx-auto w-full">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center gap-1.5 pt-6 md:pt-0 first:pt-0 px-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400/80">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors font-medium break-all"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-neutral-700 font-medium break-words">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
