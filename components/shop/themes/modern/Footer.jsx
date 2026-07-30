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
    <footer className="bg-[#F9FAFB] border-t border-neutral-100/80 pt-16 md:pt-24 pb-12">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          {/* Brand col */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link
              href={`/${lang}/shops/${shop.slug}`}
              className="flex items-center gap-3 w-fit group"
            >
              {logo ? (
                <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-neutral-200 bg-white p-1">
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
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: brandColor }}
                >
                  {(shopName || "S")[0]}
                </div>
              )}
              <span className="text-base font-semibold text-neutral-800">
                {shopName}
              </span>
            </Link>

            {description && (
              <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
                {description}
              </p>
            )}

            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                {socials.map(({ Icon, link }, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white border border-neutral-200/60 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-all duration-300 hover:scale-105"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 flex flex-col gap-5">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              {t("quickLinks")}
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { label: t("home"), href: `/${lang}/shops/${shop.slug}` },
                { label: t("products"), href: "#products" },
                { label: t("about"), href: "#about" },
                { label: t("contact"), href: "#contact" },
              ].map((l, i) => (
                <Link
                  key={i}
                  href={l.href}
                  className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors w-fit hover:underline decoration-neutral-300 underline-offset-4"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Powered by */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              {t("poweredBy")}
            </p>
            <a
              href="https://estajer.com/rent-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-4 p-5 bg-white border border-neutral-100 rounded-3xl hover:border-neutral-200 transition-all duration-300 group w-fit shadow-[0_4px_20px_rgb(0,0,0,0.01)]"
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
              <p className="text-[11px] text-neutral-400 max-w-[200px] leading-relaxed">
                {lang === "ar"
                  ? "أنشئ متجرك الخاص على منصة استاجر."
                  : "Create your own shop on Estajer."}
              </p>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-6 border-t border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 mb-16 md:mb-0">
          <p className="text-[11px] text-neutral-400">
            © {year} {shopName}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="#"
              className="text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              {t("termsAndConditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
