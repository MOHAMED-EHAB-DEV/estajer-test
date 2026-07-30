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
    scrolled,
    isDarkText,
    mobileOpen: isMobileMenuOpen,
    setMobileOpen: setIsMobileMenuOpen,
    isSticky,
    alwaysWhite,
    showSearch,
    shopName,
    logo,
    navLinks,
    cartUrl,
    cartCount,
    t,
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

  const brandColor = shop?.brandColor || "#F48A42";

  const logout = async () => {
    try {
      await fetch("/api/auth/user/offline", { method: "POST" });
      await fetch("/api/logout");
      window.location.href = lang === "ar" ? "/" : "/en";
    } catch (err) {
      console.error(err);
    }
  };

  // Bold theme: prominent brand-color bar at top, white body below
  const headerBg =
    alwaysWhite || scrolled || isMobileMenuOpen
      ? "bg-white/95 backdrop-blur-sm border-b border-neutral-100 shadow-sm"
      : "bg-transparent";

  const textColor = isDarkText ? "text-darkNavy" : "text-white";
  const subTextColor = isDarkText ? "text-neutral-500" : "text-white/80";

  return (
    <>
      {/* Brand color top stripe */}
      <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />
      <header
        className={`${isSticky ? "sticky top-0" : "relative"} w-full z-50 transition-all duration-300 ${headerBg} ${textColor}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 relative">
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
                    className="text-neutral-400 hover:text-var(--brand) transition-colors"
                    style={{ "--brand": brandColor }}
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
                scrolled || isMobileMenuOpen ? "md:h-12" : "md:h-14"
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
                <div
                  className="h-full px-3.5 flex items-center justify-center text-white font-black text-sm rounded-xl"
                  style={{ backgroundColor: brandColor }}
                >
                  {(shopName || "S")[0]}
                </div>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-bold transition-all duration-200 rounded-xl ${
                    scrolled || isMobileMenuOpen ? "py-3 px-4" : "p-4"
                  } ${subTextColor} hover:text-white hover:rounded-xl`}
                  style={{
                    "--brand": brandColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = brandColor;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "";
                  }}
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
                className={`relative hidden md:flex items-center rounded-xl p-0.5 border cursor-pointer select-none transition-all duration-300 ${
                  isDarkText
                    ? "border-neutral-200 bg-neutral-50 text-darkNavy"
                    : "border-white/20 bg-white/10 text-white"
                }`}
                roundedClass="rounded-lg"
              />
              <ShopUserData
                variant="bold"
                lang={lang}
                translate={translate}
                brandColor={brandColor}
                isDarkText={isDarkText}
              />
              <button
                type="button"
                onClick={() => setLangOpen(true)}
                className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isDarkText
                    ? `${subTextColor} hover:bg-neutral-100`
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Lang className="w-5 h-5" fill="currentColor" />
              </button>
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={`hidden md:flex w-9 h-9 rounded-xl items-center justify-center transition-all ${
                    isDarkText
                      ? `${subTextColor} hover:bg-neutral-100`
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <IconSearch size={17} />
                </button>
              )}
              <Link
                href={cartUrl}
                className="hidden md:flex relative items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-bold shadow-md transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
                style={{ backgroundColor: brandColor }}
              >
                <IconShoppingBag size={16} />
                <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-darkNavy text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full start-0 w-full bg-white border-b border-neutral-100 shadow-xl transition-all duration-300 origin-top overflow-hidden ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-bold text-darkNavy hover:text-white transition-all"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = brandColor;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "";
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
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
