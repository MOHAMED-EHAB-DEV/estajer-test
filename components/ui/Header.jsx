"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import Image from "next/image";
import { Plus } from "./svgs/icons/PlusSvg";
import { Lang } from "./svgs/icons/LangSvg";
import { User } from "./svgs/icons/UserSvg";
import { Cart } from "./svgs/icons/CartSvg";
import HeaderSearch from "../search/HeaderSearch";
import { anyImgUrl } from "@/utils/ImageUrl";
import Button from "./Button";
import { useTranslations } from "@/hooks/useTranslations";
import { useUser } from "@/context/UserContext";
// import AddProductDrawer from "./AddProductDrawer";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";
import MobileNav from "./MobileNav";
import dynamic from "next/dynamic";

const UserDrawer = dynamic(() => import("./UserDrawer"), { ssr: false });
const NavbarDrawer = dynamic(() => import("./NavbarDrawer"), { ssr: false });
const LangDrawer = dynamic(() => import("./LangDrawer"), { ssr: false });
import { toast } from "@/utils/toast";
import ToastMessage from "./ToastMessage";
import NotificationList from "../shared/NotificationList";
import { sendGTMEvent } from "@next/third-parties/google";

function UserData({
  user,
  langPrefix,
  t,
  sm,
  onPress,
  logout,
  isLoading,
  home,
}) {
  const UserIcon = () => (
    <>
      <div className="min">
        <Image
          src={anyImgUrl({ src: user.avatar, size: 100 })}
          unoptimized
          width={sm ? 36 : 32}
          height={sm ? 36 : 32}
          className="rounded-full"
          alt={user.fullName}
          priority
        />
      </div>
      <span className={`${sm ? "hidden md:block" : "block"} font-semibold`}>
        {user?.fullName?.trim()?.split(" ")[0]}
      </span>
    </>
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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

  const links = [
    {
      href: `/${langPrefix}dashboard`,
      text: t("dashboard"),
      description: t("dashboardDescription"),
    },
    {
      href: `/${langPrefix}favorites`,
      text: t("favorites"),
      description: t("favoritesDescription"),
    },
    {
      href: `/${langPrefix}dashboard/messages`,
      text: t("messages"),
      description: t("messagesDescription"),
    },
    {
      href: `/${langPrefix}dashboard/products`,
      text: t("myProducts"),
      description: t("myProductsDescription"),
    },
    {
      href: `/${langPrefix}dashboard/settings`,
      text: t("settings"),
      description: t("settingsDescription"),
    },
  ];

  const adminLinks = [
    {
      href: `/${langPrefix}admin`,
      text: t("adminDashboard"),
      description: t("adminDashboardDescription"),
    },
    {
      href: `/${langPrefix}admin/products/all`,
      text: t("products"),
      description: t("productsDescription"),
    },
    {
      href: `/${langPrefix}admin/orders/all`,
      text: t("orders"),
      description: t("ordersDescription"),
    },
    {
      href: `/${langPrefix}admin/users`,
      text: t("users"),
      description: t("usersDescription"),
    },
  ];
  return user ? (
    onPress ? (
      <Button
        variant="light"
        color="default"
        {...(!onPress ? { as: "div" } : { onPress })}
        size="sm"
        className={`text-black items-center px-0 min-w-0 gap-2 text-lg ${
          sm
            ? "flex md:hidden h-[2.6rem] min-w-[2.6rem] bg-white"
            : "hidden md:flex !bg-transparent"
        }`}
      >
        <UserIcon />
      </Button>
    ) : (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="cursor-pointer flex items-center gap-2 p-1 rounded-lg transition-colors hover:bg-gray-100/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => {
            setDropdownOpen((v) => !v);
            sendGTMEvent({
              event: "user_menu_toggle",
              link_text: t("userMenuAriaLabel"),
              location: "user_menu",
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setDropdownOpen((v) => !v);
            }
          }}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
          aria-label={t("userMenuAriaLabel")}
        >
          <UserIcon />
        </button>
        {dropdownOpen && (
          <div
            className="absolute text-black right-0 mt-4 w-60 bg-white rounded-lg shadow-lg border z-50 min-w-[200px]"
            role="menu"
            aria-labelledby="user-menu-button"
          >
            <div
              className="px-4 py-3 border-b flex flex-col gap-1"
              role="presentation"
            >
              <span className="font-bold text-sm">{t("signedInAs")}</span>
              <span className="font-bold text-sm text-gray-500">
                @{user?.fullName?.trim()?.split(" ")[0]}
              </span>
            </div>
            <div className="flex flex-col" role="none">
              {user?.accountType === "admin" && (
                <div
                  className="flex flex-col border-b"
                  role="group"
                  aria-label="Admin menu"
                >
                  {adminLinks.map((link, i) => (
                    <Link
                      key={`admin-${i}`}
                      href={link.href}
                      className="px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                      role="menuitem"
                      tabIndex={0}
                      title={link.description}
                      aria-label={link.description}
                      onClick={() =>
                        sendGTMEvent({
                          event: "navigation_click",
                          link_text: link.text,
                          location: "user_menu",
                        })
                      }
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
              )}
              {links.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                  role="menuitem"
                  tabIndex={0}
                  title={link.description}
                  aria-label={link.description}
                  onClick={() =>
                    sendGTMEvent({
                      event: "navigation_click",
                      link_text: link.text,
                      location: "user_menu",
                    })
                  }
                >
                  {link.text}
                </Link>
              ))}
              <button
                type="button"
                className="px-4 py-2 hover:bg-red-50 text-red-600 border-t mt-1 focus:outline-none focus:bg-red-50 transition-colors text-start"
                onClick={logout}
                disabled={isLoading}
                role="menuitem"
                aria-label={t("logout")}
              >
                {isLoading ? (
                  <span
                    className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full align-middle"
                    aria-hidden="true"
                  ></span>
                ) : null}
                {t("logout")}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  ) : (
    <Button
      variant="light"
      title={t("loginTitle")}
      {...(!onPress ? { as: Link, href: `/${langPrefix}login` } : { onPress })}
      className={`text-current items-center px-0 min-w-0 gap-2 text-lg ${
        sm
          ? `flex md:hidden h-[2.6rem] min-w-[2.6rem] ${home ? "bg-white" : "bg-[#fff9f0]"}`
          : "hidden md:flex !bg-transparent"
      }`}
    >
      <User size={22} color="currentColor" />
      <span className={`${sm ? "hidden md:block" : "block"} font-semibold`}>
        {t("login")}
      </span>
    </Button>
  );
}

export default function Header({
  lang,
  home,
  partner,
  products,
  awareness,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (value) => trans(`ui.button.${value}`);
  const tHeader = (value) => trans(`ui.header.${value}`);
  const tDropdown = (value) => trans(`ui.dropdown.${value}`);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const langPrefix = lang === "ar" ? "" : "en/";

  const [scrolled, setScrolled] = useState(true);
  // const { isOpen, onOpen, onOpenChange } = useDrawerWithHistory();
  const {
    isOpen: navOpen,
    onOpen: onNavOpen,
    onOpenChange: onNavOpenChange,
  } = useDrawerWithHistory();
  const {
    isOpen: userOpen,
    onOpen: onUserOpen,
    onOpenChange: onUserOpenChange,
  } = useDrawerWithHistory();
  const {
    isOpen: langOpen,
    onOpen: onLangOpen,
    onOpenChange: onLangOpenChange,
  } = useDrawerWithHistory();

  const checkScrollPosition = () =>
    setScrolled((prev) => window.scrollY < (prev ? 30 : 1));

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("scroll", checkScrollPosition);
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, []);

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/user/offline", { method: "POST" });
      const res = await fetch("/api/logout");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || trans("sidebar.error"));
      toast.success(ToastMessage(trans("sidebar.logoutConfirm")));
      sendGTMEvent({
        event: "logout",
        method: "button",
        location: "user_menu",
      });
      setTimeout(() => {
        window.location.href = `/${langPrefix}`;
      }, 100);
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <header
        role="banner"
        className={`${
          home
            ? partner || awareness
              ? `md:bg-transparent pt-4 !-top-28 `
              : `pt-2 !-top-24`
            : scrolled
              ? "bg-white md:pt-4 pt-"
              : "bg-white bg-opacity-85 md:shadow-lg shadow mb-10"
        } ${products ? "md:sticky" : "sticky"} top-0 z-30 md:z-50 w-full transition-all ${awareness && home ? "backdrop-blur-[2px]" : "backdrop-blur-sm"}`}
        aria-label={tHeader("siteHeaderAriaLabel")}
      >
        <nav
          role="navigation"
          aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}
          className={`max-w-screen-2xl mx-auto flex md:gap-6 gap-4 items-center justify-between transition-[padding] ${
            scrolled ? "md:p-4 px-4 py-2" : "md:py-3 py-2 px-4"
          }`}
        >
          <Link
            href={`/${langPrefix}`}
            className={`transition-[min-height,height] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg ${
              scrolled ? "md:min-h-[75px] h-[60px]" : "md:min-h-[60px] h-[55px]"
            }`}
            aria-label={tHeader("logoAriaLabel")}
            title={tHeader("logoTitle")}
            onClick={() =>
              sendGTMEvent({
                event: "navigation_click",
                link_text: "Estajer",
                location: "header",
              })
            }
          >
            <Image
              src={anyImgUrl({
                src:
                  home && !awareness
                    ? lang === "ar"
                      ? "logoWhite_l0rabo_hkkqjj"
                      : "white-logo-with-slogan--estajer--english_k4cwvh_eno8rz_vsopvk_ugss33"
                    : lang === "ar"
                      ? "df29491010c0d93a10d9a4be03e0a505_bm0quc_ucrmq4"
                      : "final-logo-with-slogan--estajer--english_k4cwvh_rmcy09_rdlor1_nx9hds",
                size: !home
                  ? lang === "ar"
                    ? !scrolled
                      ? 109 * 2
                      : 136 * 2
                    : !scrolled
                      ? 135 * 2
                      : 167 * 2
                  : lang === "ar"
                    ? 136 * 2
                    : 170 * 2,
              })}
              unoptimized
              width={160}
              height={88}
              className="h-full w-auto"
              alt={tHeader("logoAlt")}
              title={tHeader("logoTitle")}
              priority
            />
          </Link>
          {!home && (
            <HeaderSearch
              t={t}
              lang={lang}
              scrolled={scrolled}
              langPrefix={langPrefix}
              translate={translate}
            />
          )}

          <div
            className={`${
              home ? "md:gap-5 gap-4" : scrolled ? "md:gap-5 gap-4" : "gap-4"
            } transition-[gap] items-center md:flex hidden ${(partner || home) && scrolled ? "text-white" : ""}`}
          >
            <UserData
              langPrefix={langPrefix}
              user={user}
              t={tDropdown}
              logout={logout}
              isLoading={isLoading}
              home={home}
            />

            <NotificationList home={true} translate={trans} lang={lang} />
            <Link
              href={`/${langPrefix}cart`}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={tHeader("cartAriaLabel")}
              title={tHeader("cartTitle")}
              onClick={() =>
                sendGTMEvent({
                  event: "navigation_click",
                  link_text: "cart",
                  location: "header",
                })
              }
            >
              <Cart aria-hidden="true" />
            </Link>
            <div>
              <LanguageSwitcher lang={lang} home={home} awareness={awareness} />
            </div>
            {!partner && (
              <Button
                className={`${awareness && home ? "" : "bg-darkNavy"} !opacity-100 font-semibold gap-2 ps-6 pe-8 focus:outline-none `}
                as={Link}
                variant="solid"
                href={`/${langPrefix}add-product`}
                aria-label={tHeader("addAdAriaLabel")}
                title={tHeader("addAdTitle")}
              >
                <Plus
                  color={awareness && home ? "#fff" : "#F48A42"}
                  aria-hidden="true"
                />
                {t("addAd")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Button
              variant="solid"
              className="min-w-12 p-2 min-h-14 bg-transparent"
              aria-label={tHeader("langTitle")}
              title={tHeader("langTitle")}
              onPress={() => {
                sendGTMEvent({
                  event: "drawer_open",
                  drawer_name: "lang_drawer",
                  location: "header",
                });
                onLangOpen();
              }}
            >
              <Lang
                className={home ? "min-w-10" : "min-w-6"}
                fill={home ? "#fff" : "#0D092B"}
              />
            </Button>
            <UserData
              langPrefix={langPrefix}
              user={user}
              t={tDropdown}
              sm={true}
              home={home}
              onPress={() => {
                sendGTMEvent({
                  event: "drawer_open",
                  drawer_name: "user_drawer",
                  location: "header",
                });
                onUserOpen();
              }}
            />
          </div>
        </nav>
      </header>
      {/* <AddProductDrawer
        open={isOpen}
        setOpen={onOpenChange}
        langPrefix={langPrefix}
        t={t}
      /> */}
      {!products && (
        <MobileNav
          translate={translate}
          langPrefix={langPrefix}
          navOpen={navOpen}
          // onOpen={onOpen}
          onNavOpen={onNavOpen}
          lang={lang}
        />
      )}
      {userOpen && (
        <UserDrawer
          open={userOpen}
          user={user}
          setOpen={onUserOpenChange}
          lang={lang}
          trans={trans}
          t={t}
          logout={logout}
          isLoading={isLoading}
        />
      )}
      {langOpen && (
        <LangDrawer
          open={langOpen}
          setOpen={onLangOpenChange}
          lang={lang}
          trans={trans}
        />
      )}
      {navOpen && (
        <NavbarDrawer
          open={navOpen}
          user={user}
          setOpen={onNavOpenChange}
          lang={lang}
          trans={trans}
        />
      )}
    </>
  );
}
