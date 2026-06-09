"use client";
import Link from "next/link";
import React from "react";
import { Cart } from "./svgs/icons/CartSvg";
import { Home } from "./svgs/icons/HomeSvg";
import { Plus } from "./svgs/icons/PlusSvg";
import { Search } from "./svgs/icons/SearchSvg";
import { Menu } from "./svgs/icons/MenuSvg";

import Button from "./Button";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function MobileNav({
  langPrefix,
  onOpen,
  onNavOpen,
  navOpen,
  lang,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`mobileNav.${key}`);
  const pathname = usePathname();

  const links = {
    home: lang === "ar" ? "/" : "/en",
    search: `/${langPrefix}search/products`,
    cart: `/${langPrefix}cart`,
  };

  const navLabels = {
    home: t("home"),
    search: t("search"),
    addProduct: t("addProduct"),
    cart: t("cart"),
    menu: t("menu"),
  };

  return (
    <nav
      className="block md:hidden fixed bottom-0 left-0 p-4 w-full z-50"
      aria-label={t("ariaLabel")}
      role="navigation"
    >
      <div className="bg-white/90 backdrop-blur shadow-[0_5px_15px_-1px_rgb(244_138_66_/_30%)] w-full px-2 py-1 rounded-full grid grid-cols-5 items-center justify-items-center gap-2">
        <Link
          href={`/${langPrefix}`}
          title={t("homeTitle")}
          className="p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={navLabels.home}
          aria-current={pathname === links.home ? "page" : undefined}
        >
          <Home
            color={pathname === links.home ? "#F48A42" : "#0d092b"}
            aria-hidden="true"
          />
          <span className="sr-only">{navLabels.home}</span>
        </Link>

        <Link
          href={`/${langPrefix}search/products`}
          title={t("searchTitle")}
          className="p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={navLabels.search}
          aria-current={pathname === links.search ? "page" : undefined}
        >
          <Search
            color={pathname === links.search ? "#F48A42" : "#0d092b"}
            className="min-w-5 h-5"
            aria-hidden="true"
            strokeWidth={6}
          />
          <span className="sr-only">{navLabels.search}</span>
        </Link>

        <Button
          as={Link}
          href={`/${langPrefix}add-product`}
          className="font-semibold p-0 h-[2.8rem] min-w-[2.8rem] bg-primary !opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={navLabels.addProduct}
        >
          <Plus color="#fff" size={18} aria-hidden="true" />
          <span className="sr-only">{navLabels.addProduct}</span>
        </Button>

        <Link
          href={`/${langPrefix}cart`}
          title={t("cartTitle")}
          className="p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={navLabels.cart}
          aria-current={pathname === links.cart ? "page" : undefined}
        >
          <Cart
            color={pathname === links.cart ? "#F48A42" : "#0d092b"}
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
