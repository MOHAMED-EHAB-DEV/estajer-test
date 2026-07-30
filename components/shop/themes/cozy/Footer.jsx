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
  const brandColor = shop?.brandColor || "#F48A42";

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAF6F0] border-t border-neutral-200/50 pt-16 pb-12 my-6 md:my-12">
      <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-8 items-start">
          {/* Shop Information Panel (Spans 5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <Link
              href={`/${lang}/shops/${shop.slug}`}
              className="flex items-center gap-3.5 self-start group"
            >
              <div className="relative w-11 h-11 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md overflow-hidden border border-neutral-200 bg-white p-0.5 transition-transform duration-500 group-hover:rotate-6">
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
                  <div className="w-full h-full bg-[#FAF6F0] flex items-center justify-center text-[10px] text-neutral-400 font-bold">
                    🌿
                  </div>
                )}
              </div>
              <span className="text-lg font-bold text-neutral-800">
                {shopName}
              </span>
            </Link>
            <p className="text-neutral-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              {description || t("defaultDescription")}
            </p>
            {/* Round squircle social buttons */}
            <div className="flex items-center gap-3 mt-1">
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
                    className="w-9 h-9 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:border-neutral-800 transition-all duration-300 shadow-sm"
                  >
                    <Icon size={14} />
                  </a>
                ))}
            </div>
          </div>

          {/* Quick Links (Spans 3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-5">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
              {t("quickLinks") || "Navigate"}
            </h4>
            <nav className="flex flex-col gap-3 font-semibold">
              {[
                { label: t("home"), href: "#" },
                { label: t("products"), href: "#products" },
                { label: t("about"), href: "#about" },
                { label: t("contact"), href: "#" },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="text-xs text-neutral-500 hover:text-neutral-950 transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Platform Promo Card (Spans 4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
              {t("poweredBy") || "Estajer Platform"}
            </h4>
            <a
              href="https://estajer.com/rent-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-3.5 p-5 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md border border-neutral-200 bg-white hover:shadow-md transition-all duration-500 group"
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
              <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
                {lang === "ar"
                  ? "ابدأ بتأجير منتجاتك اليوم عبر منصتنا البسيطة والودية."
                  : "Start sharing and renting your items today with our simple, warm marketplace platform."}
              </p>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-neutral-200/50 flex flex-col md:flex-row items-center justify-between gap-6 text-neutral-400 text-xs font-semibold">
          <p className="flex items-center gap-1">
            © {currentYear} {shopName}. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-neutral-700 transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="hover:text-neutral-700 transition-colors">
              {t("termsAndConditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
