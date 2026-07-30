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
    langPrefix,
  } = useShopHeader({ shop, lang, translate, data });

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
          isScrolled || isMobileMenuOpen
            ? "bg-white/95 backdrop-blur-sm border-b border-neutral-200/50 py-3 shadow-sm"
            : "bg-transparent py-4"
        } ${isDarkText ? "text-darkNavy" : "text-white"}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 relative">
          {searchOpen && (
            <div className="absolute inset-x-0 top-0 bottom-0 bg-white z-50 flex items-center px-4 md:px-6 lg:px-8 animate-in fade-in duration-200">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 flex items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-1.5 border border-neutral-200/60">
                  <input
                    type="text"
                    placeholder={
                      lang === "ar" ? "ابحث عن منتج..." : "Search products..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs w-full text-darkNavy placeholder:text-neutral-400 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-neutral-400 hover:text-var(--shop-brand) transition-colors"
                    style={{ "--shop-brand": shop.brandColor }}
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
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Name */}
            <Link
              href={`/${langPrefix}shops/${shop.slug}`}
              className={`flex items-center gap-3 group shrink-0 transition-all duration-300 h-10 ${
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
                <div className="h-full px-3.5 flex items-center justify-center bg-neutral-50 text-[10px] text-neutral-300 font-bold rounded-xl border border-neutral-200/50">
                  LOGO
                </div>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-bold transition-all relative group duration-300 ${
                    isScrolled || isMobileMenuOpen ? "py-3 px-4" : "p-4"
                  } ${
                    isDarkText
                      ? "text-neutral-500 hover:text-var(--shop-brand)"
                      : "text-white/85 hover:text-white"
                  }`}
                  style={{ "--shop-brand": shop.brandColor }}
                >
                  {link.label}
                  <span
                    className={`absolute ${
                      isScrolled || isMobileMenuOpen ? "bottom-1" : "bottom-1.5"
                    } left-4 right-4 h-0.5 bg-var(--shop-brand) transition-all scale-x-0 group-hover:scale-x-100 origin-center`}
                    style={{ backgroundColor: shop.brandColor }}
                  />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <LanguageSwitcher
                lang={lang}
                home={!isDarkText}
                brandColor={shop.brandColor}
                className={`relative hidden md:flex items-center rounded-xl p-0.5 border cursor-pointer select-none transition-all duration-300 ${
                  isDarkText
                    ? "border-neutral-200 bg-neutral-50 text-darkNavy"
                    : "border-white/20 bg-white/10 text-white"
                }`}
                roundedClass="rounded-lg"
              />
              <ShopUserData
                variant="classic"
                lang={lang}
                translate={translate}
                brandColor={shop.brandColor}
                isDarkText={isDarkText}
              />
              <button
                type="button"
                onClick={() => setLangOpen(true)}
                className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDarkText
                    ? "text-darkNavy hover:bg-neutral-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Lang className="w-5 h-5" fill="currentColor" />
              </button>
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-300 ${
                    isDarkText
                      ? "text-darkNavy hover:bg-neutral-100"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <IconSearch size={18} />
                </button>
              )}
              <Link
                href={cartUrl}
                className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-300 relative ${
                  isDarkText
                    ? "text-darkNavy hover:bg-neutral-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <IconShoppingBag size={18} />
                <span
                  className="absolute top-1 end-1 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: shop.brandColor }}
                >
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200 transition-all duration-300 origin-top ${
            isMobileMenuOpen
              ? "scale-y-100 opacity-100"
              : "scale-y-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-darkNavy hover:text-var(--shop-brand)"
                style={{ "--shop-brand": shop.brandColor }}
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
