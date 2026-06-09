"use client";
import { NotificationsIcon } from "@/components/ui/svgs/icons/NotificationsIconSvg";
import { User } from "@/components/ui/svgs/icons/UserSvg";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import UserList from "../UserList";
import Link from "next/link";
import NotificationList from "@/components/shared/NotificationList";
import { AddProduct, AddUser, Refresh } from "@/components/ui/svgs/AdminIcons";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import Button from "@/components/ui/Button";

export default function AdminHeader({ lang, setOpen, translate }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const t = useTranslations(translate);
  const { user } = useUser();

  return (
    <div className="bg-white flex items-center justify-between">
      <div className="lg:hidden">
        <Button
          size="md"
          color="transparent"
          onPress={() => setOpen((prev) => !prev)}
          className="md:p-4 p-2 h-auto min-w-0"
          variant="light"
        >
          <svg
            viewBox="0 0 512 512"
            className="md:w-7 md:h-7 w-6 h-6"
            fill={"#0D092B"}
          >
            <path d="M441.13,166.52h-372a15,15,0,1,1,0-30h372a15,15,0,0,1,0,30Z" />
            <path d="M441.13,279.72h-372a15,15,0,1,1,0-30h372a15,15,0,0,1,0,30Z" />
            <path d="M441.13,392.92h-372a15,15,0,1,1,0-30h372a15,15,0,0,1,0,30Z" />
          </svg>
        </Button>
      </div>
      <div className="grow md:py-4 py-2 items-center md:px-10 px-2 flex justify-end md:gap-4 gap-2 max-w-screen-3xl mx-auto">
        <button
          onClick={async () => await revalidate("/")}
          className="flex p-0 bg-transparent min-w-fit items-center justify-center md:gap-[10px] gap-1"
        >
          <Refresh className="md:w-10 md:h-10 w-7 h-7" />
          <span className="font-NotoSansArabic hidden md:block text-darkNavy text-base font-semibold">
            {t("admin.header.refresh")}
          </span>
        </button>
        <button
          onClick={async () => await revalidateWithTag("everyProduct")}
          className="flex p-0 bg-transparent min-w-fit items-center justify-center md:gap-[10px] gap-1"
        >
          <Refresh className="md:w-10 md:h-10 w-7 h-7" />
          <span className="font-NotoSansArabic hidden md:block text-darkNavy text-base font-semibold">
            {t("admin.header.refreshProducts")}
          </span>
        </button>
        <Link
          href={`/${langPrefix}admin`}
          className="flex items-center justify-center md:gap-[10px] gap-1"
        >
          <AddUser className="md:w-10 md:h-10 w-7 h-7" />
          <span className="font-NotoSansArabic hidden md:block text-darkNavy text-base font-semibold">
            {t("admin.header.newUser")}
          </span>
        </Link>
        <Link
          href={`/${langPrefix}admin`}
          className="flex items-center justify-center md:gap-[10px] gap-1"
        >
          <AddProduct className="md:w-10 md:h-10 w-7 h-7" />
          <span className="font-NotoSansArabic hidden md:block text-darkNavy text-base font-semibold">
            {t("admin.header.newProduct")}
          </span>
        </Link>
        <div className="flex items-center md:gap-2 gap-1">
          {user ? (
            <div>
              <Image
                src={anyImgUrl({ src: user.avatar, size: 100 })}
                unoptimized
                width={32}
                height={32}
                className="rounded-full md:w-8 md:h-8 w-6 h-6"
                alt={user.fullName}
                priority
              />
            </div>
          ) : (
            <User className="md:w-8 md:h-8 w-6 h-6" />
          )}
          <span
            className={
              user?.fullName
                ? "md:block hidden"
                : "md:block hidden animate-pulse bg-gray-200 rounded-md min-w-24 min-h-6"
            }
          >
            {user?.fullName}
          </span>
        </div>
      </div>
    </div>
  );
}
