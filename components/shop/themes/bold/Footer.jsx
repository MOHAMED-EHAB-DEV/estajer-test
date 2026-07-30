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

  const socials = [
    { Icon: IconFacebook, link: data?.facebook },
    { Icon: IconInstagram, link: data?.instagram },
    { Icon: IconTwitter, link: data?.twitter },
    { Icon: IconSnapchat, link: data?.snapchat },
    { Icon: IconTiktok, link: data?.tiktok },
    { Icon: IconWhatsapp, link: data?.whatsapp },
  ].filter((s) => s.link);

  return (
    <footer className="bg-neutral-50 border-t-4 pt-12 md:pt-20 pb-10" style={{ borderTopColor: brandColor }}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link href={`/${lang}/shops/${shop.slug}`} className="flex items-center gap-3 group w-fit">
              <div
                className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all border-2"
                style={{ borderColor: brandColor }}
              >
                {logo ? (
                  <Image
                    unoptimized
                    src={logo.startsWith("data:") ? logo : anyImgUrl({ src: logo, size: 100 })}
                    alt={shopName || "Logo"}
                    fill
                    className="object-contain p-1.5"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-black text-lg"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(shopName || "S")[0]}
                  </div>
                )}
              </div>
              <span className="text-xl md:text-2xl font-black text-darkNavy">{shopName}</span>
            </Link>

            {description && (
              <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">{description}</p>
            )}

            {/* Socials */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2.5">
                {socials.map(({ Icon, link }, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg active:scale-95"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-black text-darkNavy uppercase tracking-widest pb-2 border-b-2" style={{ borderColor: brandColor }}>
              {t("quickLinks")}
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: t("home"), href: "#" },
                { label: t("products"), href: "#products" },
                { label: t("about"), href: "#about" },
                { label: t("contact"), href: "#contact" },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="text-sm text-neutral-500 hover:text-darkNavy font-medium transition-colors flex items-center gap-2 group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-all group-hover:w-4"
                    style={{ backgroundColor: brandColor }}
                  />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Powered By */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-black text-darkNavy uppercase tracking-widest pb-2 border-b-2" style={{ borderColor: brandColor }}>
              {t("poweredBy")}
            </h4>
            <a
              href="https://estajer.com/rent-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <Image
                src={anyImgUrl({ src: "df29491010c0d93a10d9a4be03e0a505_bm0quc_ucrmq4", size: 100 })}
                alt="Estajer"
                unoptimized
                width={80}
                height={44}
                className="grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
              />
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {lang === "ar"
                  ? "قم بإنشاء متجرك الخاص اليوم وانضم إلى أكبر منصة تأجير في المنطقة."
                  : "Create your own shop today and join the largest rental platform in the region."}
              </p>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 md:mt-16 pt-6 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4 mb-16 md:mb-0">
          <p className="text-xs text-neutral-400 font-medium">
            © {currentYear} {shopName}. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[11px] text-neutral-400 hover:text-darkNavy transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="text-[11px] text-neutral-400 hover:text-darkNavy transition-colors">
              {t("termsAndConditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
