"use client";

import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import ProductMapWrapper from "@/components/singleProduct/ProductMapWrapper";

export default function ContactSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.contact.${key}`);
  const isAr = lang === "ar";
  const brandColor = shop?.brandColor || "#111111";
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

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  const items = [
    address && {
      label: t("address"),
      value: address,
      href: null,
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5 text-neutral-600"
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
      ),
    },
    phone && {
      label: t("phone"),
      value: phone,
      href: phone ? `tel:${phone}` : null,
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5 text-neutral-600"
        >
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
      label: t("email"),
      value: email,
      href: email ? `mailto:${email}` : null,
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5 text-neutral-600"
        >
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
      href: null,
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5 text-neutral-600"
        >
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
    <section
      id="contact"
      className="bg-[#F9FAFB] py-16 md:py-24 my-6 md:my-12 border-t border-neutral-100/60"
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        {data.showMap !== false ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left: Info */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Contact
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {title || t("title")}
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-5 bg-white border border-neutral-200/50 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <span className="w-10 h-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-sm border border-neutral-100 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {item.icon}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-xs md:text-sm font-semibold text-neutral-700 hover:text-neutral-950 truncate transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-xs md:text-sm font-semibold text-neutral-700 truncate">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Map inside a stylized modern container */}
            <div className="lg:col-span-7 p-2 bg-neutral-100/50 rounded-[2.5rem] border border-neutral-200/40 shadow-sm">
              <div className="rounded-[2rem] overflow-hidden bg-white min-h-[300px] md:min-h-[380px] relative">
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
                    className="w-full h-full min-h-[300px] md:min-h-[380px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] md:min-h-[380px] flex flex-col items-center justify-center gap-3 text-neutral-300 bg-white">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-12 h-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-neutral-400">
                      {t("mapPlaceholder") || "Map"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch animate-in fade-in duration-500">
            {/* Left: 2x2 Grid of modern cards */}
            <div className="lg:col-span-6 flex flex-col justify-center gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Contact
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
                  {title || t("title")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2.5 p-5 bg-white border border-neutral-200/50 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-neutral-50 flex items-center justify-center text-xs border border-neutral-100 shrink-0 group-hover:scale-105 transition-transform duration-300">
                        {item.icon}
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        {item.label}
                      </p>
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-xs md:text-sm font-semibold text-neutral-700 hover:text-neutral-950 break-all transition-colors mt-1"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-xs md:text-sm font-semibold text-neutral-700 break-words mt-1">
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Premium WA CTA Card */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl flex flex-col gap-6 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />

                <div className="flex flex-col gap-2 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                    {isAr ? "دعم فوري" : "Instant Support"}
                  </span>
                  <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    {isAr
                      ? "تواصل معنا مباشرة عبر الواتساب"
                      : "Message Us on WhatsApp"}
                  </h3>
                  <p className="text-sm text-emerald-50/90 leading-relaxed mt-1">
                    {isAr
                      ? "نحن هنا لمساعدتك والإجابة على كافة استفساراتك بشكل مباشر وسريع. اضغط على الزر أدناه لبدء المحادثة."
                      : "We are here to help and answer all your questions instantly. Click the button below to start a live chat."}
                  </p>
                </div>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-fit px-8 py-4 bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all duration-300 font-extrabold rounded-2xl shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2.5 text-sm relative z-10"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {isAr ? "تحدث معنا" : "Chat with us"}
                  </a>
                ) : (
                  <a
                    href={`tel:${phone}`}
                    className="w-full sm:w-fit px-8 py-4 bg-white text-neutral-800 hover:bg-emerald-50 active:scale-95 transition-all duration-300 font-extrabold rounded-2xl shadow-lg shadow-neutral-900/10 flex items-center justify-center gap-2.5 text-sm relative z-10"
                  >
                    {isAr ? "اتصل بنا الآن" : "Call us now"}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
