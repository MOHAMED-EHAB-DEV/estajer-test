"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * Shared logic hook for all theme Header components.
 * Manages scroll state, mobile menu toggle, sticky/search configuration,
 * logo selection, and localized navigation links.
 */
export function useShopHeader({ shop, lang, translate, data }) {
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = useCallback((key) => trans(`sections.footer.${key}`), [trans]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolledState, setScrolledState] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const langPrefix = lang === "ar" ? "" : "en/";

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${langPrefix}shops/${shop.slug}/search/products?name=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isSticky = data?.sticky !== false;
  const alwaysWhite = data?.alwaysWhite === true;
  const showSearch = data?.showSearch !== false;

  const scrolled = scrolledState || alwaysWhite;

  useEffect(() => {
    const handleScroll = () => {
      setScrolledState(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shopName = lang === "ar" ? shop.nameAr : shop.nameEn;
  const brandColor = shop?.brandColor || "#111111";

  const isDarkText = scrolledState || alwaysWhite || mobileOpen || data?.headerDarkText === true;

  // Logo selection: light logos for transparent bg, dark logos for scrolled/white bg
  const logo = useMemo(() => {
    const useArLogo = lang === "ar" || data?.singleLangLogo === true;
    return isDarkText
      ? (useArLogo ? data?.logoDarkAr : data?.logoDarkEn) || data?.logo || shop.logo
      : (useArLogo ? data?.logoLightAr : data?.logoLightEn) || data?.logo || shop.logo;
  }, [isDarkText, lang, data, shop.logo]);

  const navLinks = useMemo(() => {
    return [
      { label: t("home"), href: `/${langPrefix}shops/${shop.slug}` },
      { label: t("products"), href: `#products` },
      { label: t("about"), href: `#about` },
      { label: t("contact"), href: `#contact` },
    ];
  }, [langPrefix, shop.slug, t]);

  const cartUrl = `/${langPrefix}shops/${shop.slug}/cart`;

  return {
    scrolled,
    isScrolled: scrolled, // compatibility alias
    isDarkText,
    mobileOpen,
    setMobileOpen,
    isMobileMenuOpen: mobileOpen, // compatibility alias
    setIsMobileMenuOpen: setMobileOpen, // compatibility alias
    isSticky,
    alwaysWhite,
    showSearch,
    shopName,
    brandColor,
    logo,
    navLinks,
    cartUrl,
    cartCount,
    t,
    trans,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    langOpen,
    setLangOpen,
    langPrefix,
  };
}
