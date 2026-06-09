"use client";
import { Drawer, DrawerContent } from "@heroui/react";
import { X } from "../ui/svgs/icons/XSvg";
import NotificationsBox from "./NotificationsBox";
import Button from "../ui/Button";

export default function NotificationsDrawer({
  open,
  setOpen,
  lang,
  notifications,
  isLoading,
  translate,
  showMore,
  hasMore,
}) {
  const t = (text) => translate(`notifications.${text}`);
  const handleClose = () => setOpen(false);
  return (
    <Drawer
      isOpen={open}
      placement={lang === "ar" ? "left" : "right"}
      size="md"
      backdrop="opaque"
      onOpenChange={setOpen}
      hideCloseButton
    >
      <DrawerContent>
        <div className="py-4">
          <div className="flex justify-between items-center border-b py-6 px-6">
            <h2 className="text-xl font-semibold font-IBMPlex">
              {t("drawerTitle")}
            </h2>
            <Button
              onPress={handleClose}
              color="transparent"
              variant="light"
              size="md"
              className="min-w-8 p-0 -me-1"
            >
              <X className="text-[#0D092B] w-[22px] h-[22px]" />
            </Button>
          </div>
          <div className="mt-4">
            <NotificationsBox
              translate={translate}
              notifications={notifications}
              placeholder={isLoading && notifications.length === 0}
              lang={lang}
              t={t}
            />
            {hasMore && (
              <div className="text-center my-4">
                <Button
                  variant="solid"
                  size="md"
                  color="transparent"
                  onPress={showMore}
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {t("showMore")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
