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

  return (
    <>
      <header
        className={`${isSticky ? `sticky top-4 ${isScrolled || isMobileMenuOpen ? "my-4" : ""}` : "relative mt-4"} w-full z-50 px-4 md:px-8`}
      >
        {/* Floating pill container */}
        <div
          className={`max-w-screen-2xl mx-auto rounded-3xl border transition-all duration-300 py-3 px-5 md:px-8 ${
            isScrolled || isMobileMenuOpen
              ? "bg-white/95 backdrop-blur-sm border-neutral-200/50 shadow-lg text-neutral-800"
              : `bg-white/10 backdrop-blur-sm border-white/10 shadow-none ${isDarkText ? "text-neutral-800" : "text-white"}`
          }`}
        >
          {searchOpen && (
            <div className="absolute inset-x-4 md:inset-x-8 top-0 bottom-0 bg-white/95 backdrop-blur-md rounded-3xl z-50 flex items-center px-5 md:px-8 animate-in fade-in duration-300">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 flex items-center gap-3"
              >
                <div className="flex-1 flex items-center gap-2 bg-[#FDFBF7] rounded-2xl px-4 py-2 border border-neutral-200/40">
                  <input
                    type="text"
                    placeholder={
                      lang === "ar"
                        ? "ابحث في متجرنا الدافئ..."
                        : "Search our cozy shop..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs w-full text-neutral-800 placeholder:text-neutral-400 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-neutral-400 hover:text-neutral-800 transition-colors"
                  >
                    <IconSearch size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-neutral-500 hover:text-neutral-800 text-xs font-semibold px-2 py-1 transition-colors"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
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
                  className="h-full w-auto object-contain transition-transform duration-500 group-hover:rotate-6"
                />
              ) : (
                <div className="h-full px-3.5 bg-[#FAF6F0] flex items-center justify-center text-[10px] text-neutral-400 font-bold rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-neutral-200/55">
                  🌿
                </div>
              )}
            </Link>

            {/* Cozy Pill Nav Links */}
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold rounded-full transition-all duration-300 ${
                    isScrolled || isMobileMenuOpen ? "py-3 px-4" : "p-4"
                  } ${
                    isDarkText
                      ? "text-neutral-500 hover:text-neutral-900 hover:bg-[#FAF6F0]"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions Panel */}
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher
                lang={lang}
                home={!isDarkText}
                brandColor={brandColor}
                className={`relative hidden md:flex items-center rounded-full border cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider transition-all duration-300 p-0.5 ${
                  isDarkText
                    ? "border-transparent bg-[#FAF6F0] text-neutral-700"
                    : "border-white/20 bg-white/10 text-white"
                }`}
                roundedClass="rounded-full"
              />
              <ShopUserData
                variant="cozy"
                lang={lang}
                translate={translate}
                brandColor={brandColor}
                isDarkText={isDarkText}
              />
              <button
                type="button"
                onClick={() => setLangOpen(true)}
                className="md:hidden w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all"
                aria-label="Language selection"
              >
                <Lang className="w-4 h-4" fill="currentColor" />
              </button>
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="hidden md:flex w-8.5 h-8.5 rounded-full items-center justify-center transition-all"
                  aria-label="Search"
                >
                  <IconSearch size={14} />
                </button>
              )}
              <Link
                href={cartUrl}
                className="hidden md:flex w-8.5 h-8.5 rounded-full items-center justify-center transition-all relative"
                aria-label="Shopping bag"
              >
                <IconShoppingBag size={14} />
                <span
                  className="absolute -top-1 -end-1 w-4 h-4 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow"
                  style={{ backgroundColor: brandColor }}
                >
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={`md:hidden absolute top-[calc(100%+8px)] inset-x-4 bg-white border border-neutral-200/60 rounded-3xl shadow-xl transition-all duration-500 origin-top ${
            isMobileMenuOpen
              ? "scale-y-100 opacity-100"
              : "scale-y-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-6 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-neutral-800 hover:bg-[#FAF6F0] p-3 rounded-2xl transition-all"
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
