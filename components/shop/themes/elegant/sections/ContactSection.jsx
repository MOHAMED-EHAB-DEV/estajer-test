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
  const brandColor = shop?.brandColor || "#8B5E3C";

  const brandIntroAr = "يسعدنا دائماً استقبالكم وخدمتكم في متجرنا. نحرص على تقديم أفضل تجربة تسوق تلبي تطلعاتكم وتليق باختياراتكم الراقية. لا تترددوا في التواصل معنا لأي استفسارات.";
  const brandIntroEn = "It is our privilege to welcome you and serve you at our boutique. We strive to curate an exquisite shopping experience tailored to your unique tastes. Please feel free to reach out for any inquiries.";
  const brandIntro = isAr ? brandIntroAr : brandIntroEn;

  const items = [
    address && {
      label: t("location") || (isAr ? "عنوان المعرض" : "Showroom Address"),
      value: address,
      href: null,
    },
    phone && {
      label: t("phoneNumber") || (isAr ? "الهاتف" : "Telephone"),
      value: phone,
      href: `tel:${phone}`,
    },
    email && {
      label: t("emailAddress") || (isAr ? "الاستفسارات" : "Inquiries"),
      value: email,
      href: `mailto:${email}`,
    },
    workingHours && {
      label: isAr ? "ساعات العمل" : "Bespoke Hours",
      value: workingHours,
      href: null,
    },
  ].filter(Boolean);

  return (
    <section className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 my-6 md:my-12">
      {data.showMap !== false ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          {/* Left: Boutique Directory Stack */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex flex-col gap-6 text-start">
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: brandColor }}
                >
                  {t("badge") || "Bespoke Contacts"}
                </span>
                <div
                  className="w-1.5 h-1.5 rotate-45"
                  style={{ backgroundColor: brandColor }}
                />
              </div>

              {title && (
                <h2 className="text-2xl md:text-4xl text-neutral-900 leading-tight">
                  {title}
                </h2>
              )}

              {/* Elegant double line divider */}
              <div className="h-px bg-neutral-300 w-24 my-2" />

              {/* Boutique Directory List */}
              <div className="flex flex-col border-t border-neutral-200">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col py-5 border-b border-neutral-200 gap-1.5">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                      {item.label}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm italic text-neutral-800 hover:text-neutral-500 transition-colors w-fit"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-sm italic text-neutral-800">
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Map framed like Gallery Artwork */}
          <div className="lg:col-span-7 flex items-center">
            <div className="relative w-full aspect-[4/3] min-h-[300px]">
              {/* Gallery Frame Offset Border */}
              <div
                className="absolute inset-0 border transform translate-x-3 translate-y-3"
                style={{ borderColor: `${brandColor}40` }}
              />

              {/* Main Map Box */}
              <div className="absolute inset-0 bg-[#FCFAF7] border border-neutral-200/80 p-4 shadow-xl">
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
                    className="w-full h-full"
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
                    className="w-full h-full border-0 grayscale opacity-90 hover:opacity-100 hover:grayscale-0 transition-all duration-700"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-3">
                    <div className="text-2xl">📍</div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-xs text-neutral-800 tracking-wide">
                        {t("geographicLocation") || "Location Directory"}
                      </p>
                      <p className="text-[10px] text-neutral-400 tracking-wider uppercase">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center animate-in fade-in duration-500">
          {/* Left: Editorial/Brand narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center gap-6">
            <div className="flex items-center gap-3">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: brandColor }}
              >
                {t("badge") || "Bespoke Contacts"}
              </span>
              <div
                className="w-1.5 h-1.5 rotate-45"
                style={{ backgroundColor: brandColor }}
              />
            </div>
            {title && (
              <h2 className="text-2xl md:text-5xl text-neutral-900 leading-tight">
                {title}
              </h2>
            )}
            <div className="h-px bg-neutral-300 w-24 my-2" />
            <p className="text-neutral-500 text-sm md:text-base leading-relaxed italic max-w-lg">
              {brandIntro}
            </p>
          </div>

          {/* Right: Symmetrical Directory Details */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex flex-col border-t border-b border-neutral-200">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col py-5 border-b border-neutral-200 last:border-b-0 gap-1.5">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm italic text-neutral-800 hover:text-neutral-500 transition-colors w-fit break-all"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-sm italic text-neutral-800 break-words">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
