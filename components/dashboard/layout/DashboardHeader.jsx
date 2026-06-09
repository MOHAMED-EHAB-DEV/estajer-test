"use client";
import { NotificationsIcon } from "@/components/ui/svgs/icons/NotificationsIconSvg";
import { User } from "@/components/ui/svgs/icons/UserSvg";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import Link from "next/link";
import NotificationList from "../../shared/NotificationList";
import Button from "@/components/ui/Button";

export default function DashboardHeader({ lang, setOpen, translate }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const t = useTranslations(translate);
  const { user } = useUser();

  return (
    <div className="bg-white flex items-center justify-between">
      <div className="lg:hidden">
        <Button
          color="transparent"
          size="md"
          onPress={() => setOpen((prev) => !prev)}
          className="p-4 h-auto min-w-0"
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
      <div className="grow md:py-4 py-3 items-center md:px-8 px-4 flex justify-end gap-3 max-w-screen-3xl mx-auto">
        <LanguageSwitcher lang={lang} />
        <div title={t("dashboard.header.messages")}>
          <Link href={`/${langPrefix}dashboard/messages`}>
            <svg
              className="md:w-[43px] md:h-[41px] w-[34px] h-[33px]"
              viewBox="0 0 43 41"
              fill="#0D092B"
            >
              <rect y="0.5" width="40" height="40" rx="20" fill="#FCE7C5" />
              <circle cx="35" cy="7.5" r="7.5" fill="#F48A42" />
              <path d="M24.6607 12.4635C23.487 12.3379 21.9792 12.3379 20.0393 12.3379H19.9607C18.0208 12.3379 16.513 12.3379 15.3393 12.4635C14.1521 12.5916 13.2119 12.857 12.4618 13.4564C11.6915 14.0726 11.3315 14.8738 11.1616 15.8843C11 16.8488 11 18.0761 11 19.6065V19.7598C11 21.2517 11 22.2839 11.1674 23.0533C11.246 23.4487 11.401 23.825 11.6237 24.161C11.8447 24.4891 12.126 24.7654 12.4609 25.0333C13.2119 25.6336 14.1521 25.8982 15.3393 26.0254C16.513 26.1518 18.0208 26.1518 19.9607 26.1518H20C20.8841 26.1518 21.5597 26.4507 22.2663 26.9104C22.5527 27.0954 22.8314 27.2988 23.1337 27.5207L23.3882 27.7049C23.7859 27.9937 24.2204 28.2993 24.711 28.5806C24.8065 28.6353 24.9147 28.664 25.0248 28.6637C25.1349 28.6635 25.2429 28.6343 25.3382 28.5791C25.4334 28.5239 25.5124 28.4446 25.5674 28.3492C25.6223 28.2538 25.6512 28.1456 25.6512 28.0356V25.8714C26.3871 25.7123 27.01 25.4561 27.5382 25.0342C27.8731 24.7654 28.1553 24.49 28.3754 24.161C28.5985 23.825 28.7537 23.4488 28.8326 23.0533C29 22.2839 29 21.2517 29 19.7598V19.6065C29 18.0761 29 16.8488 28.8384 15.8851C28.6685 14.8738 28.3085 14.0726 27.5382 13.4564C26.7881 12.8561 25.8479 12.5907 24.6607 12.4635ZM22.7209 19.2457C22.7209 19.0792 22.7871 18.9195 22.9048 18.8017C23.0226 18.684 23.1823 18.6178 23.3488 18.6178C23.5154 18.6178 23.6751 18.684 23.7928 18.8017C23.9106 18.9195 23.9767 19.0792 23.9767 19.2457V19.6643C23.9767 19.8308 23.9106 19.9906 23.7928 20.1083C23.6751 20.2261 23.5154 20.2922 23.3488 20.2922C23.1823 20.2922 23.0226 20.2261 22.9048 20.1083C22.7871 19.9906 22.7209 19.8308 22.7209 19.6643V19.2457ZM19.3721 19.2457C19.3721 19.0792 19.4382 18.9195 19.556 18.8017C19.6738 18.684 19.8335 18.6178 20 18.6178C20.1665 18.6178 20.3262 18.684 20.444 18.8017C20.5618 18.9195 20.6279 19.0792 20.6279 19.2457V19.6643C20.6279 19.8308 20.5618 19.9906 20.444 20.1083C20.3262 20.2261 20.1665 20.2922 20 20.2922C19.8335 20.2922 19.6738 20.2261 19.556 20.1083C19.4382 19.9906 19.3721 19.8308 19.3721 19.6643V19.2457ZM16.0233 19.2457C16.0233 19.0792 16.0894 18.9195 16.2072 18.8017C16.3249 18.684 16.4846 18.6178 16.6512 18.6178C16.8177 18.6178 16.9774 18.684 17.0952 18.8017C17.2129 18.9195 17.2791 19.0792 17.2791 19.2457V19.6643C17.2791 19.8308 17.2129 19.9906 17.0952 20.1083C16.9774 20.2261 16.8177 20.2922 16.6512 20.2922C16.4846 20.2922 16.3249 20.2261 16.2072 20.1083C16.0894 19.9906 16.0233 19.8308 16.0233 19.6643V19.2457Z" />
            </svg>
          </Link>
        </div>
        <div title={t("dashboard.header.notifications")}>
          <NotificationList translate={t} lang={lang} />
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div>
              <Image
                src={anyImgUrl({ src: user.avatar, size: 100 })}
                unoptimized
                width={32}
                height={32}
                className="rounded-full md:w-8 md:h-8 w-7 h-7"
                alt={user.fullName}
                priority
              />
            </div>
          ) : (
            <User className="md:w-8 md:h-8 w-7 h-7" />
          )}
          <span
            className={`${
              user?.fullName
                ? ""
                : "animate-pulse bg-gray-200 rounded-md min-w-24 min-h-6"
            } text-sm md:text-base md:block hidden`}
          >
            {user?.fullName}
          </span>
        </div>
      </div>
    </div>
  );
}
