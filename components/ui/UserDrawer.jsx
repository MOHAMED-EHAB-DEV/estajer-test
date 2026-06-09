import { Drawer, DrawerContent } from "@heroui/react";
import { ChevronLeft } from "./svgs/icons/ChevronLeftSvg";
import { User } from "./svgs/icons/UserSvg";
import { X } from "./svgs/icons/XSvg";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import Button from "./Button";

function NavLink({ href, text, lang, title }) {
  return (
    <Link
      href={href}
      title={title || text}
      className="bg-[#F6F6F6] rounded-md p-4 font-semibold w-full flex items-center justify-between gap-2"
    >
      <span>{text}</span>
      <span
        className={`bg-[#F48A4233] rounded-md p-1 ${
          lang === "ar" ? "" : "rotate-180"
        }`}
      >
        <ChevronLeft />
      </span>
    </Link>
  );
}

export default function UserDrawer({
  open,
  setOpen,
  lang,
  user,
  trans,
  logout,
  isLoading,
}) {
  const t = (text) => trans(`sidebar.${text}`);
  const langPrefix = lang === "ar" ? "" : "en/";

  return (
    <>
      <Drawer
        classNames={{ wrapper: "md:hidden", backdrop: "md:hidden" }}
        isOpen={open}
        placement="bottom"
        onOpenChange={setOpen}
        hideCloseButton
      >
        <DrawerContent>
          <div className="py-4 px-6">
            <div className="flex justify-between items-center border-b py-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="bg-[#FDDCA680] rounded-full flex items-center justify-center">
                    <Image
                      src={anyImgUrl({ src: user.avatar, size: 100 })}
                      unoptimized
                      width={40}
                      height={40}
                      className="rounded-full"
                      alt={user.fullName}
                      priority
                    />
                  </div>
                  <span className="text-xl font-semibold font-IBMPlex">
                    {user.fullName}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#FDDCA680] rounded-full flex items-center justify-center">
                    <User size={28} />
                  </div>
                  <span className="text-xl font-semibold font-IBMPlex">
                    {t("myAccount")}
                  </span>
                </div>
              )}
              <Button
                color="transparent"
                onPress={() => setOpen(false)}
                variant="light"
                size="md"
                className="min-w-8 p-0 -me-1"
              >
                <X className="text-[#0D092B] w-[22px] h-[22px]"></X>
              </Button>
            </div>
            {user ? (
              <>
                {user.accountType === "admin" && (
                  <div className="mt-8 mb-4">
                    <NavLink
                      href={`/${langPrefix}admin`}
                      text={t("adminDashboard")}
                      title={t("adminDashboardTitle")}
                      lang={lang}
                    />
                  </div>
                )}
                <div className="mt-8 mb-4">
                  <NavLink
                    href={`/${langPrefix}dashboard`}
                    text={t("dashboard")}
                    title={t("dashboardTitle")}
                    lang={lang}
                  />
                </div>
                <div className="mb-4">
                  <NavLink
                    href={`/${langPrefix}dashboard/settings`}
                    text={t("settings")}
                    title={t("settingsTitle")}
                    lang={lang}
                  />
                </div>
                <div className="mb-8">
                  <Button
                    endContent={
                      <span
                        className={`bg-[#F  48A4233] rounded-md p-1 ${
                          lang === "ar" ? "" : "rotate-180"
                        }`}
                      >
                        <ChevronLeft />
                      </span>
                    }
                    onPress={logout}
                    color="transparent"
                    isLoading={isLoading}
                    size="lg"
                    className="h-16 bg-[#F6F6F6] rounded-md p-4 font-semibold w-full justify-between gap-2"
                  >
                    <span> {t("logout")}</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-8 mb-4">
                  <NavLink
                    href={`/${langPrefix}login`}
                    text={t("login")}
                    title={t("loginTitle")}
                    lang={lang}
                  />
                </div>
                <div className="mb-8">
                  <NavLink
                    href={`/${langPrefix}register`}
                    text={t("register")}
                    title={t("registerTitle")}
                    lang={lang}
                  />
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
