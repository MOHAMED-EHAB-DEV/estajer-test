import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import React from "react";
import { Instagram } from "./svgs/icons/InstagramSvg";
import { Facebook } from "./svgs/icons/FacebookSvg";
import { Twitter } from "./svgs/icons/TwitterSvg";
import { Whatsapp } from "./svgs/icons/WhatsappSvg";
import { Nafath } from "./svgs/icons/NafathSvg";
import { Linkedin } from "./svgs/icons/LinkedinSvg";
import { Snapchat } from "./svgs/icons/SnapchatSvg";
import { Tiktok } from "./svgs/icons/TiktokSvg";
import Link from "next/link";
import Button from "./Button";
import {
  ApplePay,
  Visa,
  MasterCard,
  Mada,
  Tabby,
  Bank,
} from "./svgs/PaymentIcons";
import { getTranslations } from "@/hooks/getTranslations";
import Freelance from "./svgs/icons/Freelance";
import FutureWork from "./svgs/icons/Futurework";
import { Plus } from "./svgs/icons/PlusSvg";
import ScrollToTop from "./ScrollToTop";

export default async function Footer({ lang }) {
  const translate = await getTranslations(lang, ["footer"]);
  const t = (value) => translate(`footer.${value}`);
  const langPrefix = lang === "ar" ? "" : "/en";

  return (
    <footer
      role="contentinfo"
      className="relative overflow-hidden pb-28 md:pb-0"
      style={{ backgroundColor: "#0d092b" }}
      aria-label="Site footer"
    >
      {/* Subtle background glow accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-20 pb-8">
          {/* ── Col 1: Logo + description + socials ── */}
          <div className="lg:col-span-4 flex flex-col gap-6 text-center lg:text-start">
            {/* Logo */}
            <div className="md:w-[230px] w-[160px] md:h-[110px] h-[72px] relative mx-auto lg:mx-0">
              <Image
                src={anyImgUrl({
                  src: "logo_with_slogan_-estajer_y6tvqg_mujo45",
                  size: 250,
                })}
                fill
                alt="Estajer Footer Logo"
                title="Estajer Footer Logo"
                unoptimized
                className="object-contain drop-shadow-lg"
              />
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-7 max-w-sm mx-auto lg:mx-0 whitespace-pre-line">
              {t("description")}
            </p>

            {/* Social icons */}
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                {t("followUs")}
              </h3>
              <nav
                role="navigation"
                aria-label={t("socialMediaLinks")}
                className="flex flex-wrap gap-2 justify-center lg:justify-start"
              >
                {[
                  {
                    href: "https://www.facebook.com/estajer",
                    icon: <Facebook />,
                    label: t("social.facebook.ariaLabel"),
                    title: t("social.facebook.title"),
                  },
                  {
                    href: "https://www.tiktok.com/@estajer.com",
                    icon: <Tiktok />,
                    label: t("social.tiktok.ariaLabel"),
                    title: t("social.tiktok.title"),
                  },
                  {
                    href: "https://www.snapchat.com/add/estajercom",
                    icon: <Snapchat />,
                    label: t("social.snapchat.ariaLabel"),
                    title: t("social.snapchat.title"),
                  },
                  {
                    href: "https://www.linkedin.com/company/estajer/",
                    icon: <Linkedin />,
                    label: t("social.linkedin.ariaLabel"),
                    title: t("social.linkedin.title"),
                  },
                  {
                    href: "https://x.com/estajercom",
                    icon: <Twitter />,
                    label: t("social.twitter.ariaLabel"),
                    title: t("social.twitter.title"),
                  },
                  {
                    href: "https://www.instagram.com/estajercom/",
                    icon: <Instagram />,
                    label: t("social.instagram.ariaLabel"),
                    title: t("social.instagram.title"),
                  },
                ].map(({ href, icon, label, title }) => (
                  <Link
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={title}
                    className="p-2 bg-white/10 hover:bg-primary/20 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  >
                    {icon}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* ── Col 2: Nav links ── */}
          <div className="lg:col-span-5">
            <div className="hidden md:grid grid-cols-3 gap-8 text-start">
              {/* Estajer nav */}
              <nav
                role="navigation"
                aria-label={t("navigation.mainSite.ariaLabel")}
              >
                <h3 className="text-xs md:text-sm font-semibold text-primary uppercase tracking-widest border-b border-primary/25 pb-2 mb-4">
                  {t("websiteName")}
                </h3>
                <ul className="space-y-2.5">
                  {[
                    {
                      href: `${langPrefix}/search/products`,
                      label: t("allProducts"),
                      titleKey: "navigation.mainSite.allProducts",
                    },
                    // {
                    //   href: `${langPrefix}/shops`,
                    //   label: t("allShops"),
                    //   titleKey: "navigation.mainSite.allShops",
                    // },
                    {
                      href: `${langPrefix}/rent-flow`,
                      label: t("createShop"),
                      titleKey: "navigation.mainSite.createShop",
                    },
                    {
                      href: `${langPrefix}/proposal`,
                      label: t("proposal"),
                      titleKey: "navigation.mainSite.proposal",
                    },
                    {
                      href: `${langPrefix}/contact`,
                      label: t("support"),
                      titleKey: "navigation.mainSite.support",
                    },
                  ].map(({ href, label, titleKey }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        title={t(`${titleKey}.title`)}
                        aria-label={t(`${titleKey}.ariaLabel`)}
                        className="text-gray-400 hover:text-primary text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* About nav */}
              <nav
                role="navigation"
                aria-label={t("navigation.about.ariaLabel")}
              >
                <h3 className="text-xs md:text-sm font-semibold text-primary uppercase tracking-widest border-b border-primary/25 pb-2 mb-4">
                  {t("about")}
                </h3>
                <ul className="space-y-2.5">
                  {[
                    {
                      href: `${langPrefix}/about`,
                      label: t("aboutUs"),
                      titleKey: "navigation.about.aboutUs",
                    },
                    {
                      href: `${langPrefix}/faq`,
                      label: t("faq"),
                      titleKey: "navigation.about.faq",
                    },
                    {
                      href: `${langPrefix}/privacy`,
                      label: t("privacy"),
                      titleKey: "navigation.about.privacy",
                    },
                    {
                      href: `${langPrefix}/terms-of-use`,
                      label: t("terms"),
                      titleKey: "navigation.about.terms",
                    },
                    {
                      href: `${langPrefix}/blogs`,
                      label: t("blog"),
                      titleKey: "navigation.mainSite.blog",
                    },
                  ].map(({ href, label, titleKey }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        title={t(`${titleKey}.title`)}
                        aria-label={t(`${titleKey}.ariaLabel`)}
                        className="text-gray-400 hover:text-primary text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* My products nav */}
              <nav
                role="navigation"
                aria-label={t("navigation.myProducts.ariaLabel")}
              >
                <h3 className="text-xs md:text-sm font-semibold text-primary uppercase tracking-widest border-b border-primary/25 pb-2 mb-4">
                  {t("myProducts")}
                </h3>
                <ul className="space-y-2.5">
                  {[
                    {
                      href: `${langPrefix}/dashboard/products`,
                      label: t("myProductsList"),
                      titleKey: "navigation.myProducts.productsList",
                    },
                    {
                      href: `${langPrefix}/dashboard/my-orders`,
                      label: t("myOrders"),
                      titleKey: "navigation.myProducts.myOrders",
                    },
                    {
                      href: `${langPrefix}/dashboard/my-orders`,
                      label: t("myPurchases"),
                      titleKey: "navigation.myProducts.myPurchases",
                    },
                    {
                      href: `${langPrefix}/favorites`,
                      label: t("myFavorites"),
                      titleKey: "navigation.myProducts.myFavorites",
                    },
                  ].map(({ href, label, titleKey }) => (
                    <li key={`${href}-${label}`}>
                      <Link
                        href={href}
                        title={t(`${titleKey}.title`)}
                        aria-label={t(`${titleKey}.ariaLabel`)}
                        className="text-gray-400 hover:text-primary text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* App store buttons */}
            <div className="mt-8">
              <h3 className="md:text-start text-center text-xs md:text-sm font-semibold text-primary uppercase tracking-widest mb-4">
                {t("soon")}
              </h3>
              <div className="flex justify-center md:justify-start gap-3">
                <a
                  href="#"
                  rel="noopener noreferrer"
                  aria-label="Download on the App Store (Coming Soon)"
                  className="group inline-block transition-all duration-300 hover:shadow-lg"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="Download on the App Store"
                    className="h-10 w-auto transition-transform group-hover:scale-105"
                  />
                </a>
                <a
                  href="#"
                  rel="noopener noreferrer"
                  aria-label="Get it on Google Play (Coming Soon)"
                  className="group inline-block transition-all duration-300 hover:shadow-lg"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    className="h-10 w-auto transition-transform group-hover:scale-105"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* ── Col 3: WhatsApp + partner badges ── */}
          <div className="lg:col-span-3 flex flex-col gap-5 text-center">
            <Button
              as={Link}
              href={`${langPrefix}/add-product`}
              className="w-full font-semibold gap-2 text-sm md:text-base px-6 py-4 bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <Plus
                className="md:w-[18px] w-4 md:h-[18px] h-4"
                color="#ffffff"
              />{" "}
              {translate("ui.button.addAd")}
            </Button>
            {/* WhatsApp CTA */}
            <Link
              href="https://api.whatsapp.com/send?phone=966530636879"
              target="_blank"
              rel="noopener noreferrer"
              title={t("whatsappLink.title")}
              aria-label={t("whatsappLink.ariaLabel")}
              className="block"
            >
              <Button
                color="success"
                variant="bordered"
                className="w-full font-semibold gap-2 text-sm px-6 py-4 border-2 border-green-500 hover:bg-green-500/10 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <Whatsapp />
                {t("whatsapp")}
              </Button>
            </Link>

            {/* ── Partner / Verified-via badges — horizontal row ── */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest text-center mb-3">
                {t("verifiedVia")}
              </p>

              {/* Three logos side-by-side with subtle dividers */}
              <div className="flex items-center justify-around gap-1.5">
                <div className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-lg px-2 py-2.5">
                  <Freelance className="h-7 w-auto max-w-[76px]" />
                </div>

                <div className="w-px h-8 bg-white/10 shrink-0" />

                <div className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-lg px-2 py-2.5">
                  <FutureWork className="h-7 w-auto max-w-[76px]" />
                </div>

                <div className="w-px h-8 bg-white/10 shrink-0" />

                <div className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-lg px-2 py-2.5">
                  <Nafath className="h-7 w-auto max-w-[76px]" />
                </div>
              </div>
            </div>
            <div className="hidden md:flex justify-center pt-4">
              <ScrollToTop />
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.08] pt-6 pb-8 flex flex-col md:flex-row md:justify-between items-center gap-5">
          {/* Copyright */}
          <p className="text-gray-500 text-xs md:text-sm order-2 md:order-1">
            {t("copyRight").replace("{year}", new Date().getFullYear())}
          </p>

          {/* Payment icons */}
          <div className="order-1 md:order-2 flex items-center gap-3 flex-wrap justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3">
            {[
              <Tabby key="tabby" />,
              <Bank key="bank" />,
              <Mada key="mada" />,
              <MasterCard key="mc" />,
              <Visa key="visa" />,
              <ApplePay key="apple" />,
            ].map((icon) => (
              <div
                key={icon.key}
                className="hover:scale-110 transition-transform duration-300"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
