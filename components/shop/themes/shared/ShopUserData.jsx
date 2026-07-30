"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useUser } from "@/context/UserContext";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { User as UserIcon } from "@/components/ui/svgs/icons/UserSvg";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";

const UserDrawer = dynamic(() => import("@/components/ui/UserDrawer"), {
  ssr: false,
});

export default function ShopUserData({
  variant = "minimal",
  lang,
  translate,
  brandColor,
  isDarkText,
}) {
  const { user } = useUser();
  const trans = useTranslations(translate);
  const tButton = (value) => trans(`ui.button.${value}`);
  const tDropdown = (value) => trans(`ui.dropdown.${value}`);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const langPrefix = lang === "ar" ? "" : "en/";

  const {
    isOpen: userOpen,
    onOpen: onUserOpen,
    onOpenChange: onUserOpenChange,
  } = useDrawerWithHistory();

  // Close dropdown on outside click or escape key
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [dropdownOpen]);

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/user/offline", { method: "POST" });
      const res = await fetch("/api/logout");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || trans("sidebar.error"));
      toast.success(ToastMessage(trans("sidebar.logoutConfirm")));
      setTimeout(() => {
        window.location.href = `/${langPrefix}`;
      }, 100);
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const links = [
    {
      href: `/${langPrefix}dashboard`,
      text: tDropdown("dashboard"),
      description: tDropdown("dashboardDescription"),
    },
    {
      href: `/${langPrefix}favorites`,
      text: tDropdown("favorites"),
      description: tDropdown("favoritesDescription"),
    },
    {
      href: `/${langPrefix}dashboard/messages`,
      text: tDropdown("messages"),
      description: tDropdown("messagesDescription"),
    },
    {
      href: `/${langPrefix}dashboard/products`,
      text: tDropdown("myProducts"),
      description: tDropdown("myProductsDescription"),
    },
    {
      href: `/${langPrefix}dashboard/settings`,
      text: tDropdown("settings"),
      description: tDropdown("settingsDescription"),
    },
  ];

  // Base and variant specific trigger styles
  let triggerClassName = "";
  if (variant === "minimal") {
    triggerClassName = `w-9 h-9 flex items-center justify-center transition-colors ${
      isDarkText
        ? "text-neutral-500 hover:text-neutral-900"
        : "text-white/80 hover:text-white"
    }`;
  } else if (variant === "bold") {
    triggerClassName = `w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
      isDarkText
        ? "text-neutral-500 hover:bg-neutral-100"
        : "text-white hover:bg-white/10"
    }`;
  } else if (variant === "classic") {
    triggerClassName = `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
      isDarkText
        ? "text-darkNavy hover:bg-neutral-100"
        : "text-white hover:bg-white/10"
    }`;
  } else if (variant === "cozy") {
    triggerClassName = `w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all ${
      isDarkText
        ? "text-neutral-800 hover:bg-neutral-100/50"
        : "text-white hover:bg-white/10"
    }`;
  } else if (variant === "elegant") {
    triggerClassName = `w-9 h-9 rounded-none border flex items-center justify-center transition-all ${
      isDarkText
        ? "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-800"
        : "border-white/20 bg-white/10 text-white hover:border-white/40"
    }`;
  } else if (variant === "modern") {
    triggerClassName = `w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
      isDarkText
        ? "text-neutral-550 hover:text-neutral-900 bg-white border-neutral-100 hover:border-neutral-200"
        : "text-white/80 hover:text-white bg-white/10 border-white/10 hover:border-white/20"
    }`;
  }

  if (user) {
    triggerClassName += " md:w-auto md:px-2 md:gap-2";
  }

  // Common user image display
  const renderUserImage = () => {
    if (user?.avatar) {
      return (
        <Image
          src={anyImgUrl({ src: user.avatar, size: 80 })}
          unoptimized
          width={32}
          height={32}
          className="rounded-full object-cover"
          alt={user.fullName || "User Avatar"}
          priority
        />
      );
    }
    return <UserIcon size={20} color="currentColor" />;
  };

  // Dropdown alignment classes
  const dropdownAlignClass = lang === "ar" ? "left-0" : "right-0";

  const handleLoginClick = (e) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.preventDefault();
      onUserOpen();
    }
  };

  const handleTriggerClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onUserOpen();
    } else {
      setDropdownOpen((v) => !v);
    }
  };

  if (!user) {
    return (
      <>
        <Link
          href={`/${langPrefix}login`}
          onClick={handleLoginClick}
          title={tButton("loginTitle") || "Login"}
          className={`${triggerClassName} flex items-center justify-center gap-1.5`}
        >
          <UserIcon size={variant === "cozy" ? 16 : 18} color="currentColor" />
          <span className="sr-only">{tButton("login") || "Login"}</span>
        </Link>
        {userOpen && (
          <UserDrawer
            open={userOpen}
            user={user}
            setOpen={onUserOpenChange}
            lang={lang}
            trans={trans}
            t={tButton}
            logout={logout}
            isLoading={isLoading}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          className={`${triggerClassName} cursor-pointer flex items-center justify-center focus:outline-none`}
          onClick={handleTriggerClick}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
          aria-label={tDropdown("userMenuAriaLabel") || "User Menu"}
        >
          {renderUserImage()}
          <span className="hidden md:block font-semibold text-xs whitespace-nowrap">
            {user?.fullName?.trim()?.split(" ")[0]}
          </span>
        </button>

        {dropdownOpen && (
          <div
            className={`hidden md:block absolute text-black mt-2 w-60 bg-white rounded-lg shadow-lg border border-neutral-200/80 z-50 min-w-[200px] ${dropdownAlignClass} animate-in fade-in slide-in-from-top-1 duration-150`}
            role="menu"
            aria-labelledby="user-menu-button"
          >
            <div
              className="px-4 py-3 border-b border-neutral-100 flex flex-col gap-0.5"
              role="presentation"
            >
              <span className="font-bold text-xs text-neutral-400">
                {tDropdown("signedInAs") || "Signed in as"}
              </span>
              <span className="font-bold text-sm text-neutral-800 truncate">
                {user.fullName}
              </span>
            </div>

            <div className="flex flex-col py-1" role="none">
              {links.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:bg-neutral-50 transition-colors text-start block"
                  role="menuitem"
                  tabIndex={0}
                  title={link.description}
                  aria-label={link.description}
                  onClick={() => setDropdownOpen(false)}
                >
                  {link.text}
                </Link>
              ))}

              <button
                type="button"
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50 transition-colors text-start border-t border-neutral-100 mt-1 flex items-center gap-2"
                onClick={logout}
                disabled={isLoading}
                role="menuitem"
                aria-label={tDropdown("logout") || "Logout"}
              >
                {isLoading && (
                  <span
                    className="animate-spin inline-block w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full align-middle"
                    aria-hidden="true"
                  ></span>
                )}
                {tDropdown("logout") || "Logout"}
              </button>
            </div>
          </div>
        )}
      </div>
      {userOpen && (
        <UserDrawer
          open={userOpen}
          user={user}
          setOpen={onUserOpenChange}
          lang={lang}
          trans={trans}
          t={tButton}
          logout={logout}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
