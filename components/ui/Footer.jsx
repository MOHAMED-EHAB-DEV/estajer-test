import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import Button from "./Button";
import { getTranslations } from "@/hooks/getTranslations";
import ScrollToTop from "./ScrollToTop";

export default async function Footer({ lang }) {
  const translate = await getTranslations(lang, ["footer"]);
  const t = (value) => translate(`footer.${value}`);
  const langPrefix = lang === "ar" ? "" : "/en";

  return (
    <footer
      role="contentinfo"
      className="relative overflow-hidden pb-28 md:!pb-0"
      style={{
        backgroundColor: "#0d092b",
        paddingBottom: "calc(7rem + env(safe-area-inset-bottom, 0px))",
      }}
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
                    src: "/svgs/footer/facebook.svg",
                    label: t("social.facebook.ariaLabel"),
                    title: t("social.facebook.title"),
                  },
                  {
                    href: "https://www.tiktok.com/@estajer.com",
                    src: "/svgs/footer/tiktok.svg",
                    label: t("social.tiktok.ariaLabel"),
                    title: t("social.tiktok.title"),
                  },
                  {
                    href: "https://www.snapchat.com/add/estajercom",
                    src: "/svgs/footer/snapchat.svg",
                    label: t("social.snapchat.ariaLabel"),
                    title: t("social.snapchat.title"),
                  },
                  {
                    href: "https://www.linkedin.com/company/estajer/",
                    src: "/svgs/footer/linkedin.svg",
                    label: t("social.linkedin.ariaLabel"),
                    title: t("social.linkedin.title"),
                  },
                  {
                    href: "https://x.com/estajercom",
                    src: "/svgs/footer/twitter.svg",
                    label: t("social.twitter.ariaLabel"),
                    title: t("social.twitter.title"),
                  },
                  {
                    href: "https://www.instagram.com/estajercom/",
                    src: "/svgs/footer/instagram.svg",
                    label: t("social.instagram.ariaLabel"),
                    title: t("social.instagram.title"),
                  },
                  {
                    href: "https://www.youtube.com/@Estajer",
                    src: "/svgs/footer/youtube.svg",
                    label: t("social.youtube.ariaLabel"),
                    title: t("social.youtube.title"),
                  },
                ].map(({ href, src, label, title }) => (
                  <Link
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={title}
                    className="p-2 bg-white/10 hover:bg-primary/20 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  >
                    <img
                      src={src}
                      alt={title || label}
                      className="w-8 h-8"
                      loading="lazy"
                    />
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
                    <li key={href} className="group">
                      <Link
                        href={href}
                        title={t(`${titleKey}.title`)}
                        aria-label={t(`${titleKey}.ariaLabel`)}
                        className="text-gray-400 group-hover:text-primary text-sm transition-colors duration-300 group-hover:translate-x-1 inline-block"
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
                    <li key={href} className="group">
                      <Link
                        href={href}
                        title={t(`${titleKey}.title`)}
                        aria-label={t(`${titleKey}.ariaLabel`)}
                        className="text-gray-400 group-hover:text-primary text-sm transition-colors duration-300 group-hover:translate-x-1 inline-block"
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
                    <li key={`${href}-${label}`} className="group">
                      <Link
                        href={href}
                        title={t(`${titleKey}.title`)}
                        aria-label={t(`${titleKey}.ariaLabel`)}
                        className="text-gray-400 group-hover:text-primary text-sm transition-colors duration-300 group-hover:translate-x-1 inline-block"
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
                    loading="lazy"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.estajer.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get it on Google Play"
                  className="group inline-block transition-all duration-300 hover:shadow-lg"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    className="h-10 w-auto transition-transform group-hover:scale-105"
                    loading="lazy"
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
              <img
                src="/svgs/footer/plus.svg"
                alt="Add"
                className="md:w-4.5 w-4 md:h-4.5 h-4"
                loading="lazy"
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
                <img
                  src="/svgs/footer/whatsapp.svg"
                  alt=""
                  aria-hidden="true"
                  className="md:w-5 md:h-5 w-4 h-4"
                  loading="lazy"
                />
                {t("whatsapp")}
              </Button>
            </Link>

            {/* ── Partner / Verified-via badges — horizontal row ── */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest text-center mb-3">
                {t("verifiedVia")}
              </p>

              {/* Three logos side-by-side with subtle dividers */}
              <div className="flex items-center flex-wrap justify-around gap-1.5">
                <div className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-lg px-2 py-2.5">
                  <img
                    src="/svgs/footer/freelance.svg"
                    alt="Freelance"
                    className="h-7 w-auto max-w-[76px]"
                    loading="lazy"
                  />
                </div>

                <div className="w-px h-8 bg-white/10 shrink-0" />

                <div className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-lg px-2 py-2.5">
                  <img
                    src="/svgs/footer/futurework.svg"
                    alt="Future Work"
                    className="h-7 w-auto max-w-[76px]"
                    loading="lazy"
                  />
                </div>

                <div className="w-px h-8 bg-white/10 shrink-0" />

                <div className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-lg px-2 py-2.5">
                  <img
                    src="/svgs/footer/nafath.svg"
                    alt="Nafath"
                    className="h-7 w-auto max-w-[76px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            {/* CR & Tax ID Info */}
            <div className="flex flex-col min-[360px]:flex-row gap-[5px] w-full">
              {/* CR Block */}
              <div className="flex-1 flex items-center gap-[5px] bg-white/[0.03] border border-white/10 rounded-xl p-3 hover:bg-white/[0.06] transition-all duration-300">
                <div>
                  <Image
                    unoptimized
                    src={anyImgUrl({
                      src: "products/ymp6qicy3kfpybelldhq",
                      size: 250,
                    })}
                    width={32}
                    height={32}
                    alt="Commercial Register"
                    title="Commercial Register"
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <div className="text-start">
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                    {t("cr")}
                  </span>
                  <span className="block text-[11px] font-semibold text-white/90 font-mono">
                    1010916873
                  </span>
                </div>
              </div>

              {/* Tax ID Block */}
              <div className="flex-1 flex items-center gap-[6px] bg-white/[0.03] border border-white/10 rounded-xl p-3 hover:bg-white/[0.06] transition-all duration-300">
                <div>
                  <img
                    src="/svgs/footer/tax.svg"
                    alt="Tax"
                    className="w-10 h-8 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="text-start">
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                    {t("tax")}
                  </span>
                  <span className="block text-[11px] font-semibold text-white/90 font-mono">
                    311791334800003
                  </span>
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
          {/* Copyright & Company Name */}
          <div className="order-2 md:order-1 flex flex-col items-center md:items-start gap-1">
            <p className="text-gray-500 text-xs md:text-sm">
              {t("copyRight").replace("{year}", new Date().getFullYear())}
            </p>
            <p className="text-gray-600 text-[10px] md:text-xs">
              {t("company")}
            </p>
          </div>

          {/* Payment icons */}
          <div className="order-1 md:order-2 flex items-center gap-3 flex-wrap justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3">
            {[
              {
                src: "/svgs/footer/tabby.svg",
                alt: "Tabby",
                key: "tabby",
                className: "h-6 w-auto",
              },
              {
                src: "/svgs/footer/bank.svg",
                alt: "Bank",
                key: "bank",
                className: "h-6 w-auto",
              },
              {
                src: "/svgs/footer/mada.svg",
                alt: "Mada",
                key: "mada",
                className: "h-6 w-auto",
              },
              {
                src: "/svgs/footer/mastercard.svg",
                alt: "MasterCard",
                key: "mc",
                className: "h-6 w-auto",
              },
              {
                src: "/svgs/footer/visa.svg",
                alt: "Visa",
                key: "visa",
                className: "h-6 w-auto",
              },
              {
                src: "/svgs/footer/apple-pay.svg",
                alt: "Apple Pay",
                key: "apple",
                className: "h-6 w-auto",
              },
            ].map(({ src, alt, key, className }) => (
              <div
                key={key}
                className="hover:scale-110 transition-transform duration-300"
              >
                <img src={src} alt={alt} className={className} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
