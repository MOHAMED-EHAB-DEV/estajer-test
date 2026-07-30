"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import {
  IconFacebook,
  IconInstagram,
  IconTwitter,
  IconSnapchat,
  IconTiktok,
  IconWhatsapp,
} from "./Icons";
import { useTranslations } from "@/hooks/useTranslations";

export default function Footer({ shop, lang, translate, data }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.footer.${key}`);

  const shopName = lang === "ar" ? shop.nameAr : shop.nameEn;
  const description =
    lang === "ar"
      ? data?.descriptionAr || shop.descriptionAr
      : data?.descriptionEn || shop.descriptionEn;
  const logo = data?.logo || shop.logo;
  const brandColor = shop?.brandColor || "#8B5E3C";

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[#FCFAF7] border-t border-neutral-200/80 pt-16 md:pt-28 pb-12"
      
    >
      <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Brand Info & Identity - Spans 5 columns */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link
              href={`/${lang}/shops/${shop.slug}`}
              className="flex items-center gap-4 self-start group"
            >
              <div className="relative w-12 h-12 rounded-none border border-neutral-300/60 bg-white p-0.5">
                {logo ? (
                  <Image
                    unoptimized
                    src={
                      logo.startsWith("data:")
                        ? logo
                        : anyImgUrl({ src: logo, size: 100 })
                    }
                    alt={shopName || "Logo"}
                    fill
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-50 flex items-center justify-center text-[10px] text-neutral-400 uppercase tracking-widest">
                    EST
                  </div>
                )}
              </div>
              <span className="text-xl tracking-widest text-neutral-900 group-hover:text-neutral-600 transition-colors">
                {shopName}
              </span>
            </Link>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed max-w-sm italic">
              {description || t("defaultDescription")}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-2">
              {[
                { Icon: IconFacebook, link: data?.facebook },
                { Icon: IconInstagram, link: data?.instagram },
                { Icon: IconTwitter, link: data?.twitter },
                { Icon: IconSnapchat, link: data?.snapchat },
                { Icon: IconTiktok, link: data?.tiktok },
                { Icon: IconWhatsapp, link: data?.whatsapp },
              ]
                .filter((item) => item.link)
                .map(({ Icon, link }, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 border border-neutral-300/60 flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:border-neutral-800 transition-all duration-300"
                  >
                    <Icon size={14} />
                  </a>
                ))}
            </div>
          </div>

          {/* Quick Links Column - Spans 3 columns with a thin border divider on desktop */}
          <div className="lg:col-span-3 flex flex-col gap-6 lg:border-s lg:border-neutral-200/60 lg:ps-12">
            <h4 className="text-[10px] font-bold text-neutral-900 uppercase tracking-[0.2em]">
              {t("quickLinks") || "Quick Links"}
            </h4>
            <nav className="flex flex-col gap-3.5">
              {[
                { label: t("home"), href: "#" },
                { label: t("products"), href: "#products" },
                { label: t("about"), href: "#about" },
                { label: t("contact"), href: "#" },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors tracking-wide font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Platform Promo / Powered By - Spans 4 columns with border divider */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:border-s lg:border-neutral-200/60 lg:ps-12">
            <h4 className="text-[10px] font-bold text-neutral-900 uppercase tracking-[0.2em]">
              {t("poweredBy") || "Powered By"}
            </h4>
            <a
              href="https://estajer.com/rent-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-4 p-5 border border-neutral-300/60 bg-white hover:border-neutral-900 transition-all duration-500 group"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={anyImgUrl({
                    src: "df29491010c0d93a10d9a4be03e0a505_bm0quc_ucrmq4",
                    size: 100,
                  })}
                  alt="Estajer"
                  unoptimized
                  width={80}
                  height={44}
                  className="grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 origin-start"
                />
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                {lang === "ar"
                  ? "أنشئ مساحتك الخاصة اليوم ودع أعمالك تتألق في عالم التأجير الراقي."
                  : "Curate your boutique space today. Join the premier platform for luxury rentals."}
              </p>
            </a>
          </div>
        </div>

        {/* Brand Copyright & Signature Bottom Bar */}
        <div className="mt-16 md:mt-24 pt-8 border-t border-neutral-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] text-neutral-400 tracking-wide font-medium">
            © {currentYear} {shopName}. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-8">
            <Link
              href="#"
              className="text-[10px] text-neutral-400 hover:text-neutral-900 tracking-wide font-medium"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="#"
              className="text-[10px] text-neutral-400 hover:text-neutral-900 tracking-wide font-medium"
            >
              {t("termsAndConditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
