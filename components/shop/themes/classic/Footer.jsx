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

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-100 pt-10 md:pt-20 pb-10">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
            <Link
              href={`/${lang}/shops/${shop.slug}`}
              className="flex items-center gap-3 md:gap-4"
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border border-neutral-200/50 bg-white shadow-sm">
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
                    className="object-contain p-1 md:p-1.5"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-50" />
                )}
              </div>
              <span className="text-xl md:text-2xl font-black text-darkNavy">
                {shopName}
              </span>
            </Link>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed max-w-md">
              {description || t("defaultDescription")}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2.5 md:gap-3">
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
                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-var(--shop-brand) hover:border-var(--shop-brand) transition-all"
                    style={{ "--shop-brand": shop.brandColor }}
                  >
                    <Icon className="md:w-4 w-3.5 md:h-4 h-3.5" />
                  </a>
                ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-black text-darkNavy uppercase tracking-widest">
              {t("quickLinks")}
            </h4>
            <nav className="flex flex-col gap-4">
              {[
                { label: t("home"), href: "#" },
                { label: t("products"), href: "#products" },
                { label: t("about"), href: "#about" },
                { label: t("contact"), href: "#" },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="text-sm text-neutral-400 hover:text-darkNavy transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Powered By */}
          <div className="flex flex-col gap-4 md:gap-6">
            <h4 className="text-[11px] font-black text-darkNavy uppercase tracking-widest">
              {t("poweredBy")}
            </h4>
            <a
              href="https://estajer.com/rent-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-primary/20 transition-all group"
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
                  className="grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all scale-90 md:scale-100 origin-start"
                />
              </div>
              <p className="text-[10px] md:text-[11px] text-neutral-400">
                {lang === "ar"
                  ? "قم بإنشاء متجرك الخاص اليوم وانضم إلى أكبر منصة تأجير في المنطقة."
                  : "Create your own shop today and join the largest rental platform in the region."}
              </p>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 mb-16 md:mb-0 md:mt-20 pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-neutral-400 font-medium">
            © {currentYear} {shopName}. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-[11px] text-neutral-400 hover:text-darkNavy"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="#"
              className="text-[11px] text-neutral-400 hover:text-darkNavy"
            >
              {t("termsAndConditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
