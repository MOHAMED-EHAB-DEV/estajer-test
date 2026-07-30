"use client";
import Link from "next/link";
import React from "react";
import { Cart } from "./svgs/icons/CartSvg";
import { Home } from "./svgs/icons/HomeSvg";
import { Plus } from "./svgs/icons/PlusSvg";
import { Search } from "./svgs/icons/SearchSvg";
import { Menu } from "./svgs/icons/MenuSvg";
import { Chat } from "./svgs/icons/ChatSvg";

import Button from "./Button";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useUser } from "@/context/UserContext";
import { MyOrders } from "./svgs/Dashboard";

export default function MobileNav({
  langPrefix,
  onOpen,
  onNavOpen,
  navOpen,
  lang,
  translate,
  partner,
  shopSlug,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`mobileNav.${key}`);
  const pathname = usePathname();
  const { user } = useUser();
  const isRenter = user && (user?.isRenter === undefined || user?.isRenter);

  const links = {
    home: lang === "ar" ? "/" : "/en",
    search: `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}search/products`,
    cart: `/${langPrefix}${shopSlug ? `shops/${shopSlug}/` : ""}cart`,
    ...(partner ? { messages: `/${langPrefix}dashboard/messages` } : {}),
  };

  const navLabels = {
    home: t("home"),
    search: t("search"),
    addProduct: t("addProduct"),
    cart: t("cart"),
    menu: t("menu"),
    ...(partner ? { messages: t("messages") || "Messages" } : {}),
  };

  const homeLink =
    partner && shopSlug ? `/${langPrefix}shops/${shopSlug}` : links.home;
  const normalizePath = (p) => p?.replace(/\/$/, "") || "/";
  const normalizedPathname = normalizePath(pathname);
  const normalizedHomeLink = normalizePath(homeLink);

  const isHomeActive = normalizedPathname === normalizedHomeLink;

  const isSearchActive =
    normalizedPathname === normalizePath(links.search) ||
    normalizedPathname.startsWith(`${normalizePath(links.search)}/`);
  const isCartActive = normalizedPathname === normalizePath(links.cart);
  const isMessagesActive =
    normalizedPathname === normalizePath(links.messages) ||
    normalizedPathname.startsWith(`${normalizePath(links.messages)}/`);

  const ACTIVE = "#F48A42";
  const INACTIVE = "#0d092b";

  if (partner) {
    const items = [
      {
        href: homeLink,
        label: navLabels.home,
        active: isHomeActive,
        icon: (
          <Home color={isHomeActive ? ACTIVE : INACTIVE} aria-hidden="true" />
        ),
      },
      {
        href: links.search,
        label: navLabels.search,
        active: isSearchActive,
        icon: (
          <Search
            color={isSearchActive ? ACTIVE : "#64748b"}
            className="w-[22px] h-[22px]"
            aria-hidden="true"
            strokeWidth={isSearchActive ? 7 : 5}
          />
        ),
      },
      {
        href: links.messages,
        label: navLabels.messages,
        active: isMessagesActive,
        icon: (
          <Chat
            className="w-[22px] h-[22px]"
            fill={isMessagesActive ? ACTIVE : "#64748b"}
            aria-hidden="true"
          />
        ),
      },
      {
        href: links.cart,
        label: navLabels.cart,
        active: isCartActive,
        icon: (
          <Cart
            color={isCartActive ? ACTIVE : "#64748b"}
            circle={false}
            size={40}
            aria-hidden="true"
          />
        ),
      },
    ];

    return (
      <nav
        className="block md:hidden fixed bottom-0 left-0 w-full z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label={t("ariaLabel")}
        role="navigation"
      >
        {/* Safe-area spacer */}
        <div
          className="relative mx-3 mb-3"
          style={{ filter: "drop-shadow(0 -1px 16px rgba(13,9,43,0.10))" }}
        >
          <div className="bg-white rounded-[24px] grid grid-cols-4 items-end px-2 pt-2 pb-3 gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
                className="flex flex-col items-center justify-end gap-[5px] min-h-[54px] relative active:scale-90 transition-transform focus:outline-none group"
              >
                {/* Active background bubble */}
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300 ${
                    item.active
                      ? "w-10 h-10 bg-primary/10"
                      : "w-0 h-0 opacity-0"
                  }`}
                />
                {/* Icon wrapper */}
                <span className="relative z-10 flex items-center justify-center w-10 h-10">
                  {item.icon}
                </span>
                {/* Label */}
                <span
                  className={`text-[10px] font-semibold leading-none tracking-wide transition-colors ${
                    item.active ? "text-primary" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  // ── Default mode ───────────────────────────────────────────────────────────
  return (
    <nav
      className="block md:hidden fixed bottom-0 left-0 px-4 pt-4 w-full z-50"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label={t("ariaLabel")}
      role="navigation"
    >
      <div className="bg-white/90 backdrop-blur shadow-[0_5px_15px_-1px_rgb(244_138_66_/_30%)] w-full px-2 py-1 rounded-full grid grid-cols-5 items-center justify-items-center gap-2">
        <Link
          href={links.home}
          title={t("homeTitle")}
          className="p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={navLabels.home}
          aria-current={isHomeActive ? "page" : undefined}
        >
          <Home color={isHomeActive ? ACTIVE : INACTIVE} aria-hidden="true" />
          <span className="sr-only">{navLabels.home}</span>
        </Link>

        <Link
          href={links.search}
          title={t("searchTitle")}
          className="p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={navLabels.search}
          aria-current={isSearchActive ? "page" : undefined}
        >
          <Search
            color={isSearchActive ? ACTIVE : INACTIVE}
            className="min-w-5 h-5"
            aria-hidden="true"
            strokeWidth={6}
          />
          <span className="sr-only">{navLabels.search}</span>
        </Link>

        {isRenter ? (
          <Button
            as={Link}
            href={`/${langPrefix}dashboard/my-orders`}
            className="font-semibold p-0 h-[2.8rem] min-w-[2.8rem] bg-primary !opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={trans("sidebar.myOrders") || "My Orders"}
          >
            <MyOrders isActive={true} className="size-5" />
            <span className="sr-only">
              {trans("sidebar.myOrders") || "My Orders"}
            </span>
          </Button>
        ) : (
          <Button
            as={Link}
            href={`/${langPrefix}add-product`}
            className="font-semibold p-0 h-[2.8rem] min-w-[2.8rem] bg-primary !opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={navLabels.addProduct}
          >
            <Plus color="#fff" size={18} aria-hidden="true" />
            <span className="sr-only">{navLabels.addProduct}</span>
          </Button>
        )}

        <Link
          href={links.cart}
          title={t("cartTitle")}
          className="p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={navLabels.cart}
          aria-current={isCartActive ? "page" : undefined}
        >
          <Cart
            color={isCartActive ? ACTIVE : INACTIVE}
            circle={false}
            size={40}
            aria-hidden="true"
          />
          <span className="sr-only">{navLabels.cart}</span>
        </Link>

        <Button
          variant="light"
          className="px-3 min-w-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          color="default"
          onPress={onNavOpen}
          aria-label={navLabels.menu}
          aria-expanded={navOpen}
          type="button"
        >
          <Menu />
          <span className="sr-only">{navLabels.menu}</span>
        </Button>
      </div>
    </nav>
  );
}
