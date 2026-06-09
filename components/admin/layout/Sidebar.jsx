"use client";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useTransition } from "react";
import Button from "../../ui/Button";
import {
  Home,
  Requests,
  Messages,
  Settings,
  Logout,
  Arrow,
} from "../../ui/svgs/Dashboard";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { X } from "@/components/ui/svgs/icons/XSvg";
import { useTranslations } from "@/hooks/useTranslations";
import {
  Products,
  Cash,
  Proposals,
  Users,
  Blogs,
  Contacts,
  Notifications,
  StaticPages,
  Advertisement,
  Reports,
  Sponsors,
  Headset,
  ErrorLogs,
  Tasks,
} from "@/components/ui/svgs/Admin";
import { FaVideo as FaVideoIcon } from "@/components/ui/svgs/AdminIcons";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

const FaVideo = ({ isActive, className, ...rest }) => (
  <FaVideoIcon
    className={clsx(className, isActive ? "text-primary" : "")}
    {...rest}
  />
);

const Shops = ({ isActive, className, ...rest }) => (
  <svg
    viewBox="0 0 448 512"
    fill={isActive ? "white" : "#0D092B"}
    className={clsx("md:w-5 md:h-5 w-4 h-4", className)}
    {...rest}
  >
    <path d="M160 112c0-35.3 28.7-64 64-64s64 28.7 64 64v48H160V112zm-48 48H48c-26.5 0-48 21.5-48 48V416c0 53 43 96 96 96H352c53 0 96-43 96-96V208c0-26.5-21.5-48-48-48H336V112C336 50.1 285.9 0 224 0S112 50.1 112 112v48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1-48 0z" />
  </svg>
);

export default function Sidebar({ lang, open, setOpen, translate }) {
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState(null);
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.sidebar.${text}`);
  const [showCover, setShowCover] = useState(false);
  const langPrefix = lang === "ar" ? "" : "en/";
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const logout = () => {
    setPendingPath("logout");
    startTransition(async () => {
      try {
        await fetch("/api/auth/user/offline", { method: "POST" });
        const res = await fetch("/api/logout");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("error"));
        setOpen(false);
        toast.success(ToastMessage(t("logoutConfirm")));
        window.location.href = `/${langPrefix}`;
      } catch (err) {
        toast.error(ToastMessage(err.message));
      }
    });
  };
  const links = [
    { text: t("home"), Icon: Home, href: "/" },
    { text: t("dashboard"), Icon: Home, href: "" },
    {
      text: t("rentalRequests"),
      Icon: Requests,
      href: `/orders/all`,
      alertType: "order",
      subLinks: [
        { text: t("overview"), link: "/orders/overview" },
        {
          text: t("rentalRequestsOrders"),
          link: "/orders/all",
          subLink: "/orders/details",
        },
        { text: t("productRequests"), link: `/requests` },
        { text: t("proposals"), link: `/proposals`, alertType: "proposal" },
      ],
    },
    {
      text: t("products"),
      Icon: Products,
      href: `/products/all`,
      alertType: "product",
      subLinks: [
        { text: t("overview"), link: "/products/overview" },
        { text: t("allProducts"), link: "/products/all", alertType: "product" },
        { text: t("allProductsList"), link: "/products/all-table" },
        { text: t("categories"), link: "/products/categories" },
      ],
    },
    {
      text: t("users"),
      Icon: Users,
      href: `/users`,
      subLinks: [
        { text: t("users"), link: "/users" },
        {
          text: lang === "ar" ? "جلسات المستخدمين" : "User Sessions",
          link: "/sessions",
        },
      ],
    },
    {
      text: t("messages"),
      Icon: Messages,
      href: `/messages/all`,
      alertType: "message",
      subLinks: [
        { text: t("overview"), link: "/messages/overview" },
        {
          text: t("allMessages"),
          link: "/messages/all",
          alertType: "message",
        },
        { text: t("aiChat"), link: "/messages/ai" },
        { text: t("tickets"), link: "/messages/tickets", disabled: true },
      ],
    },
    {
      text: t("support"),
      Icon: Headset,
      href: "/support/tickets",
      alertType: "ticket",
      subLinks: [
        { text: t("overview"), link: "/support/overview" },
        {
          text: t("allTickets"),
          link: "/support/tickets",
          dynamicPages: true,
          alertType: "ticket",
        },
        // { text: t("contacts"), link: "/contacts" },
        { text: t("notifications"), link: "/notifications" },
        {
          text: lang === "ar" ? "ارسال اشعار" : "Send Notification",
          link: "/send-notification",
        },
      ],
      dynamicPages: true,
    },
    { text: t("shops"), Icon: Shops, href: `/shops` },
    {
      text: t("staticPages"),
      Icon: StaticPages,
      href: `/blogs`,
      // disabled: true,
      subLinks: [
        { text: t("blogs"), link: "/blogs" },
        { text: t("partners"), link: "/partners" },
        {
          text: lang === "ar" ? "البانرات" : "Banners",
          link: "/banners",
        },
        {
          text: t("advertisement"),
          link: "/advertisements",
          // disabled: true,
        },
        { text: t("sponsors"), link: "/sponsors" },
      ],
    },
    {
      text: t("reports"),
      Icon: Reports,
      href: `/visits`,
      subLinks: [
        { text: t("visits"), link: "/visits" },
        {
          text: lang === "ar" ? "تحليل البحث" : "Search Analytics",
          link: "/search-analytics",
        },
        {
          text: t("damageReports"),
          link: "/damage-reports",
          alertType: "damageReport",
        },
        { text: t("earnings"), link: "/earnings", disabled: true },
      ],
    },
    {
      text: lang === "ar" ? "التطويرات" : "Developments",
      Icon: Tasks,
      href: `/tasks`,
      subLinks: [{ text: t("tasks"), link: "/tasks" }],
    },
    // {
    //   text: lang === "ar" ? "سجل الأخطاء" : "Error Logs",
    //   Icon: ErrorLogs,
    //   href: `/error-logs`,
    // },
    { text: t("settings"), Icon: Settings, href: `/settings` },
  ];
  useEffect(() => {
    if (open) setShowCover(true);
    else
      setTimeout(() => {
        setShowCover(false);
      }, 300);
  }, [open]);

  const [alerts, setAlerts] = useState({});
  const [seenAlerts, setSeenAlerts] = useState({});

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/admin/alerts");
        const data = await res.json();
        if (data.success) {
          setAlerts(data.data || {});
        }
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const seen = {
      order: localStorage.getItem("admin_seen_order"),
      message: localStorage.getItem("admin_seen_message"),
      ticket: localStorage.getItem("admin_seen_ticket"),
      proposal: localStorage.getItem("admin_seen_proposal"),
      damageReport: localStorage.getItem("admin_seen_damageReport"),
      product: localStorage.getItem("admin_seen_product"),
    };
    setSeenAlerts(seen);
  }, []);

  const handleAlertAction = (type) => {
    if (alerts[type]) {
      localStorage.setItem(`admin_seen_${type}`, alerts[type]);
      setSeenAlerts((prev) => ({ ...prev, [type]: alerts[type] }));
    }
  };

  const hasNewAlert = (type) => {
    return alerts[type] && alerts[type] !== seenAlerts[type];
  };

  const Badge = () => (
    <div className="w-2 h-2 ms-auto bg-red-500 rounded-full animate-pulse shadow-sm" />
  );
  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);
  return (
    <>
      {showCover && (
        <div
          className={`lg:hidden fixed top-0 left-0 w-screen h-screen bg-black/50 transition-opacity duration-300 z-40 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        ></div>
      )}
      <div
        className={`lg:start-0 z-50 md:w-[21rem] w-[18.5rem] bg-white h-dvh md:p-8 p-3 pt-4 fixed top-0 overflow-auto transition-[inset-inline-start] duration-300 ${
          open ? "start-0" : "-start-[21rem]"
        } `}
      >
        <Button
          variant="light"
          color="default"
          className="lg:hidden absolute top-2 end-2 min-w-0 md:p-4 p-2 h-auto rounded-lg"
          onPress={() => setOpen(false)}
        >
          <X className="md:size-[18px] size-[15px]" />
        </Button>
        <Link
          href={`/${langPrefix}`}
          className="flex md:min-w-[130px] md:w-40 w-32"
        >
          <Image
            src={anyImgUrl({
              src: "df29491010c0d93a10d9a4be03e0a505_bm0quc_ucrmq4",
              size: 400,
            })}
            unoptimized
            width={160}
            height={88}
            className="h-auto"
            alt="estajer logo"
            priority
          />
        </Link>
        <div className="flex flex-col lg:gap-4 gap-1 md:mt-14 mt-8">
          {links.map(
            (
              { text, Icon, href, subLinks, disabled, dynamicPages, alertType },
              idx,
            ) => {
              const fullHref =
                href === "/" ? `/${langPrefix}` : `/${langPrefix}admin${href}`;
              const isActive =
                pathname === fullHref ||
                (subLinks &&
                  subLinks.some(
                    ({ link, subLink }) =>
                      `/${langPrefix}admin${link}` === pathname ||
                      (subLink && pathname.includes(subLink)) ||
                      (dynamicPages && pathname.includes(link)),
                  ));
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    isActive && subLinks ? "bg-[#F6F6F6] rounded-t-[21px]" : ""
                  } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Button
                    onPress={(e) => {
                      if (disabled) return;
                      e?.preventDefault();
                      setPendingPath(fullHref);
                      startTransition(() => {
                        router.push(fullHref);
                        setOpen(false);
                        if (alertType) handleAlertAction(alertType);
                      });
                    }}
                    variant="solid"
                    className={`md:text-xl text-sm justify-start md:py-7 py-3 md:px-6 px-3 ${
                      !isActive ? "text-darkNavy" : ""
                    }`}
                    {...(!isActive && { color: "transparent" })}
                    isLoading={isPending && pendingPath === fullHref}
                    startContent={
                      <Icon
                        isActive={isActive}
                        className="md:w-5 md:h-5 w-4 h-4"
                      />
                    }
                  >
                    {text}
                    {hasNewAlert(alertType) && <Badge />}
                    {isActive && (
                      <div className={lang === "en" ? "rotate-180" : ""}>
                        <Arrow className="md:size-8 size-5" />
                      </div>
                    )}
                  </Button>
                  {isActive && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {subLinks &&
                        subLinks.map(
                          (
                            {
                              link,
                              text,
                              subLink,
                              disabled,
                              dynamicPages,
                              alertType: subAlertType,
                            },
                            idx,
                          ) => {
                            const fullHref = `/${langPrefix}admin${link}`;
                            const isActive =
                              pathname === fullHref ||
                              (subLink && pathname.includes(subLink)) ||
                              (dynamicPages && pathname.includes(link));
                            return (
                              <button
                                key={idx}
                                className={clsx(
                                  "md:px-5 md:py-[10px] px-4 py-2 flex gap-3 items-center w-full text-start",
                                  disabled && "opacity-50 pointer-events-none",
                                )}
                                onClick={(e) => {
                                  if (disabled) return;
                                  e?.preventDefault();
                                  setPendingPath(fullHref);
                                  startTransition(() => {
                                    router.push(fullHref);
                                    setOpen(false);
                                    if (subAlertType)
                                      handleAlertAction(subAlertType);
                                  });
                                }}
                              >
                                {isPending && pendingPath === fullHref ? (
                                  <div className="w-2 h-2 border border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
                                ) : (
                                  <div
                                    className={`${
                                      isActive ? "bg-primary" : "bg-darkNavy"
                                    } rounded-full md:w-3 md:h-3 w-2 h-2 shrink-0`}
                                  />
                                )}
                                <span
                                  className={clsx(
                                    "font-NotoSansArabic w-full flex items-center gap-2 md:text-sm text-[11px]",
                                    isActive ? "text-primary" : "text-darkNavy",
                                  )}
                                >
                                  {text}
                                  {hasNewAlert(subAlertType) && <Badge />}
                                </span>
                              </button>
                            );
                          },
                        )}
                    </div>
                  )}
                </div>
              );
            },
          )}
          <Button
            onPress={logout}
            className="md:text-xl text-sm justify-start md:py-7 py-3 md:px-6 px-3 text-darkNavy"
            color="transparent"
            isLoading={isPending && pendingPath === "logout"}
            startContent={<Logout className="md:size-6 size-4" />}
          >
            {t("logout")}
          </Button>
        </div>
      </div>
    </>
  );
}
