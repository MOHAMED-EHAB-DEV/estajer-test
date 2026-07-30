"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import ProductMapWrapper from "@/components/singleProduct/ProductMapWrapper";

export default function ContactSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.contact.${key}`);
  const isAr = lang === "ar";
  const brandColor = shop?.brandColor || "#F48A42";

  const title = isAr ? data?.titleAr : data?.titleEn;
  const address = isAr ? data?.addressAr : data?.addressEn;
  const phone = data?.phone;
  const email = data?.email;
  const mapUrl = data?.mapUrl;
  const location = data?.location;
  const workingHours = isAr ? data?.workingHoursAr : data?.workingHoursEn;
  const showGoogleMap = location && typeof location.lat === "number" && typeof location.lng === "number";

  const contactItems = [
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: t("address"),
      value: address,
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: t("phone"),
      value: phone,
      href: phone ? `tel:${phone}` : null,
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: t("email"),
      value: email,
      href: email ? `mailto:${email}` : null,
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: isAr ? "أوقات العمل" : "Working Hours",
      value: workingHours,
    },
  ].filter((i) => i.value);

  return (
    <section id="contact" className="bg-neutral-50 py-12 md:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-darkNavy">{title || t("title")}</h2>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full" style={{ backgroundColor: brandColor }} />
            <div className="h-1 w-4 rounded-full opacity-40" style={{ backgroundColor: brandColor }} />
          </div>
        </div>

        {data.showMap !== false ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Contact cards */}
            <div className="flex flex-col gap-4">
              {contactItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 md:p-5 bg-white rounded-2xl border-2 border-neutral-100 hover:shadow-md transition-all duration-300 group"
                  style={{ "--brand": brandColor }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{item.label}</span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-bold text-darkNavy hover:underline truncate"
                        style={{ color: brandColor }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-sm font-bold text-darkNavy truncate">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="rounded-2xl md:rounded-3xl overflow-hidden border-2 border-neutral-100 shadow-md min-h-[280px] md:min-h-[320px] bg-neutral-100 relative">
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
                  className="w-full h-full min-h-[280px] md:min-h-[320px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 text-neutral-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 opacity-30">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm font-medium">{t("mapPlaceholder") || "Map will appear here"}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
            {contactItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-2xl border-2 border-neutral-100 hover:shadow-md transition-all duration-300 group"
                style={{ "--brand": brandColor }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {item.icon}
                </div>
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{item.label}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-base font-bold text-darkNavy hover:underline break-all"
                      style={{ color: brandColor }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-base font-bold text-darkNavy break-words">{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
