"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "@/components/ui/svgs/icons/HomeSvg";
import { Search } from "@/components/ui/svgs/icons/SearchSvg";
import { Cart } from "@/components/ui/svgs/icons/CartSvg";
import { Menu } from "@/components/ui/svgs/icons/MenuSvg";
import { useTranslations } from "@/hooks/useTranslations";

export default function ShopMobileNav({
  shop,
  lang,
  translate,
  mobileOpen,
  setMobileOpen,
  onSearchClick,
}) {
  const pathname = usePathname();
  const trans = useTranslations(translate);
  const t = (key) => trans(`mobileNav.${key}`);

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const langPrefix = lang === "ar" ? "" : "en/";
  const brandColor = shop?.brandColor || "#111111";

  const homeLink = `/${langPrefix}shops/${shop.slug}`;
  const searchLink = `/${langPrefix}shops/${shop.slug}/search/products`;
  const cartLink = `/${langPrefix}shops/${shop.slug}/cart`;

  const normalizePath = (p) => p?.replace(/\/$/, "") || "/";
  const normalizedPathname = normalizePath(pathname);
  const normalizedHomeLink = normalizePath(homeLink);

  const isHomeActive = normalizedPathname === normalizedHomeLink;
  const isSearchActive =
    normalizedPathname === normalizePath(searchLink) ||
    normalizedPathname.startsWith(`${normalizePath(searchLink)}/`);
  const isCartActive = normalizedPathname === normalizePath(cartLink);

  const ACTIVE = brandColor;
  const INACTIVE = "#0d092b";

  return (
    <nav
      className="block md:hidden fixed bottom-0 left-0 px-4 pt-4 w-full z-50"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label={t("ariaLabel") || "Mobile navigation"}
      role="navigation"
    >
      <div
        className="bg-white/90 backdrop-blur w-full px-2 py-1 rounded-full grid grid-cols-4 items-center justify-items-center gap-2 transition-all duration-300"
        style={{
          boxShadow: `0 8px 30px rgba(0, 0, 0, 0.08), 0 4px 12px ${brandColor}20`,
        }}
      >
        {/* Home Link */}
        <Link
          href={homeLink}
          onClick={() => setMobileOpen(false)}
          className="p-2 rounded-full transition-all active:scale-95 flex items-center justify-center relative"
          aria-label={t("home") || "Home"}
          aria-current={isHomeActive ? "page" : undefined}
        >
          {isHomeActive && (
            <span
              className="absolute inset-0 rounded-full opacity-10 transition-all duration-300"
              style={{ backgroundColor: brandColor }}
            />
          )}
          <Home
            color={isHomeActive ? ACTIVE : INACTIVE}
            className="w-[22px] h-[22px]"
          />
        </Link>

        {/* Search Toggle / Link */}
        {onSearchClick ? (
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onSearchClick();
            }}
            className="p-2 rounded-full transition-all active:scale-95 flex items-center justify-center"
            aria-label={t("search") || "Search"}
          >
            <Search
              color={INACTIVE}
              className="w-[22px] h-[22px]"
              strokeWidth={5}
            />
          </button>
        ) : (
          <Link
            href={searchLink}
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full transition-all active:scale-95 flex items-center justify-center relative"
            aria-label={t("search") || "Search"}
            aria-current={isSearchActive ? "page" : undefined}
          >
            {isSearchActive && (
              <span
                className="absolute inset-0 rounded-full opacity-10 transition-all duration-300"
                style={{ backgroundColor: brandColor }}
              />
            )}
            <Search
              color={isSearchActive ? ACTIVE : INACTIVE}
              className="w-[22px] h-[22px]"
              strokeWidth={isSearchActive ? 7 : 5}
            />
          </Link>
        )}

        {/* Cart Link */}
        <Link
          href={cartLink}
          onClick={() => setMobileOpen(false)}
          className="p-2 rounded-full transition-all active:scale-95 flex items-center justify-center relative"
          aria-label={t("cart") || "Cart"}
          aria-current={isCartActive ? "page" : undefined}
        >
          {isCartActive && (
            <span
              className="absolute inset-0 rounded-full opacity-10 transition-all duration-300"
              style={{ backgroundColor: brandColor }}
            />
          )}
          <Cart
            color={isCartActive ? ACTIVE : INACTIVE}
            circle={false}
            size={40}
            aria-hidden="true"
          />
          {cartCount > 0 && (
            <span
              className="hidden md:flex absolute top-1 end-1 w-4 h-4 text-white text-[9px] font-black rounded-full items-center justify-center shadow-sm"
              style={{ backgroundColor: brandColor }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        {/* Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-full transition-all active:scale-95 flex items-center justify-center relative"
          aria-label={t("menu") || "Menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen && (
            <span
              className="absolute inset-0 rounded-full opacity-10 transition-all duration-300"
              style={{ backgroundColor: brandColor }}
            />
          )}
          <Menu
            fill={mobileOpen ? ACTIVE : INACTIVE}
            className="w-[22px] h-[22px]"
          />
        </button>
      </div>
    </nav>
  );
}
