"use client";

import React from "react";

const ContactItem = ({ icon, label, value, href, isAr }) => (
  <div className="flex items-start gap-3 md:gap-5 p-4 md:p-6 rounded-[24px] md:rounded-[32px] bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/10 to-transparent text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner">
      {React.cloneElement(icon, { className: "md:w-7 w-5 md:h-7 h-5" })}
    </div>
    <div className="flex flex-col gap-1 md:gap-1.5 min-w-0 pt-0.5 md:pt-1">
      <span className="text-[9px] md:text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          className="text-sm md:text-base lg:text-lg font-black text-darkNavy hover:text-primary transition-colors truncate"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm md:text-base lg:text-lg font-black text-darkNavy truncate">
          {value}
        </span>
      )}
    </div>
  </div>
);

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
  const workingHours = isAr ? data?.workingHoursAr : data?.workingHoursEn;
  const showGoogleMap =
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number";

  const items = [
    address && {
      label: t("location"),
      value: address,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      ),
    },
    phone && {
      label: t("phoneNumber"),
      value: phone,
      href: `tel:${phone}`,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    email && {
      label: t("emailAddress"),
      value: email,
      href: `mailto:${email}`,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    workingHours && {
      label: isAr ? "أوقات العمل" : "Working Hours",
      value: workingHours,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ].filter(Boolean);

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 my-6 md:my-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6 md:mb-20">
        <div className="inline-flex items-center gap-2 px-3 md:px-5 py-1 md:py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs md:text-sm font-bold tracking-wide mb-4 md:mb-6">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="md:w-3.5 md:h-3.5 w-3 h-3"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {t("badge")}
        </div>
        {title && (
          <h2 className="text-xl md:text-5xl font-black text-darkNavy leading-tight max-w-2xl">
            {title}
          </h2>
        )}
      </div>

      {data.showMap !== false ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
          {/* Contact Info */}
          <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
            {items.map((item, idx) => (
              <ContactItem
                key={idx}
                label={item.label}
                value={item.value}
                href={item.href}
                isAr={isAr}
                icon={item.icon}
              />
            ))}

            {/* Social Card */}
            <div className="mt-2 md:mt-4 p-5 md:p-8 rounded-[32px] md:rounded-[40px] bg-neutral-50 border border-neutral-100 flex flex-col gap-3 md:gap-4 relative overflow-hidden group shadow-xl shadow-neutral-200/30">
              <div className="relative z-10">
                <h4 className="text-lg md:text-xl font-black text-darkNavy">
                  {t("followSocial")}
                </h4>
                <p className="text-neutral-500 text-xs md:text-sm font-medium mt-0.5 md:mt-1">
                  {t("followSocialDesc")}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary/10 blur-[40px] md:blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
            </div>
          </div>

          {/* Map Card */}
          <div className="lg:col-span-7 relative rounded-[32px] md:rounded-[48px] overflow-hidden bg-neutral-100 border border-neutral-100 shadow-2xl shadow-primary/5 group min-h-[250px] md:min-h-[400px]">
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
                center={{ lat: location.lat, lng: location.lng }}
                showProducts={false}
              />
            ) : mapUrl ? (
              <iframe
                src={mapUrl}
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-3 md:gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-500">
                  📍
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm md:text-base text-darkNavy font-black">
                    {t("geographicLocation")}
                  </p>
                  <p className="text-[10px] md:text-xs font-medium text-neutral-400">
                    {t("mapUrlNotAvailable")}
                  </p>
                </div>
              </div>
            )}

            {/* Map Overlay Button */}
            {mapUrl && !showGoogleMap && (
              <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="bg-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-2xl text-darkNavy text-xs md:text-sm font-black flex items-center gap-2">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-ping" />
                  {t("viewFullMap")}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8 md:gap-12 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item, idx) => (
              <ContactItem
                key={idx}
                label={item.label}
                value={item.value}
                href={item.href}
                isAr={isAr}
                icon={item.icon}
              />
            ))}
          </div>

          {/* Social Card centered */}
          <div className="p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-neutral-50 border border-neutral-100 flex flex-col items-center text-center gap-3 md:gap-4 relative overflow-hidden group shadow-xl shadow-neutral-200/30 max-w-2xl mx-auto w-full">
            <div className="relative z-10">
              <h4 className="text-lg md:text-xl font-black text-darkNavy">
                {t("followSocial")}
              </h4>
              <p className="text-neutral-500 text-xs md:text-sm font-medium mt-0.5 md:mt-1">
                {t("followSocialDesc")}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary/10 blur-[40px] md:blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      )}
    </section>
  );
}
