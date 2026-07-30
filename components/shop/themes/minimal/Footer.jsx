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
  const brandColor = shop?.brandColor || "#111111";
  const year = new Date().getFullYear();

  const socials = [
    { Icon: IconFacebook, link: data?.facebook },
    { Icon: IconInstagram, link: data?.instagram },
    { Icon: IconTwitter, link: data?.twitter },
    { Icon: IconSnapchat, link: data?.snapchat },
    { Icon: IconTiktok, link: data?.tiktok },
    { Icon: IconWhatsapp, link: data?.whatsapp },
  ].filter((s) => s.link);

  return (
    <footer className="bg-white border-t border-neutral-100 pt-16 md:pt-24 pb-10">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand col */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link
              href={`/${lang}/shops/${shop.slug}`}
              className="flex items-center gap-3 w-fit"
            >
              {logo ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                  <Image
                    unoptimized
                    src={
                      logo.startsWith("data:")
                        ? logo
                        : anyImgUrl({ src: logo, size: 80 })
                    }
                    alt={shopName}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: brandColor }}
                >
                  {(shopName || "S")[0]}
                </div>
              )}
              <span className="text-base font-semibold text-neutral-900">
                {shopName}
              </span>
            </Link>

            {description && (
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
                {description}
              </p>
            )}

            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ Icon, link }, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-neutral-900 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 flex flex-col gap-5">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
              {t("quickLinks")}
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { label: t("home"), href: "#" },
                { label: t("products"), href: "#products" },
                { label: t("about"), href: "#about" },
                { label: t("contact"), href: "#contact" },
              ].map((l, i) => (
                <Link
                  key={i}
                  href={l.href}
                  className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Powered by */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
              {t("poweredBy")}
            </p>
            <a
              href="https://estajer.com/rent-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-3 p-4 border border-neutral-100 rounded-xl hover:border-neutral-300 transition-colors group w-fit"
            >
              <Image
                src={anyImgUrl({
                  src: "df29491010c0d93a10d9a4be03e0a505_bm0quc_ucrmq4",
                  size: 100,
                })}
                alt="Estajer"
                unoptimized
                width={72}
                height={40}
                className="grayscale opacity-40 group-hover:opacity-80 transition-opacity"
              />
              <p className="text-[11px] text-neutral-400 max-w-[180px] leading-relaxed">
                {lang === "ar"
                  ? "أنشئ متجرك الخاص على منصة استاجر."
                  : "Create your own shop on Estajer."}
              </p>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 mb-16 md:mb-0">
          <p className="text-[11px] text-neutral-300">
            © {year} {shopName}
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="#"
              className="text-[11px] text-neutral-300 hover:text-neutral-600 transition-colors"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="#"
              className="text-[11px] text-neutral-300 hover:text-neutral-600 transition-colors"
            >
              {t("termsAndConditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
