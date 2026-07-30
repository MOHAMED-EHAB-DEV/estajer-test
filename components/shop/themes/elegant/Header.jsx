"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useShopHeader } from "../shared/useShopHeader";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import LangDrawer from "@/components/ui/LangDrawer";
import { Lang } from "@/components/ui/svgs/icons/LangSvg";
import { IconShoppingBag, IconSearch, IconMenu, IconClose } from "./Icons";
import ShopUserData from "../shared/ShopUserData";
import ShopMobileNav from "../shared/ShopMobileNav";
import { useUser } from "@/context/UserContext";

export default function Header({ shop, lang, translate, data }) {
  const { user } = useUser();
  const {
    scrolled: isScrolled,
    isDarkText,
    mobileOpen: isMobileMenuOpen,
    setMobileOpen: setIsMobileMenuOpen,
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

  const brandColor = shop?.brandColor || "#8B5E3C";

  return (
    <>
      <header
        className={`${isSticky ? "sticky top-0" : "relative"} w-full z-50 transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-white/90 backdrop-blur-xl border-b border-neutral-100 py-3.5 shadow-sm"
            : "bg-transparent py-5"
        } ${isDarkText ? "text-neutral-900" : "text-white"}`}
      >
        <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 relative">
          {searchOpen && (
            <div className="absolute inset-x-0 top-0 bottom-0 bg-white z-50 flex items-center px-6 md:px-10 lg:px-16 animate-in fade-in duration-300">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 flex items-center gap-4"
              >
                <div className="flex-1 flex items-center gap-3 border-b border-neutral-200 py-2">
                  <input
                    type="text"
                    placeholder={
                      lang === "ar"
                        ? "ابحث عن شيء استثنائي..."
                        : "Search for something exceptional..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent focus:outline-none text-sm w-full text-neutral-800 placeholder:text-neutral-300 italic"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-neutral-400 hover:text-neutral-800 transition-colors"
                  >
                    <IconSearch size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-neutral-400 hover:text-neutral-800 text-xs font-medium uppercase tracking-widest px-2 py-1 transition-colors"
                >
                  {lang === "ar" ? "إغلاق" : "Close"}
                </button>
              </form>
            </div>
          )}

          <div className="flex items-center justify-between gap-6">
            {/* Logo & Brand Name */}
            <Link
              href={`/${lang}/shops/${shop.slug}`}
              className={`flex items-center gap-3.5 group shrink-0 transition-all duration-300 h-10 ${
                isScrolled || isMobileMenuOpen ? "md:h-12" : "md:h-14"
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
                  alt={shopName || "Logo"}
                  width={150}
                  height={56}
                  className="h-full w-auto object-contain"
                />
              ) : (
                <div className="h-full px-4 flex items-center justify-center bg-neutral-50 text-[9px] text-neutral-400 tracking-widest font-medium uppercase border border-neutral-200">
                  EST
                </div>
              )}
            </Link>

            {/* Centered Minimalist Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] tracking-[0.2em] font-medium uppercase transition-colors relative group ${
                    isScrolled || isMobileMenuOpen ? "py-3 px-4" : "p-4"
                  } ${
                    isDarkText
                      ? "text-neutral-500 hover:text-neutral-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute ${
                      isScrolled || isMobileMenuOpen ? "bottom-1" : "bottom-2"
                    } left-4 right-4 h-[1px] transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-center`}
                    style={{ backgroundColor: brandColor }}
                  />
                </Link>
              ))}
            </nav>
            {/* Actions Panel */}
            <div className="flex items-center gap-3 md:gap-5">
              <LanguageSwitcher
                lang={lang}
                home={!isDarkText}
                brandColor={brandColor}
                className={`relative hidden md:flex items-center rounded-none border cursor-pointer select-none text-[10px] uppercase font-medium tracking-wider transition-all duration-300 p-0.5 ${
                  isDarkText
                    ? "border-neutral-200 bg-white text-neutral-800"
                    : "border-white/20 bg-white/10 text-white"
                }`}
                roundedClass="rounded-none"
              />
              <ShopUserData
                variant="elegant"
                lang={lang}
                translate={translate}
                brandColor={brandColor}
                isDarkText={isDarkText}
              />
              <button
                type="button"
                onClick={() => setLangOpen(true)}
                className={`md:hidden w-9 h-9 rounded-none border flex items-center justify-center transition-all ${
                  isDarkText
                    ? "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-800"
                    : "border-white/20 bg-white/10 text-white hover:border-white/40"
                }`}
                aria-label="Language selection"
              >
                <Lang className="w-4.5 h-4.5" fill="currentColor" />
              </button>
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={`md:flex w-9 h-9 rounded-none border flex items-center justify-center transition-all ${
                    isDarkText
                      ? "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-800"
                      : "border-white/20 bg-white/10 text-white hover:border-white/40"
                  }`}
                  aria-label="Search"
                >
                  <IconSearch size={15} />
                </button>
              )}
              <Link
                href={cartUrl}
                className={`md:flex w-9 h-9 rounded-none border flex items-center justify-center transition-all relative ${
                  isDarkText
                    ? "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-800"
                    : "border-white/20 bg-white/10 text-white hover:border-white/40"
                }`}
                aria-label="Shopping bag"
              >
                <IconShoppingBag size={15} />
                <span
                  className="absolute -top-1.5 -end-1.5 w-4 h-4 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Slidedown */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200 transition-all duration-500 origin-top shadow-xl ${
            isMobileMenuOpen
              ? "scale-y-100 opacity-100"
              : "scale-y-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium uppercase tracking-[0.15em] text-neutral-800 hover:text-neutral-550 border-b border-neutral-50 pb-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
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
        mobileOpen={isMobileMenuOpen}
        setMobileOpen={setIsMobileMenuOpen}
        onSearchClick={() => setSearchOpen(true)}
      />
    </>
  );
}
