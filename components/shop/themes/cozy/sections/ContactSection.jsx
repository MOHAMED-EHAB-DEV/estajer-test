"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import ProductMapWrapper from "@/components/singleProduct/ProductMapWrapper";

export default function ContactSection({ data, lang, shop, translate }) {
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
  const showGoogleMap = location && typeof location.lat === "number" && typeof location.lng === "number";
  const brandColor = shop?.brandColor || "#F48A42";

  const items = [
    address && {
      label: t("location") || (isAr ? "موقعنا" : "Visit Our Showroom"),
      value: address,
      href: null,
    },
    phone && {
      label: t("phoneNumber") || (isAr ? "اتصل بنا" : "Call Us"),
      value: phone,
      href: `tel:${phone}`,
    },
    email && {
      label: t("emailAddress") || (isAr ? "راسلنا" : "Send Message"),
      value: email,
      href: `mailto:${email}`,
    },
    workingHours && {
      label: isAr ? "أوقات العمل" : "Working Hours",
      value: workingHours,
      href: null,
    },
  ].filter(Boolean);

  return (
    <section
      className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12"
    >
      {data.showMap !== false ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
          {/* Left Side: Squircle boxes directory */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-4 text-start">
              <span className="bg-[#FAF6F0] text-neutral-600 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-neutral-200/50 w-fit">
                {t("badge") || "Get In Touch"}
              </span>
              {title && (
                <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800 leading-tight">
                  {title}
                </h2>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-[#FAF6F0] rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md border border-neutral-200/40 flex flex-col gap-1 text-start"
                >
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm font-bold text-neutral-800 hover:text-neutral-600 transition-colors w-fit"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-neutral-700 leading-normal">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Leaf-rounded Map Frame */}
          <div className="lg:col-span-7 flex items-center">
            <div className="w-full aspect-[4/3] min-h-[300px] bg-[#FAF6F0] p-3 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.2rem] rounded-bl-[1.2rem] border border-neutral-200/50 shadow-md overflow-hidden">
              <div className="w-full h-full rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1rem] rounded-bl-[1rem] overflow-hidden bg-white relative">
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
                    className="w-full h-full border-0 grayscale opacity-90 hover:opacity-100 hover:grayscale-0 transition-all duration-1000"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-3">
                    <span className="text-2xl">📍</span>
                    <div className="flex flex-col items-center gap-1 font-semibold">
                      <p className="text-xs text-neutral-800 tracking-wide">
                        {t("geographicLocation") || "Location Directory"}
                      </p>
                      <p className="text-[9px] text-neutral-400 tracking-wider uppercase">
                        {t("mapUrlNotAvailable") || "Map Unavailable"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full bg-[#FAF6F0] p-6 md:p-10 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.2rem] rounded-bl-[1.2rem] border border-neutral-200/50 shadow-sm flex flex-col gap-8 animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="bg-white text-neutral-600 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-neutral-200/50 w-fit">
              {t("badge") || "Get In Touch"}
            </span>
            {title && (
              <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800 leading-tight">
                {title}
              </h2>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md border border-neutral-200/20 shadow-sm flex flex-col items-center text-center gap-1.5"
              >
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-base font-bold text-neutral-800 hover:text-neutral-600 transition-colors break-all"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-base font-semibold text-neutral-700 leading-normal break-words">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
