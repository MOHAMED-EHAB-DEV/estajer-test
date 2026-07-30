"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useShopHeader } from "../shared/useShopHeader";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import LangDrawer from "@/components/ui/LangDrawer";
import { Lang } from "@/components/ui/svgs/icons/LangSvg";
import { IconSearch, IconShoppingBag, IconMenu, IconClose } from "./Icons";
import ShopUserData from "../shared/ShopUserData";
import ShopMobileNav from "../shared/ShopMobileNav";
import { useUser } from "@/context/UserContext";

/**
 * Modern theme Header
 * Aesthetic: Clean, ultra-modern, soft off-white backdrop on scroll, floating header feeling, pill-hover states.
 */
export default function Header({ shop, lang, translate, data }) {
  const { user } = useUser();
  const {
    scrolled,
    isDarkText,
    mobileOpen,
    setMobileOpen,
    isSticky,
    showSearch,
    shopName,
    logo,
    navLinks,
    cartUrl,
    cartCount,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    langOpen,
    setLangOpen,
    trans,
  } = useShopHeader({ shop, lang, translate, data });

  const brandColor = shop?.brandColor || "#111111";

  const logout = async () => {
    try {
      await fetch("/api/auth/user/offline", { method: "POST" });
      await fetch("/api/logout");
      window.location.href = lang === "ar" ? "/" : "/en";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header
        className={`${isSticky ? "sticky top-0" : "relative"} w-full z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-neutral-100/80 py-3"
            : "bg-transparent py-4"
        } ${isDarkText ? "text-neutral-800" : "text-white"}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 relative">
          {searchOpen && (
            <div className="absolute inset-x-0 top-0 bottom-0 bg-white z-50 flex items-center px-4 md:px-10 lg:px-16 animate-in fade-in duration-200">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 flex items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2 bg-[#F3F4F6]/70 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-neutral-200/40 shadow-sm">
                  <input
                    type="text"
                    placeholder={
                      lang === "ar" ? "ابحث عن منتج..." : "Search products..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs w-full text-neutral-800 placeholder:text-neutral-400 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    <IconSearch size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs font-bold px-2 py-1.5 transition-colors"
                >
                  ✕
                </button>
              </form>
            </div>
          )}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${lang}/shops/${shop.slug}`}
              className={`flex items-center gap-3 shrink-0 group transition-all duration-300 h-10 ${
                scrolled || mobileOpen ? "md:h-12" : "md:h-14"
              }`}
            >
              {logo ? (
                <Image
                  unoptimized
                  src={
                    logo.startsWith("data:")
                      ? logo
                      : anyImgUrl({ src: logo, size: 200 })
                  }
                  alt={shopName}
                  width={150}
                  height={56}
                  className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className="h-full px-3.5 rounded-2xl flex items-center justify-center text-white text-base font-bold transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: brandColor }}
                >
                  {(shopName || "S")[0]}
                </div>
              )}
            </Link>

            {/* Desktop Nav - Pill hover elements */}
            <nav
              className={`hidden md:flex items-center gap-4 border p-1.5 rounded-full transition-all duration-300 ${
                isDarkText
                  ? "bg-white border-neutral-200/50 shadow-sm"
                  : "bg-white/10 border-white/20 text-white"
              }`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-medium rounded-full transition-all duration-300 ${
                    scrolled || mobileOpen ? "py-3 px-4" : "p-4"
                  } ${
                    isDarkText
                      ? "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher
                lang={lang}
                home={!isDarkText}
                brandColor={brandColor}
                className={`relative hidden md:flex items-center rounded-full p-0.5 border cursor-pointer select-none transition-all duration-300 ${
                  isDarkText
                    ? "border-neutral-205 bg-neutral-50 text-neutral-800"
                    : "border-white/20 bg-white/10 text-white"
                }`}
                roundedClass="rounded-full"
              />
              <ShopUserData
                variant="modern"
                lang={lang}
                translate={translate}
                brandColor={brandColor}
                isDarkText={isDarkText}
              />
              <button
                type="button"
                onClick={() => setLangOpen(true)}
                className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isDarkText
                    ? "text-neutral-550 hover:text-neutral-900 bg-white border-neutral-100 hover:border-neutral-200"
                    : "text-white/80 hover:text-white bg-white/10 border-white/10 hover:border-white/20"
                }`}
                aria-label="Language selection"
              >
                <Lang className="w-5 h-5" fill="currentColor" />
              </button>
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center border transition-all duration-300 ${
                    isDarkText
                      ? "text-neutral-550 hover:text-neutral-900 bg-white border-neutral-100 hover:border-neutral-200"
                      : "text-white/80 hover:text-white bg-white/10 border-white/10 hover:border-white/20"
                  }`}
                >
                  <IconSearch size={18} />
                </button>
              )}
              <Link
                href={cartUrl}
                className={`md:flex relative w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isDarkText
                    ? "text-neutral-555 hover:text-neutral-900 bg-white border-neutral-100 hover:border-neutral-200"
                    : "text-white/80 hover:text-white bg-white/10 border-white/10 hover:border-white/20"
                }`}
              >
                <IconShoppingBag size={18} />
                <span
                  className="absolute -top-0.5 -end-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: brandColor }}
                >
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-neutral-100 ${
            mobileOpen
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col px-6 py-4 gap-3 bg-[#F9FAFB]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm font-medium text-neutral-600 rounded-lg hover:text-neutral-900 hover:bg-white transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {langOpen && (
        <LangDrawer
          open={langOpen}
          setOpen={setLangOpen}
          lang={lang}
          trans={trans}
        />
      )}
      <ShopMobileNav
        shop={shop}
        lang={lang}
        translate={translate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onSearchClick={() => setSearchOpen(true)}
      />
    </>
  );
}
