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
  MyOrders,
  Locations,
  PaymentMethods,
  Settings,
  Logout,
  Arrow,
  ProductRequests,
  DocumentIcon,
  Ticket,
} from "../../ui/svgs/Dashboard";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { X } from "@/components/ui/svgs/icons/XSvg";
import { useTranslations } from "@/hooks/useTranslations";
import { usePathname, useRouter } from "next/navigation";
import { Order } from "@/components/ui/svgs/OrdersSvg";
import { ShoppingBag as ShopIcon } from "@/components/ui/svgs/AdminIcons";
import { useUser } from "@/context/UserContext";
import SwitchRole from "../SwitchRole";

export const TrendChartSvg = ({ isActive, size = 24, className }) => (
  <svg
    width={!className ? size : undefined}
    height={!className ? size : undefined}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default function Sidebar({ lang, open, setOpen, translate }) {
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState(null);
  const { user } = useUser();
  const trans = useTranslations(translate);
  const t = (text) => trans(`sidebar.${text}`);
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
  const main = pathname === "/dashboard/renter";
  const links = [
    ...(user?.accountType === "admin"
      ? [
          {
            text: t("adminDashboard"),
            Icon: Home,
            href: `/admin`,
            external: true,
          },
        ]
      : [{ text: t("home"), Icon: Home, href: "/" }]),
    { text: t("dashboard"), Icon: Home, href: main ? `/renter` : `` },
    ...(user?.isRenter === undefined || user?.isRenter
      ? [{ text: t("myOrders"), Icon: MyOrders, href: `/my-orders` }]
      : [{ text: t("rentalRequests"), Icon: Requests, href: `/requests` }]),

    { text: t("messages"), Icon: Messages, href: `/messages` },

    // { text: t("addresses"), Icon: Locations, href: `/locations` },
    // {
    //   text: t("paymentMethods"),
    //   Icon: PaymentMethods,
    //   href: `/payment-methods`,
    // },
    { text: t("myProducts"), Icon: Order, href: `/products` },
    ...(user?.isRenter !== undefined && !user?.isRenter && user.premium
      ? [
          {
            text: trans("sidebar.visits"),
            Icon: TrendChartSvg,
            href: `/visits`,
          },
        ]
      : []),
    ...(user?.hasShop
      ? [{ text: t("myShop"), Icon: ShopIcon, href: `/my-shop` }]
      : []),
    ...(user?.isRenter !== undefined && !user?.isRenter
      ? [
          {
            text: t("damageReports"),
            Icon: DocumentIcon,
            href: `/damage-reports`,
          },
        ]
      : []),
    // {
    //   text: t("productRequests"),
    //   Icon: ProductRequests,
    //   href: `/product-requests`,
    // },
    { text: t("tickets"), Icon: Ticket, href: `/tickets`, dynamicPages: true },
    { text: t("settings"), Icon: Settings, href: `/settings` },
    // {
    //   text: t("estajerPlus"),
    //   Icon: Home,
    //   href: "https://estajer.plus",
    //   external: true,
    //   soon: true,
    // },
  ];
  useEffect(() => {
    if (open) setShowCover(true);
    else
      setTimeout(() => {
        setShowCover(false);
      }, 300);
  }, [open]);
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
        className={`lg:start-0 z-50 md:w-[21rem] w-[18.5rem] bg-white h-dvh fixed top-0 transition-[inset-inline-start] duration-300 ${
          open ? "start-0" : "-start-[21rem]"
        } `}
      >
        <div className="overflow-auto h-full pb-36 md:p-8 p-3">
          <Button
            variant="light"
            color="default"
            className="z-50 bg-white/50 backdrop-blur-sm lg:hidden absolute top-2 end-4 min-w-0 p-4 h-auto rounded-lg"
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
          <div className="flex flex-col lg:gap-4 gap-2 md:mt-14 mt-8">
            {links.map(
              ({ text, Icon, href, external, soon, dynamicPages }, idx) => {
                const fullHref = external
                  ? href
                  : href === "/"
                    ? `/${langPrefix}`
                    : `/${langPrefix}dashboard${href}`;
                const isActive = dynamicPages
                  ? pathname.includes(href)
                  : !external && pathname === fullHref;

                const handleNavigate = (e) => {
                  if (soon) return;
                  e?.preventDefault();
                  setPendingPath(fullHref);
                  startTransition(() => {
                    router.push(fullHref);
                    setOpen(false);
                  });
                };

                return (
                  <Button
                    onPress={handleNavigate}
                    {...(external && {
                      as: Link,
                      href: fullHref,
                      // target: "_blank",
                    })}
                    key={idx}
                    startContent={
                      <Icon
                        isActive={isActive}
                        className="md:w-5 md:h-5 w-[18px] h-[18px]"
                      />
                    }
                    className={`md:text-xl text-base justify-start md:py-7 py-4 md:px-6 px-4 relative ${
                      !isActive ? "text-darkNavy" : ""
                    } ${
                      soon
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg opacity-60 pointer-events-none"
                        : ""
                    }`}
                    {...(!isActive && { color: "transparent" })}
                    isLoading={isPending && pendingPath === fullHref}
                  >
                    <span className="flex items-center gap-2">
                      {text}
                      {soon && (
                        <span className="ms-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                          {t("soon")}
                        </span>
                      )}
                    </span>
                    {isActive && <Arrow className="md:size-8 size-6" />}
                  </Button>
                );
              },
            )}
            <Button
              onPress={logout}
              className="md:text-xl text-base justify-start md:py-7 py-4 md:px-6 px-4 text-darkNavy"
              color="transparent"
              isLoading={isPending && pendingPath === "logout"}
              startContent={<Logout className="md:size-6 size-5" />}
            >
              {t("logout")}
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 start-0 w-full">
          {/* gradient fade-out above */}
          <div className="h-6 w-full bg-gradient-to-t from-white to-transparent" />
          <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <SwitchRole
              langPrefix={langPrefix}
              initialRole={
                user?.isRenter === undefined || user?.isRenter
                  ? "renter"
                  : "landlord"
              }
              translate={translate}
              updateValue={!user?.isRenter}
            />
          </div>
        </div>
      </div>
    </>
  );
}
