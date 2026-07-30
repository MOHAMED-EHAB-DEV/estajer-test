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
 * Minimal theme Header
 * Aesthetic: pure white, hairline bottom border, generous padding, monospace accent text.
 * No shadows, no gradients — just geometry and type.
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
    langPrefix,
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
        className={`${isSticky ? "sticky top-0" : "relative"} w-full z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? "bg-white/95 backdrop-blur-sm shadow-sm py-3.5"
            : "bg-transparent py-4"
        } ${isDarkText ? "text-neutral-900" : "text-white"}`}
        style={{
          borderBottom:
            scrolled || mobileOpen
              ? "1px solid #e5e5e5"
              : "1px solid transparent",
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 relative">
          {searchOpen && (
            <div className="absolute inset-x-0 top-0 bottom-0 bg-white z-50 flex items-center px-4 md:px-10 lg:px-16 animate-in fade-in duration-200">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 flex items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-neutral-300">
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "ابحث..." : "SEARCH..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent focus:outline-none text-[11px] w-full text-neutral-800 placeholder:text-neutral-300 font-mono tracking-wider uppercase"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    <IconSearch size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-neutral-400 hover:text-neutral-900 text-xs font-bold px-2 py-1.5 transition-colors"
                >
                  ✕
                </button>
              </form>
            </div>
          )}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${langPrefix}shops/${shop.slug}`}
              className={`flex items-center gap-3 group shrink-0 transition-all duration-300 h-10 ${
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
                  className="h-full w-auto object-contain"
                />
              ) : (
                <div
                  className="h-full px-3.5 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: brandColor }}
                >
                  {(shopName || "S")[0]}
                </div>
              )}
            </Link>

            {/* Desktop nav — minimal, no underlines on default */}
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-medium transition-colors duration-200 tracking-wide ${
                    scrolled || mobileOpen ? "py-3 px-4" : "p-4"
                  } ${
                    isDarkText
                      ? "text-neutral-400 hover:text-neutral-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher
                lang={lang}
                home={!isDarkText}
                brandColor={brandColor}
                className={`relative hidden md:flex items-center rounded-lg p-0.5 border cursor-pointer select-none transition-all duration-300 ${
                  isDarkText
                    ? "border-neutral-200 bg-white text-neutral-850"
                    : "border-white/20 bg-white/10 text-white"
                }`}
                roundedClass="rounded-md"
              />
              <ShopUserData
                variant="minimal"
                lang={lang}
                translate={translate}
                brandColor={brandColor}
                isDarkText={isDarkText}
              />
              <button
                type="button"
                onClick={() => setLangOpen(true)}
                className={`md:hidden w-9 h-9 flex items-center justify-center transition-colors ${
                  isDarkText
                    ? "text-neutral-400 hover:text-neutral-900"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Lang className="w-5 h-5" fill="currentColor" />
              </button>
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={`md:flex w-9 h-9 flex items-center justify-center transition-colors ${
                    isDarkText
                      ? "text-neutral-400 hover:text-neutral-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <IconSearch size={17} />
                </button>
              )}
              <Link
                href={cartUrl}
                className={`md:flex relative w-9 h-9 flex items-center justify-center transition-colors ${
                  isDarkText
                    ? "text-neutral-500 hover:text-neutral-900"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <IconShoppingBag size={18} />
                <span
                  className="absolute -top-0.5 -end-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: brandColor }}
                >
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu — slides down cleanly */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-neutral-100 ${
            mobileOpen ? "max-h-[500px]" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col px-6 py-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
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
